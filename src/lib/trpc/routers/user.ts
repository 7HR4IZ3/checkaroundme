import { z } from "zod";
import { UserService, account } from "../../appwrite"; // Assuming account is exported for direct use or UserService wraps it
import {
  updateUserSchema,
  userSettingsSchema,
  userSubscriptionSchema,
  paymentTransactionSchema, // Assuming this will be used for the return type of getPaymentHistory
} from "../../schema";
import { TRPCError } from "@trpc/server";

import type { AppTRPC } from "../router";
import { AppwriteException } from "appwrite";
import { AuthService } from "@/lib/appwrite/services/auth";

export function createUserProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure,
) {
  return {
    getUserById: t.procedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await UserService.getUserById(input.userId);
      }),

    updateUser: protectedProcedure // Changed to protectedProcedure
      .input(
        // UserId is now derived from context, so only data is needed in input
        updateUserSchema
      )
      .mutation(async ({ ctx, input }) => {
        const user = await AuthService.getCurrentUser();
        const userId = user?.user.$id;
        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        // UserService.updateUser now takes (targetUserId, data)
        // The first userId parameter was for authenticatedUserId, which is now handled inside the service.
        // So we pass the authenticated user's ID as the targetId.
        return await UserService.updateUser(userId, input);
      }),

    // uploadAvatar tRPC procedure is removed as per previous change to use API Route for avatar uploads.

    getUserSettings: protectedProcedure.query(async ({ ctx }) => {
      const user = await AuthService.getCurrentUser(); // Assuming userId is available in context after auth
      const userId = user?.user.$id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      try {
        return await UserService.getUserSettings(userId);
      } catch (error) {
        if (error instanceof AppwriteException && error.code === 404) {
          // If prefs don't exist, return default settings
          return userSettingsSchema.parse({});
        }
        console.error("Failed to get user settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve user settings.",
        });
      }
    }),

    updateUserSettings: protectedProcedure
      .input(userSettingsSchema)
      .mutation(async ({ ctx, input }) => {
        const user = await AuthService.getCurrentUser();
        const userId = user?.user.$id;
        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        try {
          return await UserService.updateUserSettings(userId, input);
        } catch (error) {
          console.error("Failed to update user settings:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user settings.",
          });
        }
      }),

    getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
      const user = await AuthService.getCurrentUser();
      const userId = user?.user.$id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      try {
        // This might involve fetching from Appwrite prefs and/or Paystack/Flutterwave
        return await UserService.getUserSubscription(userId);
      } catch (error) {
        console.error("Failed to get user subscription:", error);
        // If prefs don't exist or no active subscription, return default/empty state
        if (error instanceof AppwriteException && error.code === 404) {
          return userSubscriptionSchema.parse({}); // Default empty state
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve user subscription details.",
        });
      }
    }),

    getPaymentHistory: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).nullish(),
          cursor: z.string().nullish(), // Appwrite cursor for pagination
        }),
      )
      .query(async ({ ctx, input }) => {
        const user = await AuthService.getCurrentUser();
        const userId = user?.user.$id;
        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        try {
          // This will query the `payment_transactions` collection in Appwrite
          return await UserService.getPaymentHistory(
            userId,
            input.limit ?? 10,
            input.cursor ?? undefined, // Ensure null is converted to undefined
          );
        } catch (error) {
          console.error("Failed to get payment history:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve payment history.",
          });
        }
      }),
  };
}
