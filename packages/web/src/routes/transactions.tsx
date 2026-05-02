import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageContainer } from "../components/layout/page-container";
import { PageHeader } from "../components/layout/top-bar";
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
    <>
      <PageHeader title="Transactions" />
      <PageContainer>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
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
          <button
            onClick={openAddTransaction}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>
        <TransactionList typeFilter={filter} />
      </PageContainer>
    </>
  );
}
