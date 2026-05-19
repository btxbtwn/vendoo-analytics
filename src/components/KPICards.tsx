"use client";

import { memo } from "react";
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
  color: string;
  bgColor: string;
  trend?: number;          // e.g. +12 or -5
  goal?: number;           // 0–100 percentage
  sparklineData?: { value: number }[];
}

interface KPICardsProps {
  cards: KPIItem[];
  compact?: boolean;
}

/* ─── tiny helpers ─── */
function ArrowIcon({ value }: { value: number }) {
  return (
    <span className={value >= 0 ? "text-success" : "text-danger"}>
      {value >= 0 ? "▲" : "▼"}
    </span>
  );
}

function GoalBar({ pct }: { pct: number }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-secondary">{Math.round(clamped)}%</span>
    </div>
  );
}

/* ─── sparkline (memo for perf) ─── */
const Sparkline = memo(function Sparkline({
  data,
  color,
}: {
  data: { value: number }[];
  color: string;
}) {
  if (!data || data.length < 2) return null;

  return (
    <div className="h-9 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-fill-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            contentStyle={{
              background: "#111118",
              border: "1px solid #1e1e2e",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#f8fafc",
            }}
            itemStyle={{ color: "#f8fafc" }}
            formatter={(value: any) => [Number(value).toLocaleString(), ""]}
            labelStyle={{ display: "none" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-fill-${color})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

/* ─── desktop card ─── */
function DesktopCard({ card }: { card: KPIItem }) {
  const Icon = card.icon;
  const hasTrend = card.trend !== undefined;
  const hasGoal = card.goal !== undefined;

  return (
    <div className="group surface-card rounded-2xl p-5 transition-all duration-150 hover:border-border-hover">
      {/* top row: label + icon + sparkline */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor}`}>
            <Icon size={16} className={card.color} />
          </div>
          <span className="section-kicker text-secondary">{card.label}</span>
        </div>
        {card.sparklineData ? (
          <Sparkline data={card.sparklineData} color={card.color.replace("text-", "") === "accent" ? "#6366f1" : card.color.replace("text-", "") === "success" ? "#22c55e" : "#8b5cf6"} />
        ) : null}
      </div>

      {/* big number */}
      <p className={`mt-3 text-2xl font-bold tracking-tight tabular-nums ${card.color}`}>
        {card.value}
      </p>

      {/* trend */}
      {hasTrend ? (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-secondary">
          <ArrowIcon value={card.trend!} />
          <span className={card.trend! >= 0 ? "text-success" : "text-danger"}>
            {Math.abs(card.trend!)}%
          </span>
          <span className="text-tertiary">vs last period</span>
        </p>
      ) : null}

      {/* goal */}
      {hasGoal ? <GoalBar pct={card.goal!} /> : null}
    </div>
  );
}

/* ─── compact (mobile) card ─── */
function CompactCard({ card }: { card: KPIItem }) {
  const Icon = card.icon;
  return (
    <div className="surface-card rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="section-kicker text-secondary">{card.label}</span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${card.bgColor}`}>
          <Icon size={14} className={card.color} />
        </div>
      </div>
      <p className={`mt-2 text-xl font-bold tracking-tight tabular-nums ${card.color}`}>
        {card.value}
      </p>
      {card.trend !== undefined ? (
        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium">
          <ArrowIcon value={card.trend} />
          <span className={card.trend >= 0 ? "text-success" : "text-danger"}>
            {Math.abs(card.trend)}%
          </span>
        </p>
      ) : null}
    </div>
  );
}

/* ─── main export ─── */
export default function KPICards({ cards, compact = false }: KPICardsProps) {
  if (compact) {
    const primary = cards.slice(0, 4);
    const secondary = cards.slice(4);

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {primary.map((card) => (
            <CompactCard key={card.label} card={card} />
          ))}
        </div>
        {secondary.length > 0 && (
          <div className="surface-card rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Supporting Metrics</h3>
              <span className="text-xs text-tertiary">{secondary.length} values</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secondary.map((card) => (
                <CompactCard key={card.label} card={card} />
              ))}
            </div>
          </div>
        )}
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
