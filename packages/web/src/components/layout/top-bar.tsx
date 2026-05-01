import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-3">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
