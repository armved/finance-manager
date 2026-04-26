import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "@finance-manager/shared";
import { DEFAULT_EXPENSE_CATEGORY } from "../../lib/category-meta";
import { getIconComponent } from "../../lib/category-icons";
import { useCategories, useDeleteCategory } from "../../api/categories";
import { useUIStore } from "../../store/ui";
import { CategoryDialog } from "../categories/CategoryDialog";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export interface CategoryAmount {
  label: string;
  amount: number;
  color?: string | null;
}

export interface ExpensesByCategoryProps {
  total: number;
  categories: readonly CategoryAmount[];
}

export function ExpensesByCategory({ total, categories }: ExpensesByCategoryProps) {
  const [editMode, setEditMode] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category?: Category;
  }>({ open: false, mode: "create" });
  const [deleteTarget, setDeleteTarget] = useState<Category | undefined>();

  const { data: apiCategories = [] } = useCategories("expense");
  const deleteCategory = useDeleteCategory();
  const openAddTransactionWithCategory = useUIStore(
    (s) => s.openAddTransactionWithCategory,
  );

  const donutGradient = buildDonutGradient(categories, total);

  function openEdit(cat: Category) {
    setCategoryDialog({ open: true, mode: "edit", category: cat });
  }

  function openCreate() {
    setCategoryDialog({ open: true, mode: "create", category: undefined });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteCategory.mutate(
      { id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(undefined) },
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Expenses by Category
        </h2>
        <button
          type="button"
          onClick={() => setEditMode((m) => !m)}
          className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {editMode ? "Done" : "Edit categories"}
        </button>
      </div>

      <div className="flex items-center gap-8">
        {/* Donut chart */}
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
          <div
            className="h-44 w-44 rounded-full"
            style={{ background: donutGradient }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-surface">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Total
              </p>
              <p className="text-lg font-bold text-foreground">
                €{total.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>

        {/* Category grid */}
        <div className="grid flex-1 grid-cols-6 gap-x-4 gap-y-5">
          {apiCategories.map((cat) => {
            const IconComp =
              getIconComponent(cat.icon) ?? DEFAULT_EXPENSE_CATEGORY.icon;
            const color = cat.color ?? DEFAULT_EXPENSE_CATEGORY.color;
            const amount =
              categories.find((c) => c.label === cat.name)?.amount ?? 0;

            const iconEl = (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}20` }}
              >
                <IconComp className="h-5 w-5" style={{ color }} />
              </div>
            );

            if (editMode) {
              return (
                <div
                  key={cat.id}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  {iconEl}
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    {cat.name}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(cat)}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-expense/10 hover:text-expense"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => openAddTransactionWithCategory(cat.id)}
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg p-1 text-center transition-colors hover:bg-surface-raised"
              >
                {iconEl}
                <p className="text-[10px] leading-tight text-muted-foreground">
                  {cat.name}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  €{amount.toLocaleString("en-US")}
                </p>
              </button>
            );
          })}

          {/* Add category — only in edit mode */}
          {editMode && (
            <button
              type="button"
              onClick={openCreate}
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg p-1 text-center transition-colors hover:bg-surface-raised"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-border">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[10px] leading-tight text-muted-foreground">
                Add
              </p>
            </button>
          )}
        </div>
      </div>

      <CategoryDialog
        key={categoryDialog.category?.id ?? "create"}
        open={categoryDialog.open}
        onOpenChange={(open) => setCategoryDialog((d) => ({ ...d, open }))}
        mode={categoryDialog.mode}
        category={categoryDialog.category}
        defaultType="expense"
      />

      <ConfirmDialog
        open={deleteTarget !== undefined}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete category?"
        description="All transactions in this category will be moved to Uncategorized."
        confirmLabel="Delete"
        destructive
        isPending={deleteCategory.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function buildDonutGradient(
  categories: readonly CategoryAmount[],
  total: number,
): string {
  let accumulated = 0;

  const stops = categories.map(({ amount, color }) => {
    const pct = total > 0 ? (amount / total) * 100 : 0;
    const from = accumulated.toFixed(2);
    accumulated += pct;
    const to = accumulated.toFixed(2);
    const resolvedColor = color ?? DEFAULT_EXPENSE_CATEGORY.color;
    return `${resolvedColor} ${from}% ${to}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}
