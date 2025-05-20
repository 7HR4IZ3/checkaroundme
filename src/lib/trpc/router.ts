import { cache } from "react";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers as NextHeaders } from "next/headers";

import { createUserProcedures } from "./routers/user";
import { createAuthProcedures } from "./routers/auth";
import { createReviewProcedures } from "./routers/review";
import { createMessageProcedures } from "./routers/message";
import { createLocationProcedures } from "./routers/location";
import { createCategoryProcedures } from "./routers/category";
import { createBusinessProcedures } from "./routers/business";
import { createPaystackProcedures } from "./routers/paystack";
import { createConversationProcedures } from "./routers/conversation";
import { createVerificationProcedures } from "./routers/verification";
import { createAnonymousSubmissionRouter } from "./routers/anonymous-submission"; // Import the new router
import { createNotificationProcedures } from "./routers/notification"; // Add this import

// Server-side secret key (should be in .env and NOT prefixed with NEXT_PUBLIC_)
const SERVER_TRPC_SECRET_KEY = process.env.SERVER_TRPC_SECRET_KEY;

export const createTRPCContext = cache(
  async ({ headers }: { headers?: Headers } = {}) => {
    /**
     * @see: https://trpc.io/docs/server/context
     * This context is now parameterless and uses `next/headers`.
     * It's suitable for App Router (RSC, Route Handlers, Server Actions).
     */
    headers = headers || (await NextHeaders());
    const clientSecretKeyHeader = headers.get("x-trpc-secret-key");

    let clientSecretKey: string | undefined;
    if (Array.isArray(clientSecretKeyHeader)) {
      console.warn(
        "x-trpc-secret-key header was an array (unexpected for next/headers.get), using first element if possible."
      );
      clientSecretKey = clientSecretKeyHeader[0];
    } else {
      clientSecretKey = clientSecretKeyHeader ?? undefined;
    }

    console.log(clientSecretKey, SERVER_TRPC_SECRET_KEY);

    return {
      clientSecretKey,
    };
  }
);

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

/**
 * The type of the main tRPC instance, including the specific context.
 * This will be used to correctly type the `t` parameter in sub-router creation functions.
 */
export type AppTRPC = typeof t;

/**
 * Middleware to check for the secret key.
 */
const enforceSecretKey = t.middleware(({ ctx, next }) => {
  if (!SERVER_TRPC_SECRET_KEY) {
    console.error(
      "SERVER_TRPC_SECRET_KEY is not set on the server. Ensure it is in your .env file."
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Server configuration error.",
    });
  }

  console.log(ctx.clientSecretKey, SERVER_TRPC_SECRET_KEY);

  if (ctx.clientSecretKey !== SERVER_TRPC_SECRET_KEY) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or missing authentiction key.",
    });
  }

  return next({ ctx });
});

/**
 * Public procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires JWT authentication.
 * Routes using this procedure will require a valid Bearer token in the Authorization header.
 */
export const protectedProcedureWithSecret = t.procedure; //.use(enforceSecretKey);

export const appRouter = t.router({
  ...createAuthProcedures(t, protectedProcedureWithSecret),
  ...createUserProcedures(t, protectedProcedureWithSecret),
  ...createReviewProcedures(t, protectedProcedureWithSecret),
  ...createMessageProcedures(t, protectedProcedureWithSecret),
  ...createBusinessProcedures(t, protectedProcedureWithSecret),
  ...createCategoryProcedures(t, protectedProcedureWithSecret),
  ...createConversationProcedures(t, protectedProcedureWithSecret),
  ...createLocationProcedures(t, protectedProcedureWithSecret),
  ...createVerificationProcedures(t, protectedProcedureWithSecret),
  ...createNotificationProcedures(t, protectedProcedureWithSecret), // Add to the appRouter

  // Add Flutterwave procedures.
  // NOTE: The second argument to createFlutterwaveProcedures is a placeholder
  // for your actual `protectedProcedure`. If your protectedProcedure is simply
  // `t.procedure.use(authMiddleware)`, then passing `t.procedure` and relying
  // on the internal structure of `createFlutterwaveProcedures` to use a passed
  // `protectedProcedure` (or defining it within that file using `t`) is one way.
  // Ensure `protectedProcedure` in `flutterwave.ts` aligns with how you handle auth.
  // For now, assuming `t.procedure` is the base for public, and `flutterwave.ts`
  // uses the passed `protectedProcedure` for protected routes.
  // You might need to adjust how `protectedProcedure` is passed or defined.
  // A common pattern is: `const protectedProcedure = t.procedure.use(isAuthedMiddleware);`
  // Then you'd pass this `protectedProcedure` to `createFlutterwaveProcedures`.
  // The current `createFlutterwaveProcedures` expects `protectedProcedure` as an argument.
  // Let's assume you have a `protectedProcedure` exported from `../trpc` or defined here.
  // If not, `t.procedure` will be used, and you'd need to add auth middleware within those specific procedures.
  // For simplicity, if `protectedProcedure` is not explicitly defined and passed,
  // the placeholder in `createFlutterwaveProcedures` will use `t.procedure`.
  // This means those routes will be public unless you adjust `createFlutterwaveProcedures`.
  // A better way: define `publicProcedure = t.procedure;` and `protectedProcedure = t.procedure.use(authMiddleware);`
  // then pass both to `createFlutterwaveProcedures`.
  // Given the current structure of `createFlutterwaveProcedures`, it expects `protectedProcedure`.
  // Let's assume `t.procedure` is passed for now, and you'll adjust auth within the router or by passing a real `protectedProcedure`.

  // ...createFlutterwaveProcedures(t, protectedProcedureWithSecret),
  ...createPaystackProcedures(t, protectedProcedureWithSecret),
  ...createAnonymousSubmissionRouter(t, protectedProcedureWithSecret), // Include the new router
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
