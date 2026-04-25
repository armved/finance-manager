import { useTransactions } from "../../api/transactions";
import { getCategoryMeta } from "../../lib/category-meta";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number, type: "income" | "expense"): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${type === "income" ? "+" : "-"}€${formatted}`;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-[10px] bg-surface-raised" />
          <div className="flex flex-col gap-1">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-raised" />
            <div className="h-3 w-20 animate-pulse rounded bg-surface-raised" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-surface-raised" />
      </td>
      <td className="px-6 py-3 text-right">
        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-surface-raised" />
      </td>
    </tr>
  );
}

interface TransactionListProps {
  typeFilter?: "all" | "income" | "expense";
}

export function TransactionList({ typeFilter = "all" }: TransactionListProps) {
  const { data, isPending, error } = useTransactions(
    typeFilter !== "all" ? { type: typeFilter } : undefined,
  );

  const rows = data?.data;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">All Transactions</h2>
        {data && (
          <span className="text-xs text-muted-foreground">
            {rows?.length ?? data.total} total
          </span>
        )}
      </div>

      {error ? (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          Failed to load transactions: {error.message}
        </div>
      ) : (
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
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : rows?.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No transactions yet. Add your first one!
                </td>
              </tr>
            ) : (
              rows?.map((tx) => {
                const name = tx.merchant?.name ?? "Transaction";
                const { icon: Icon, color } = getCategoryMeta(tx.category.name);
                const categoryColor = tx.category.color ?? color;
                const isIncome = tx.type === "income";
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface-raised"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                          style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-semibold leading-tight text-foreground">
                            {tx.category.name}
                          </span>
                          <span className="truncate text-xs leading-tight text-muted-foreground">
                            {name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td
                      className={`px-6 py-3 text-right font-mono text-sm font-semibold ${
                        isIncome ? "text-income" : "text-expense"
                      }`}
                    >
                      {formatAmount(tx.amount, tx.type)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
