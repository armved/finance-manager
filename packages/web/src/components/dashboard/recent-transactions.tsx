import { SlidersHorizontal } from "lucide-react";
import { getCategoryMeta } from "../../lib/category-meta";

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
}

export interface RecentTransactionsProps {
  transactions: readonly Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Transactions
        </h2>
        <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Transaction
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Date
            </th>
            <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const initials = tx.merchant
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const isIncome = tx.type === "income";
  const formattedAmount = `${isIncome ? "+" : "-"}€${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-surface-raised">
      {/* Merchant */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
              isIncome ? "bg-income-subtle text-income" : "bg-expense-subtle text-expense"
            }`}
          >
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground">{tx.merchant}</span>
        </div>
      </td>

      {/* Category badge */}
      <td className="px-4 py-4">
        {(() => {
          const { color } = getCategoryMeta(tx.category);
          return (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {tx.category}
            </span>
          );
        })()}
      </td>

      {/* Date */}
      <td className="px-4 py-4 text-sm text-muted-foreground">{tx.date}</td>

      {/* Amount */}
      <td
        className={`px-6 py-4 text-right text-sm font-semibold ${
          isIncome ? "text-income" : "text-expense"
        }`}
      >
        {formattedAmount}
      </td>
    </tr>
  );
}
