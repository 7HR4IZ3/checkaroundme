import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  initializeTransaction as psInitializeTransaction,
  verifyTransaction as psVerifyTransaction,
  createPlan as psCreatePlan,
  listPlans as psListPlans,
  createSubscription as psCreateSubscription,
  listSubscriptions as psListSubscriptions,
  disableSubscription as psDisableSubscription,
  enableSubscription as psEnableSubscription,
} from "@/lib/paystack"; // Assuming paystack/index.ts is in @/lib
import { updateUserSubscriptionStatus as appwriteUpdateUserSubscription } from "@/lib/appwrite/services/user"; // Import Appwrite service function
import { calculateExpiryDate } from "@/lib/utils";

import type { IPlan } from "paystack-sdk/dist/plan";
import type { AppTRPC } from "../router";
import { AuthService } from "@/lib/appwrite/services/auth";
import { Subscription } from "paystack-sdk/dist/subscription";

// --- Zod Schemas for Paystack Inputs ---

const initializeTransactionInputSchema = z.object({
  email: z.string().email(),
  amount: z.number().positive(), // Amount in kobo
  currency: z.string().optional(),
  reference: z.string().optional(),
  callback_url: z.string().url().optional(), // Often handled client-side or via webhooks
  plan: z.string().optional(), // Plan code for subscriptions
  metadata: z.record(z.any()).optional(),
  channels: z
    .array(
      z.enum(["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"])
    )
    .optional(),
});

const verifyTransactionInputSchema = z.object({
  reference: z.string(),
});

const createPlanInputSchema = z.object({
  name: z.string().min(1),
  interval: z.enum([
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "biannually",
    "annually",
  ]),
  amount: z.number().positive(), // Amount in kobo
  currency: z.string().optional(),
  description: z.string().optional(),
});

const listPlansInputSchema = z
  .object({
    perPage: z.number().optional(),
    page: z.number().optional(),
    status: z.string().optional(),
    interval: z.string().optional(),
    amount: z.number().optional(),
  })
  .optional();

const createSubscriptionInputSchema = z.object({
  customer: z.string(), // Customer email or code
  plan: z.string(), // Plan code
  authorization: z.string().optional(),
  start_date: z.date().optional(),
});

const listSubscriptionsInputSchema = z
  .object({
    perPage: z.number().optional(),
    page: z.number().optional(),
    customer: z.number().optional(), // Customer ID
    plan: z.number().optional(), // Plan ID
  })
  .optional();

const manageSubscriptionInputSchema = z.object({
  code: z.string(), // Subscription code
  token: z.string(), // Email token
});

// Schema for the new mutation input
const updateUserSubscriptionInputSchema = z.object({
  userId: z.string(),
  planCode: z.string(),
  interval: z.enum([
    // Make sure this matches plan intervals
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "biannually",
    "annually",
  ]),
  paystackCustomerId: z.string().optional(),
  paystackSubscriptionCode: z.string().optional().nullable(), // Make optional and nullable
  // Add other fields needed from the verified transaction or context
});

// --- tRPC Procedure Creation Function ---

export function createPaystackProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure // Pass your actual protected procedure
) {
  return {
    // --- Transactions ---
    initializeTransaction: protectedProcedure
      .input(initializeTransactionInputSchema)
      .mutation(async ({ input }) => {
        try {
          const response = await psInitializeTransaction(input);
          if (!response.status) {
            // Paystack uses { status: true/false }
            throw new Error(
              response.message || "Failed to initialize Paystack transaction."
            );
          }
          return response.data; // Contains authorization_url, access_code, reference
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "Paystack transaction initialization failed.",
            cause: error,
          });
        }
      }),

    verifyTransactionAndCreateSubscription: protectedProcedure // Make protected as it modifies user data
      .input(verifyTransactionInputSchema)
      .mutation(async ({ input, ctx }) => {
        try {
          // 0. Check for existing subscription
          const user = await AuthService.getCurrentUser();
          if (!user) throw new Error("Unauthenticated user");

          if (user.user.prefs.subscriptionStatus === "active") {
            return {
              success: true,
              message:
                "Transaction verified, subscription created, and user profile updated.",
              subscriptionCode: "",
              transactionStatus: "",
            };
          }

          // 1. Verify the transaction
          const verifyResponse = await psVerifyTransaction(input.reference);
          if (
            !verifyResponse.status ||
            !verifyResponse.data ||
            verifyResponse.data.status !== "success"
          ) {
            throw new Error(
              verifyResponse.message ||
                `Transaction verification failed or status was not 'success': ${verifyResponse.data?.status}`
            );
          }
          const transactionData = verifyResponse.data;

          // 2. Extract necessary details for subscription creation
          const metadata = transactionData.metadata as any;
          const customerEmail = transactionData.customer?.email;
          const planCode =
            // @ts-ignore
            transactionData.plan || metadata?.planCode;
          const authorizationCode =
            transactionData.authorization?.authorization_code;
          const userId = metadata?.userId;
          const isEligibleForTwoMonthFreeOffer = metadata?.isEligibleForTwoMonthFreeOffer === true;
          const planInterval = metadata?.interval?.toLowerCase();

          if (
            !customerEmail ||
            !planCode ||
            !authorizationCode ||
            !userId ||
            !planInterval
          ) {
            console.error("Missing data for subscription creation:", {
              customerEmail,
              planCode,
              authorizationCode,
              userId,
              planInterval,
              transactionData,
            });
            throw new Error(
              "Verification successful, but missing required details (email, planCode, authCode, userId, or interval) to create subscription."
            );
          }

          let paystackSubscriptionStartDate = new Date();
          if (true || isEligibleForTwoMonthFreeOffer) {
            const twoMonthsFromNow = new Date();
            twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
            paystackSubscriptionStartDate = twoMonthsFromNow;
          }

          // 3. Create the subscription on Paystack
          const createSubResponse = await psCreateSubscription({
            customer: customerEmail,
            plan: planCode,
            authorization: authorizationCode,
            start_date: paystackSubscriptionStartDate,
          });

          if (
            !createSubResponse.status ||
            // @ts-ignore
            !createSubResponse.data?.subscription_code
          ) {
            // Handle cases where subscription might already exist for this authorization/plan?
            // Paystack might return an error message indicating this.
            console.error(
              "Paystack subscription creation failed:",
              createSubResponse.message
            );
            throw new Error(
              createSubResponse.message ||
                "Failed to create Paystack subscription after successful payment."
            );
          }
          // @ts-ignore
          const subscriptionData = createSubResponse.data as Subscription;

          // 4. Update Appwrite User Document
          const paystackCustomerId =
            transactionData.customer?.customer_code ||
            String(transactionData.customer?.id || "");

          // Ensure planInterval is one of the allowed enum values (already checked if it exists)
          const validIntervals = [
            "hourly", // Though likely not used for this offer
            "daily", // Though likely not used for this offer
            "weekly", // Though likely not used for this offer
            "monthly",
            "quarterly",
            "biannually",
            "annually",
          ];
          if (!validIntervals.includes(planInterval)) {
            throw new Error(`Invalid plan interval received: ${planInterval}`);
          }

          let appwriteExpiryDate: Date;
          const currentDate = new Date();

          if (true || isEligibleForTwoMonthFreeOffer) {
            // Base expiry is 2 months from now + plan's original interval
            const twoMonthsFromNow = new Date(currentDate);
            twoMonthsFromNow.setMonth(currentDate.getMonth() + 2);
            appwriteExpiryDate = calculateExpiryDate(
              twoMonthsFromNow,
              planInterval
            );
          } else {
            // Standard expiry calculation
            appwriteExpiryDate = calculateExpiryDate(currentDate, planInterval);
          }

          await appwriteUpdateUserSubscription(userId, {
            subscriptionStatus: "active",
            planCode: planCode,
            subscriptionExpiry: appwriteExpiryDate,
            paystackCustomerId: paystackCustomerId,
            paystackSubscriptionToken: subscriptionData.email_token,
            paystackSubscriptionCode: subscriptionData.subscription_code,
          });

          // 5. Return success status and maybe subscription details
          return {
            success: true,
            message:
              "Transaction verified, subscription created, and user profile updated.",
            subscriptionCode: subscriptionData.subscription_code,
            transactionStatus: transactionData.status,
          };
        } catch (error: any) {
          console.error(
            "Error in verifyTransactionAndCreateSubscription:",
            error
          );
          // Rethrow as TRPCError
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error.message ||
              "Failed to verify payment and create subscription.",
            cause: error,
          });
        }
      }),

    // --- Plans ---
    createPlan: protectedProcedure // Admin/protected action
      .input(createPlanInputSchema)
      .mutation(async ({ input }) => {
        try {
          const response = await psCreatePlan(input);
          if (!response.status) {
            throw new Error(
              response.message || "Failed to create Paystack plan."
            );
          }
          return response.data; // Contains plan details like plan_code
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Paystack plan creation failed.",
            cause: error,
          });
        }
      }),

    listPlans: t.procedure // Public or protected based on needs
      .input(listPlansInputSchema)
      .query(async ({ input }) => {
        try {
          const response = await psListPlans(input as any); // Cast needed if input type mismatch with SDK
          if (!response.status) {
            throw new Error(
              response.message || "Failed to list Paystack plans."
            );
          }
          return response.data as unknown as IPlan[]; // Array of plans
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to fetch Paystack plans.",
            cause: error,
          });
        }
      }),

    // --- Subscriptions ---
    createSubscription: protectedProcedure
      .input(createSubscriptionInputSchema)
      .mutation(async ({ input }) => {
        try {
          const response = await psCreateSubscription(input);
          if (!response.status) {
            throw new Error(
              response.message || "Failed to create Paystack subscription."
            );
          }
          // @ts-ignore
          return response.data;
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Paystack subscription creation failed.",
            cause: error,
          });
        }
      }),

    listSubscriptions: protectedProcedure
      .input(listSubscriptionsInputSchema)
      .query(async ({ input }) => {
        try {
          const response = await psListSubscriptions(input);
          if (!response.status) {
            throw new Error(
              response.message || "Failed to list Paystack subscriptions."
            );
          }
          // @ts-ignore
          return response.data; // Array of subscriptions
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to fetch Paystack subscriptions.",
            cause: error,
          });
        }
      }),

    disableSubscription: protectedProcedure
      .input(manageSubscriptionInputSchema)
      .mutation(async ({ input }) => {
        try {
          const response = await psDisableSubscription(input);
          if (!response.status) {
            throw new Error(
              response.message || "Failed to disable Paystack subscription."
            );
          }
          return { success: true, message: response.message };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Paystack subscription disabling failed.",
            cause: error,
          });
        }
      }),

    enableSubscription: protectedProcedure
      .input(manageSubscriptionInputSchema)
      .mutation(async ({ input }) => {
        try {
          const response = await psEnableSubscription(input);
          if (!response.status) {
            throw new Error(
              response.message || "Failed to enable Paystack subscription."
            );
          }
          return { success: true, message: response.message };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Paystack subscription enabling failed.",
            cause: error,
          });
        }
      }),

    // Removed separate updateUserSubscription procedure as logic is now in verifyTransactionAndCreateSubscription
  };
}
