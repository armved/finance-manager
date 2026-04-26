import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useUIStore } from "../../store/ui";

interface TopBarProps {
  month: string; // "YYYY-MM"
  onMonthChange: (month: string) => void;
}

function shiftMonth(month: string, delta: -1 | 1): string {
  const year = parseInt(month.slice(0, 4), 10);
  const mon = parseInt(month.slice(5, 7), 10);
  const d = new Date(year, mon - 1 + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month: string): string {
  const year = parseInt(month.slice(0, 4), 10);
  const mon = parseInt(month.slice(5, 7), 10);
  return new Date(year, mon - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function TopBar({ month, onMonthChange }: TopBarProps) {
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  return (
    <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-3">
      {/* Period navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-1 text-sm font-medium text-foreground">
          {formatMonth(month)}
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
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
