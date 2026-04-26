import { useTransactions } from "../../api/transactions";
import { TransactionTable } from "./TransactionTable";

interface TransactionListProps {
  typeFilter?: "all" | "income" | "expense";
}

export function TransactionList({ typeFilter = "all" }: TransactionListProps) {
  const { data, isPending, error } = useTransactions(
    typeFilter !== "all" ? { type: typeFilter } : undefined,
  );
  const rows = data?.data ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">All Transactions</h2>
        {data && (
          <span className="text-xs text-muted-foreground">{data.total} total</span>
        )}
      </div>

      {error ? (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          Failed to load transactions: {error.message}
        </div>
      ) : (
        <TransactionTable transactions={rows} isPending={isPending} />
      )}
    </div>
  );
}
