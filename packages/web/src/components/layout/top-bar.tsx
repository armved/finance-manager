interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex flex-shrink-0 items-center border-b border-border bg-surface px-6 py-3">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
    </header>
  );
}
