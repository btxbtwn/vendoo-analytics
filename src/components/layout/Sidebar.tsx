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
import { useState } from "react";
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


  return (
    <>
      <aside
        className="hidden md:fixed md:top-0 md:left-0 md:flex md:h-screen md:flex-col transition-[width] duration-200 ease-out z-50"
        style={{
          width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          transition: "width 200ms var(--ease-out)",
          backgroundColor: "var(--color-bg-sidebar)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Header */}
        <div
          className="flex border-b shrink-0 justify-end"
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
            className="shrink-0 rounded"
            style={{
              padding: "6px",
              backgroundColor: "transparent",
              border: "1px solid var(--color-border-subtle)",
              color: "var(--color-text-secondary)",
              transition: "all var(--duration-normal) var(--ease-out)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
              e.currentTarget.style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
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
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--color-text-tertiary)",
                  padding: "16px 10px 8px",
                  fontWeight: 500,
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
                    className="flex w-full items-center"
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
                      backgroundColor: "transparent",
                      color: isActive
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      transition: "color 150ms var(--ease-out), border-color 150ms var(--ease-out)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "var(--color-text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "var(--color-text-secondary)";
                      }
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
        <div
          style={{
            paddingTop: "24px",
            padding: "12px 10px",
          }}
        >
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center"
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
              cursor: "pointer",
              border: "none",
              borderLeft: "2px solid transparent",
            }}
            title={collapsed ? "Toggle theme" : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
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
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                  padding: "6px 2px",
                  flex: "1 1 0",
                  minWidth: 0,
                  minHeight: "48px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: isActive
                    ? "var(--color-accent-muted)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-secondary)",
                  fontSize: "11px",
                  fontWeight: 500,
                  transition: "all var(--duration-normal) var(--ease-out)",
                  cursor: "pointer",
                  border: "none",
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
