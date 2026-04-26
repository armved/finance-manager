import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import * as repository from "./analytics.repository";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const analyticsRoutes = fp(async (fastify: FastifyInstance) => {
  fastify.get("/api/analytics/dashboard", async (request, reply) => {
    const { start, end } = request.query as { start?: string; end?: string };

    if (!start || !end) {
      return reply.badRequest("start and end query params are required (YYYY-MM-DD)");
    }
    if (!DATE_RE.test(start) || !DATE_RE.test(end)) {
      return reply.badRequest("start and end must be in YYYY-MM-DD format");
    }

    return repository.getDashboard(start, end, request.server.db);
  });
});
