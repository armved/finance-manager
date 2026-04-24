import type { Database } from "../../db";
import { accounts, categories } from "../../db/schema";
import { eq } from "drizzle-orm";
import type {
  CreateTransactionInput,
  TransactionFilters,
  UpdateTransactionInput,
} from "@finance-manager/shared";
import type { PaginatedResponse, TransactionWithRelations } from "@finance-manager/shared";
import * as repo from "./transaction.repository";

function badRequest(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 400 });
}

async function resolveAccountId(
  explicitId: string | undefined,
  db: Database,
): Promise<string> {
  if (explicitId) return explicitId;
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.isActive, true))
    .limit(1);
  if (!account) throw badRequest("No active account found");
  return account.id;
}

async function assertCategoryMatchesType(
  categoryId: string,
  expectedType: "income" | "expense",
  db: Database,
): Promise<void> {
  const [category] = await db
    .select({ id: categories.id, type: categories.type })
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!category) throw badRequest("Category not found");
  if (category.type !== expectedType) {
    throw badRequest(
      `Category type "${category.type}" does not match transaction type "${expectedType}"`,
    );
  }
}

export async function listTransactions(
  filters: TransactionFilters,
  db: Database,
): Promise<PaginatedResponse<TransactionWithRelations>> {
  return repo.findAll(filters, db);
}

export async function getTransaction(
  id: string,
  db: Database,
): Promise<TransactionWithRelations | null> {
  return repo.findById(id, db);
}

export async function createTransaction(
  data: CreateTransactionInput,
  db: Database,
): Promise<TransactionWithRelations> {
  await assertCategoryMatchesType(data.categoryId, data.type, db);
  const accountId = await resolveAccountId(data.accountId, db);
  return repo.create({ ...data, accountId }, db);
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput,
  db: Database,
): Promise<TransactionWithRelations | null> {
  const existing = await repo.findById(id, db);
  if (!existing) return null;

  if (data.categoryId) {
    await assertCategoryMatchesType(data.categoryId, data.type ?? existing.type, db);
  }

  return repo.update(id, data, db);
}

export async function deleteTransaction(id: string, db: Database): Promise<boolean> {
  return repo.remove(id, db);
}
