import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  adjustBalanceSchema,
  createAccountSchema,
  updateAccountSchema,
} from "@finance-manager/shared";
import * as service from "./account.service";

export const accountRoutes = fp(async (fastify: FastifyInstance) => {
  fastify.get("/api/accounts", async (request) => {
    return service.listAccounts(request.server.db);
  });

  fastify.get<{ Params: { id: string } }>("/api/accounts/:id", async (request, reply) => {
    const account = await service.getAccount(request.params.id, request.server.db);
    if (!account) return reply.notFound("Account not found");
    return account;
  });

  fastify.post("/api/accounts", async (request, reply) => {
    const data = createAccountSchema.parse(request.body);
    const account = await service.createAccount(data, request.server.db);
    reply.code(201);
    return account;
  });

  fastify.put<{ Params: { id: string } }>("/api/accounts/:id", async (request, reply) => {
    const data = updateAccountSchema.parse(request.body);
    const account = await service.updateAccount(request.params.id, data, request.server.db);
    return account;
  });

  fastify.post<{ Params: { id: string } }>(
    "/api/accounts/:id/adjust-balance",
    async (request, reply) => {
      const data = adjustBalanceSchema.parse(request.body);
      const account = await service.adjustAccountBalance(
        request.params.id,
        data,
        request.server.db,
      );
      return account;
    },
  );

  fastify.delete<{ Params: { id: string } }>("/api/accounts/:id", async (request, reply) => {
    await service.deleteAccount(request.params.id, request.server.db);
    return reply.code(204).send();
  });

  fastify.setErrorHandler(async (rawError, _request, reply) => {
    const error = rawError as Error & { statusCode?: number; issues?: { path: (string | number)[]; message: string }[] };
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
      error: statusCode === 404 ? "Not Found" : statusCode === 400 ? "Bad Request" : "Internal Server Error",
      message: error.message,
    });
  });
});
