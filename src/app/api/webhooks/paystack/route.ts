import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateUserSubscriptionStatus as appwriteUpdateUserSubscription } from "@/lib/appwrite/services/user";
import { calculateExpiryDate } from "@/lib/utils";
import { listPlans } from "@/lib/paystack";
import { IPlan } from "paystack-sdk/dist/plan";

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

    // Handle specific events
    if (
      event.event === "subscription.payment_success" ||
      event.event === "charge.success"
    ) {
      // Using charge.success as a fallback, but subscription.payment_success is more specific for renewals
      console.log("Received Paystack event:", event.event, event.data);

      const transactionData = event.data;
      const customerEmail = transactionData?.customer?.email;
      const paystackSubscriptionCode =
        transactionData?.subscription?.subscription_code ||
        transactionData?.plan_object?.subscription_code; // For charge.success, plan_object might hold it
      const planCode =
        transactionData?.plan?.plan_code ||
        transactionData?.plan_object?.plan_code; // Get plan code

      // Attempt to get userId from metadata if present (might not be on all renewal events)
      // It's more reliable if your subscription creation ensures userId is in subscription metadata on Paystack
      const userIdFromMetadata =
        transactionData?.metadata?.userId ||
        transactionData?.customer?.metadata?.userId;

      if (!customerEmail) {
        // UserID might not always be present, but email usually is
        console.error(
          "Webhook: Missing customer email from Paystack event data.",
          event.data
        );
        return NextResponse.json(
          { error: "Missing customer email." },
          { status: 400 }
        );
      }

      // If userId is not directly in the event, you might need to query your Appwrite DB
      // by paystackSubscriptionCode or customerEmail to find the user.
      // This part is crucial and might need adjustment based on how you store user IDs.
      // For now, let's assume we can get userId or need to implement a lookup.
      // If you stored userId in Paystack's subscription metadata, it should be there.

      // Placeholder: You'll need a robust way to get your internal userId
      // For example, query Appwrite users by paystackSubscriptionCode or customerEmail
      // const appwriteUser = await findUserByPaystackSubscriptionCode(paystackSubscriptionCode) || await findUserByEmail(customerEmail);
      // const userId = appwriteUser?.$id;

      // For this example, we'll assume userIdFromMetadata is available or you have a lookup
      // This is a critical part to get right for your specific setup.
      // If userIdFromMetadata is not found, you must have a fallback.
      // One common way is to store your internal userId in Paystack's customer or subscription metadata.
      // Let's assume for now that `transactionData.customer.metadata.appwrite_user_id` was set during subscription.
      const userId =
        userIdFromMetadata ||
        transactionData?.customer?.metadata?.appwrite_user_id;

      if (!userId) {
        console.error(
          "Webhook: Could not determine internal userId from Paystack event.",
          event.data
        );
        // Potentially queue this event for manual review or retry if userId lookup fails
        return NextResponse.json(
          { error: "Could not determine user." },
          { status: 400 }
        );
      }

      if (!planCode) {
        console.error(
          "Webhook: Missing plan_code from Paystack event data.",
          event.data
        );
        return NextResponse.json(
          { error: "Missing plan_code." },
          { status: 400 }
        );
      }

      // Fetch the plan details from Paystack to get the interval
      // This is important because the event itself might not contain the interval directly
      // Or, ensure 'interval' is part of your subscription metadata on Paystack
      let planInterval =
        transactionData?.plan?.interval ||
        transactionData?.plan_object?.interval;

      if (!planInterval) {
        // Fallback: Fetch all plans and find the matching one
        // This is less efficient but a good fallback.
        const plansResponse = await listPlans(); // Adjust perPage as needed
        if (plansResponse.status && plansResponse.data) {
          const foundPlan = (plansResponse.data as unknown as IPlan[]).find(
            (p) => p.plan_code === planCode
          );
          if (foundPlan) {
            planInterval = foundPlan.interval;
          }
        }
      }

      if (!planInterval) {
        console.error(
          `Webhook: Could not determine plan interval for plan_code ${planCode}.`,
          event.data
        );
        return NextResponse.json(
          { error: "Could not determine plan interval." },
          { status: 400 }
        );
      }

      // At this point, you should have userId and planInterval.
      // You need to fetch the *current* subscriptionExpiry from Appwrite for this user.
      // This part requires an Appwrite SDK call to get user preferences/data.
      // For this example, we'll simulate it. In a real scenario, you'd fetch this.
      // const currentUserData = await appwriteGetUserPreferences(userId);
      // const currentExpiryString = currentUserData?.prefs?.subscriptionExpiry;
      // if (!currentExpiryString) {
      //   console.error(`Webhook: Could not find current subscriptionExpiry for user ${userId}.`);
      //   return NextResponse.json({ error: "User subscription data not found." }, { status: 404 });
      // }
      // const currentExpiryDate = new Date(currentExpiryString);

      // For the purpose of this example, let's assume the renewal means extending from *now*
      // if the old expiry is in the past, or from the *old expiry* if it's in the future.
      // Paystack usually charges on the due date.
      // A safer approach for renewals is to take the *next_payment_date* from the subscription event if available,
      // or calculate based on the *last_payment_date* + interval.
      // For simplicity here, we'll extend from the current date of the webhook event.
      // A more robust solution would involve fetching the user's current expiry from Appwrite.

      // Let's assume the webhook means the user just paid for the *next* period.
      // The new expiry should be calculated from the *start of this new period*.
      // Paystack's `transactionData.paid_at` or `event.data.created_at` could be a reference.
      // Or, if the subscription object in the event has `next_payment_date`, that's even better.

      // Simplified: Calculate new expiry from today + interval.
      // IMPORTANT: This simplification might lead to drift if webhooks are delayed.
      // A more robust method:
      // 1. Get the user's current `subscriptionExpiry` from Appwrite.
      // 2. If `currentExpiry` > `now`, newExpiry = `currentExpiry` + interval.
      // 3. If `currentExpiry` <= `now` (lapsed), newExpiry = `now` + interval.
      // For this example, we'll use the simpler `now + interval`.
      const newExpiryDate = calculateExpiryDate(
        new Date(),
        planInterval as any
      );

      await appwriteUpdateUserSubscription(userId, {
        planCode,
        paystackSubscriptionCode,
        subscriptionStatus: "active",
        subscriptionExpiry: newExpiryDate,
      });

      console.log(
        `Webhook: Successfully updated subscription for user ${userId}. New expiry: ${newExpiryDate.toISOString()}`
      );
    } else {
      console.log("Received Paystack event (unhandled):", event.event);
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
