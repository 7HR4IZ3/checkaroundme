import { z } from "zod";
import { UserService, account } from "../../appwrite";
import {
  updateUserSchema,
  userSettingsSchema,
  userSubscriptionSchema,
  paymentTransactionSchema,
} from "../../schema";
import { TRPCError } from "@trpc/server";

import type { AppTRPC } from "../router";
import { AppwriteException } from "appwrite";
import { AuthService } from "@/lib/appwrite/services/auth";

export function createUserProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure
) {
  return {
    getUserById: t.procedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await UserService.getUserById(input.userId);
      }),

    getUserProfileById: t.procedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await UserService.getUserProfileById(input.userId);
      }),

    updateUser: protectedProcedure
      .input(updateUserSchema)
      .mutation(async ({ ctx, input }) => {
        const user = await AuthService.getCurrentUser();
        const userId = user?.user.$id;
        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return await UserService.updateUser(userId, input);
      }),

    getUserSettings: protectedProcedure.query(async ({ ctx }) => {
      const user = await AuthService.getCurrentUser();
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
        return await UserService.getUserSubscription(userId);
      } catch (error) {
        console.error("Failed to get user subscription:", error);
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
          cursor: z.string().nullish(),
        })
      )
      .query(async ({ ctx, input }) => {
        const user = await AuthService.getCurrentUser();
        const userId = user?.user.$id;
        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        try {
          return await UserService.getPaymentHistory(
            userId,
            input.limit ?? 10,
            input.cursor ?? undefined
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
