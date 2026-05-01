import { and, asc, eq, sql } from "drizzle-orm";
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
    children: [],
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

type RawCategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
  type: "income" | "expense";
  sort_order: number;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export async function findTree(
  type: "income" | "expense" | undefined,
  db: Database,
): Promise<Category[]> {
  const whereBase = type
    ? sql`WHERE parent_id IS NULL AND type = ${type}`
    : sql`WHERE parent_id IS NULL`;

  const result = await db.execute<RawCategoryRow>(sql`
    WITH RECURSIVE category_tree AS (
      SELECT *, 0 AS depth FROM categories ${whereBase}
      UNION ALL
      SELECT c.*, ct.depth + 1
      FROM categories c
      JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT * FROM category_tree ORDER BY depth, sort_order, name
  `);

  const map = new Map<string, Category>();
  const roots: Category[] = [];

  for (const row of result) {
    const node: Category = {
      id: row.id,
      name: row.name,
      parentId: row.parent_id ?? null,
      type: row.type,
      sortOrder: row.sort_order,
      icon: row.icon ?? null,
      color: row.color ?? null,
      isDefault: row.is_default,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      children: [],
    };
    map.set(node.id, node);
    if (!node.parentId) {
      roots.push(node);
    } else {
      map.get(node.parentId)?.children.push(node);
    }
  }

  return roots;
}

export async function move(
  id: string,
  newParentId: string | null,
  db: Database,
): Promise<Category | null> {
  if (newParentId) {
    // Cycle detection: walk up from newParentId; if we reach id, it's a cycle
    let current: string | null = newParentId;
    const visited = new Set<string>();
    while (current) {
      if (current === id) {
        throw Object.assign(new Error("Cannot move a category into its own descendant"), {
          statusCode: 400,
        });
      }
      if (visited.has(current)) break;
      visited.add(current);
      const parentRow: { parentId: string | null } | undefined =
        await db.query.categories.findFirst({
          where: eq(categories.id, current),
          columns: { parentId: true },
        });
      current = parentRow?.parentId ?? null;
    }
  }

  const [row] = await db
    .update(categories)
    .set({ parentId: newParentId })
    .where(eq(categories.id, id))
    .returning();
  return row ? toCategory(row) : null;
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

export async function reorder(
  items: { id: string; sortOrder: number }[],
  db: Database,
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const { id, sortOrder } of items) {
      await tx
        .update(categories)
        .set({ sortOrder })
        .where(eq(categories.id, id));
    }
  });
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
