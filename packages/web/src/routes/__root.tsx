import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-950 text-white">
      <h1 className="p-6 text-2xl font-bold tracking-tight">Finance Manager</h1>
      <Outlet />
    </div>
  ),
});
