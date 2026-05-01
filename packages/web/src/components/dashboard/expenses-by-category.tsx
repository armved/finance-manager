import { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Category } from "@finance-manager/shared";
import { DEFAULT_EXPENSE_CATEGORY } from "../../lib/category-meta";
import { getIconComponent } from "../../lib/category-icons";
import { useCategories, useDeleteCategory, useReorderCategories } from "../../api/categories";
import { useUIStore } from "../../store/ui";
import { CategoryDialog } from "../categories/CategoryDialog";

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
  onAddChild: (cat: Category) => void;
  onDrill: (cat: Category) => void;
}

function CategoryCell({ cat, amount, editMode, onEdit, onDelete, onAdd, onAddChild, onDrill }: CategoryCellProps) {
  const [addHovered, setAddHovered] = useState(false);
  const [bodyHovered, setBodyHovered] = useState(false);

  const IconComp = getIconComponent(cat.icon) ?? DEFAULT_EXPENSE_CATEGORY.icon;
  const color = cat.color ?? DEFAULT_EXPENSE_CATEGORY.color;
  const hasChildren = cat.children.length > 0;
  const drillable = hasChildren && !editMode;
  const hovered = bodyHovered && !editMode;

  return (
    <div
      className="border border-border rounded-[10px] overflow-hidden transition-colors"
      style={hovered ? { borderColor: `${color}80` } : undefined}
    >
      <div
        className={`relative flex flex-col items-center justify-center gap-1.5 p-3 text-center transition-colors ${drillable ? "cursor-pointer" : ""}`}
        onClick={() => drillable && onDrill(cat)}
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
            <ChevronRight className="h-3 w-3 transition-colors text-border" style={hovered ? { color } : undefined} />
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

      {editMode ? (
        <button
          type="button"
          onClick={() => onAddChild(cat)}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          className="w-full cursor-pointer border-t border-border py-1 text-center transition-colors"
          style={{ backgroundColor: addHovered ? `${color}10` : undefined }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors"
            style={{ color: addHovered ? color : undefined }}
          >
            + Subcategory
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onAdd(String(cat.id))}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          className="w-full cursor-pointer border-t border-border py-1 text-center transition-colors"
          style={{ backgroundColor: addHovered ? `${color}20` : undefined }}
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

function SortableCategoryCell(props: CategoryCellProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.cat.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 10 : undefined,
        cursor: props.editMode ? "grab" : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <CategoryCell {...props} />
    </div>
  );
}

export function ExpensesByCategory({ total, categories }: ExpensesByCategoryProps) {
  const [editMode, setEditMode] = useState(false);
  const [drillPath, setDrillPath] = useState<Category[]>([]);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category?: Category;
    parentId?: string;
    parentName?: string;
  }>({ open: false, mode: "create" });
  const [deleteTarget, setDeleteTarget] = useState<Category | undefined>();

  const { data: apiCategories = [] } = useCategories("expense");
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();
  const openAddTransactionWithCategory = useUIStore((s) => s.openAddTransactionWithCategory);
  const [reassignId, setReassignId] = useState("");
  const reassignOptions = apiCategories.filter((c) => c.id !== deleteTarget?.id);

  const roots = apiCategories.filter((c) => !c.parentId);
  const drilledStale = drillPath[drillPath.length - 1];
  const drilled = drilledStale
    ? (apiCategories.find((c) => c.id === drilledStale.id) ?? drilledStale)
    : undefined;
  const displayCategories = drilled ? drilled.children : roots;

  // Reset local order whenever the user drills in or out
  useEffect(() => {
    setLocalOrder(null);
  }, [drillPath]);

  // Split: draggable (non-default) vs pinned last (default / Uncategorized)
  const draggableCats = displayCategories.filter((c) => !c.isDefault);
  const pinnedCats = displayCategories.filter((c) => c.isDefault);

  // Apply user-defined order or fall back to server sortOrder
  const orderedDraggable = localOrder
    ? localOrder
        .flatMap((id) => {
          const found = draggableCats.find((c) => c.id === id);
          return found ? [found] : [];
        })
        .concat(draggableCats.filter((c) => !localOrder.includes(c.id)))
    : [...draggableCats].sort((a, b) => a.sortOrder - b.sortOrder);

  const allDisplayed = [...orderedDraggable, ...pinnedCats];

  const analyticsMap = new Map(categories.map((c) => [c.label, c.amount]));
  const displayAmounts = allDisplayed.map((cat) => ({
    label: cat.name,
    amount: analyticsMap.get(cat.name) ?? 0,
    color: cat.color,
  }));
  const displayTotal = displayAmounts.reduce((s, c) => s + c.amount, 0);
  const donutGradient = buildDonutGradient(displayAmounts, displayTotal || total);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedDraggable.findIndex((c) => c.id === active.id);
    const newIndex = orderedDraggable.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedDraggable, oldIndex, newIndex);
    setLocalOrder(reordered.map((c) => c.id));
    reorderCategories.mutate(reordered.map((c, i) => ({ id: c.id, sortOrder: i })));
  }

  function openEdit(cat: Category) {
    setCategoryDialog({ open: true, mode: "edit", category: cat });
  }

  function openCreate() {
    setCategoryDialog({ open: true, mode: "create", category: undefined });
  }

  function openAddChild(cat: Category) {
    setCategoryDialog({ open: true, mode: "create", parentId: cat.id, parentName: cat.name });
  }

  function handleDrill(cat: Category) {
    setDrillPath((p) => [...p, cat]);
    setEditMode(false);
  }

  function handleBack() {
    setDrillPath((p) => p.slice(0, -1));
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    deleteCategory.mutate(
      { id: targetId, reassignToCategoryId: reassignId || undefined },
      {
        onSuccess: () => {
          if (drilled) {
            const remaining = drilled.children.filter((c) => c.id !== targetId);
            if (remaining.length === 0) setDrillPath((p) => p.slice(0, -1));
          }
          setDeleteTarget(undefined);
          setReassignId("");
        },
      },
    );
  }

  const sharedCellProps = {
    editMode,
    onEdit: openEdit,
    onDelete: setDeleteTarget,
    onAdd: openAddTransactionWithCategory,
    onAddChild: openAddChild,
    onDrill: handleDrill,
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {drillPath.length > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <span className={drillPath.length > 0 ? "text-muted-foreground" : ""}>
              Expenses
            </span>
            {drillPath.map((cat, i) => (
              <span key={cat.id} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className={i === drillPath.length - 1 ? "text-foreground" : "text-muted-foreground"}>
                  {cat.name}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setEditMode((m) => !m)}
          className={`flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors ${
            editMode
              ? "bg-surface-raised text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {editMode ? <Check className="h-3 w-3" /> : <SlidersHorizontal className="h-3 w-3" />}
          {editMode ? "Done" : "Edit categories"}
        </button>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
          <div className="h-44 w-44 rounded-full" style={{ background: donutGradient }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-surface">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Total
              </p>
              <p className="font-mono text-lg font-bold text-foreground">
                €{(drilled ? displayTotal : total).toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedDraggable.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid flex-1 grid-cols-6 gap-2.5">
              {orderedDraggable.map((cat) => (
                <SortableCategoryCell
                  key={cat.id}
                  cat={cat}
                  amount={analyticsMap.get(cat.name) ?? 0}
                  {...sharedCellProps}
                />
              ))}
              {pinnedCats.map((cat) => (
                <CategoryCell
                  key={cat.id}
                  cat={cat}
                  amount={analyticsMap.get(cat.name) ?? 0}
                  {...sharedCellProps}
                />
              ))}
              {editMode && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border p-3 text-center transition-colors hover:bg-surface-raised"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-border">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">Add</p>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <CategoryDialog
        key={categoryDialog.category?.id ?? categoryDialog.parentId ?? "create"}
        open={categoryDialog.open}
        onOpenChange={(open) => setCategoryDialog((d) => ({ ...d, open }))}
        mode={categoryDialog.mode}
        category={categoryDialog.category}
        defaultType="expense"
        parentId={categoryDialog.parentId}
        parentName={categoryDialog.parentName}
      />

      <Dialog.Root
        open={deleteTarget !== undefined}
        onOpenChange={(open) => {
          if (!open) { setDeleteTarget(undefined); setReassignId(""); }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="mb-4 flex items-start justify-between gap-4">
              <Dialog.Title className="text-base font-semibold text-foreground">
                Delete category?
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Description className="mb-4 text-sm text-muted-foreground">
              Move transactions from{" "}
              <span className="font-medium text-foreground">"{deleteTarget?.name}"</span> to:
            </Dialog.Description>

            <div className="relative mb-5">
              <select
                value={reassignId}
                onChange={(e) => setReassignId(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Uncategorized (default)</option>
                {reassignOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="flex gap-3">
              <Dialog.Close asChild>
                <button className="flex-1 cursor-pointer rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                disabled={deleteCategory.isPending}
                onClick={handleConfirmDelete}
                className="flex-1 cursor-pointer rounded-lg bg-expense py-2 text-sm font-medium text-white transition-colors hover:bg-expense/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteCategory.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
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
