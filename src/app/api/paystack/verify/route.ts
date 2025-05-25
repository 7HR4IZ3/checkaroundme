import {
  verifyTransaction as psVerifyTransaction,
  createSubscription as psCreateSubscription,
  listSubscriptions as psListSubscriptions,
  listSubscriptions,
} from "@/lib/paystack";
import { updateUserSubscriptionStatus as appwriteUpdateUserSubscription } from "@/lib/appwrite/services/user";
import { calculateExpiryDate } from "@/lib/utils";
import { AuthService } from "@/lib/appwrite/services/auth";
import { SubscriptionCreated } from "paystack-sdk/dist/subscription";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, res: NextResponse) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(
      new URL(`/business/payment-status?error=missing_reference`, req.url)
    );
  }

  try {
    // 1. Get current user (assumes session cookie present)
    const auth = await AuthService.getCurrentUser();
    if (!auth)
      return NextResponse.redirect(
        new URL(`/business/payment-status?error=unauthenticated`, req.url)
      );

    // 2. Verify transaction
    const verifyResponse = await psVerifyTransaction(reference);
    if (
      !verifyResponse.status ||
      !verifyResponse.data ||
      verifyResponse.data.status !== "success"
    ) {
      return NextResponse.redirect(
        new URL(`/business/payment-status?error=verification_failed`, req.url)
      );
    }
    const transactionData = verifyResponse.data;

    // 3. Extract metadata
    const metadata = transactionData.metadata as any;
    const customerEmail = transactionData.customer?.email;
    // @ts-ignore
    const planCode = transactionData.plan || metadata?.planCode;
    const authorizationCode = transactionData.authorization?.authorization_code;
    const userId = metadata?.userId;
    const isEligibleForTwoMonthFreeOffer =
      metadata?.isEligibleForTwoMonthFreeOffer === "true";
    const planInterval = metadata?.interval?.toLowerCase();

    if (
      !customerEmail ||
      !planCode ||
      !authorizationCode ||
      !userId ||
      !planInterval
    ) {
      return NextResponse.redirect(
        new URL(`/business/payment-status?error=missing_data`, req.url)
      );
    }

    // 4. Create subscription
    // @ts-ignore
    let paystackSubscriptionStartDate = new Date(transactionData.paid_at);
    if (isEligibleForTwoMonthFreeOffer) {
      paystackSubscriptionStartDate.setMonth(
        paystackSubscriptionStartDate.getMonth() + 2
      );
    }
    const createSubResponse = (await psCreateSubscription({
      customer: customerEmail,
      plan: planCode,
      authorization: authorizationCode,
      start_date: paystackSubscriptionStartDate,
    })) as SubscriptionCreated;

    console.log(createSubResponse);

    if (
      !createSubResponse.status ||
      !createSubResponse.data?.subscription_code
    ) {
      // If already exists, treat as success (Paystack returns duplicate_subscription)
      // if (createSubResponse.code === "duplicate_subscription") {
      //   // Find the existing subscription
      //   const allSubs = await psListSubscriptions();
      //   const found = allSubs.data?.find(
      //     (sub: any) =>
      //       sub.customer?.email === customerEmail &&
      //       sub.plan?.plan_code === planCode &&
      //       (sub.status === "active" || sub.status === "non-renewing")
      //   );
      //   if (!found) {
      //     return NextResponse.redirect(new URL(`/business/payment-status?error=subscription_failed`, req.url));
      //   }
      //   // Use found subscription for updating user
      //   createSubResponse.data = found;
      // } else {
      // }
      return NextResponse.redirect(
        new URL(`/business/payment-status?error=subscription_failed`, req.url)
      );
    }

    const subscriptionData = createSubResponse.data;

    // 5. Update Appwrite user
    const paystackCustomerId = String(transactionData.customer.id || "");
    const validIntervals = ["monthly", "quarterly", "biannually", "annually"];
    if (!validIntervals.includes(planInterval)) {
      return NextResponse.redirect(
        new URL(`/business/payment-status?error=invalid_interval`, req.url)
      );
    }
    let appwriteExpiryDate: Date;
    const currentDate = new Date();
    if (isEligibleForTwoMonthFreeOffer) {
      const twoMonthsFromNow = new Date(currentDate);
      twoMonthsFromNow.setMonth(currentDate.getMonth() + 2);
      appwriteExpiryDate = calculateExpiryDate(twoMonthsFromNow, planInterval);
    } else {
      appwriteExpiryDate = calculateExpiryDate(currentDate, planInterval);
    }

    await appwriteUpdateUserSubscription(auth.user.$id, {
      ...auth.user.prefs,
      subscriptionStatus: "active",
      planCode: planCode,
      subscriptionExpiry: appwriteExpiryDate,
      paystackCustomerId: paystackCustomerId,
      paystackSubscriptionToken: subscriptionData.email_token,
      paystackSubscriptionCode: subscriptionData.subscription_code,
    });

    // 6. Redirect to payment status page
    return NextResponse.redirect(
      new URL(`/business/payment-status?success=1`, req.url)
    );
  } catch (error: any) {
    return NextResponse.redirect(
      new URL(
        `/business/payment-status?error=${encodeURIComponent(
          error.message || "unknown_error"
        )}`,
        req.url
      )
    );
  }
}
