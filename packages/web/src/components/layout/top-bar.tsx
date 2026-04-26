import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useUIStore } from "../../store/ui";

export function TopBar() {
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  return (
    <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-3">
      {/* Period navigation */}
      <div className="flex items-center gap-1">
        <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-1 text-sm font-medium text-foreground">April 2026</span>
        <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button className="ml-1 flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={openAddTransaction}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>
    </header>
  );
}
