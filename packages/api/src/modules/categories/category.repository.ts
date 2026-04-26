import { and, asc, eq } from "drizzle-orm";
import type { Database } from "../../db";
import { categories, transactions } from "../../db/schema";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@finance-manager/shared";

function toCategory(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId ?? null,
    type: row.type,
    sortOrder: row.sortOrder,
    icon: row.icon ?? null,
    color: row.color ?? null,
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function findAll(
  type: "income" | "expense" | undefined,
  db: Database,
): Promise<Category[]> {
  const rows = await db.query.categories.findMany({
    where: type ? eq(categories.type, type) : undefined,
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
  return rows.map(toCategory);
}

export async function findById(id: string, db: Database): Promise<Category | null> {
  const row = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
  return row ? toCategory(row) : null;
}

export async function findDefault(
  type: "income" | "expense",
  db: Database,
): Promise<Category | null> {
  const row = await db.query.categories.findFirst({
    where: and(eq(categories.type, type), eq(categories.isDefault, true)),
  });
  return row ? toCategory(row) : null;
}

export async function hasChildren(id: string, db: Database): Promise<boolean> {
  const row = await db.query.categories.findFirst({
    where: eq(categories.parentId, id),
    columns: { id: true },
  });
  return !!row;
}

export async function create(data: CreateCategoryInput, db: Database): Promise<Category> {
  const [row] = await db
    .insert(categories)
    .values({
      name: data.name,
      parentId: data.parentId ?? null,
      type: data.type,
      sortOrder: data.sortOrder ?? 0,
      icon: data.icon ?? null,
      color: data.color ?? null,
    })
    .returning();
  if (!row) throw new Error("Failed to insert category");
  return toCategory(row);
}

export async function update(
  id: string,
  data: UpdateCategoryInput,
  db: Database,
): Promise<Category | null> {
  const values: Partial<typeof categories.$inferInsert> = {};
  if (data.name !== undefined) values.name = data.name;
  if (data.type !== undefined) values.type = data.type;
  if (data.sortOrder !== undefined) values.sortOrder = data.sortOrder;
  if ("icon" in data) values.icon = data.icon ?? null;
  if ("color" in data) values.color = data.color ?? null;

  if (Object.keys(values).length === 0) return findById(id, db);

  const [row] = await db
    .update(categories)
    .set(values)
    .where(eq(categories.id, id))
    .returning();
  return row ? toCategory(row) : null;
}

export async function reassignAndDelete(
  id: string,
  targetCategoryId: string,
  db: Database,
): Promise<boolean> {
  await db.transaction(async (tx) => {
    await tx
      .update(transactions)
      .set({ categoryId: targetCategoryId })
      .where(eq(transactions.categoryId, id));
    await tx.delete(categories).where(eq(categories.id, id));
  });
  return true;
}
