import type { ElementType } from "react";
import {
  Car,
  GraduationCap,
  HeartPulse,
  Home,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tv2,
  Utensils,
  Zap,
} from "lucide-react";

export interface CategoryAmount {
  label: string;
  amount: number;
}

export interface ExpensesByCategoryProps {
  total: number;
  categories: readonly CategoryAmount[];
}

// Presentation config: maps category labels to icon + color tokens.
// Lives here because it's purely a display concern.
const CATEGORY_META: Record<
  string,
  { icon: ElementType; bg: string; fg: string; chartColor: string }
> = {
  Housing: {
    icon: Home,
    bg: "bg-primary-900",
    fg: "text-primary-300",
    chartColor: "var(--primary)",
  },
  "Food & Drink": {
    icon: Utensils,
    bg: "bg-expense-subtle",
    fg: "text-expense",
    chartColor: "var(--expense)",
  },
  Shopping: {
    icon: ShoppingBag,
    bg: "bg-primary-800",
    fg: "text-primary-400",
    chartColor: "var(--color-primary-700)",
  },
  Groceries: {
    icon: ShoppingCart,
    bg: "bg-income-subtle",
    fg: "text-income",
    chartColor: "var(--income)",
  },
  Transport: {
    icon: Car,
    bg: "bg-primary-900",
    fg: "text-primary-200",
    chartColor: "var(--transfer)",
  },
  Utilities: {
    icon: Zap,
    bg: "bg-transfer-subtle",
    fg: "text-transfer",
    chartColor: "var(--color-primary-300)",
  },
  Education: {
    icon: GraduationCap,
    bg: "bg-primary-900",
    fg: "text-primary-400",
    chartColor: "var(--color-neutral-600)",
  },
  Insurance: {
    icon: Shield,
    bg: "bg-primary-900",
    fg: "text-primary-300",
    chartColor: "var(--color-neutral-600)",
  },
  Healthcare: {
    icon: HeartPulse,
    bg: "bg-expense-subtle",
    fg: "text-danger-400",
    chartColor: "var(--color-neutral-600)",
  },
  Entertainment: {
    icon: Tv2,
    bg: "bg-surface-raised",
    fg: "text-muted-foreground",
    chartColor: "var(--color-neutral-600)",
  },
};

const FALLBACK_META = {
  icon: ShoppingBag,
  bg: "bg-surface-raised",
  fg: "text-muted-foreground",
  chartColor: "var(--color-neutral-600)",
};

export function ExpensesByCategory({ total, categories }: ExpensesByCategoryProps) {
  const donutGradient = buildDonutGradient(categories, total);

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-5 text-sm font-semibold text-foreground">
        Expenses by Category
      </h2>
      <div className="flex items-center gap-8">
        {/* Donut chart */}
        <div className="relative flex h-44 w-44 flex-shrink-0 items-center justify-center">
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
        <div className="grid flex-1 grid-cols-5 gap-x-4 gap-y-5">
          {categories.map(({ label, amount }) => {
            const meta = CATEGORY_META[label] ?? FALLBACK_META;
            const Icon = meta.icon;
            return (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${meta.bg}`}
                >
                  <Icon className={`h-5 w-5 ${meta.fg}`} />
                </div>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  {label}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  €{amount.toLocaleString("en-US")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Converts category amounts into a CSS conic-gradient string.
// Only the first 6 categories get distinct chart colors; the rest are grouped.
function buildDonutGradient(
  categories: readonly CategoryAmount[],
  total: number,
): string {
  let accumulated = 0;

  const stops = categories.map(({ label, amount }, i) => {
    const pct = total > 0 ? (amount / total) * 100 : 0;
    const from = accumulated.toFixed(2);
    accumulated += pct;
    const to = accumulated.toFixed(2);
    const color =
      (CATEGORY_META[label] ?? FALLBACK_META).chartColor;
    // After the 6th segment reuse a muted neutral so the chart doesn't get noisy
    const resolvedColor = i < 6 ? color : "var(--color-neutral-700)";
    return `${resolvedColor} ${from}% ${to}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}
