import { Landmark, TrendingDown, TrendingUp } from "lucide-react";

export interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  incomeChangePercent: number;
  expensesChangePercent: number;
  netCashFlowChangePercent: number;
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  netCashFlow,
  incomeChangePercent,
  expensesChangePercent,
  netCashFlowChangePercent,
}: SummaryCardsProps) {
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "EUR" });

  const sign = (n: number) => (n >= 0 ? "+" : "");

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total Income */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Total Income
          </p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-income-subtle">
            <TrendingUp className="h-5 w-5 text-income" />
          </div>
        </div>
        <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground">{fmt(totalIncome)}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold text-income">
            {sign(incomeChangePercent)}{incomeChangePercent}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Total Expenses
          </p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-expense-subtle">
            <TrendingDown className="h-5 w-5 text-expense" />
          </div>
        </div>
        <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground">{fmt(totalExpenses)}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold text-expense">
            {sign(expensesChangePercent)}{expensesChangePercent}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </div>

      {/* Net Cash Flow */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Net Cash Flow
          </p>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${netCashFlow >= 0 ? "bg-income-subtle" : "bg-expense-subtle"}`}>
            <Landmark className={`h-5 w-5 ${netCashFlow >= 0 ? "text-income" : "text-expense"}`} />
          </div>
        </div>
        <p className={`mt-2 font-mono text-2xl font-bold tracking-tight ${netCashFlow >= 0 ? "text-income" : "text-expense"}`}>{fmt(netCashFlow)}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`font-mono text-xs font-semibold ${netCashFlowChangePercent >= 0 ? "text-income" : "text-expense"}`}>
            {sign(netCashFlowChangePercent)}{netCashFlowChangePercent}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </div>
    </div>
  );
}
