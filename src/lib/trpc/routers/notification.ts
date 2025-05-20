import { z } from "zod";
import type { AppTRPC } from "../router";
import { NotificationService } from "@/lib/appwrite";

export const createNotificationProcedures = (
  t: AppTRPC,
  protectedProcedure: typeof t.procedure
) => ({
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return NotificationService.getUserNotifications(
        input.limit,
        input.offset
      );
    }),

  markAsRead: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await NotificationService.markAsRead(input);
    }),

  registerDeviceToken: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await NotificationService.registerDeviceToken(input);
    }),
});