"use client";

import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Package,
  BarChart3,
  Store,
} from "lucide-react";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "platforms", label: "Platforms", icon: Store },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "brands", label: "Brands", icon: BarChart3 },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-full md:flex-col md:border-r md:border-border md:bg-card/80 md:backdrop-blur-xl">
        <div
          className={`flex border-b border-border ${
            collapsed
              ? "flex-col items-center gap-3 px-3 py-4"
              : "items-center justify-between gap-2 px-4 py-4"
          }`}
        >
          <div
            className={`flex min-w-0 items-center ${
              collapsed ? "justify-center" : "gap-2.5"
            }`}
          >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent shadow-[0_0_32px_rgba(99,102,241,0.25)]">
            <span className="text-sm font-bold text-white">V</span>
          </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  Vendoo Analytics
                </h1>
                <p className="text-xs text-muted-foreground">Reseller Dashboard</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className={`flex-1 space-y-1.5 py-4 ${collapsed ? "px-2" : "px-2.5"}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`flex w-full items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
                } ${
                  isActive
                    ? "bg-accent/15 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
