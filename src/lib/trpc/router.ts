import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { createAuthProcedures } from "./routers/auth";
import { createUserProcedures } from "./routers/user";
import { createBusinessProcedures } from "./routers/business";
import { createCategoryProcedures } from "./routers/category";
import { createReviewProcedures } from "./routers/review";
import { createMessageProcedures } from "./routers/message";
import { createConversationProcedures } from "./routers/conversation";
import { createLocationProcedures } from "./routers/location"; // Import location procedures
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
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
