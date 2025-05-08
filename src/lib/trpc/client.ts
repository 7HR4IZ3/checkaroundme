import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "./router";

// Helper to get the base URL for tRPC requests
const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // Client-side, use relative path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel deployment
  return `http://localhost:${process.env.PORT ?? 3000}`; // Development
};

// This is the trpc instance you'll use in your React components
export const trpc = createTRPCReact<AppRouter>();

// This function creates the tRPC client with the necessary links and headers.
// It should be called in your tRPC provider component (e.g., src/lib/trpc/components/provider.tsx).
export const createClient = () => {
  return trpc.createClient({
    links: [
      // Optional: You might want a loggerLink for development
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          // Retrieve the secret key from environment variables.
          // Ensure NEXT_PUBLIC_TRPC_SECRET_KEY is set in your .env file.
          const secretKey = process.env.NEXT_PUBLIC_TRPC_SECRET_KEY;
          if (!secretKey) {
            // Warn in development if the key is missing.
            console.warn(
              "Client-side TRPC_SECRET_KEY (NEXT_PUBLIC_TRPC_SECRET_KEY) is not set. Requests to protected routes may fail.",
            );
          }

          // Only include the header if the secretKey is present.
          return secretKey ? { "x-trpc-secret-key": secretKey } : {};
        },
        transformer: superjson,
      }),
    ],
  });
};
