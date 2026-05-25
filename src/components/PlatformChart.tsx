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
  eBay: "var(--chart-1)",
  Poshmark: "var(--chart-5)",
  Mercari: "var(--chart-4)",
  Depop: "var(--chart-2)",
  Etsy: "var(--chart-7)",
  "In-Person": "var(--chart-8)",
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
      <div className="bg-transparent border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 w-full max-w-full overflow-hidden">
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
    <div className="bg-transparent border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div ref={ref} className="h-60 md:h-72 xl:h-80">
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
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
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} name="Revenue">
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PLATFORM_COLORS[entry.name] || "var(--chart-1)"}
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
