import { SlidersHorizontal } from "lucide-react";
import { getCategoryMeta } from "../../lib/category-meta";

export interface Transaction {
  id: string;
  merchant?: string;
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
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
        <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
  const { icon: Icon, color } = getCategoryMeta(tx.category);
  const isIncome = tx.type === "income";
  const formattedAmount = `${isIncome ? "+" : "-"}€${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-surface-raised">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold leading-tight text-foreground">{tx.category}</span>
            {tx.merchant && (
              <span className="truncate text-xs leading-tight text-muted-foreground">{tx.merchant}</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{tx.date}</td>
      <td className={`px-6 py-3 text-right font-mono text-sm font-semibold ${isIncome ? "text-income" : "text-expense"}`}>
        {formattedAmount}
      </td>
    </tr>
  );
}
