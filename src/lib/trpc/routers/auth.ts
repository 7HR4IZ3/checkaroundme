import { z } from "zod";
import { AuthService } from "../../appwrite/services/auth";
import { changePasswordSchema, registerInputSchema } from "../../schema";
import SuperJSON from "superjson";
import { TRPCError } from "@trpc/server";

import type { AppTRPC } from "../router"; // Import the AppTRPC type

export function createAuthProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure,
) {
  async function verifyCaptcha(
    token: string,
  ): Promise<{ success: boolean; score?: number; "error-codes"?: string[] }> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error(
        "RECAPTCHA_SECRET_KEY is not set in environment variables.",
      );
      // Depending on security policy, either fail open or closed. Failing closed is safer.
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Captcha configuration error.",
      });
    }

    console.log("Verifying captcha token:", token);

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    try {
      const response = await fetch(verificationUrl, { method: "POST" });
      const data: {
        success: boolean;
        score?: number;
        "error-codes"?: string[];
      } = await response.json();
      return data;
    } catch (error) {
      console.error("Captcha verification request failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to verify captcha.",
      });
    }
  }

  return {
    register: protectedProcedure
      .input(registerInputSchema)
      .mutation(async ({ input }) => {
        const captchaResult = await verifyCaptcha(input.captchaToken);
        if (!captchaResult.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Captcha verification failed: ${
              captchaResult["error-codes"]?.join(", ") || "Unknown error"
            }`,
          });
        }
        await AuthService.register(
          input.email,
          input.password,
          input.name,
          input.phone,
        );

        if (input.login) {
          return await AuthService.login(input.email, input.password);
        } else {
          return { success: true };
        }
      }),

    login: protectedProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          captchaToken: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const captchaResult = await verifyCaptcha(input.captchaToken);
        if (!captchaResult.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Captcha verification failed: ${
              captchaResult["error-codes"]?.join(", ") || "Unknown error"
            }`,
          });
        }
        return await AuthService.login(input.email, input.password);
      }),

    loginWithGoogle: protectedProcedure
      .input(
        z.object({
          redirectUrl: z.string().url(),
          captchaToken: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const captchaResult = await verifyCaptcha(input.captchaToken);
        if (!captchaResult.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Captcha verification failed: ${
              captchaResult["error-codes"]?.join(", ") || "Unknown error"
            }`,
          });
        }
        return await AuthService.loginWithGoogle(input.redirectUrl);
      }),

    requestPasswordReset: protectedProcedure
      .input(
        z.object({
          email: z.string().email(),
          captchaToken: z.string(), // Added captcha token
        }),
      )
      .mutation(async ({ input }) => {
        const captchaResult = await verifyCaptcha(input.captchaToken);
        if (!captchaResult.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Captcha verification failed: ${
              captchaResult["error-codes"]?.join(", ") || "Unknown error"
            }`,
          });
        }

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
        }),
      )
      .mutation(async ({ input }) => {
        return await AuthService.completeOauth2Login(
          input.userId,
          input.secret,
        );
      }),

    logout: t.procedure.input(z.void()).mutation(async () => {
      return await AuthService.logout();
    }),

    resetPassword: protectedProcedure
      .input(
        z.object({
          userId: z.string(),
          secret: z.string(),
          password: z.string().min(6), // Ensure password meets minimum length
        }),
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
            input.password,
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

    changePassword: protectedProcedure // User must be logged in to change their password
      .input(changePasswordSchema)
      .mutation(async ({ input, ctx }) => {
        // No captcha needed here as user is authenticated
        // The AuthService.changePassword method will need the current user's session
        // or rely on Appwrite's Account service to use the active session.
        try {
          // AuthService.changePassword will call Appwrite's account.updatePassword
          await AuthService.changePassword(
            input.currentPassword,
            input.newPassword,
          );
          return { success: true, message: "Password changed successfully." };
        } catch (error: any) {
          console.error("Change password error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to change password.",
          });
        }
      }),
  };
}
