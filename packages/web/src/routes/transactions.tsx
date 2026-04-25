import { createFileRoute } from "@tanstack/react-router";
import { TransactionList } from "../components/transactions/TransactionList";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All your transactions in one place.
        </p>
      </div>
      <TransactionList />
    </div>
  );
}
