import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  createTransactionSchema,
  transactionFiltersSchema,
  updateTransactionSchema,
} from "@finance-manager/shared";
import * as service from "./transaction.service";

export const transactionRoutes = fp(async (fastify: FastifyInstance) => {
  // ── GET /api/transactions ─────────────────────────────────────────────────
  fastify.get("/api/transactions", async (request, reply) => {
    const filters = transactionFiltersSchema.parse(request.query);
    const result = await service.listTransactions(filters, request.server.db);
    return result;
  });

  // ── GET /api/transactions/:id ─────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>("/api/transactions/:id", async (request, reply) => {
    const transaction = await service.getTransaction(request.params.id, request.server.db);
    if (!transaction) return reply.notFound("Transaction not found");
    return transaction;
  });

  // ── POST /api/transactions ────────────────────────────────────────────────
  fastify.post("/api/transactions", async (request, reply) => {
    const data = createTransactionSchema.parse(request.body);
    const transaction = await service.createTransaction(data, request.server.db);
    reply.code(201);
    return transaction;
  });

  // ── PUT /api/transactions/:id ─────────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>("/api/transactions/:id", async (request, reply) => {
    const data = updateTransactionSchema.parse(request.body);
    const transaction = await service.updateTransaction(request.params.id, data, request.server.db);
    if (!transaction) return reply.notFound("Transaction not found");
    return transaction;
  });

  // ── DELETE /api/transactions/:id ──────────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>("/api/transactions/:id", async (request, reply) => {
    const deleted = await service.deleteTransaction(request.params.id, request.server.db);
    if (!deleted) return reply.notFound("Transaction not found");
    reply.code(204);
  });

  // ── Error handler: turn ZodErrors into 400s ───────────────────────────────
  fastify.setErrorHandler(async (rawError, _request, reply) => {
    const error = rawError as Error & { statusCode?: number; issues?: { path: (string | number)[]; message: string }[] };
    // ZodError check without importing zod directly (not listed in api deps)
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
