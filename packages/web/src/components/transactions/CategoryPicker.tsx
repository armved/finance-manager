import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Category } from "@finance-manager/shared";
import { getIconComponent } from "../../lib/category-icons";
import { DEFAULT_EXPENSE_CATEGORY } from "../../lib/category-meta";

interface CategoryNode {
  id: string;
  name: string;
  resolvedColor: string;
  resolvedIcon: string | null;
  parentId: string | null;
  children: CategoryNode[];
  pathNames: string[];
}

const DEFAULT_COLOR = DEFAULT_EXPENSE_CATEGORY.color;
const DEFAULT_ICON_ID = DEFAULT_EXPENSE_CATEGORY.iconId;

function buildTree(categories: Category[]): { roots: CategoryNode[]; flat: CategoryNode[] } {
  function buildNode(
    cat: Category,
    inheritedColor: string,
    inheritedIcon: string | null,
    pathNames: string[],
  ): CategoryNode {
    const resolvedColor = cat.color ?? inheritedColor;
    const resolvedIcon = cat.icon ?? inheritedIcon;
    const myPath = [...pathNames, cat.name];
    const children = categories
      .filter((c) => c.parentId === cat.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((child) => buildNode(child, resolvedColor, resolvedIcon, myPath));
    return { id: cat.id, name: cat.name, resolvedColor, resolvedIcon, parentId: cat.parentId, children, pathNames: myPath };
  }

  const roots = categories
    .filter((c) => c.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => buildNode(c, DEFAULT_COLOR, DEFAULT_ICON_ID, []));

  function flatten(nodes: CategoryNode[]): CategoryNode[] {
    return nodes.flatMap((n) => [n, ...flatten(n.children)]);
  }

  return { roots, flat: flatten(roots) };
}

interface Props {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCancel: () => void;
}

export function CategoryPicker({ categories, selectedId, onSelect, onCancel }: Props) {
  const [path, setPath] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const { roots, flat } = useMemo(() => buildTree(categories), [categories]);

  const { currentNodes, breadcrumb } = useMemo(() => {
    let nodes = roots;
    const crumbs: CategoryNode[] = [];
    for (const id of path) {
      const found = nodes.find((n) => n.id === id);
      if (!found) break;
      crumbs.push(found);
      nodes = found.children;
    }
    return { currentNodes: nodes, breadcrumb: crumbs };
  }, [roots, path]);

  const currentParent = breadcrumb[breadcrumb.length - 1] ?? null;

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return flat
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.pathNames.join(" › ").toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [flat, query]);

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: 380 }}>
      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center gap-1 overflow-hidden">
        {path.length > 0 && (
          <button
            type="button"
            onClick={() => setPath((p) => p.slice(0, -1))}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setPath([])}
          className={`shrink-0 cursor-pointer border-none bg-transparent p-0 text-xs font-medium transition-colors ${path.length === 0 ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          All categories
        </button>
        {breadcrumb.map((b, i) => (
          <span key={b.id} className="flex shrink-0 items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setPath(path.slice(0, i + 1))}
              className={`cursor-pointer border-none bg-transparent p-0 text-xs font-medium transition-colors ${i === breadcrumb.length - 1 ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {b.name}
            </button>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories…"
          className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Grid or search results */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 300 }}>
        {searchHits !== null ? (
          <div className="flex flex-col gap-0.5">
            {searchHits.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No categories match "{query}"
              </p>
            ) : (
              searchHits.map((node) => (
                <SearchRow
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  onSelect={() => onSelect(node.id)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {currentParent && (
              <button
                type="button"
                onClick={() => onSelect(currentParent.id)}
                className="col-span-2 flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-border px-3 py-2.5 text-left transition-colors hover:bg-surface-raised"
              >
                <CategoryIcon node={currentParent} />
                <span className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    Use "{currentParent.name}"
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Pick this group, no subcategory
                  </span>
                </span>
              </button>
            )}
            {currentNodes.map((node) => {
              const hasChildren = node.children.length > 0;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() =>
                    hasChildren ? setPath((p) => [...p, node.id]) : onSelect(node.id)
                  }
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-surface-raised"
                  style={{
                    borderColor:
                      node.id === selectedId ? node.resolvedColor : "var(--border)",
                    background:
                      node.id === selectedId
                        ? `${node.resolvedColor}15`
                        : "var(--surface)",
                  }}
                >
                  <CategoryIcon node={node} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium leading-snug text-foreground">
                      {node.name}
                    </span>
                    {hasChildren && (
                      <span className="text-[11px] text-muted-foreground">
                        {node.children.length} subcategories
                      </span>
                    )}
                  </span>
                  {hasChildren && (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex border-t border-border pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CategoryIcon({ node }: { node: CategoryNode }) {
  const IconComp = getIconComponent(node.resolvedIcon);
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
      style={{ background: `${node.resolvedColor}20`, color: node.resolvedColor }}
    >
      {IconComp ? <IconComp className="h-3.5 w-3.5" /> : null}
    </span>
  );
}

function SearchRow({
  node,
  selected,
  onSelect,
}: {
  node: CategoryNode;
  selected: boolean;
  onSelect: () => void;
}) {
  const IconComp = getIconComponent(node.resolvedIcon);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-raised"
      style={{ background: selected ? `${node.resolvedColor}15` : "transparent" }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${node.resolvedColor}20`, color: node.resolvedColor }}
      >
        {IconComp ? <IconComp className="h-3.5 w-3.5" /> : null}
      </span>
      <span className="flex flex-col">
        <span className="text-xs font-medium text-foreground">{node.name}</span>
        {node.pathNames.length > 1 && (
          <span className="text-[11px] text-muted-foreground">
            {node.pathNames.slice(0, -1).join(" › ")}
          </span>
        )}
      </span>
    </button>
  );
}

export function resolveCategoryDisplay(
  categories: Category[],
  id: string,
): { name: string; color: string; icon: string | null; path: string[] } | null {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const cat = byId.get(id);
  if (!cat) return null;

  const path: string[] = [];
  let color: string | null = null;
  let icon: string | null = null;
  let current: Category | undefined = cat;
  const visited = new Set<string>();

  while (current) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    path.unshift(current.name);
    if (!color && current.color) color = current.color;
    if (!icon && current.icon) icon = current.icon;
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return { name: cat.name, color: color ?? DEFAULT_COLOR, icon: icon ?? DEFAULT_ICON_ID, path };
}
