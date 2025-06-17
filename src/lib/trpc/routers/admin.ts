import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createPlan,
  listPlans,
  listSubscriptions,
  verifyTransaction,
  fetchCustomer,
  listCustomers,
} from "@/lib/paystack";
import { AuthService } from "@/lib/appwrite/services/auth";
import { PaymentTransactionService } from "@/lib/appwrite";
import {
  paymentTransactionSchema,
  paystackCustomerSchema,
  paystackSubscriptionSchema,
} from "@/lib/schema";

import type { AppTRPC } from "../router";
import { IPlan } from "paystack-sdk/dist/plan";
import { ListSubscriptions, Subscription } from "paystack-sdk/dist/subscription";

// Helper function to check admin status
async function verifyAdmin() {
  const auth = await AuthService.getCurrentUser();
  if (!auth?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  // Check if user has admin role/permissions
  const isAdmin = auth.user.labels.includes("admin");
  if (!isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not authorized",
    });
  }

  return auth;
}

export function createAdminProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure
) {
  const adminProcedure = protectedProcedure.use(
    t.middleware(async ({ ctx, next }) => {
      return next({ ctx });
    })
  );

  return {
    // List all transactions with filtering and pagination
    listTransactions: adminProcedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(10),
          status: z
            .enum(["succeeded", "failed", "pending", "refunded"])
            .optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const transactions = await PaymentTransactionService.listTransactions(
            {
              page: input.page,
              perPage: input.limit,
              status: input.status,
              startDate: input.startDate,
              endDate: input.endDate,
              search: input.search,
            }
          );

          return transactions;
        } catch (error) {
          console.error("Error fetching transactions:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch transactions",
          });
        }
      }),

    // Get transaction details
    getTransactionDetails: adminProcedure
      .input(
        z.object({
          reference: z.string(),
        })
      )
      .query(async ({ input }) => {
        try {
          const transaction = await verifyTransaction(input.reference);
          return paymentTransactionSchema.parse(transaction.data);
        } catch (error) {
          console.error("Error fetching transaction details:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch transaction details",
          });
        }
      }),

    // List all subscriptions with filtering
    listSubscriptions: adminProcedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(10),
          status: z.enum(["active", "cancelled", "pending"]).optional(),
          planId: z.number().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const subscriptions = await listSubscriptions({
            page: input.page,
            perPage: input.limit,
            plan: input.planId,
          });

          if (!subscriptions.status) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to fetch subscriptions",
            });
          }

          // @ts-ignore
          return subscriptions.data as Subscription[];
        } catch (error) {
          console.error("Error fetching subscriptions:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch subscriptions",
          });
        }
      }),

    // Get subscription analytics
    getSubscriptionAnalytics: adminProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          // Implement subscription analytics logic here
          const analytics = {
            totalActive: 0,
            totalCancelled: 0,
            revenueThisMonth: 0,
            // Add more metrics as needed
          };

          return analytics;
        } catch (error) {
          console.error("Error fetching subscription analytics:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch subscription analytics",
          });
        }
      }),

    // List all plans
    listPlans: adminProcedure.input(z.void()).query(async ({ input }) => {
      try {
        const plans = await listPlans();
        return plans.data as unknown as IPlan[];
      } catch (error) {
        console.error("Error fetching plans:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch plans",
        });
      }
    }),

    // Plans Management
    createPlan: adminProcedure
      .input(
        z.object({
          name: z.string(),
          amount: z.number(),
          interval: z.enum(["monthly", "quarterly", "annually"]),
          description: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const response = await createPlan(input);
          return response.data;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create plan",
          });
        }
      }),

    updatePlan: adminProcedure
      .input(
        z.object({
          planId: z.string(),
          name: z.string().optional(),
          description: z.string().optional(),
          features: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Implement plan update logic
      }),

    // Customers Management
    listCustomers: adminProcedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(10),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const response = await listCustomers({
            page: input.page,
            perPage: input.limit,
          });

          return response.data;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch customers",
          });
        }
      }),

    getCustomerDetails: adminProcedure
      .input(
        z.object({
          customerId: z.string(),
        })
      )
      .query(async ({ input }) => {
        try {
          const customer = await fetchCustomer(input.customerId);
          return customer.data;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch customer details",
          });
        }
      }),

    getCustomerTransactions: adminProcedure
      .input(
        z.object({
          customerId: z.string(),
          page: z.number().default(1),
          limit: z.number().default(10),
        })
      )
      .query(async ({ input }) => {
        try {
          const customer = await fetchCustomer(input.customerId);
          if (!customer.data?.email) {
            throw new Error("Customer not found");
          }

          // Filter transactions by customer email
          const transactions = await PaymentTransactionService.listTransactions(
            {
              page: input.page,
              perPage: input.limit,
              search: customer.data.email,
            }
          );

          return transactions;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch customer transactions",
          });
        }
      }),
  };
}
