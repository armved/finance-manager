import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { config, isDev } from "./config";
import { dbPlugin } from "./plugins/db";
import { healthRoutes } from "./routes/health";
import { transactionRoutes } from "./modules/transactions/transaction.routes";
import { categoryRoutes } from "./modules/categories/category.routes";
import { analyticsRoutes } from "./modules/analytics/analytics.routes";
import { accountRoutes } from "./modules/accounts/account.routes";

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
    origin: isDev ? true : (config.corsOrigin ?? false),
  });

  await app.register(sensible);
  await app.register(dbPlugin);

  // ── Routes ─────────────────────────────────────────────────────────────────

  await app.register(healthRoutes);
  await app.register(transactionRoutes);
  await app.register(categoryRoutes);
  await app.register(analyticsRoutes);
  await app.register(accountRoutes);

  return app;
}
