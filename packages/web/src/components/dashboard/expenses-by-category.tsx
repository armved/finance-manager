import { getCategoryMeta } from "../../lib/category-meta";

export interface CategoryAmount {
  label: string;
  amount: number;
}

export interface ExpensesByCategoryProps {
  total: number;
  categories: readonly CategoryAmount[];
}

export function ExpensesByCategory({ total, categories }: ExpensesByCategoryProps) {
  const donutGradient = buildDonutGradient(categories, total);

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-5 text-sm font-semibold text-foreground">
        Expenses by Category
      </h2>
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
        <div className="grid flex-1 grid-cols-5 gap-x-4 gap-y-5">
          {categories.map(({ label, amount }) => {
            const { icon: Icon, color } = getCategoryMeta(label);
            return (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
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
// After the 6th segment, reuse a muted neutral so the chart doesn't get noisy.
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
    const { color } = getCategoryMeta(label);
    const resolvedColor = i < 6 ? color : "var(--color-neutral-700)";
    return `${resolvedColor} ${from}% ${to}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}
