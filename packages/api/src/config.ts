/**
 * Reads a required environment variable.
 * Throws at startup if it is missing — fail fast is better than a cryptic
 * runtime error later (e.g. "Cannot connect to undefined").
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  logLevel: process.env.LOG_LEVEL ?? "info",
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: requireEnv("DATABASE_URL"),
  // Optional: lock down CORS in production by setting this to your frontend URL.
  // If unset in production, all cross-origin requests are rejected.
  corsOrigin: process.env.CORS_ORIGIN,
} as const;

export const isDev = config.nodeEnv === "development";
