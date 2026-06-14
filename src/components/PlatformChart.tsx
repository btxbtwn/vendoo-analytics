"use client";

import { ChartTooltip, formatCurrency } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartDataPoint } from "../lib/types";

import { PLATFORM_COLORS as BRAND_COLORS } from "../lib/platform-colors";

// Brand colors per platform's official identity
const PLATFORM_COLORS: Record<string, string> = {
  ...BRAND_COLORS,
  Unknown: "#95A5A6",
};

interface PlatformChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function PlatformChart({
  data,
  compact = false,
}: PlatformChartProps) {
  const { ref, ready } = useChartReady();
  const maxRevenue = Math.max(...data.map((platform) => Number(platform.revenue || 0)), 1);

  if (compact) {
    return (
      <div className="bg-transparent border border-[var(--color-border)] rounded-none p-4 w-full max-w-full overflow-hidden">
        <div className="space-y-3">
          {data.map((platform) => {
            const revenue = Number(platform.revenue || 0);
            const sales = Number(platform.sales || 0);
            const color = PLATFORM_COLORS[platform.name] || "var(--chart-1)";

            return (
              <div
                key={platform.name}
                className="border border-border/70 bg-muted/20 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-none"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {platform.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    ${revenue.toFixed(2)}
                  </span>
                </div>
                <div className="mb-2 h-2 overflow-hidden rounded-none bg-muted">
                  <div
                    className="h-full rounded-none"
                    style={{ width: `${(revenue / maxRevenue) * 100}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{sales} sales</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent border border-[var(--color-border)] rounded-none p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div ref={ref} className="h-60 md:h-72 xl:h-80">
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                {data.map((entry) => {
                  const c = PLATFORM_COLORS[entry.name] || "var(--chart-1)";
                  return (
                    <linearGradient key={`grad-${entry.name}`} id={`barGrad-${entry.name.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={1} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.6} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={(props) => (
                  <ChartTooltip
                    {...props}
                    getTitle={({ label }) => String(label ?? "")}
                    getValueLabel={() => "Revenue"}
                    valueFormatter={formatCurrency}
                  />
                )}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} name="Revenue">
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={`url(#barGrad-${entry.name.replace(/[^a-zA-Z0-9]/g, "")})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full bg-muted/20" />
        )}
      </div>

      {/* Platform Breakdown Table */}
      <div className="mt-6 space-y-3">
        {data.map((platform) => {
          const color = PLATFORM_COLORS[platform.name] || "var(--chart-1)";
          return (
            <div
              key={platform.name}
              className="flex items-center justify-between py-2 px-3 rounded-none bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-none"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {platform.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {(platform.sales as number)} sales
                </span>
                <span className="font-medium text-foreground">
                  ${(platform.revenue as number).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
