"use client";

import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Package,
  BarChart3,
  Store,
  Moon,
  Sun,
  MoreHorizontal, Settings, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/use-theme";

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
  const { toggleTheme } = useTheme();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [settingsOpen]);

  return (
    <>
      <aside
        className="hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col transition-[width] duration-200 ease-out"
        style={{
          width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          transition: "width 200ms var(--ease-out)",
        }}
      >
        {/* Header */}
        <div
          className="flex border-b shrink-0"
          style={{
            borderColor: "var(--color-border)",
            padding: collapsed ? "16px 12px" : "16px",
            flexDirection: collapsed ? "column" : "row",
            alignItems: collapsed ? "center" : "flex-start",
            gap: collapsed ? "12px" : "8px",
          }}
        >
          <div
            className="flex items-center"
            style={{
              gap: collapsed ? 0 : "10px",
              minWidth: 0,
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 40,
                height: 40,
                backgroundColor: "var(--color-accent)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                V
              </span>
            </div>

            {!collapsed && (
              <span
                className="truncate font-semibold"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-primary)",
                  letterSpacing: "var(--tracking-tight)",
                }}
              >
                Vendoo
              </span>
            )}
          </div>

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
          {/* Settings */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex w-full items-center"
            style={{
              height: "32px",
              padding: "0 10px",
              marginBottom: "2px",
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
            title={collapsed ? "Settings" : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
          >
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>

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
        <div className="grid grid-cols-6 gap-1">
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
                  gap: "4px",
                  padding: "8px 4px",
                  minHeight: "56px",
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
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
          {/* More */}
          <button
            type="button"
            onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "8px 4px",
              minHeight: "56px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              fontSize: "11px",
              fontWeight: 500,
              transition: "all var(--duration-normal) var(--ease-out)",
              cursor: "pointer",
              border: "none",
            }}
          >
            <MoreHorizontal size={18} className="shrink-0" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Settings overlay */}
      {settingsOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
            onClick={() => setSettingsOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(400px, 100vw)",
              zIndex: 101,
              backgroundColor: "var(--color-bg-surface)",
              borderLeft: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                Settings
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>
              Coming soon
            </p>
          </div>
        </>
      )}

      {/* Mobile more popup */}
      {mobileMoreOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
            }}
            onClick={() => setMobileMoreOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              bottom: "calc(72px + env(safe-area-inset-bottom))",
              right: "8px",
              zIndex: 61,
              backgroundColor: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              minWidth: "160px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <button
              type="button"
              onClick={() => { setSettingsOpen(true); setMobileMoreOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                background: "none",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
              }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={() => { toggleTheme(); setMobileMoreOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                background: "none",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
              }}
            >
              <Sun size={16} />
              <span>Theme</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
