import { useTransactions } from "../../api/transactions";

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

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-raised" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface-raised" />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-24 animate-pulse rounded-full bg-surface-raised" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-20 animate-pulse rounded bg-surface-raised" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-surface-raised" />
      </td>
    </tr>
  );
}

export function TransactionList() {
  const { data, isPending, error } = useTransactions();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">All Transactions</h2>
        {data && (
          <span className="text-xs text-muted-foreground">
            {data.total} total
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
                Description
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
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : data?.data.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No transactions yet. Add your first one!
                </td>
              </tr>
            ) : (
              data?.data.map((tx) => {
                const name = tx.merchant?.name ?? "Transaction";
                const color = tx.category.color ?? "#6B7280";
                const isIncome = tx.type === "income";
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface-raised"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                            isIncome
                              ? "bg-income-subtle text-income"
                              : "bg-expense-subtle text-expense"
                          }`}
                        >
                          {getInitials(name)}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${color}20`,
                          color,
                        }}
                      >
                        {tx.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-semibold ${
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
