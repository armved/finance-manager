import type { Database } from "../../db";
import type {
  AccountWithBalance,
  AdjustBalanceInput,
  CreateAccountInput,
  UpdateAccountInput,
} from "@finance-manager/shared";
import * as repo from "./account.repository";

function notFound(): Error {
  return Object.assign(new Error("Account not found"), { statusCode: 404 });
}

export async function listAccounts(db: Database): Promise<AccountWithBalance[]> {
  return repo.findAll(db);
}

export async function getAccount(id: string, db: Database): Promise<AccountWithBalance | null> {
  return repo.findById(id, db);
}

export async function createAccount(
  data: CreateAccountInput,
  db: Database,
): Promise<AccountWithBalance> {
  return repo.create(data, db);
}

export async function updateAccount(
  id: string,
  data: UpdateAccountInput,
  db: Database,
): Promise<AccountWithBalance> {
  const result = await repo.update(id, data, db);
  if (!result) throw notFound();
  return result;
}

export async function adjustAccountBalance(
  id: string,
  data: AdjustBalanceInput,
  db: Database,
): Promise<AccountWithBalance> {
  const result = await repo.adjustBalance(id, data.balance, db);
  if (!result) throw notFound();
  return result;
}

export async function deleteAccount(id: string, db: Database): Promise<void> {
  const deleted = await repo.deactivate(id, db);
  if (!deleted) throw notFound();
}
