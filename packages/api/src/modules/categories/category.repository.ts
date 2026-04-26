import { asc, eq } from "drizzle-orm";
import type { Database } from "../../db";
import { categories } from "../../db/schema";
import type { Category } from "@finance-manager/shared";

export async function findAll(
  type: "income" | "expense" | undefined,
  db: Database,
): Promise<Category[]> {
  const rows = await db.query.categories.findMany({
    where: type ? eq(categories.type, type) : undefined,
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
  return rows as unknown as Category[];
}
