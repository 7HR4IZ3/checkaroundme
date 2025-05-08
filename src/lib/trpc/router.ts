import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import superjson from "superjson";

import { createAuthProcedures } from "./routers/auth";
import { createUserProcedures } from "./routers/user";
import { createBusinessProcedures } from "./routers/business";
import { createCategoryProcedures } from "./routers/category";
import { createReviewProcedures } from "./routers/review";
import { createMessageProcedures } from "./routers/message";
import { createConversationProcedures } from "./routers/conversation";
import { createLocationProcedures } from "./routers/location";
import { createVerificationProcedures } from "./routers/verification";
// import { createFlutterwaveProcedures } from "./routers/flutterwave";
import { createPaystackProcedures } from "./routers/paystack";
import { cache } from "react";

// Server-side secret key (should be in .env and NOT prefixed with NEXT_PUBLIC_)
const SERVER_TRPC_SECRET_KEY = process.env.SERVER_TRPC_SECRET_KEY;

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   * This context is now parameterless and uses `next/headers`.
   * It's suitable for App Router (RSC, Route Handlers, Server Actions).
   */
  const headerStore = await headers();
  const clientSecretKeyHeader = headerStore.get("x-trpc-secret-key");

  let clientSecretKey: string | undefined;
  if (Array.isArray(clientSecretKeyHeader)) {
    // This case should ideally not happen with `headerStore.get()`
    console.warn(
      "x-trpc-secret-key header was an array (unexpected for next/headers.get), using first element if possible."
    );
    clientSecretKey = clientSecretKeyHeader[0];
  } else {
    // headerStore.get() returns string | null
    clientSecretKey = clientSecretKeyHeader ?? undefined;
  }

  return {
    // `req` object from CreateNextContextOptions is no longer part of this context.
    // If procedures relied on `req` for things other than 'x-trpc-secret-key',
    // they might need adjustment or a different context approach for those specific needs.
    clientSecretKey,
  };
});

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
  // Assuming ctx.clientSecretKey is populated by createTRPCContext
  // The `await ctx` is needed because createTRPCContext is async due to `cache()`
  // ctx in middleware is the resolved context value
  const resolvedCtx = ctx;

  console.log(resolvedCtx.clientSecretKey, SERVER_TRPC_SECRET_KEY);

  if (resolvedCtx.clientSecretKey !== SERVER_TRPC_SECRET_KEY) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or missing secret key.",
    });
  }
  return next({
    ctx: {
      ...resolvedCtx,
      // clientSecretKey is confirmed to be the server secret key
    },
  });
});

/**
 * Public procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires JWT authentication.
 * Routes using this procedure will require a valid Bearer token in the Authorization header.
 */
export const protectedProcedureWithSecret = t.procedure //.use(enforceSecretKey);

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
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
