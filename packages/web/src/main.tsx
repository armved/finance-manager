import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { routeTree } from "./routeTree.gen";
import "./index.css";

/**
 * Configure the QueryClient with sensible defaults.
 *
 * staleTime: 60s
 *   Data is considered fresh for 1 minute. TanStack Query won't refetch in
 *   the background while the data is still fresh, even if you navigate away
 *   and come back. Without this, the default is 0ms — every component mount
 *   triggers a background refetch, which is usually too aggressive.
 *
 * retry: 1
 *   On a failed request, retry once before showing an error. The default is 3,
 *   which adds noticeable delay before the user sees feedback.
 *
 * Individual hooks can override both values when they need different behaviour
 * (e.g. the health check uses refetchInterval, a mutation uses retry: 0).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: import.meta.env.PROD ? 1000 * 60 : 0, // 1 min in prod, always fresh in dev
      retry: 1,
    },
  },
});

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/*
       * ReactQueryDevtools renders a floating panel in the bottom corner.
       * It shows every query in the cache, their status, data, and lets you
       * manually refetch or invalidate — invaluable when debugging.
       * It is automatically excluded from production builds.
       */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
