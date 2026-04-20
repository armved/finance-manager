import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">Coming soon.</p>
      {/* TODO: remove when dashboard is built */}
      <Link
        to="/theme"
        className="inline-block rounded-md bg-surface-raised border border-border px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-ring transition-colors"
      >
        debug: theme →
      </Link>
    </div>
  );
}
