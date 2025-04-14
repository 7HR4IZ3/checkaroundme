import { cache } from 'react';

import { appRouter } from '@/lib/trpc/router';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import type { NextRequest } from 'next/server';

const handler = (request: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: cache(() => ({}))
  });
};

export { handler as GET, handler as POST };