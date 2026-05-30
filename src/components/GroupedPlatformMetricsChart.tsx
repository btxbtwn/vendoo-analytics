"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { ChartDataPoint } from "../lib/types";
import { ChartTooltip, formatCurrency } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";

const METRIC_COLORS = {
  revenue: "var(--chart-1)",
  profit: "#22C55E",
  fees: "#FF6B6B",
};

const METRIC_LABELS = {
  revenue: "Revenue",
  profit: "Profit",
  fees: "Fees",
};

import { PLATFORM_COLORS as BRAND_COLORS } from "../lib/platform-colors";

const PLATFORM_BRAND_COLORS: Record<string, string> = {
  ...BRAND_COLORS,
  Unknown: "#95A5A6",
};

interface GroupedPlatformMetricsChartProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

interface GroupedBarPoint {
  name: string;
  revenue: number;
  profit: number;
  fees: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const data = payload.reduce<Record<string, number>>(
    (acc, item) => ({ ...acc, [item.name]: item.value }),
    {}
  );

  return (
    <div
      className="min-w-[12rem] border rounded-none px-4 py-3"
      style={{
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
      }}
    >
      <p
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--color-text-primary)" }}
      >
        {label}
      </p>
      <div className="space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <div className="flex justify-between gap-6">
          <span>Revenue</span>
          <span className="font-medium" style={{ color: METRIC_COLORS.revenue }}>
            {formatCurrency(data.revenue ?? 0)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Profit</span>
          <span className="font-medium" style={{ color: METRIC_COLORS.profit }}>
            {formatCurrency(data.profit ?? 0)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Fees</span>
          <span className="font-medium" style={{ color: METRIC_COLORS.fees }}>
            {formatCurrency(data.fees ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GroupedPlatformMetricsChart({
  data,
  compact = false,
}: GroupedPlatformMetricsChartProps) {
  const { ref, ready } = useChartReady();

  const groupedData = useMemo<GroupedBarPoint[]>(
    () =>
      data.map((p) => ({
        name: p.name,
        revenue: Number(p.revenue ?? 0),
        profit: Number(p.profit ?? 0),
        fees: Number(p.fees ?? 0),
      })),
    [data]
  );

  const maxValue = useMemo(
    () =>
      Math.max(
        ...groupedData.flatMap((p) => [p.revenue, p.profit, p.fees]),
        1
      ),
    [groupedData]
  );

  if (compact) {
    return (
      <div className="space-y-3">
        {groupedData.map((platform) => {
          const brandColor = PLATFORM_BRAND_COLORS[platform.name] || "#95A5A6";
          return (
            <div
              key={platform.name}
              className="border border-border/70 bg-muted/20 p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-none"
                  style={{ backgroundColor: brandColor }}
                />
                <span className="text-sm font-medium text-foreground">
                  {platform.name}
                </span>
              </div>
              {/* Stacked bar: Revenue | Profit | Fees */}
              <div className="h-3 overflow-hidden rounded-none bg-muted flex">
                {[
                  { key: "revenue", value: platform.revenue, color: brandColor },
                  { key: "profit", value: platform.profit, color: METRIC_COLORS.profit },
                  { key: "fees", value: platform.fees, color: METRIC_COLORS.fees },
                ]
                  .filter((s) => s.value > 0)
                  .map((seg) => (
                    <div
                      key={seg.key}
                      title={`${METRIC_LABELS[seg.key as keyof typeof METRIC_LABELS]}: ${formatCurrency(seg.value)}`}
                      className="h-full rounded-none"
                      style={{
                        width: `${Math.max((seg.value / maxValue) * 100, 2)}%`,
                        backgroundColor: seg.color,
                      }}
                    />
                  ))}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span style={{ color: brandColor }}>
                  Rev: {formatCurrency(platform.revenue)}
                </span>
                <span style={{ color: METRIC_COLORS.profit }}>
                  Pft: {formatCurrency(platform.profit)}
                </span>
                <span style={{ color: METRIC_COLORS.fees }}>
                  Fee: {formatCurrency(platform.fees)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-transparent border border-[var(--color-border)] rounded-none p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div ref={ref} className="h-60 md:h-72 xl:h-80">
        {ready ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={groupedData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              barCategoryGap="20%"
              barGap={4}
            >
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
                content={<CustomTooltip />}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                formatter={(value) => (
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {METRIC_LABELS[value as keyof typeof METRIC_LABELS]}
                  </span>
                )}
              />
              <Bar dataKey="revenue" name="revenue" radius={[3, 3, 0, 0]}>
                {groupedData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PLATFORM_BRAND_COLORS[entry.name] || "#95A5A6"}
                  />
                ))}
              </Bar>
              <Bar dataKey="profit" name="profit" fill={METRIC_COLORS.profit} radius={[3, 3, 0, 0]} />
              <Bar dataKey="fees" name="fees" fill={METRIC_COLORS.fees} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full bg-muted/20" />
        )}
      </div>
    </div>
  );
}
