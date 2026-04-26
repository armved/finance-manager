/**
 * Typed HTTP client — thin wrapper around fetch.
 *
 * WHY not just call fetch() directly in every hook?
 * Two reasons:
 *  1. fetch() does NOT throw on HTTP errors (4xx, 5xx). A 500 returns a
 *     resolved promise with response.ok === false. Without this wrapper,
 *     TanStack Query would treat every error response as a success.
 *  2. Centralising the base behaviour here means we change it in one place
 *     later — e.g. when we add auth tokens, request IDs, or logging.
 *
 * Paths are ALWAYS relative (e.g. "/api/health").
 * Vite's proxy rewrites them to http://localhost:3001 in dev.
 * Caddy does the same in production.
 * This means the frontend never has a hardcoded host or port.
 */

/**
 * Represents an HTTP error response from the API.
 * Extending Error gives us a stack trace and makes `instanceof` checks work.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetches a JSON endpoint and returns typed data.
 * Throws ApiError for any non-2xx response.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Try to read an error message from the response body.
    // If the body isn't JSON (e.g. a 502 from the proxy), fall back to the
    // HTTP status text.
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      body.message ?? response.statusText,
    );
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
