import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import type { Database } from "../../db";
import { categories, transactions } from "../../db/schema";

export interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
  };
  expensesByCategory: Array<{
    categoryId: string;
    name: string;
    icon: string | null;
    color: string | null;
    amount: number;
  }>;
}

export async function getDashboard(
  startDate: string,
  endDate: string,
  db: Database,
): Promise<DashboardData> {
  const [summaryRow] = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
      totalExpenses: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(
      and(
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    );

  const expenseRows = await db
    .select({
      categoryId: categories.id,
      name: categories.name,
      icon: categories.icon,
      color: categories.color,
      amount: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
    })
    .from(categories)
    .leftJoin(
      transactions,
      and(
        eq(transactions.categoryId, categories.id),
        eq(transactions.type, "expense"),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    )
    .where(eq(categories.type, "expense"))
    .groupBy(categories.id, categories.name, categories.icon, categories.color)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return {
    summary: {
      totalIncome: parseFloat(summaryRow?.totalIncome ?? "0"),
      totalExpenses: parseFloat(summaryRow?.totalExpenses ?? "0"),
    },
    expensesByCategory: expenseRows.map((r) => ({
      categoryId: r.categoryId,
      name: r.name,
      icon: r.icon ?? null,
      color: r.color ?? null,
      amount: parseFloat(r.amount),
    })),
  };
}
