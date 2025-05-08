import { z } from "zod";
import { UserService } from "../../appwrite";
import { updateUserSchema } from "../../schema";

import type { AppTRPC } from "../router";

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

    updateUser: t.procedure
      .input(
        z.object({
          userId: z.string(),
          data: updateUserSchema,
        }),
      )
      .mutation(async ({ input }) => {
        return await UserService.updateUser(input.userId, input.data);
      }),

    uploadAvatar: t.procedure
      .input(
        z.object({
          file: z.any(), // File upload handling may need to be adapted for your setup
          userId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        return await UserService.uploadAvatar(input.file, input.userId);
      }),
  };
}
