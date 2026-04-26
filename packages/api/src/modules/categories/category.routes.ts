import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategoryQuerySchema,
} from "@finance-manager/shared";
import * as service from "./category.service";

export const categoryRoutes = fp(async (fastify: FastifyInstance) => {
  // ── GET /api/categories ───────────────────────────────────────────────────
  fastify.get("/api/categories", async (request) => {
    const { type } = request.query as { type?: string };
    const validType = type === "income" || type === "expense" ? type : undefined;
    return service.listCategories(validType, request.server.db);
  });

  // ── GET /api/categories/:id ───────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>("/api/categories/:id", async (request, reply) => {
    const category = await service.getCategory(request.params.id, request.server.db);
    if (!category) return reply.notFound("Category not found");
    return category;
  });

  // ── POST /api/categories ──────────────────────────────────────────────────
  fastify.post("/api/categories", async (request, reply) => {
    const data = createCategorySchema.parse(request.body);
    const category = await service.createCategory(data, request.server.db);
    reply.code(201);
    return category;
  });

  // ── PUT /api/categories/:id ───────────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>("/api/categories/:id", async (request, reply) => {
    const data = updateCategorySchema.parse(request.body);
    const category = await service.updateCategory(request.params.id, data, request.server.db);
    if (!category) return reply.notFound("Category not found");
    return category;
  });

  // ── DELETE /api/categories/:id ────────────────────────────────────────────
  // Optional query param: ?reassignToCategoryId=<uuid>
  // If omitted, transactions are moved to the default "Uncategorized" for that type.
  fastify.delete<{ Params: { id: string } }>("/api/categories/:id", async (request, reply) => {
    const { reassignToCategoryId } = deleteCategoryQuerySchema.parse(request.query);
    const deleted = await service.deleteCategory(
      request.params.id,
      reassignToCategoryId,
      request.server.db,
    );
    if (!deleted) return reply.notFound("Category not found");
    return reply.code(204).send();
  });

  // ── Error handler: ZodErrors → 400, statusCode errors → their code ────────
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
