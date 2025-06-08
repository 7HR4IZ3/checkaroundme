import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AuthenticationFactor, Models } from "appwrite";
import { AuthService } from "@/lib/appwrite/services/auth";
import { users, MailingListService } from "@/lib/appwrite";
import { emailService } from "@/lib/email/EmailService";
import { changePasswordSchema, registerInputSchema } from "@/lib/schema";

import type { AppTRPC } from "../router";
import { createSessionClient } from "@/lib/appwrite/session";

export function createAuthProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure
) {
  async function verifyCaptcha(
    token: string
  ): Promise<{ success: boolean; score?: number; "error-codes"?: string[] }> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error(
        "RECAPTCHA_SECRET_KEY is not set in environment variables."
      );
      // Depending on security policy, either fail open or closed. Failing closed is safer.
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Captcha configuration error.",
      });
    }

    // console.log("Verifying captcha token:", token);

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

        try {
          const { user, account } = await AuthService.register(
            input.email,
            input.password,
            input.name,
            input.phone
          );

          // Send welcome email
          try {
            await emailService.sendUserWelcomeEmail(
              account.email,
              account.name
            );
          } catch (emailError) {
            console.error("Error sending welcome email:", emailError);
            // Decide how to handle email sending failure (e.g., log, alert admin)
            // Registration should likely still succeed even if email fails.
          }

          // Handle mailing list opt-in
          if (input.optInMailingList) {
            try {
              await MailingListService.addEmail(input.email);
            } catch (error) {
              console.error("Error subscribing user to mailing list:", error);
              // Optionally throw an error or log, but don't block registration
            }
          }

          if (input.login) {
            const { session } = await AuthService.login(
              input.email,
              input.password
            );

            const { account } = await createSessionClient(session);
            await account.createVerification(
              `${process.env.APP_URL}/api/verify-email`
            );

            // // Set 2FA enabled and not verified for the new user
            // const preferences = await users.getPrefs(user.$id);

            // // Send OTP after registration (always)
            // const challenge = await account.createVerification(
            //   AuthenticationFactor.Email
            // );

            // await users.updatePrefs(user.$id, {
            //   ...preferences,
            //   challenge,
            //   twoFactorEnabled: true,
            //   twoFactorVerified: false,
            // });
          }

          return { success: true };
        } catch (error) {
          console.error(error);
          throw error;
        }
      }),

    login: protectedProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          captchaToken: z.string(),
        })
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

        const { session } = await AuthService.login(
          input.email,
          input.password
        );

        // After login, check if 2FA is enabled and not verified, then send OTP
        const auth = await AuthService.getCurrentUser();
        if (!auth) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Please sign in",
          });
        }

        // if (
        //   auth.user.prefs?.twoFactorEnabled &&
        //   !auth.user.prefs?.twoFactorVerified
        // ) {
        //   const { account } = await createSessionClient(session);
        //   const challenge = await account.createMfaChallenge(
        //     AuthenticationFactor.Email
        //   );
        //   const preferences = await users.getPrefs(auth.user.$id);
        //   await users.updatePrefs(auth.user.$id, {
        //     ...preferences,
        //     challenge,
        //   });
        // }
        return { success: true };
      }),

    loginWithGoogle: protectedProcedure
      .input(
        z.object({
          redirectUrl: z.string().url(),
          captchaToken: z.string(),
        })
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
        })
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

    sendEmailVerification: t.procedure.input(z.void()).mutation(async () => {
      const auth = await AuthService.getCurrentUserWithAcount();
      if (!auth?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Please sign in",
        });
      }

      try {
        await auth.account.createVerification(
          `${process.env.APP_URL}/api/verify-email`
        );
        return { success: true };
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification email. Please try again later.",
        });
      }
    }),

    getCurrentUser: t.procedure.input(z.void()).query(async () => {
      return await AuthService.getCurrentUser();
    }),

    getCurrentUserWithProfile: t.procedure.input(z.void()).query(async () => {
      return await AuthService.getCurrentUserWithProfile();
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

    resetPassword: protectedProcedure
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
            input.newPassword
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

    start2FA: protectedProcedure
      .input(
        z.object({
          factor: z
            .enum(["email", "phone", "totp", "recoverycode"])
            .default("email"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const auth = await AuthService.getCurrentUserWithAcount();
          if (!auth?.user) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Please sign in",
            });
          }

          // Always send a new OTP challenge
          const challenge = await auth.account.createMfaChallenge(
            input.factor as AuthenticationFactor
          );
          const preferences = await users.getPrefs(auth.user.$id);
          await users.updatePrefs(auth.user.$id, {
            ...preferences,
            challenge,
          });
          return challenge;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send OTP",
          });
        }
      }),

    verify2FA: protectedProcedure
      .input(z.object({ otp: z.string().min(4) }))
      .mutation(async ({ input }) => {
        try {
          // Mark user as 2FA verified in prefs
          const auth = await AuthService.getCurrentUserWithAcount();
          if (!auth?.user) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Please sign in",
            });
          }

          const preferences = await users.getPrefs(auth.user.$id);
          if (!preferences.challange?.$id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "You don't have a pending OTP request",
            });
          }

          // Verify OTP using Appwrite
          await auth.account.updateMfaChallenge(
            preferences.challenge.$id,
            input.otp
          );

          await users.updatePrefs(auth.user.$id, {
            ...preferences,
            challenge: null,
            twoFactorVerified: true,
          });
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error?.message || "Invalid OTP",
          });
        }
      }),

    check2FAStatus: protectedProcedure
      .input(z.object({}))
      .query(async ({ ctx }) => {
        try {
          const auth = await AuthService.getCurrentUser();

          if (!auth) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Please sign in",
            });
          }

          // Check if user has 2FA enabled and verified
          const twoFactorEnabled = auth.user.prefs?.twoFactorEnabled ?? false;
          const twoFactorVerified = auth.user.prefs?.twoFactorVerified ?? false;
          return { twoFactorEnabled, twoFactorVerified };
        } catch {
          return { twoFactorEnabled: false, twoFactorVerified: false };
        }
      }),
  };
}
