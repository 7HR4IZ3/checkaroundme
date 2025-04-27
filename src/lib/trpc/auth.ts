import { z } from "zod";
import { AuthService } from "../appwrite/services/auth";
import SuperJSON from "superjson";

export function createAuthProcedures(
  t: ReturnType<
    typeof import("@trpc/server").initTRPC.create<{
      transformer: typeof SuperJSON;
    }>
  >
) {
  return {
    register: t.procedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string(),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await AuthService.register(
          input.email,
          input.password,
          input.name,
          input.phone
        );
      }),

    login: t.procedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        return await AuthService.login(input.email, input.password);
      }),

    loginWithGoogle: t.procedure
      .input(
        z.object({
          redirectUrl: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        return await AuthService.loginWithGoogle(input.redirectUrl);
      }),

    requestPasswordReset: t.procedure
      .input(
        z.object({
          email: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        // TODO: Implement AuthService.requestPasswordReset in src/lib/appwrite/index.ts (or relevant file)
        // This assumes the service method returns { success: boolean, message?: string }
        // Appwrite's createRecovery returns a promise resolving to an empty object on success or throws.
        // Adapt the actual implementation and return type as needed.
        try {
          // Placeholder URL for the reset page - replace with your actual reset page URL
          const resetPageUrl = `${process.env.APP_URL}/auth/reset-password`;
          await AuthService.requestPasswordReset(input.email, resetPageUrl);
          return { success: true };
        } catch (error: any) {
          console.error("Password reset request failed:", error);
          // Provide a generic error message or parse Appwrite error if possible
          return {
            success: false,
            message: error.message || "Failed to send password reset email.",
          };
        }
      }),

    getCurrentUser: t.procedure.input(z.void()).query(async () => {
      return await AuthService.getCurrentUser();
    }),

    completeOauthLogin: t.procedure
      .input(
        z.object({
          userId: z.string(),
          secret: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await AuthService.completeOauth2Login(
          input.userId,
          input.secret
        );
      }),

    logout: t.procedure.input(z.void()).mutation(async () => {
      return await AuthService.logout();
    }),

    resetPassword: t.procedure
      .input(
        z.object({
          userId: z.string(),
          secret: z.string(),
          password: z.string().min(6), // Ensure password meets minimum length
        })
      )
      .mutation(async ({ input }) => {
        // TODO: Implement AuthService.resetPassword in src/lib/appwrite/index.ts (or relevant file)
        // This assumes the service method returns { success: boolean, message?: string }
        // Appwrite's updateRecovery resolves with an empty object on success or throws.
        // Adapt the actual implementation and return type as needed.
        try {
          await AuthService.resetPassword(
            input.userId,
            input.secret,
            input.password
          );
          return { success: true };
        } catch (error: any) {
          console.error("Password reset failed:", error);
          // Provide a generic error message or parse Appwrite error if possible
          return {
            success: false,
            message: error.message || "Failed to reset password.",
          };
        }
      }),
  };
}
