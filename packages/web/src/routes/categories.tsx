import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCategoryTree } from "../api/categories";
import { CategoryTree } from "../components/categories/CategoryTree";
import { CategoryDialog } from "../components/categories/CategoryDialog";
import { PageContainer } from "../components/layout/page-container";
import { PageHeader } from "../components/layout/top-bar";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

type Tab = "expense" | "income";

function CategoriesPage() {
  const [tab, setTab] = useState<Tab>("expense");
  const [addOpen, setAddOpen] = useState(false);

  const { data: tree, isLoading } = useCategoryTree(tab);
  const roots = tree ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Categories">
        <button
          onClick={() => setAddOpen(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </PageHeader>

      <PageContainer>
        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg border border-border bg-background p-1 w-fit">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? t === "expense"
                    ? "bg-expense/15 text-expense"
                    : "bg-income/15 text-income"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tree */}
        <div className="rounded-xl border border-border bg-surface p-4">
          {isLoading ? (
            <div className="flex flex-col gap-2 py-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-md bg-surface-raised"
                  style={{ width: `${60 + (i % 3) * 15}%` }}
                />
              ))}
            </div>
          ) : (
            <CategoryTree roots={roots} type={tab} />
          )}
        </div>
      </PageContainer>

      {addOpen && (
        <CategoryDialog
          open
          onOpenChange={(open) => !open && setAddOpen(false)}
          mode="create"
          defaultType={tab}
        />
      )}
    </div>
  );
}
