import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <h1 className="p-6 text-2xl font-bold tracking-tight">Finance Manager</h1>
      <Outlet />
    </div>
  ),
});
