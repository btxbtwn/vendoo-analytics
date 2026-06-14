"use client";

import { LucideIcon } from "lucide-react";
import { Sparkline } from "./charts";

export interface KPIItem {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;        // e.g. "text-accent" or "#6366f1"
  bgColor: string;      // e.g. "bg-accent/15"
  trend?: number;       // e.g. +12 or -5
  goal?: number;        // 0–100 percentage
  sparklineData?: { value: number }[];
  sub?: string;         // e.g. "28 of 59" shown below the value
  variant?: "default" | "trend" | "goal" | "plain"; // controls what decorations appear
  span?: 1 | 2;         // column span for emphasis (default: 1)
}

interface KPICardsProps {
  cards: KPIItem[];
  compact?: boolean;
}

/* ─── goal bar ─── */
function GoalBar({ pct }: { pct: number }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-none" style={{ background: "var(--color-border)" }}>
        <div
          className="h-full rounded-none transition-all duration-500 ease-out"
          style={{ width: `${clamped}%`, background: "var(--color-accent)" }}
        />
      </div>
      <span className="text-[10px] font-medium" style={{ color: "var(--color-text-tertiary)" }}>{Math.round(clamped)}%</span>
    </div>
  );
}

/* ─── desktop card ─── */
function DesktopCard({ card }: { card: KPIItem }) {
  const Icon = card.icon;
  const variant = card.variant ?? "default";
  const hasTrend = card.trend !== undefined && (variant === "default" || variant === "trend");
  const hasGoal = card.goal !== undefined && (variant === "default" || variant === "goal");
  const hasSparkline = card.sparklineData && (variant === "default");

  // Determine chart color from card.color
  let chartColor = "var(--chart-5)"; // fallback
  if (card.color === "text-accent") {
    chartColor = "var(--chart-1)";
  } else if (card.color === "text-success") {
    chartColor = "var(--chart-2)";
  }

  const valueColorStyle = { color: "var(--color-text-primary)" };

  return (
    <div
      className="rounded-none p-5 transition-all duration-[var(--duration-normal)]"
      style={{
        background: "transparent",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* top row: icon + label + sparkline */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-none"
            style={{ background: card.bgColor || "var(--color-accent-muted)" }}
          >
            <Icon size={16} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
          <span className="text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>{card.label}</span>
        </div>
        {hasSparkline ? (
          <Sparkline data={card.sparklineData!} color={chartColor} />
        ) : null}
      </div>

      {/* big number + trend */}
      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          className="text-[28px] font-semibold tracking-tight tabular-nums"
          style={valueColorStyle}
        >
          {card.value}
        </p>
        {hasTrend ? (
          <span
            className="text-xs font-medium tabular-nums"
            style={{
              color: card.trend! > 0 ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {card.trend! > 0 ? "↑" : card.trend! < 0 ? "↓" : "→"} {Math.abs(card.trend!)}%
          </span>
        ) : null}
      </div>

      {/* subtitle */}
      {card.sub ? (
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {card.sub}
        </p>
      ) : null}

      {/* goal bar */}
      {hasGoal ? <GoalBar pct={card.goal!} /> : null}
    </div>
  );
}

/* ─── compact (mobile) card ─── */
function CompactCard({ card }: { card: KPIItem }) {
  const Icon = card.icon;
  const hasTrend = card.trend !== undefined;

  const valueColorStyle = { color: "var(--color-text-primary)" };

  return (
    <div
      className="rounded-none p-4 transition-all duration-[var(--duration-normal)]"
      style={{
        background: "transparent",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>{card.label}</span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-none shrink-0"
          style={{ background: card.bgColor || "var(--color-accent-muted)" }}
        >
          <Icon size={14} style={{ color: "var(--color-text-tertiary)" }} />
        </div>
      </div>
      <div className="mt-3 flex flex-col items-start gap-1">
        <p
          className="text-xl font-semibold tracking-tight tabular-nums"
          style={valueColorStyle}
        >
          {card.value}
        </p>
        {hasTrend ? (
          <span
            className="text-xs font-medium tabular-nums"
            style={{
              color: card.trend! > 0 ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {card.trend! > 0 ? "↑" : card.trend! < 0 ? "↓" : "→"} {Math.abs(card.trend!)}%
          </span>
        ) : null}
        {card.sub ? (
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {" "}{card.sub}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ─── main export ─── */
export default function KPICards({ cards, compact = false }: KPICardsProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <CompactCard key={card.label} card={card} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={card.span === 2 ? "sm:col-span-2" : ""}>
          <DesktopCard card={card} />
        </div>
      ))}
    </div>
  );
}
