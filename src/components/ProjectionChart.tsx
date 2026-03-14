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
    <div className="min-w-[11rem] rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
      <p className="text-base font-semibold text-foreground">{String(label ?? "")}</p>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        {rows.map((item) => (
          <div key={String(item.dataKey ?? item.name)} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color ?? "#6366f1", opacity: item.strokeDasharray ? 0.6 : 1 }}
              />
              <span>{String(item.name ?? item.dataKey ?? "Value")}</span>
            </div>
            <span className="font-semibold text-foreground">
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
  const ready = useChartReady();

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-6">
      <div className={`flex gap-3 ${compact ? "flex-col" : "flex-col 2xl:flex-row 2xl:items-start 2xl:justify-between"}`}>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue &amp; Profit Projector</h3>
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
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
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
          { label: `Past ${windowDays}d Revenue`, value: summary.actualRevenue, tone: "text-accent" },
          { label: `Past ${windowDays}d Profit`, value: summary.actualProfit, tone: "text-success" },
          { label: `Next ${windowDays}d Revenue`, value: summary.projectedRevenue, tone: "text-accent" },
          { label: `Next ${windowDays}d Profit`, value: summary.projectedProfit, tone: "text-success" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{card.label}</p>
            <p className={`mt-2 text-lg font-semibold ${card.tone}`}>{formatCurrency(card.value)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> Revenue actual
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-accent opacity-60" /> Revenue projected
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-success" /> Profit actual
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-success opacity-60" /> Profit projected
        </span>
      </div>

      <div className={compact ? "mt-4 h-64" : "mt-4 h-72 md:h-80 xl:h-[24rem]"}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={compact ? { top: 8, right: 8, left: -18, bottom: 0 } : { top: 8, right: 18, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
                axisLine={{ stroke: "#27272a" }}
                tickLine={false}
                minTickGap={compact ? 22 : 14}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
                axisLine={{ stroke: "#27272a" }}
                tickLine={false}
                width={compact ? 40 : 56}
                tickFormatter={(value) => formatMetricTick(Number(value))}
              />
              <Tooltip cursor={{ stroke: "#6366f1", strokeOpacity: 0.15 }} content={<ProjectionTooltip />} />
              <Line
                type="monotone"
                dataKey="actualRevenue"
                stroke="#6366f1"
                strokeWidth={2.25}
                dot={false}
                name="Revenue actual"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="projectedRevenue"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="Revenue projected"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="actualProfit"
                stroke="#22c55e"
                strokeWidth={2.25}
                dot={false}
                name="Profit actual"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="projectedProfit"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="Profit projected"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-2xl bg-muted/20" />
        )}
      </div>
    </div>
  );
}
