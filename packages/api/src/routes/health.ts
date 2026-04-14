import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";

export const healthRoutes = fp(async (fastify: FastifyInstance) => {
  fastify.get("/api/health", async (request) => {
    // Verify DB is reachable on every call — this endpoint is used by load
    // balancers and uptime monitors, so { status: "ok" } must mean fully healthy.
    await request.server.db.execute(sql`SELECT 1`);
    return { status: "ok", db: "connected" };
  });
});
