import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LayoutDashboard,
  Palette,
  Receipt,
  Wallet,
} from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex ${collapsed ? "w-14" : "w-56"} shrink-0 flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ease-in-out`}
    >
      {/* Brand */}
      <div className={`flex items-center py-4 ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}>
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-200 ease-in-out ${
            collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
          }`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
            <Banknote className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="whitespace-nowrap text-[10px] font-bold uppercase leading-tight tracking-widest text-primary">
            Finance Manager
          </span>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-0.5 py-1 ${collapsed ? "px-1" : "px-2"}`}>
        <NavLink
          to="/"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
          exact
          collapsed={collapsed}
        />
        <NavLink
          to="/transactions"
          icon={<Receipt className="h-4 w-4" />}
          label="Transactions"
          collapsed={collapsed}
        />
        <NavLink
          to="/accounts"
          icon={<Wallet className="h-4 w-4" />}
          label="Accounts"
          collapsed={collapsed}
        />
        <NavLink
          to="/theme"
          icon={<Palette className="h-4 w-4" />}
          label="Theme Showcase"
          collapsed={collapsed}
        />
      </nav>

      {/* Net Worth */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          collapsed ? "max-h-0 opacity-0" : "max-h-32 opacity-100"
        }`}
      >
        <div className="border-t border-border px-4 py-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Net Worth
          </p>
          <p className="text-xl font-bold text-foreground">$12,847.32</p>
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <ChevronsUpDown className="h-3 w-3" />
            <span className="text-xs">All Accounts</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

const NAV_ITEM_BASE =
  "flex w-full items-center rounded-md py-2 text-sm font-medium transition-colors";

const NAV_ITEM_INACTIVE =
  "text-muted-foreground hover:bg-surface-raised hover:text-foreground";

const NAV_ITEM_ACTIVE = "bg-surface-raised text-foreground";

function NavLink({
  icon,
  label,
  to,
  exact,
  collapsed,
}: {
  icon: ReactNode;
  label: string;
  to: LinkProps["to"];
  exact?: boolean;
  collapsed: boolean;
}) {
  const layout = collapsed ? "justify-center px-2" : "gap-3 px-3";

  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      title={collapsed ? label : undefined}
      className={`${NAV_ITEM_BASE} ${layout} ${NAV_ITEM_INACTIVE}`}
      activeProps={{ className: `${NAV_ITEM_BASE} ${layout} ${NAV_ITEM_ACTIVE}` }}
    >
      {icon}
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out ${
          collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
