import type { TransactionWithRelations } from "@finance-manager/shared";
import { TransactionTable } from "../transactions/TransactionTable";

interface RecentTransactionsProps {
  transactions: TransactionWithRelations[];
  isPending?: boolean;
}

export function RecentTransactions({ transactions, isPending }: RecentTransactionsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
      </div>
      <TransactionTable
        transactions={transactions}
        isPending={isPending}
        emptyMessage="No transactions this month. Start tracking!"
      />
    </div>
  );
}
