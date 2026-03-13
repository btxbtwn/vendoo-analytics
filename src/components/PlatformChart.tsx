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

const PLATFORM_COLORS: Record<string, string> = {
  eBay: "#6366f1",
  Poshmark: "#ec4899",
  Mercari: "#ef4444",
  Depop: "#22c55e",
  Etsy: "#f97316",
  "In-Person": "#8b5cf6",
};

interface PlatformChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export default function PlatformChart({
  data,
  compact = false,
}: PlatformChartProps) {
  const ready = useChartReady();
  const maxRevenue = Math.max(...data.map((platform) => Number(platform.revenue || 0)), 1);

  if (compact) {
    return (
      <div className="bg-card rounded-2xl border border-border p-4 w-full max-w-full overflow-hidden">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-foreground">
            Revenue by Platform
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Marketplace performance comparison
          </p>
        </div>
        <div className="space-y-3">
          {data.map((platform) => {
            const revenue = Number(platform.revenue || 0);
            const sales = Number(platform.sales || 0);
            const color = PLATFORM_COLORS[platform.name] || "#6366f1";

            return (
              <div
                key={platform.name}
                className="rounded-2xl border border-border/70 bg-muted/20 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
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
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
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
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Revenue by Platform
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Marketplace performance comparison
        </p>
      </div>
      <div className="h-60 md:h-72 xl:h-80">
        {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "#27272a" }}
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
                  fill={PLATFORM_COLORS[entry.name] || "#6366f1"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-2xl bg-muted/20" />
        )}
      </div>

      {/* Platform Breakdown Table */}
      <div className="mt-6 space-y-3">
        {data.map((platform) => {
          const color = PLATFORM_COLORS[platform.name] || "#6366f1";
          return (
            <div
              key={platform.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
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
