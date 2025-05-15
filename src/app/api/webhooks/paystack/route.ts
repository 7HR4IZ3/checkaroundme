import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateUserSubscriptionStatus as appwriteUpdateUserSubscription } from "@/lib/appwrite/services/user";
import { calculateExpiryDate } from "@/lib/utils";
import { getPlan, listPlans } from "@/lib/paystack";
import { IPlan } from "paystack-sdk/dist/plan";
import { users } from "@/lib/appwrite"; // Import Appwrite users service
import { Query } from "node-appwrite"; // Import Query for Appwrite queries

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    console.error("Paystack secret key not set for webhook verification.");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  const signature = req.headers.get("x-paystack-signature");
  const bodyText = await req.text(); // Read the raw body text

  if (!signature) {
    console.warn("Webhook request missing Paystack signature.");
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  try {
    // Verify the webhook signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(bodyText) // Use the raw body text for verification
      .digest("hex");

    if (hash !== signature) {
      console.warn("Invalid Paystack webhook signature.");
      return NextResponse.json(
        { error: "Invalid signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(bodyText);
    const eventType = event.event;
    const eventData = event.data;

    console.log(event);
    try {
      console.log(JSON.stringify(event));
    } catch {}

    console.log(`Received Paystack event: ${eventType}`);

    // --- User Identification ---
    let userId: string | null = null;
    const customerEmail = eventData?.customer?.email;
    const paystackSubscriptionCode =
      eventData?.subscription?.subscription_code ||
      eventData?.plan_object?.subscription_code;

    // Attempt to get userId from metadata first
    userId =
      eventData?.metadata?.userId ||
      eventData?.customer?.metadata?.userId ||
      eventData?.customer?.metadata?.appwrite_user_id; // Check common metadata locations

    // If userId not found in metadata, attempt to look up in Appwrite by email
    if (!userId && customerEmail) {
      try {
        const response = await users.list([
          Query.equal("email", customerEmail),
        ]);

        if (response.users.length > 0) {
          userId = response.users[0].$id;
          if (response.users.length > 1) {
            console.warn(
              `Webhook: Multiple users found for email ${customerEmail}. Using the first one found.`
            );
          }
        } else {
          console.warn(
            `Webhook: No user found in Appwrite for email ${customerEmail}.`
          );
        }
      } catch (lookupError: any) {
        console.error(
          "Webhook: Error during Appwrite user lookup by email:",
          lookupError
        );
        // Continue processing, but userId will be null
      }
    }

    if (!userId) {
      console.error(
        "Webhook: Could not determine internal userId from Paystack event or Appwrite lookup.",
        eventData
      );
      // Respond with 200 to avoid continuous retries for unmatchable events,
      // but log the issue for investigation.
      return NextResponse.json(
        { received: true, message: "User not found." },
        { status: 200 }
      );
    }

    // --- Handle Specific Events ---
    switch (eventType) {
      case "charge.success":
      case "subscription.create": // Handle initial subscription creation webhook
      case "subscription.payment_success": // Handle recurring payment success
        console.log("Processing successful payment or subscription creation.");

        const planCode =
          eventData?.plan?.plan_code ||
          eventData?.plan_object?.plan_code ||
          eventData?.subscription?.plan?.plan_code; // Get plan code from various locations

        if (!planCode) {
          console.error(
            "Webhook: Missing plan_code for successful payment/subscription event.",
            eventData
          );
          return NextResponse.json(
            { error: "Missing plan_code." },
            { status: 400 }
          );
        }

        let planInterval =
          eventData?.plan?.interval ||
          eventData?.plan_object?.interval ||
          eventData?.subscription?.plan?.interval;

        if (!planInterval) {
          // Fallback: Fetch the plan details from Paystack if interval is missing
          console.warn(
            `Webhook: Plan interval missing for plan_code ${planCode}. Attempting to fetch from Paystack.`
          );
          const plansResponse = await getPlan(planCode); // Use plan code filter if supported by SDK
          if (plansResponse.status && plansResponse.data) {
            planInterval = plansResponse.data.interval;
            console.log(
              `Webhook: Fetched plan interval ${planInterval} for plan_code ${planCode}.`
            );
          } else {
            console.error(
              `Webhook: Could not fetch plan details for plan_code ${planCode}.`,
              plansResponse
            );
            return NextResponse.json(
              { error: "Could not determine plan interval." },
              { status: 400 }
            );
          }
        }

        // Ensure planInterval is one of the allowed enum values
        const validIntervals = [
          "hourly",
          "daily",
          "weekly",
          "monthly",
          "quarterly",
          "biannually",
          "annually",
        ];
        if (!validIntervals.includes(planInterval.toLowerCase())) {
          console.error(
            `Webhook: Invalid plan interval received: ${planInterval}`
          );
          return NextResponse.json(
            { error: "Invalid plan interval." },
            { status: 400 }
          );
        }

        // Calculate new expiry date
        // IMPORTANT: This simplified calculation from the current date might lead to drift if webhooks are delayed.
        // A more robust method would involve fetching the user's current subscription expiry from Appwrite
        // and extending from there, or using the `next_payment_date` from the Paystack event data if available.
        const newExpiryDate = calculateExpiryDate(
          eventData.paid_at || eventData.created_at,
          planInterval.toLowerCase()
        );

        await appwriteUpdateUserSubscription(userId, {
          planCode,
          paystackSubscriptionCode:
            paystackSubscriptionCode ||
            eventData?.subscription?.subscription_code,
          subscriptionStatus: "active",
          subscriptionExpiry: newExpiryDate,
          // Optionally store other relevant data like Paystack customer ID if available
          paystackCustomerId:
            eventData?.customer?.customer_code ||
            String(eventData?.customer?.id || ""),
        });

        console.log(
          `Webhook: Successfully updated subscription for user ${userId}. New expiry: ${newExpiryDate.toISOString()}`
        );
        break;

      case "subscription.disable":
        console.log("Processing subscription disable event.");
        // Update user status to inactive or disabled
        await appwriteUpdateUserSubscription(userId, {
          subscriptionStatus: "inactive",
          // Optionally clear or update other subscription-related fields
          planCode: "", // Clear plan code or set to a default 'inactive' plan
          subscriptionExpiry: new Date(), // Set expiry to now or a past date
          // Keep paystackSubscriptionCode for reference if needed
        });
        console.log(
          `Webhook: Successfully disabled subscription for user ${userId}.`
        );
        break;

      case "subscription.enable":
        console.log("Processing subscription enable event.");
        // Update user status to active
        // You might need to fetch subscription details from Paystack here
        // to get the plan and next payment date for accurate expiry calculation.
        // For simplicity, setting to active without updating expiry for now.
        // A more robust implementation would fetch subscription details.

          const isEligibleForTwoMonthFreeOffer = true;
        let paystackSubscriptionStartDate = new Date();
        if (true || isEligibleForTwoMonthFreeOffer) {
          const twoMonthsFromNow = new Date();
          twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
          paystackSubscriptionStartDate = twoMonthsFromNow;
        }

        await appwriteUpdateUserSubscription(userId, {
          planCode: planCode,
          subscriptionStatus: "active",
          subscriptionExpiry: paystackSubscriptionStartDate,
          // Consider fetching planCode and calculating subscriptionExpiry here
        });
        console.log(
          `Webhook: Successfully enabled subscription for user ${userId}.`
        );
        break;

      case "subscription.cancel":
        console.log("Processing subscription cancel event.");
        // Update user status to cancelled
        await appwriteUpdateUserSubscription(userId, {
          subscriptionStatus: "cancelled",
          // Optionally clear or update other subscription-related fields
          planCode: "", // Clear plan code or set to a default 'cancelled' plan
          subscriptionExpiry: new Date(), // Set expiry to now or the cancellation date
          // Keep paystackSubscriptionCode for reference if needed
        });
        console.log(
          `Webhook: Successfully cancelled subscription for user ${userId}.`
        );
        break;

      // Add cases for other relevant events like:
      // case "invoice.create":
      // case "invoice.update":
      // case "invoice.payment_failed":
      // case "subscription.notif": // For subscription notifications (e.g., about to expire)
      // case "subscription.expiring_cards": // For expiring cards on subscriptions

      default:
        console.log(`Received unhandled Paystack event: ${eventType}`);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing Paystack webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing error.", message: error.message },
      { status: 500 }
    );
  }
}
