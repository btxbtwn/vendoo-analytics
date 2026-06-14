"use client";

import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Package,
  BarChart3,
  Store,
  Tag,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/lib/use-theme";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "platforms", label: "Platforms", icon: Store },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "brands", label: "Brands", icon: BarChart3 },
  { id: "labels", label: "Labels", icon: Tag },
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
  const { toggleTheme } = useTheme();

  const sidebarWidth = collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)";

  return (
    <>
      <aside
        className="hidden md:fixed md:top-0 md:left-0 md:flex md:h-screen md:flex-col z-50"
        style={{
          width: sidebarWidth,
          transition: "width 200ms var(--ease-out)",
          backgroundColor: "var(--color-bg-sidebar)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Header — toggle only visible on large screens */}
        <div
          className="hidden lg:flex border-b shrink-0 justify-end"
          style={{
            borderColor: "var(--color-border)",
            padding: collapsed ? "8px 12px" : "8px 16px",
          }}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="shrink-0 rounded-none p-1.5 bg-transparent border border-border text-secondary hover:bg-hover hover:text-primary focus-visible:bg-hover focus-visible:text-primary transition-colors duration-[var(--duration-normal)] ease-[var(--ease-out)] cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Nav */}
        <div
          className="flex-1"
          style={{
            paddingLeft: collapsed ? "8px" : "10px",
            paddingRight: collapsed ? "8px" : "10px",
          }}
        >
          {!collapsed && (
            <div
              className="text-tertiary font-medium"
              style={{
                fontSize: "12px",
                padding: "16px 10px 8px",
              }}
            >
              Main
            </div>
          )}
          <nav className="flex-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className="flex w-full items-center hover:text-primary focus-visible:text-primary cursor-pointer"
                  style={{
                    height: "32px",
                    padding: collapsed ? "0" : "0 10px",
                    marginBottom: "2px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: "10px",
                    borderRadius: 0,
                    borderLeft: isActive
                      ? "2px solid var(--color-accent)"
                      : "2px solid transparent",
                    backgroundColor: isActive
                      ? "var(--color-bg-active)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                    fontSize: "var(--text-sm)",
                    fontWeight: isActive ? 600 : 500,
                    transition: "color 150ms var(--ease-out), border-color 150ms var(--ease-out), background-color 150ms var(--ease-out)",
                  }}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="pt-6 px-[10px] pb-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center hover:text-primary focus-visible:text-primary cursor-pointer border-none"
            style={{
              height: "32px",
              padding: "0 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "10px",
              borderRadius: 0,
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              transition: "color 150ms var(--ease-out)",
              borderLeft: "2px solid transparent",
            }}
            title={collapsed ? "Toggle theme" : undefined}
          >
            <span className="relative block h-4 w-4 shrink-0">
              <Moon
                size={16}
                className="absolute inset-0"
                style={{ opacity: "var(--moon-opacity, 1)" }}
              />
              <Sun
                size={16}
                className="absolute inset-0"
                style={{ opacity: "var(--sun-opacity, 0)" }}
              />
            </span>
            {!collapsed && <span>Theme</span>}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 md:hidden"
        style={{
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-surface)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)",
          paddingTop: "8px",
          paddingLeft: "8px",
          paddingRight: "8px",
        }}
      >
        <div className="flex flex-nowrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center justify-center border-none cursor-pointer"
                style={{
                  gap: "2px",
                  padding: "6px 2px",
                  flex: "1 1 0",
                  minWidth: 0,
                  minHeight: "48px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: isActive
                    ? "var(--color-accent-soft)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-secondary)",
                  fontSize: "11px",
                  fontWeight: 500,
                  transition: "all var(--duration-normal) var(--ease-out)",
                }}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate text-center leading-tight text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
