import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/layout/sidebar";
import { TransactionDialog } from "../components/transactions/TransactionDialog";

export const Route = createRootRoute({
  component: AppShell,
});

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground antialiased">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      <TransactionDialog />
    </div>
  );
}
