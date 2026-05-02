import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { createMerchantSchema, updateMerchantSchema } from "@finance-manager/shared";
import * as repo from "./merchant.repository";

export const merchantRoutes = fp(async (fastify: FastifyInstance) => {
  // ── GET /api/merchants?q= ─────────────────────────────────────────────────
  fastify.get("/api/merchants", async (request) => {
    const { q } = request.query as { q?: string };
    if (q?.trim()) return repo.search(q.trim(), request.server.db);
    return repo.findAll(request.server.db);
  });

  // ── POST /api/merchants ───────────────────────────────────────────────────
  fastify.post("/api/merchants", async (request, reply) => {
    const data = createMerchantSchema.parse(request.body);
    const merchant = await repo.create(data, request.server.db);
    reply.code(201);
    return merchant;
  });

  // ── PUT /api/merchants/:id ────────────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>("/api/merchants/:id", async (request, reply) => {
    const data = updateMerchantSchema.parse(request.body);
    const merchant = await repo.update(request.params.id, data, request.server.db);
    if (!merchant) return reply.notFound("Merchant not found");
    return merchant;
  });

  // ── DELETE /api/merchants/:id ─────────────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>("/api/merchants/:id", async (request, reply) => {
    const deleted = await repo.remove(request.params.id, request.server.db);
    if (!deleted) return reply.notFound("Merchant not found");
    return reply.code(204).send();
  });

  // ── Error handler ─────────────────────────────────────────────────────────
  fastify.setErrorHandler(async (rawError, _request, reply) => {
    const error = rawError as Error & {
      statusCode?: number;
      issues?: { path: (string | number)[]; message: string }[];
    };
    if (error.name === "ZodError" && error.issues) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
      });
    }
    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      statusCode,
      error: statusCode === 400 ? "Bad Request" : "Internal Server Error",
      message: error.message,
    });
  });
});
