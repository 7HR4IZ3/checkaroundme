import { initTRPC } from '@trpc/server';
import superjson from "superjson";

import { createAuthProcedures } from './auth';
import { createUserProcedures } from './user';
import { createBusinessProcedures } from './business';
import { createCategoryProcedures } from './category';
import { createReviewProcedures } from './review';
import { createMessageProcedures } from './message';
import { createConversationProcedures } from './conversation';
import { createLocationProcedures } from './location'; // Import location procedures

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