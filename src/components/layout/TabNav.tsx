"use client";

export interface Tab {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function TabNav({ tabs, activeTab, onChange }: TabNavProps) {
  return (
    <div
      className="hidden md:flex gap-1 shrink-0 overflow-x-auto md:overflow-x-visible"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none" as const,
        msOverflowStyle: "none" as const,
      }}
    >
      {/* Fade hint — right edge signals scrollable content on mobile */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 md:hidden"
        style={{
          background: 'linear-gradient(to right, transparent, var(--color-bg-primary) 60%)',
        }}
      />
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="shrink-0"
            style={{
              height: "28px",
              padding: "0 12px",
              fontSize: "13px",
              fontWeight: 500,
              backgroundColor: isActive ? "var(--color-accent-soft)" : "transparent",
              color: isActive
                ? "var(--color-accent)"
                : "var(--color-text-secondary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "background 150ms ease-out, color 150ms ease-out",
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
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
