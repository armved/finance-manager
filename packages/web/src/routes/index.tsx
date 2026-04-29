import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageContainer } from "../components/layout/page-container";
import { PageHeader } from "../components/layout/top-bar";
import { ExpensesByCategory } from "../components/dashboard/expenses-by-category";
import { RecentTransactions } from "../components/dashboard/recent-transactions";
import { SummaryCards } from "../components/dashboard/summary-cards";
import { useAnalyticsDashboard } from "../api/analytics";
import { useTransactions } from "../api/transactions";
import { useUIStore } from "../store/ui";

const searchSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: DashboardPage,
});

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthToDateRange(month: string): { startDate: string; endDate: string } {
  const year = parseInt(month.slice(0, 4), 10);
  const mon = parseInt(month.slice(5, 7), 10);
  const lastDay = new Date(year, mon, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    startDate: `${year}-${pad(mon)}-01`,
    endDate: `${year}-${pad(mon)}-${pad(lastDay)}`,
  };
}

function shiftMonth(month: string, delta: -1 | 1): string {
  const year = parseInt(month.slice(0, 4), 10);
  const mon = parseInt(month.slice(5, 7), 10);
  const d = new Date(year, mon - 1 + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month: string): string {
  const year = parseInt(month.slice(0, 4), 10);
  const mon = parseInt(month.slice(5, 7), 10);
  return new Date(year, mon - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function DashboardPage() {
  const navigate = useNavigate({ from: "/" });
  const { month = currentMonth() } = Route.useSearch();
  const { startDate, endDate } = monthToDateRange(month);
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  const { data: analytics } = useAnalyticsDashboard(startDate, endDate);
  const { data: txPage, isPending: txPending } = useTransactions({ startDate, endDate, limit: 10 });

  function handleMonthChange(newMonth: string) {
    void navigate({ search: { month: newMonth } });
  }

  const totalIncome = analytics?.summary.totalIncome ?? 0;
  const totalExpenses = analytics?.summary.totalExpenses ?? 0;

  const categoryAmounts =
    analytics?.expensesByCategory.map((c) => ({
      label: c.name,
      amount: c.amount,
      color: c.color,
    })) ?? [];

  return (
    <>
      <PageHeader title="Dashboard" />
      <PageContainer>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMonthChange(shiftMonth(month, -1))}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-1 text-sm font-medium text-foreground">
                {formatMonth(month)}
              </span>
              <button
                type="button"
                onClick={() => handleMonthChange(shiftMonth(month, 1))}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={openAddTransaction}
              className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          </div>
          <SummaryCards
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netCashFlow={totalIncome - totalExpenses}
          />
          <ExpensesByCategory
            total={totalExpenses}
            categories={categoryAmounts}
          />
          <RecentTransactions
            transactions={txPage?.data ?? []}
            isPending={txPending}
          />
        </div>
      </PageContainer>
    </>
  );
}
