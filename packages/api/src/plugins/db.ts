import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { db, sql, type Database } from "../db";

/**
 * Tell TypeScript that fastify.db exists once this plugin is registered.
 * This is called "module augmentation" — we're extending Fastify's own type
 * definitions from inside our code.
 */
declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}

/**
 * Fastify plugin that attaches the database to the server instance.
 *
 * WHY fastify-plugin (fp)?
 * Fastify has a scoped encapsulation model. By default, anything you add
 * inside a plugin (decorators, hooks, etc.) is only visible to that plugin
 * and its children. This is great for isolation but means a db plugin
 * registered in one place wouldn't be visible in route plugins registered
 * elsewhere.
 *
 * Wrapping with fp() opts out of that encapsulation. The decorator "leaks"
 * upward and becomes available everywhere in the app — which is exactly what
 * you want for a shared resource like the database.
 *
 * The { name: "db" } option names this plugin in Fastify's dependency graph,
 * which makes error messages (e.g. "plugin 'db' already registered") clearer.
 */
export const dbPlugin = fp(
  async (fastify: FastifyInstance) => {
    // Verify connectivity BEFORE we start accepting traffic.
    // If the database is down, we want a clear startup error, not silent 500s
    // on the first request. This is called "eager connection validation".
    await sql`SELECT 1`;
    fastify.log.info("Database connection pool ready");

    // Attach the db instance to every Fastify server object.
    // After this, routes can access it via: request.server.db
    fastify.decorate("db", db);

    // Graceful shutdown: drain the connection pool when the server closes.
    // Without this hook, the Node.js process would hang after SIGTERM because
    // the open TCP connections to Postgres keep the event loop alive.
    fastify.addHook("onClose", async () => {
      fastify.log.info("Closing database connection pool");
      await sql.end();
    });
  },
  { name: "db" },
);
