"use client";

import { memo, useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";


export interface KPIItem {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;        // e.g. "text-accent" or "#6366f1"
  bgColor: string;      // e.g. "bg-accent/15"
  trend?: number;       // e.g. +12 or -5
  goal?: number;        // 0–100 percentage
  sparklineData?: { value: number }[];
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
      <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--color-border)" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%`, background: "var(--color-accent)" }}
        />
      </div>
      <span className="text-[10px] font-medium" style={{ color: "var(--color-text-tertiary)" }}>{Math.round(clamped)}%</span>
    </div>
  );
}

/* ─── sparkline (memo for perf) ─── */
function useSparkReady() {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) { setReady(true); return; }
    if (el.offsetWidth > 0 && el.offsetHeight > 0) { setReady(true); return; }
    const obs = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setReady(true);
        obs.disconnect();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, ready };
}

const Sparkline = memo(function Sparkline({
  data,
  color,
}: {
  data: { value: number }[];
  color: string;
}) {
  const { ref, ready } = useSparkReady();
  if (!data || data.length < 2) return null;

  return (
    <div ref={ref} className="h-8 w-20 max-h-[32px]">
      {ready ? (
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-fill-${color.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            contentStyle={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-primary)",
            }}
            itemStyle={{ color: "var(--color-text-primary)" }}
            formatter={(value: any) => [Number(value).toLocaleString(), ""]}
            labelStyle={{ display: "none" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-fill-${color.replace(/[^a-zA-Z0-9]/g, "")})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      ) : (
        <div className="h-8 w-20 bg-muted/20" />
      )}
    </div>
  );
});

/* ─── desktop card ─── */
function DesktopCard({ card }: { card: KPIItem }) {
  const Icon = card.icon;
  const hasTrend = card.trend !== undefined;
  const hasGoal = card.goal !== undefined;

  // Determine chart color from card.color
  let chartColor = "var(--chart-5)"; // fallback
  if (card.color === "text-accent") {
    chartColor = "var(--chart-1)";
  } else if (card.color === "text-success") {
    chartColor = "var(--chart-2)";
  }

  // Determine value color style vs class
  const isHexColor = card.color.startsWith("#");
  const valueColorClass = isHexColor ? "" : card.color;
  const valueColorStyle = isHexColor ? { color: card.color } : {};

  return (
    <div
      className="rounded-lg p-5 transition-all duration-[var(--duration-normal)]"
      style={{
        background: "transparent",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* top row: icon + label + sparkline */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: card.bgColor || "var(--color-accent-muted)" }}
          >
            <Icon size={16} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--color-text-tertiary)" }}>{card.label}</span>
        </div>
        {card.sparklineData ? (
          <Sparkline data={card.sparklineData} color={chartColor} />
        ) : null}
      </div>

      {/* big number + trend */}
      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          className={`text-[28px] font-semibold tracking-tight tabular-nums ${valueColorClass}`}
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

      {/* goal bar */}
      {hasGoal ? <GoalBar pct={card.goal!} /> : null}
    </div>
  );
}

/* ─── compact (mobile) card ─── */
function CompactCard({ card }: { card: KPIItem }) {
  const Icon = card.icon;
  const hasTrend = card.trend !== undefined;

  // Determine value color style vs class
  const isHexColor = card.color.startsWith("#");
  const valueColorClass = isHexColor ? "" : card.color;
  const valueColorStyle = isHexColor ? { color: card.color } : {};

  return (
    <div
      className="rounded-lg p-4 transition-all duration-[var(--duration-normal)]"
      style={{
        background: "transparent",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--color-text-tertiary)" }}>{card.label}</span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
          style={{ background: card.bgColor || "var(--color-accent-muted)" }}
        >
          <Icon size={14} style={{ color: "var(--color-text-tertiary)" }} />
        </div>
      </div>
      <div className="mt-3 flex flex-col items-start gap-1">
        <p
          className={`text-xl font-semibold tracking-tight tabular-nums ${valueColorClass}`}
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
        <DesktopCard key={card.label} card={card} />
      ))}
    </div>
  );
}
