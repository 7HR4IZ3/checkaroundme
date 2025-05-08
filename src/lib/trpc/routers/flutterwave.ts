import { z } from "zod";
import {
  getAllPaymentPlans as fwGetAllPaymentPlans,
  initiatePayment as fwInitiatePayment,
  verifyTransaction as fwVerifyTransaction,
  createPaymentPlan as fwCreatePaymentPlan,
  getPaymentPlan as fwGetPaymentPlan,
  getAllSubscriptions as fwGetAllSubscriptions,
  getSubscription as fwGetSubscription,
  cancelSubscription as fwCancelSubscription,
  activateSubscription as fwActivateSubscription,
  createRefund as fwCreateRefund,
} from "@/lib/flutterwave"; // Assuming flutterwave.ts is in @/lib

import type { AppTRPC } from "../router";
import { TRPCError } from "@trpc/server";

// Define Zod schemas for input validation
const initiatePaymentInputSchema = z.object({
  // tx_ref is often generated server-side before calling Flutterwave,
  // or you might pass a base and append a timestamp/UUID.
  // For now, let's assume it's provided by the client or a previous step.
  // If generated server-side, this input might not need it.
  payment_plan: z.number(), // Plan ID is crucial
  amount: z.number(), // Amount in kobo/cents
  currency: z.string(),
  redirect_url: z.string().url(),
  customer: z.object({
    email: z.string().email(),
    name: z.string().optional(),
    phonenumber: z.string().optional(),
  }),
  meta: z.record(z.any()).optional(),
  customizations: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      logo: z.string().url().optional(),
    })
    .optional(),
});

const verifyTransactionInputSchema = z.object({
  transactionId: z.union([z.string(), z.number()]),
});

const getAllPaymentPlansInputSchema = z
  .object({
    // Define if there are any specific query params you want to allow
    // e.g., status: z.enum(["active", "cancelled"]).optional(),
  })
  .optional();

const createPaymentPlanInputSchema = z.object({
  amount: z.number().positive(),
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
  duration: z.number().positive().optional(),
  currency: z.string().optional(), // Defaults to NGN if not provided by Flutterwave
});

const getPaymentPlanInputSchema = z.object({
  planId: z.number().positive(),
});

const getAllSubscriptionsInputSchema = z
  .object({
    email: z.string().email().optional(),
    plan_id: z.number().positive().optional(),
    status: z.enum(["active", "cancelled", "completed"]).optional(), // Flutterwave uses 'cancelled'
  })
  .optional();

const getSubscriptionInputSchema = z.object({
  subscriptionId: z.number().positive(),
});

const cancelSubscriptionInputSchema = z.object({
  subscriptionId: z.number().positive(),
});

const activateSubscriptionInputSchema = z.object({
  subscriptionId: z.number().positive(),
});

const createRefundInputSchema = z.object({
  transactionId: z.number().positive(), // This is the Flutterwave transaction ID
  amount: z.number().positive().optional(),
});

// This function creates the procedures, similar to your message.ts
export function createFlutterwaveProcedures(
  t: AppTRPC,
  // You might need to pass protectedProcedure if it's defined separately
  // or if `t` already includes it. Assuming `t.procedure` can be chained with `.use(isAuthed)`
  // For simplicity, let's assume `t.procedure` is the base and we'll need a way to make it protected.
  // If your `protectedProcedure` is `t.procedure.use(middleware)`, that's fine.
  // If it's a separate export, you'd pass it in.
  // Let's assume a simple `protectedProcedure` for now.
  protectedProcedure: typeof t.procedure, // This is a placeholder, adjust to your actual protectedProcedure
) {
  return {
    getAllPaymentPlans: t.procedure // Publicly accessible to list plans
      .input(getAllPaymentPlansInputSchema)
      .query(async ({ input }) => {
        const response = await fwGetAllPaymentPlans(input);
        if (response.status === "error" || !response.data) {
          throw new Error(
            response.message ||
              "Failed to fetch payment plans from Flutterwave.",
          );
        }
        // Assuming response.data is an array of plans
        return response.data as any[]; // Cast as any[] for now, define a Plan type later
      }),

    initiatePayment: protectedProcedure // Payment initiation should be protected
      .input(initiatePaymentInputSchema)
      .mutation(async ({ input, ctx }) => {
        // Assuming ctx has user info
        // const user = (ctx as any).user; // Example: Get user from context
        // if (!user || !user.id || !user.email) {
        //   throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated.' });
        // }

        const paymentDetails = {
          ...input,
          // tx_ref should be unique for each transaction attempt.
          // It's good practice to generate this on the server.
          // tx_ref: `CKM-SUB-${Date.now()}-${user.id}-${input.payment_plan}`,
          tx_ref: `CKM-SUB-${Date.now()}-${input.customer.email.split("@")[0]}-${input.payment_plan}`, // Simplified tx_ref
        };
        const response = await fwInitiatePayment(paymentDetails);
        if (response.status === "error" || !response.data?.link) {
          throw new Error(
            response.message || "Failed to initiate payment with Flutterwave.",
          );
        }
        return response.data; // Should contain the payment link
      }),

    verifyTransaction: t.procedure // Verification might be public if called from a callback URL
      .input(verifyTransactionInputSchema)
      .query(async ({ input }) => {
        const response = await fwVerifyTransaction(input.transactionId);
        if (response.status === "error" || !response.data) {
          throw new Error(
            response.message ||
              "Failed to verify transaction with Flutterwave.",
          );
        }
        // Here, response.data should conform to VerifyTransactionData
        return response.data;
      }),

    createPaymentPlan: protectedProcedure // Creating plans should be protected
      .input(createPaymentPlanInputSchema)
      .mutation(async ({ input }) => {
        const response = await fwCreatePaymentPlan(input);
        if (response.status === "error" || !response.data) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              response.message ||
              "Failed to create payment plan with Flutterwave.",
          });
        }
        return response.data;
      }),

    getPaymentPlan: t.procedure // Public or protected depending on use case
      .input(getPaymentPlanInputSchema)
      .query(async ({ input }) => {
        const response = await fwGetPaymentPlan(input.planId);
        if (response.status === "error" || !response.data) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: response.message || "Payment plan not found.",
          });
        }
        return response.data;
      }),

    getAllSubscriptions: protectedProcedure // Listing subscriptions should be protected
      .input(getAllSubscriptionsInputSchema)
      .query(async ({ input }) => {
        const response = await fwGetAllSubscriptions(input);
        if (response.status === "error" || !response.data) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: response.message || "Failed to fetch subscriptions.",
          });
        }
        return response.data;
      }),

    getSubscription: protectedProcedure // Getting a specific subscription
      .input(getSubscriptionInputSchema)
      .query(async ({ input }) => {
        const response = await fwGetSubscription(input.subscriptionId);
        if (response.status === "error" || !response.data) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: response.message || "Subscription not found.",
          });
        }
        return response.data;
      }),

    cancelSubscription: protectedProcedure
      .input(cancelSubscriptionInputSchema)
      .mutation(async ({ input }) => {
        const response = await fwCancelSubscription(input.subscriptionId);
        if (response.status === "error") {
          // Flutterwave might return success even if already cancelled, check message/data if needed
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: response.message || "Failed to cancel subscription.",
          });
        }
        return response.data; // Or a simple { success: true }
      }),

    activateSubscription: protectedProcedure
      .input(activateSubscriptionInputSchema)
      .mutation(async ({ input }) => {
        const response = await fwActivateSubscription(input.subscriptionId);
        if (response.status === "error") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: response.message || "Failed to activate subscription.",
          });
        }
        return response.data; // Or a simple { success: true }
      }),

    createRefund: protectedProcedure // Refunds are highly sensitive
      .input(createRefundInputSchema)
      .mutation(async ({ input }) => {
        const refundDetails = {
          id: input.transactionId,
          amount: input.amount,
        };
        const response = await fwCreateRefund(refundDetails);
        if (response.status === "error") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: response.message || "Failed to process refund.",
          });
        }
        return response.data; // Contains refund details
      }),
  };
}
