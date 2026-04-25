import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "../components/layout/page-container";
import { TransactionList } from "../components/transactions/TransactionList";

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

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All your transactions in one place.
        </p>
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
