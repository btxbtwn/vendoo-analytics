"use client";

import { useChartReady } from "../lib/use-chart-ready";
import { ProjectionPoint, ProjectionSummary } from "../lib/types";
import { formatCurrency } from "./ChartTooltip";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const WINDOW_OPTIONS = [7, 14, 30, 60, 90];

interface ProjectionTooltipPayloadItem {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  strokeDasharray?: string | number;
  value?: number | null;
}

interface ProjectionTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: readonly ProjectionTooltipPayloadItem[];
}

interface ProjectionChartProps {
  data: ProjectionPoint[];
  summary: ProjectionSummary;
  windowDays: number;
  onWindowChange: (nextWindow: number) => void;
  compact?: boolean;
}

function formatMetricTick(rawValue: number): string {
  const value = Number(rawValue);
  const prefix = value < 0 ? "-$" : "$";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1000) {
    const shortened = absoluteValue >= 10000
      ? (absoluteValue / 1000).toFixed(0)
      : (absoluteValue / 1000).toFixed(1);

    return `${prefix}${shortened}k`;
  }

  return `${prefix}${absoluteValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function ProjectionTooltip({ active, label, payload }: ProjectionTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const rows = payload.filter((item) => typeof item.value === "number");

  if (rows.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-elevated border rounded-[6px] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
    >
      <p className="text-[var(--text-base)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{String(label ?? "")}</p>
      <div className="mt-3 space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {rows.map((item) => (
          <div key={String(item.dataKey ?? item.name)} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color ?? "var(--chart-1)", opacity: item.strokeDasharray ? 0.6 : 1 }}
              />
              <span>{String(item.name ?? item.dataKey ?? "Value")}</span>
            </div>
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {formatCurrency(item.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectionChart({
  data,
  summary,
  windowDays,
  onWindowChange,
  compact = false,
}: ProjectionChartProps) {
  const { ref, ready } = useChartReady();

  return (
    <div className="w-full max-w-full overflow-hidden border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-transparent p-4 md:p-6">
      <div className={`flex gap-3 ${compact ? "flex-col" : "flex-col 2xl:flex-row 2xl:items-start 2xl:justify-between"}`}>
        <div>
          <p className="mt-1 text-sm text-muted-foreground">
            Dashed lines extend the current daily pace into the next selected window.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {WINDOW_OPTIONS.map((option) => {
            const active = option === windowDays;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onWindowChange(option)}
                className={`rounded-none border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {option}D
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: `Past ${windowDays}d Revenue`, value: summary.actualRevenue, tone: "text-primary" },
          { label: `Past ${windowDays}d Profit`, value: summary.actualProfit, tone: "text-primary" },
          { label: `Next ${windowDays}d Revenue`, value: summary.projectedRevenue, tone: "text-primary" },
          { label: `Next ${windowDays}d Profit`, value: summary.projectedProfit, tone: "text-primary" },
        ].map((card) => (
          <div key={card.label} className="border border-border/70 bg-muted/20 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{card.label}</p>
            <p className={`mt-2 text-lg font-semibold ${card.tone}`}>{formatCurrency(card.value)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-none border border-border/70 bg-muted/20 px-3 py-1.5">
          <span className="h-2 w-2 rounded-none bg-accent" /> Revenue actual
        </span>
        <span className="inline-flex items-center gap-2 rounded-none border border-border/70 bg-muted/20 px-3 py-1.5">
          <span className="h-2 w-2 rounded-none bg-accent opacity-60" /> Revenue projected
        </span>
        <span className="inline-flex items-center gap-2 rounded-none border border-border/70 bg-muted/20 px-3 py-1.5">
          <span className="h-2 w-2 rounded-none bg-success" /> Profit actual
        </span>
        <span className="inline-flex items-center gap-2 rounded-none border border-border/70 bg-muted/20 px-3 py-1.5">
          <span className="h-2 w-2 rounded-none bg-success opacity-60" /> Profit projected
        </span>
      </div>

      <div ref={ref} className={compact ? "mt-4 h-64" : "mt-4 h-72 md:h-80 xl:h-[24rem]"}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart
              data={data}
              margin={compact ? { top: 8, right: 8, left: -18, bottom: 0 } : { top: 8, right: 18, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
                minTickGap={compact ? 22 : 14}
              />
              <YAxis
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
                width={compact ? 40 : 56}
                tickFormatter={(value) => formatMetricTick(Number(value))}
              />
              <Tooltip cursor={{ stroke: "var(--chart-1)", strokeOpacity: 0.15 }} content={<ProjectionTooltip />} />
              <Line
                type="monotone"
                dataKey="actualRevenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                name="Revenue actual"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="projectedRevenue"
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                name="Revenue projected"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="actualProfit"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                name="Profit actual"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="projectedProfit"
                stroke="var(--chart-2)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                name="Profit projected"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full bg-muted/20" />
        )}
      </div>
    </div>
  );
}
