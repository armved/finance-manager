import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { sql } from "drizzle-orm";
import { config, isDev } from "./config";
import { dbPlugin } from "./plugins/db";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      // Pretty-print logs in dev only
      ...(isDev && {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        },
      }),
    },
  });

  // ── Plugins ────────────────────────────────────────────────────────────────

  await app.register(cors, {
    // Allow all origins in dev. Lock this down in production via env var.
    origin: isDev ? true : (process.env.CORS_ORIGIN ?? false),
  });

  // Adds app.httpErrors helpers (notFound, badRequest, etc.) and a clean
  // 404 handler for unmatched routes.
  await app.register(sensible);

  // Attaches app.db (Drizzle instance) and manages the connection pool lifecycle.
  await app.register(dbPlugin);

  // ── Routes ─────────────────────────────────────────────────────────────────

  app.get("/api/health", async (request) => {
    // Run a cheap query to confirm the database connection is alive.
    // Health checks are used by load balancers and uptime monitors — returning
    // { status: "ok" } when the DB is actually down would give false confidence.
    await request.server.db.execute(sql`SELECT 1`);
    return { status: "ok", db: "connected" };
  });

  return app;
}
