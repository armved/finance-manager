import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageContainer } from "../components/layout/page-container";
import { TransactionList } from "../components/transactions/TransactionList";
import { useUIStore } from "../store/ui";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

type TypeFilter = "all" | "income" | "expense";

const FILTERS: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expense" },
];

function TransactionsPage() {
  const [filter, setFilter] = useState<TypeFilter>("all");
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  return (
    <PageContainer>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All your transactions in one place.
          </p>
        </div>
        <button
          onClick={openAddTransaction}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>
      <div className="mb-4 flex gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-transparent text-muted-foreground hover:bg-surface-raised hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <TransactionList typeFilter={filter} />
    </PageContainer>
  );
}
