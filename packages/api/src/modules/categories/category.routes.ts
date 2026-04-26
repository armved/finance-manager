import type { FastifyInstance } from "fastify";
import * as categoryRepo from "./category.repository";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/api/categories", async (request, reply) => {
    const { type } = request.query as { type?: string };
    const validType =
      type === "income" || type === "expense" ? type : undefined;
    const data = await categoryRepo.findAll(validType, app.db);
    return reply.send(data);
  });
}
