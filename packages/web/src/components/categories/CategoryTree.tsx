import { useState } from "react";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import type { Category } from "@finance-manager/shared";
import { getIconComponent } from "../../lib/category-icons";
import { DEFAULT_EXPENSE_CATEGORY } from "../../lib/category-meta";
import { CategoryDialog } from "./CategoryDialog";

interface FlatNode {
  node: Category;
  depth: number;
}

function flattenVisible(nodes: Category[], depth: number, expanded: Set<string>): FlatNode[] {
  return nodes.flatMap((n) => {
    const item: FlatNode = { node: n, depth };
    if (n.children.length > 0 && expanded.has(n.id)) {
      return [item, ...flattenVisible(n.children, depth + 1, expanded)];
    }
    return [item];
  });
}

interface DialogState {
  mode: "create" | "edit";
  category?: Category;
  parentId?: string;
  parentName?: string;
  defaultType?: "income" | "expense";
}

interface Props {
  roots: Category[];
  type: "income" | "expense";
}

export function CategoryTree({ roots, type }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(roots.map((n) => n.id)),
  );
  const [dialog, setDialog] = useState<DialogState | null>(null);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visible = flattenVisible(roots, 0, expanded);

  if (roots.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No {type} categories yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {visible.map(({ node, depth }) => (
          <CategoryRow
            key={node.id}
            node={node}
            depth={depth}
            isExpanded={expanded.has(node.id)}
            onToggle={() => toggleExpanded(node.id)}
            onAddChild={() =>
              setDialog({
                mode: "create",
                parentId: node.id,
                parentName: node.name,
                defaultType: node.type,
              })
            }
            onEdit={() =>
              setDialog({ mode: "edit", category: node, defaultType: node.type })
            }
          />
        ))}
      </div>

      {dialog && (
        <CategoryDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          mode={dialog.mode}
          category={dialog.category}
          defaultType={dialog.defaultType ?? type}
          parentId={dialog.parentId}
          parentName={dialog.parentName}
        />
      )}
    </>
  );
}

function CategoryRow({
  node,
  depth,
  isExpanded,
  onToggle,
  onAddChild,
  onEdit,
}: {
  node: Category;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
  onAddChild: () => void;
  onEdit: () => void;
}) {
  const hasChildren = node.children.length > 0;
  const IconComp = getIconComponent(node.icon);
  const color = node.color ?? DEFAULT_EXPENSE_CATEGORY.color;

  return (
    <div
      className="group flex items-center gap-1.5 rounded-md py-1.5 pr-2 transition-colors hover:bg-surface-raised"
      style={{ paddingLeft: depth * 20 + 6 }}
    >
      {/* Expand/collapse */}
      <button
        type="button"
        onClick={hasChildren ? onToggle : undefined}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors ${
          hasChildren
            ? "cursor-pointer text-muted-foreground hover:text-foreground"
            : "cursor-default opacity-0"
        }`}
        tabIndex={hasChildren ? 0 : -1}
      >
        <ChevronRight
          className={`h-3.5 w-3.5 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Color + icon chip */}
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: `${color}20`, color }}
      >
        {IconComp ? <IconComp className="h-3.5 w-3.5" /> : null}
      </span>

      {/* Name */}
      <span className="flex-1 truncate text-sm text-foreground">{node.name}</span>

      {/* Default badge */}
      {node.isDefault && (
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          default
        </span>
      )}

      {/* Actions — visible on row hover */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onAddChild}
          title="Add subcategory"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
