import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/layout/top-bar";
import { ExpensesByCategory } from "../components/dashboard/expenses-by-category";
import { RecentTransactions } from "../components/dashboard/recent-transactions";
import { SummaryCards } from "../components/dashboard/summary-cards";
import type { CategoryAmount } from "../components/dashboard/expenses-by-category";
import type { Transaction } from "../components/dashboard/recent-transactions";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

// ─── Static data ─────────────────────────────────────────────────────────────
// Placeholder values. Replace with TanStack Query hooks when the API is wired.

const SUMMARY = {
  totalIncome: 14250.0,
  totalExpenses: 4820.75,
  netCashFlow: 9429.25,
  incomeChangePercent: 12.5,
  expensesChangePercent: -2.1,
  netCashFlowChangePercent: 8.3,
};

const CATEGORY_AMOUNTS: readonly CategoryAmount[] = [
  { label: "Housing", amount: 2400 },
  { label: "Food & Drink", amount: 845 },
  { label: "Shopping", amount: 620 },
  { label: "Groceries", amount: 450 },
  { label: "Transport", amount: 415 },
  { label: "Utilities", amount: 320 },
  { label: "Education", amount: 300 },
  { label: "Insurance", amount: 250 },
  { label: "Healthcare", amount: 180 },
  { label: "Entertainment", amount: 150 },
];

const TRANSACTIONS: readonly Transaction[] = [
  {
    id: "1",
    merchant: "Whole Foods Market",
    category: "Food & Drink",
    date: "Apr 14, 2026",
    amount: 124.5,
    type: "expense",
  },
  {
    id: "2",
    merchant: "ConEdison Utilities",
    category: "Housing",
    date: "Apr 12, 2026",
    amount: 145.2,
    type: "expense",
  },
  {
    id: "3",
    merchant: "Stripe Payout",
    category: "Income",
    date: "Apr 10, 2026",
    amount: 4250.0,
    type: "income",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function DashboardPage() {
  return (
    <>
      <TopBar />
      <main className="flex-1 space-y-5 overflow-y-auto p-6">
        <SummaryCards {...SUMMARY} />
        <ExpensesByCategory
          total={SUMMARY.totalExpenses}
          categories={CATEGORY_AMOUNTS}
        />
        <RecentTransactions transactions={TRANSACTIONS} />
      </main>
    </>
  );
}
