import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { PageContainer } from "../components/layout/page-container";
import { TopBar } from "../components/layout/top-bar";
import { ExpensesByCategory } from "../components/dashboard/expenses-by-category";
import { RecentTransactions } from "../components/dashboard/recent-transactions";
import { SummaryCards } from "../components/dashboard/summary-cards";
import { useAnalyticsDashboard } from "../api/analytics";
import { useTransactions } from "../api/transactions";

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

function DashboardPage() {
  const navigate = useNavigate({ from: "/" });
  const { month = currentMonth() } = Route.useSearch();
  const { startDate, endDate } = monthToDateRange(month);

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
      <TopBar month={month} onMonthChange={handleMonthChange} />
      <PageContainer>
        <div className="space-y-5">
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
