import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  type BuildQueryResult,
  type DBQueryConfig,
  type ExtractTablesWithRelations,
  type SQL,
} from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { transactionTags, transactions } from "../../db/schema";
import type {
  CreateTransactionInput,
  PaginatedResponse,
  TransactionFilters,
  TransactionWithRelations,
  UpdateTransactionInput,
} from "@finance-manager/shared";

// ── Relation graph + inferred row type ────────────────────────────────────────
// `relationGraph` is the single source of truth for what comes back with a
// transaction. `TransactionRow` is derived from it by Drizzle, so changing a
// schema column or editing the graph automatically updates the row type — no
// hand-written duplicate types to keep in sync.

type Schema = ExtractTablesWithRelations<typeof schema>;

const relationGraph = {
  category: { columns: { id: true, name: true, icon: true, color: true } },
  account: { columns: { id: true, name: true } },
  merchant: { columns: { id: true, name: true } },
  transactionTags: {
    columns: {},
    with: { tag: { columns: { id: true, name: true, color: true } } },
  },
} as const satisfies DBQueryConfig<"many", true, Schema, Schema["transactions"]>["with"];

type TransactionRow = BuildQueryResult<
  Schema,
  Schema["transactions"],
  { with: typeof relationGraph }
>;

// ── Mapper ────────────────────────────────────────────────────────────────────
// Turns the raw ORM row into the API-facing DTO:
// - amount: decimal-as-string → number
// - createdAt/updatedAt: Date → ISO string
// - transactionTags[].tag → flat tags[]

function toTransactionDTO(row: TransactionRow): TransactionWithRelations {
  return {
    id: row.id,
    type: row.type,
    amount: parseFloat(row.amount),
    transactionDate: row.transactionDate,
    accountId: row.accountId,
    categoryId: row.categoryId,
    merchantId: row.merchantId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    category: row.category,
    account: row.account,
    merchant: row.merchant,
    tags: row.transactionTags.map((tt) => tt.tag),
  };
}

// ── Filter builder ────────────────────────────────────────────────────────────

function buildWhere(filters: TransactionFilters, db: Database): SQL | undefined {
  const conditions: SQL[] = [];
  if (filters.startDate) conditions.push(gte(transactions.transactionDate, filters.startDate));
  if (filters.endDate) conditions.push(lte(transactions.transactionDate, filters.endDate));
  if (filters.type) conditions.push(eq(transactions.type, filters.type));
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters.accountId) conditions.push(eq(transactions.accountId, filters.accountId));
  if (filters.merchantId) conditions.push(eq(transactions.merchantId, filters.merchantId));
  if (filters.tagId) {
    conditions.push(
      inArray(
        transactions.id,
        db
          .select({ id: transactionTags.transactionId })
          .from(transactionTags)
          .where(eq(transactionTags.tagId, filters.tagId)),
      ),
    );
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function findAll(
  filters: TransactionFilters,
  db: Database,
): Promise<PaginatedResponse<TransactionWithRelations>> {
  const where = buildWhere(filters, db);

  const [countRow] = await db
    .select({ total: count() })
    .from(transactions)
    .where(where);

  const rows = await db.query.transactions.findMany({
    where,
    with: relationGraph,
    orderBy: [desc(transactions.transactionDate), desc(transactions.createdAt)],
    limit: filters.limit,
    offset: filters.offset,
  });

  return {
    data: rows.map(toTransactionDTO),
    total: countRow?.total ?? 0,
    limit: filters.limit,
    offset: filters.offset,
  };
}

export async function findById(
  id: string,
  db: Database,
): Promise<TransactionWithRelations | null> {
  const row = await db.query.transactions.findFirst({
    where: eq(transactions.id, id),
    with: relationGraph,
  });
  return row ? toTransactionDTO(row) : null;
}

export async function create(
  data: CreateTransactionInput & { accountId: string },
  db: Database,
): Promise<TransactionWithRelations> {
  const [inserted] = await db
    .insert(transactions)
    .values({
      type: data.type,
      amount: String(data.amount),
      transactionDate: data.transactionDate ?? new Date().toISOString().slice(0, 10),
      accountId: data.accountId,
      categoryId: data.categoryId,
      merchantId: data.merchantId ?? null,
    })
    .returning({ id: transactions.id });

  const newId = inserted!.id;

  if (data.tagIds && data.tagIds.length > 0) {
    await db
      .insert(transactionTags)
      .values(data.tagIds.map((tagId) => ({ transactionId: newId, tagId })));
  }

  return (await findById(newId, db))!;
}

export async function update(
  id: string,
  data: UpdateTransactionInput,
  db: Database,
): Promise<TransactionWithRelations | null> {
  const { tagIds, ...fields } = data;

  const updateValues: Record<string, unknown> = {};
  if (fields.type !== undefined) updateValues.type = fields.type;
  if (fields.amount !== undefined) updateValues.amount = String(fields.amount);
  if (fields.transactionDate !== undefined) updateValues.transactionDate = fields.transactionDate;
  if (fields.categoryId !== undefined) updateValues.categoryId = fields.categoryId;
  if (fields.merchantId !== undefined) updateValues.merchantId = fields.merchantId;

  if (Object.keys(updateValues).length > 0) {
    await db.update(transactions).set(updateValues).where(eq(transactions.id, id));
  }

  if (tagIds !== undefined) {
    await db.delete(transactionTags).where(eq(transactionTags.transactionId, id));
    if (tagIds.length > 0) {
      await db
        .insert(transactionTags)
        .values(tagIds.map((tagId) => ({ transactionId: id, tagId })));
    }
  }

  return findById(id, db);
}

export async function remove(id: string, db: Database): Promise<boolean> {
  const result = await db
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning({ id: transactions.id });
  return result.length > 0;
}
