import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/theme")({
  component: ThemeShowcase,
});

type Swatch = { label: string; bg: string; fg: string };

const groups: { title: string; swatches: Swatch[] }[] = [
  {
    title: "Neutral",
    swatches: [
      { label: "50",  bg: "bg-neutral-50",  fg: "text-neutral-950" },
      { label: "100", bg: "bg-neutral-100", fg: "text-neutral-950" },
      { label: "200", bg: "bg-neutral-200", fg: "text-neutral-950" },
      { label: "300", bg: "bg-neutral-300", fg: "text-neutral-950" },
      { label: "400", bg: "bg-neutral-400", fg: "text-neutral-950" },
      { label: "500", bg: "bg-neutral-500", fg: "text-neutral-50" },
      { label: "600", bg: "bg-neutral-600", fg: "text-neutral-50" },
      { label: "700", bg: "bg-neutral-700", fg: "text-neutral-50" },
      { label: "800", bg: "bg-neutral-800", fg: "text-neutral-50" },
      { label: "900", bg: "bg-neutral-900", fg: "text-neutral-50" },
      { label: "950", bg: "bg-neutral-950", fg: "text-neutral-50" },
    ],
  },
  {
    title: "Primary",
    swatches: [
      { label: "100", bg: "bg-primary-100", fg: "text-primary-900" },
      { label: "200", bg: "bg-primary-200", fg: "text-primary-900" },
      { label: "300", bg: "bg-primary-300", fg: "text-primary-900" },
      { label: "400", bg: "bg-primary-400", fg: "text-primary-900" },
      { label: "500", bg: "bg-primary-500", fg: "text-neutral-50" },
      { label: "600", bg: "bg-primary-600", fg: "text-neutral-50" },
      { label: "700", bg: "bg-primary-700", fg: "text-neutral-50" },
      { label: "800", bg: "bg-primary-800", fg: "text-neutral-50" },
      { label: "900", bg: "bg-primary-900", fg: "text-neutral-50" },
    ],
  },
  {
    title: "Success",
    swatches: [
      { label: "400", bg: "bg-success-400", fg: "text-neutral-950" },
      { label: "500", bg: "bg-success-500", fg: "text-neutral-50" },
      { label: "600", bg: "bg-success-600", fg: "text-neutral-50" },
      { label: "900", bg: "bg-success-900", fg: "text-success-400" },
    ],
  },
  {
    title: "Danger",
    swatches: [
      { label: "400", bg: "bg-danger-400", fg: "text-neutral-950" },
      { label: "500", bg: "bg-danger-500", fg: "text-neutral-50" },
      { label: "600", bg: "bg-danger-600", fg: "text-neutral-50" },
      { label: "900", bg: "bg-danger-900", fg: "text-danger-400" },
    ],
  },
  {
    title: "Warning",
    swatches: [
      { label: "400", bg: "bg-warning-400", fg: "text-neutral-950" },
      { label: "500", bg: "bg-warning-500", fg: "text-neutral-950" },
      { label: "900", bg: "bg-warning-900", fg: "text-warning-400" },
    ],
  },
];

const semanticRows: { label: string; bg: string; fg: string; fgLabel: string }[] = [
  { label: "background",      bg: "bg-background",      fg: "text-foreground",       fgLabel: "foreground" },
  { label: "surface",         bg: "bg-surface",         fg: "text-foreground",       fgLabel: "foreground" },
  { label: "surface-raised",  bg: "bg-surface-raised",  fg: "text-foreground",       fgLabel: "foreground" },
  { label: "surface-overlay", bg: "bg-surface-overlay", fg: "text-foreground",       fgLabel: "foreground" },
  { label: "muted",           bg: "bg-muted",           fg: "text-muted-foreground", fgLabel: "muted-foreground" },
  { label: "primary",         bg: "bg-primary",         fg: "text-primary-foreground", fgLabel: "primary-foreground" },
  { label: "secondary",       bg: "bg-secondary",       fg: "text-secondary-foreground", fgLabel: "secondary-foreground" },
  { label: "accent",          bg: "bg-accent",          fg: "text-accent-foreground", fgLabel: "accent-foreground" },
  { label: "destructive",     bg: "bg-destructive",     fg: "text-destructive-foreground", fgLabel: "destructive-foreground" },
  { label: "income",          bg: "bg-income",          fg: "text-background",       fgLabel: "background" },
  { label: "income-subtle",   bg: "bg-income-subtle",   fg: "text-income",           fgLabel: "income" },
  { label: "expense",         bg: "bg-expense",         fg: "text-background",       fgLabel: "background" },
  { label: "expense-subtle",  bg: "bg-expense-subtle",  fg: "text-expense",          fgLabel: "expense" },
  { label: "transfer",        bg: "bg-transfer",        fg: "text-background",       fgLabel: "background" },
  { label: "transfer-subtle", bg: "bg-transfer-subtle", fg: "text-transfer",         fgLabel: "transfer" },
  { label: "border",          bg: "bg-border",          fg: "text-foreground",       fgLabel: "foreground" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ThemeShowcase() {
  return (
    <div className="space-y-10 px-8 py-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Theme</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Active theme: <span className="font-mono">dark.css</span>
        </p>
      </div>

      <Section title="Primitive scales">
        <div className="space-y-1.5">
          {groups.map(({ title, swatches }) => (
            <div key={title} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-mono text-muted-foreground">
                {title}
              </span>
              <div className="flex flex-1 gap-0.5 rounded-md overflow-hidden">
                {swatches.map(({ label, bg, fg }) => (
                  <div
                    key={label}
                    className={`${bg} ${fg} flex flex-1 items-end justify-center pb-1 h-10 text-[10px] font-mono`}
                    title={`${title.toLowerCase()}-${label}`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic tokens">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {semanticRows.map(({ label, bg, fg, fgLabel }) => (
            <div
              key={label}
              className={`${bg} ${fg} rounded-md px-3 py-2.5 flex flex-col gap-0.5`}
            >
              <span className="text-xs font-mono font-medium">{label}</span>
              <span className="text-[10px] font-mono opacity-60">{fgLabel}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="bg-surface rounded-md px-5 py-4 space-y-2.5 border border-border">
          <p className="font-sans text-2xl font-bold text-foreground">The quick brown fox</p>
          <p className="font-sans text-base text-muted-foreground">Secondary text — muted foreground</p>
          <p className="font-mono text-base text-foreground">€ 1,234.56 — monospace</p>
          <div className="flex gap-4 font-mono text-sm pt-1">
            <span className="text-income">+€ 3,200.00</span>
            <span className="text-expense">−€ 1,450.00</span>
            <span className="text-transfer">↔ € 500.00</span>
          </div>
        </div>
      </Section>

      <Section title="Radius & shadow">
        <div className="flex flex-wrap gap-6">
          {(["rounded-sm","rounded-md","rounded-lg","rounded-xl","rounded-2xl","rounded-full"] as const).map((cls) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div className={`${cls} bg-surface-raised border border-border shadow-md w-14 h-14`} />
              <span className="text-[10px] font-mono text-muted-foreground">{cls}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
