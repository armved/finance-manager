import { and, gte, lte, sql } from "drizzle-orm";
import type { Database } from "../../db";
import { transactions } from "../../db/schema";

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

type ExpenseByCategoryRow = {
  category_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  amount: string;
};

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

  // Recursive CTE: for each category, collect itself and all descendants,
  // then sum transactions across the whole subtree.
  const expenseRows = await db.execute<ExpenseByCategoryRow>(sql`
    WITH RECURSIVE descendants AS (
      SELECT id AS root_id, id AS member_id FROM categories
      UNION ALL
      SELECT d.root_id, c.id
      FROM categories c
      JOIN descendants d ON c.parent_id = d.member_id
    )
    SELECT
      c.id           AS category_id,
      c.name         AS name,
      c.icon         AS icon,
      c.color        AS color,
      c.sort_order   AS sort_order,
      COALESCE(SUM(t.amount::numeric), 0) AS amount
    FROM categories c
    JOIN descendants d ON d.root_id = c.id
    LEFT JOIN transactions t
      ON t.category_id = d.member_id
      AND t.type = 'expense'
      AND t.transaction_date >= ${startDate}
      AND t.transaction_date <= ${endDate}
    WHERE c.type = 'expense'
    GROUP BY c.id, c.name, c.icon, c.color, c.sort_order
    ORDER BY c.sort_order, c.name
  `);

  return {
    summary: {
      totalIncome: parseFloat(summaryRow?.totalIncome ?? "0"),
      totalExpenses: parseFloat(summaryRow?.totalExpenses ?? "0"),
    },
    expensesByCategory: expenseRows.map((r) => ({
      categoryId: r.category_id,
      name: r.name,
      icon: r.icon ?? null,
      color: r.color ?? null,
      amount: parseFloat(r.amount),
    })),
  };
}
