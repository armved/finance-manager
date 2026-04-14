import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

interface HealthResponse {
  status: "ok";
  db: "connected" | "disconnected";
}

/**
 * The query key is exported so other parts of the app can reference it
 * for manual cache invalidation without duplicating the string.
 *
 * Convention: arrays, most-general first.
 * ["health"] identifies the resource type.
 * If this endpoint ever took params (e.g. a server ID), they'd go after:
 *   ["health", serverId]
 */
export const healthQueryKey = ["health"] as const;

/**
 * Polls the API health endpoint and returns the current status.
 *
 * retry: 1     — fail after 2 attempts instead of the default 3.
 *               Health checks should surface failures quickly, not mask them.
 * refetchInterval — keeps the status fresh while the tab is open.
 *                   If the API goes down mid-session, the indicator updates.
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: () => apiFetch<HealthResponse>("/api/health"),
    retry: 1,
    refetchInterval: 30_000,
  });
}
