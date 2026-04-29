import { eq, sql } from "drizzle-orm";
import type { Database } from "../../db";
import { accounts } from "../../db/schema";
import type {
  AccountWithBalance,
  CreateAccountInput,
  UpdateAccountInput,
} from "@finance-manager/shared";

type AccountRow = {
  id: string;
  name: string;
  currencyCode: string;
  adjustedBalance: string;
  adjustedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  balance: string;
};

function toDTO(row: AccountRow): AccountWithBalance {
  return {
    id: row.id,
    name: row.name,
    currencyCode: row.currencyCode,
    adjustedBalance: parseFloat(row.adjustedBalance),
    adjustedAt: row.adjustedAt instanceof Date ? row.adjustedAt.toISOString() : null,
    isActive: row.isActive,
    balance: parseFloat(row.balance),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

const balanceQuery = sql`
  SELECT
    a.id,
    a.name,
    a.currency_code      AS "currencyCode",
    a.adjusted_balance   AS "adjustedBalance",
    a.adjusted_at        AS "adjustedAt",
    a.is_active          AS "isActive",
    a.created_at         AS "createdAt",
    a.updated_at         AS "updatedAt",
    (
      a.adjusted_balance::numeric + COALESCE(SUM(
        CASE
          WHEN t.type = 'income'   THEN  t.amount::numeric
          WHEN t.type = 'expense'  THEN -t.amount::numeric
          WHEN t.type = 'transfer' AND tr_src.source_transaction_id IS NOT NULL THEN -t.amount::numeric
          WHEN t.type = 'transfer' AND tr_dst.destination_transaction_id IS NOT NULL THEN  t.amount::numeric
          ELSE 0
        END
      ) FILTER (
        WHERE a.adjusted_at IS NULL OR t.created_at > a.adjusted_at
      ), 0)
    )::float8 AS balance
  FROM accounts a
  LEFT JOIN transactions t ON t.account_id = a.id
  LEFT JOIN transfers tr_src ON tr_src.source_transaction_id = t.id
  LEFT JOIN transfers tr_dst ON tr_dst.destination_transaction_id = t.id
  WHERE a.is_active = true
  GROUP BY a.id, a.name, a.currency_code, a.adjusted_balance, a.adjusted_at,
           a.is_active, a.created_at, a.updated_at
  ORDER BY a.created_at ASC
`;

const balanceQueryById = (id: string) => sql`
  SELECT
    a.id,
    a.name,
    a.currency_code      AS "currencyCode",
    a.adjusted_balance   AS "adjustedBalance",
    a.adjusted_at        AS "adjustedAt",
    a.is_active          AS "isActive",
    a.created_at         AS "createdAt",
    a.updated_at         AS "updatedAt",
    (
      a.adjusted_balance::numeric + COALESCE(SUM(
        CASE
          WHEN t.type = 'income'   THEN  t.amount::numeric
          WHEN t.type = 'expense'  THEN -t.amount::numeric
          WHEN t.type = 'transfer' AND tr_src.source_transaction_id IS NOT NULL THEN -t.amount::numeric
          WHEN t.type = 'transfer' AND tr_dst.destination_transaction_id IS NOT NULL THEN  t.amount::numeric
          ELSE 0
        END
      ) FILTER (
        WHERE a.adjusted_at IS NULL OR t.created_at > a.adjusted_at
      ), 0)
    )::float8 AS balance
  FROM accounts a
  LEFT JOIN transactions t ON t.account_id = a.id
  LEFT JOIN transfers tr_src ON tr_src.source_transaction_id = t.id
  LEFT JOIN transfers tr_dst ON tr_dst.destination_transaction_id = t.id
  WHERE a.id = ${id}
  GROUP BY a.id, a.name, a.currency_code, a.adjusted_balance, a.adjusted_at,
           a.is_active, a.created_at, a.updated_at
`;

export async function findAll(db: Database): Promise<AccountWithBalance[]> {
  const rows = await db.execute(balanceQuery);
  return (rows as unknown as AccountRow[]).map(toDTO);
}

export async function findById(id: string, db: Database): Promise<AccountWithBalance | null> {
  const rows = await db.execute(balanceQueryById(id));
  const row = (rows as unknown as AccountRow[])[0];
  return row ? toDTO(row) : null;
}

export async function create(data: CreateAccountInput, db: Database): Promise<AccountWithBalance> {
  const [inserted] = await db
    .insert(accounts)
    .values({
      name: data.name,
      currencyCode: data.currencyCode,
      adjustedBalance: String(data.adjustedBalance ?? 0),
    })
    .returning({ id: accounts.id });

  if (!inserted) throw new Error("Failed to insert account");
  const result = await findById(inserted.id, db);
  if (!result) throw new Error("Account not found after insert");
  return result;
}

export async function update(
  id: string,
  data: UpdateAccountInput,
  db: Database,
): Promise<AccountWithBalance | null> {
  const values: Partial<typeof accounts.$inferInsert> = {};
  if (data.name !== undefined) values.name = data.name;
  if (data.adjustedBalance !== undefined) values.adjustedBalance = String(data.adjustedBalance);
  if (data.isActive !== undefined) values.isActive = data.isActive;

  if (Object.keys(values).length > 0) {
    await db.update(accounts).set(values).where(eq(accounts.id, id));
  }

  return findById(id, db);
}

export async function adjustBalance(
  id: string,
  balance: number,
  db: Database,
): Promise<AccountWithBalance | null> {
  await db
    .update(accounts)
    .set({ adjustedBalance: String(balance), adjustedAt: new Date() })
    .where(eq(accounts.id, id));
  return findById(id, db);
}

export async function deactivate(id: string, db: Database): Promise<boolean> {
  const result = await db
    .update(accounts)
    .set({ isActive: false })
    .where(eq(accounts.id, id))
    .returning({ id: accounts.id });
  return result.length > 0;
}
