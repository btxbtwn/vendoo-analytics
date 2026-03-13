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

interface ProfitBreakdownChartProps {
  data: { name: string; value: number; fill: string }[];
  compact?: boolean;
}

export default function ProfitBreakdownChart({
  data,
  compact = false,
}: ProfitBreakdownChartProps) {
  const ready = useChartReady();
  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Profit Breakdown
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue, costs, and net profit composition
        </p>
      </div>
      <div className={compact ? "h-56" : "h-60 md:h-72"}>
        {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={compact ? { top: 5, right: 8, left: -20, bottom: 0 } : { top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
              minTickGap={compact ? 20 : 12}
            />
            <YAxis
              tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
              tickFormatter={(val) => `$${Math.abs(val)}`}
              width={compact ? 38 : 52}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  getTitle={({ label }) => String(label ?? "")}
                  getValueLabel={({ payload }) =>
                    Number(payload[0]?.value ?? 0) >= 0 ? "Amount" : "Deduction"
                  }
                  valueFormatter={(value) => formatCurrency(Math.abs(Number(value)))}
                />
              )}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-2xl bg-muted/20" />
        )}
      </div>

      {/* Summary labels */}
      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
            <span className="text-xs font-medium text-foreground">
              ${Math.abs(item.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
