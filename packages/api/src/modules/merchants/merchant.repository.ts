import { asc, eq, ilike } from "drizzle-orm";
import type { Database } from "../../db";
import { merchants } from "../../db/schema";
import type { Merchant, CreateMerchantInput, UpdateMerchantInput } from "@finance-manager/shared";

function toMerchant(row: typeof merchants.$inferSelect): Merchant {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findAll(db: Database): Promise<Merchant[]> {
  const rows = await db.select().from(merchants).orderBy(asc(merchants.name));
  return rows.map(toMerchant);
}

export async function search(q: string, db: Database): Promise<Merchant[]> {
  const rows = await db
    .select()
    .from(merchants)
    .where(ilike(merchants.name, `%${q}%`))
    .orderBy(asc(merchants.name))
    .limit(10);
  return rows.map(toMerchant);
}

export async function findById(id: string, db: Database): Promise<Merchant | null> {
  const row = await db.query.merchants.findFirst({ where: eq(merchants.id, id) });
  return row ? toMerchant(row) : null;
}

export async function create(data: CreateMerchantInput, db: Database): Promise<Merchant> {
  const [row] = await db
    .insert(merchants)
    .values({ name: data.name })
    .returning();
  if (!row) throw new Error("Failed to insert merchant");
  return toMerchant(row);
}

export async function update(
  id: string,
  data: UpdateMerchantInput,
  db: Database,
): Promise<Merchant | null> {
  const values: Partial<typeof merchants.$inferInsert> = {};
  if (data.name !== undefined) values.name = data.name;
  if (Object.keys(values).length === 0) return findById(id, db);
  const [row] = await db.update(merchants).set(values).where(eq(merchants.id, id)).returning();
  return row ? toMerchant(row) : null;
}

export async function remove(id: string, db: Database): Promise<boolean> {
  const result = await db
    .delete(merchants)
    .where(eq(merchants.id, id))
    .returning({ id: merchants.id });
  return result.length > 0;
}
