import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { config, isDev } from "./config";

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

  // ── Routes ─────────────────────────────────────────────────────────────────

  app.get("/api/health", async () => {
    return { status: "ok" };
  });

  return app;
}
