import { useState } from "react";
import { ChevronRight, Pencil, Plus, SlidersHorizontal, X } from "lucide-react";
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

interface CategoryCellProps {
  cat: Category;
  amount: number;
  editMode: boolean;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onAdd: (categoryId: string) => void;
}

function CategoryCell({ cat, amount, editMode, onEdit, onDelete, onAdd }: CategoryCellProps) {
  const [addHovered, setAddHovered] = useState(false);
  const [bodyHovered, setBodyHovered] = useState(false);

  const IconComp = getIconComponent(cat.icon) ?? DEFAULT_EXPENSE_CATEGORY.icon;
  const color = cat.color ?? DEFAULT_EXPENSE_CATEGORY.color;
  // wire up in M12: cat.children?.length > 0
  const hasChildren = false;
  const drillable = hasChildren && !editMode;
  const hovered = bodyHovered && !editMode;

  return (
    <div
      className="border border-border rounded-[10px] overflow-hidden transition-colors"
      style={hovered ? { borderColor: `${color}80` } : undefined}
    >
      <div
        className="relative flex flex-col items-center justify-center gap-1.5 p-3 text-center cursor-pointer transition-colors"
        onMouseEnter={() => setBodyHovered(true)}
        onMouseLeave={() => setBodyHovered(false)}
        style={hovered ? { backgroundColor: `${color}10` } : undefined}
      >
        {editMode && (
          <>
            {!cat.isDefault && (
              <button
                type="button"
                onClick={() => onDelete(cat)}
                className="absolute top-1.5 left-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-expense-subtle border border-border text-expense"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(cat)}
              className="absolute top-1.5 right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-surface-raised border border-border text-muted-foreground"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </>
        )}

        {!editMode && hasChildren && (
          <div className="absolute top-1.5 right-1.5">
            <ChevronRight className="h-3 w-3" style={{ color }} />
          </div>
        )}

        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <IconComp className="h-5 w-5" style={{ color }} />
        </div>
        <p className="text-[10px] leading-tight text-muted-foreground">{cat.name}</p>
        <p className="font-mono text-xs font-semibold text-foreground">
          €{amount.toLocaleString("en-US")}
        </p>
      </div>

      {!editMode && (
        <button
          type="button"
          onClick={() => onAdd(String(cat.id))}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          className="w-full cursor-pointer border-t border-border py-1 text-center transition-colors"
          style={{
            backgroundColor: addHovered ? `${color}20` : undefined,
            color: addHovered ? color : undefined,
          }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors"
            style={{ color: addHovered ? color : undefined }}
          >
            + Add
          </span>
        </button>
      )}
    </div>
  );
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
          className={`flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors ${
            editMode
              ? "bg-surface-raised text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="h-3 w-3" />
          {editMode ? "Done" : "Edit categories"}
        </button>
      </div>

      <div className="flex items-center gap-8">
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
              <p className="font-mono text-lg font-bold text-foreground">
                €{total.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-6 gap-2.5">
          {apiCategories.map((cat) => {
            const amount =
              categories.find((c) => c.label === cat.name)?.amount ?? 0;
            return (
              <CategoryCell
                key={cat.id}
                cat={cat}
                amount={amount}
                editMode={editMode}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onAdd={openAddTransactionWithCategory}
              />
            );
          })}

          {editMode && (
            <button
              type="button"
              onClick={openCreate}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border p-3 text-center transition-colors hover:bg-surface-raised"
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
