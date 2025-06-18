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
import { PaymentTransactionService, USERS_COLLECTION_ID } from "@/lib/appwrite";
import {
  paymentTransactionSchema,
  paystackCustomerSchema,
  paystackSubscriptionSchema,
} from "@/lib/schema";

import type { AppTRPC } from "../router";
import { IPlan } from "paystack-sdk/dist/plan";
import {
  ListSubscriptions,
  Subscription,
} from "paystack-sdk/dist/subscription";
import { Query } from "appwrite";
import { databases } from "@/lib/appwrite";
import {
  DATABASE_ID,
  BUSINESSES_COLLECTION_ID,
  REVIEWS_COLLECTION_ID,
} from "@/lib/appwrite/index";

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

    getRevenueData: adminProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const result =
            await PaymentTransactionService.getTransactionAmountsByPeriod(
              "daily",
              input.startDate ||
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              input.endDate || new Date().toISOString()
            );

          // Transform data for the chart
          return Object.entries(result).map(([date, amount]) => ({
            date,
            amount,
          }));
        } catch (error) {
          console.error("Error fetching revenue data:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch revenue data",
          });
        }
      }),

    getTransactionStats: adminProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          return await PaymentTransactionService.getTransactionStats(
            input.startDate,
            input.endDate
          );
        } catch (error) {
          console.error("Error fetching transaction stats:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch transaction stats",
          });
        }
      }),

    getBusinessStats: adminProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const queries = [];
          if (input.startDate) {
            queries.push(Query.greaterThanEqual("createdAt", input.startDate));
          }
          if (input.endDate) {
            queries.push(Query.lessThanEqual("createdAt", input.endDate));
          }

          const businesses = await databases.listDocuments(
            DATABASE_ID,
            BUSINESSES_COLLECTION_ID,
            queries
          );

          // Calculate category distribution
          const categoryCount: { [key: string]: number } = {};
          businesses.documents.forEach((business) => {
            business.categories.forEach((category: string) => {
              categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
          });

          const categoryDistribution = Object.entries(categoryCount).map(
            ([name, value]) => ({
              name,
              value,
            })
          );

          return {
            totalCount: businesses.total,
            verifiedCount: businesses.documents.filter((b) => b.isVerified)
              .length,
            categoryDistribution,
          };
        } catch (error) {
          console.error("Get business stats error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch business stats",
          });
        }
      }),

    getUserStats: adminProcedure.query(async () => {
      try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const allUsers = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID
        );
        const newUsers = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.greaterThan("createdAt", weekAgo.toISOString())]
        );

        return {
          total: allUsers.total,
          newUsers: newUsers.total,
          activeUsers: allUsers.documents.filter(
            (user) => user.lastSeen && new Date(user.lastSeen) > weekAgo
          ).length,
        };
      } catch (error) {
        console.error("Get user stats error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user statistics",
        });
      }
    }),

    // Add these new procedures for the dashboard
    listBusinesses: adminProcedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(10),
          status: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const offset = (input.page - 1) * input.limit;
          const queries = [
            Query.orderDesc("$createdAt"),
            Query.limit(input.limit),
            Query.offset(offset),
          ];

          if (input.status) {
            queries.push(Query.equal("status", input.status));
          }

          const result = await databases.listDocuments(
            DATABASE_ID,
            BUSINESSES_COLLECTION_ID,
            queries
          );

          return {
            data: result.documents,
            total: result.total,
            page: input.page,
            limit: input.limit,
          };
        } catch (error) {
          console.error("List businesses error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch businesses",
          });
        }
      }),
  };
}
