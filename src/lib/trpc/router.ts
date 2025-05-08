import { initTRPC } from "@trpc/server";
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

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return {};
});

const t = initTRPC.create({
  transformer: superjson,
});

export const appRouter = t.router({
  ...createAuthProcedures(t),
  ...createUserProcedures(t),
  ...createReviewProcedures(t),
  ...createMessageProcedures(t),
  ...createBusinessProcedures(t),
  ...createCategoryProcedures(t),
  ...createConversationProcedures(t),
  ...createLocationProcedures(t),
  ...createVerificationProcedures(t),

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

  // ...createFlutterwaveProcedures(t, t.procedure), // Adjust `t.procedure` if you have a separate `protectedProcedure`
  ...createPaystackProcedures(t, t.procedure), // Added Paystack procedures (adjust protectedProcedure if needed)
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
