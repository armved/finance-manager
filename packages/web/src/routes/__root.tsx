import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Palette, Receipt, Store, Tag, Wallet } from "lucide-react";
import type { LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Sidebar } from "../components/layout/sidebar";
import { TransactionDialog } from "../components/transactions/TransactionDialog";

export const Route = createRootRoute({
  component: AppShell,
});

const MOBILE_NAV: { to: LinkProps["to"]; icon: ReactNode; label: string; exact?: boolean }[] = [
  { to: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", exact: true },
  { to: "/transactions", icon: <Receipt className="h-5 w-5" />, label: "Transactions" },
  { to: "/accounts", icon: <Wallet className="h-5 w-5" />, label: "Accounts" },
  { to: "/categories", icon: <Tag className="h-5 w-5" />, label: "Categories" },
  { to: "/merchants", icon: <Store className="h-5 w-5" />, label: "Merchants" },
  { to: "/theme", icon: <Palette className="h-5 w-5" />, label: "Theme" },
];

const MOBILE_NAV_BASE = "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors";

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground antialiased">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-surface md:hidden">
        {MOBILE_NAV.map(({ to, icon, label, exact }) => (
          <Link
            key={String(to)}
            to={to}
            activeOptions={{ exact }}
            className={`${MOBILE_NAV_BASE} text-muted-foreground hover:text-foreground`}
            activeProps={{ className: `${MOBILE_NAV_BASE} text-primary` }}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <TransactionDialog />
    </div>
  );
}
