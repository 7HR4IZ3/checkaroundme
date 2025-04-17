import { z } from "zod";
import { AuthService } from "../appwrite";
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
  };
}
