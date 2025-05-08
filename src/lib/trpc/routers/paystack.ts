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
  // Import other necessary functions from your paystack lib if needed
} from "@/lib/paystack"; // Assuming paystack/index.ts is in @/lib

import type SuperJSON from "superjson"; // For tRPC instance type

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

// --- tRPC Procedure Creation Function ---

export function createPaystackProcedures(
  t: ReturnType<
    typeof import("@trpc/server").initTRPC.create<{
      transformer: typeof SuperJSON;
      // context: Context; // Add your context type if needed
    }>
  >,
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

    verifyTransaction: t.procedure // Often public for callback handling
      .input(verifyTransactionInputSchema)
      .query(async ({ input }) => {
        // Changed to query
        try {
          const response = await psVerifyTransaction(input.reference);
          if (!response.status) {
            throw new Error(
              response.message || "Failed to verify Paystack transaction."
            );
          }
          return response.data; // Contains transaction details
        } catch (error: any) {
          // Handle specific Paystack errors if needed (e.g., transaction not found)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR", // Or NOT_FOUND based on error
            message:
              error.message || "Paystack transaction verification failed.",
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
          return response.data; // Array of plans
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
  };
}
