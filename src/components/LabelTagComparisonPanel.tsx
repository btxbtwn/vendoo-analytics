"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { compareSegmentsByPlatform, getAvailablePlatforms } from "../lib/analytics";
import {
  ComparisonDimension,
  ComparisonMetric,
  SegmentPlatformComparisonPoint,
  VendooListing,
} from "../lib/types";
import { ChartTooltip, formatCurrency } from "./ChartTooltip";
import { useChartReady } from "../lib/use-chart-ready";

const PLATFORM_COLORS: Record<string, string> = {
  eBay: "#6366f1",
  Poshmark: "#ec4899",
  Mercari: "#ef4444",
  Depop: "#22c55e",
  Etsy: "#f97316",
  "In-Person": "#8b5cf6",
  Unknown: "#64748b",
};

const COMPARISON_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#22c55e",
  "#f97316",
  "#ec4899",
  "#06b6d4",
  "#eab308",
  "#14b8a6",
];

const SOURCE_LABELS: Record<ComparisonDimension, string> = {
  labels: "Vendoo Labels",
  tags: "Vendoo Tags",
};

const SOURCE_PLACEHOLDERS: Record<ComparisonDimension, string> = {
  labels: "Search labels like A3 or raghouse",
  tags: "Search tags like y2k or minimalist",
};

const METRIC_LABELS: Record<ComparisonMetric, string> = {
  sales: "Sold items",
  revenue: "Revenue",
  profit: "Profit",
};

interface ShareSlice {
  name: string;
  value: number;
  fill: string;
}

interface ComparisonTooltipPayloadItem {
  color?: string;
  name?: string | number;
  value?: number | null;
}

interface ComparisonTooltipProps {
  active?: boolean;
  label?: string | number;
  metric: ComparisonMetric;
  payload?: readonly ComparisonTooltipPayloadItem[];
}

interface LabelTagComparisonPanelProps {
  listings: VendooListing[];
  compact?: boolean;
}

function truncateLabel(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function formatMetricValue(metric: ComparisonMetric, value: number): string {
  if (metric === "sales") {
    return value.toLocaleString("en-US");
  }

  return formatCurrency(value);
}

function formatMetricTick(metric: ComparisonMetric, rawValue: number): string {
  const value = Number(rawValue);

  if (metric === "sales") {
    return value.toLocaleString("en-US");
  }

  const prefix = value < 0 ? "-$" : "$";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1000) {
    const shortened = absoluteValue >= 10000
      ? (absoluteValue / 1000).toFixed(0)
      : (absoluteValue / 1000).toFixed(1);

    return `${prefix}${shortened}k`;
  }

  return `${prefix}${absoluteValue.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function toggleValue(values: string[], target: string): string[] {
  return values.includes(target)
    ? values.filter((value) => value !== target)
    : [...values, target];
}

function getMetricValue(
  row: SegmentPlatformComparisonPoint,
  metric: ComparisonMetric,
  platforms: string[],
): number {
  if (platforms.length === 0) {
    return Number(row[metric]);
  }

  return platforms.reduce(
    (sum, platform) => sum + Number(row.platforms[platform]?.[metric] ?? 0),
    0,
  );
}

function getPlatformColor(platform: string, index: number): string {
  return PLATFORM_COLORS[platform] || COMPARISON_COLORS[index % COMPARISON_COLORS.length];
}

function ComparisonTooltip({
  active,
  label,
  metric,
  payload,
}: ComparisonTooltipProps) {
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
          <div key={String(item.name)} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color ?? "#6366f1" }}
              />
              <span>{String(item.name ?? "Value")}</span>
            </div>
            <span className="font-semibold text-foreground">
              {formatMetricValue(metric, Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LabelTagComparisonPanel({
  listings,
  compact = false,
}: LabelTagComparisonPanelProps) {
  const ready = useChartReady();
  const [dimension, setDimension] = useState<ComparisonDimension>("tags");
  const [metric, setMetric] = useState<ComparisonMetric>("profit");
  const [query, setQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<ComparisonDimension, string[]>>({
    tags: [],
    labels: [],
  });

  const comparisonRows = useMemo(
    () => compareSegmentsByPlatform(listings, dimension),
    [dimension, listings],
  );
  const platformOptions = useMemo(() => getAvailablePlatforms(listings), [listings]);
  const activePlatforms = selectedPlatforms.length > 0 ? selectedPlatforms : platformOptions;
  const normalizedQuery = query.trim().toLowerCase();
  const currentSelections = selectedValues[dimension];

  const rankedRows = useMemo(
    () =>
      [...comparisonRows]
        .filter((row) => !normalizedQuery || row.name.toLowerCase().includes(normalizedQuery))
        .sort((left, right) => {
          const metricDifference = getMetricValue(right, metric, activePlatforms)
            - getMetricValue(left, metric, activePlatforms);

          if (metricDifference !== 0) {
            return metricDifference;
          }

          if (right.sales !== left.sales) {
            return right.sales - left.sales;
          }

          return left.name.localeCompare(right.name);
        }),
    [activePlatforms, comparisonRows, metric, normalizedQuery],
  );

  const displayRows = useMemo(() => {
    if (currentSelections.length > 0) {
      const rowMap = new Map(comparisonRows.map((row) => [row.name.toLowerCase(), row]));

      return currentSelections
        .map((value) => rowMap.get(value.toLowerCase()))
        .filter((row): row is SegmentPlatformComparisonPoint => Boolean(row));
    }

    return rankedRows.slice(0, compact ? 4 : 6);
  }, [compact, comparisonRows, currentSelections, rankedRows]);

  const chartRows = useMemo(
    () =>
      displayRows.map((row) => {
        const entry: Record<string, string | number> = {
          name: row.name,
          shortName: truncateLabel(row.name, compact ? 16 : 24),
          total: getMetricValue(row, metric, activePlatforms),
        };

        activePlatforms.forEach((platform) => {
          entry[platform] = Number(row.platforms[platform]?.[metric] ?? 0);
        });

        return entry;
      }),
    [activePlatforms, compact, displayRows, metric],
  );

  const shareSlices = useMemo<ShareSlice[]>(() => {
    return displayRows
      .map((row, index) => ({
        name: row.name,
        value: getMetricValue(row, metric, activePlatforms),
        fill: COMPARISON_COLORS[index % COMPARISON_COLORS.length],
      }))
      .filter((slice) => slice.value > 0);
  }, [activePlatforms, displayRows, metric]);

  const shareTotal = useMemo(
    () => shareSlices.reduce((sum, slice) => sum + slice.value, 0),
    [shareSlices],
  );

  const tableRows = useMemo(
    () =>
      currentSelections.length > 0
        ? displayRows
        : rankedRows.slice(0, normalizedQuery ? 18 : compact ? 6 : 10),
    [compact, currentSelections.length, displayRows, normalizedQuery, rankedRows],
  );

  const topPerformer = rankedRows[0];

  function togglePlatform(platform: string) {
    setSelectedPlatforms((current) => toggleValue(current, platform));
  }

  function toggleSegmentValue(value: string) {
    setSelectedValues((current) => ({
      ...current,
      [dimension]: toggleValue(current[dimension], value),
    }));
  }

  function clearSelections() {
    setSelectedValues((current) => ({
      ...current,
      [dimension]: [],
    }));
  }

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Label &amp; Tag Comparison</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare Vendoo labels and tags across platforms so you can see what is moving and what is making the most money.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["tags", "labels"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDimension(option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                dimension === option
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {SOURCE_LABELS[option]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["profit", "revenue", "sales"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMetric(option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                metric === option
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {METRIC_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"}`}>
        <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Platforms</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick one or more platforms to compare, or leave everything on all platforms.
              </p>
            </div>
            {selectedPlatforms.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPlatforms([])}
                className="text-xs font-medium text-accent hover:text-accent/80"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedPlatforms([])}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedPlatforms.length === 0
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-background/70 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              All platforms
            </button>
            {platformOptions.map((platform, index) => {
              const active = selectedPlatforms.includes(platform);
              const color = getPlatformColor(platform, index);

              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-transparent bg-white/10 text-foreground"
                      : "border-border bg-background/70 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  style={active ? { boxShadow: `inset 0 0 0 1px ${color}` } : undefined}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {platform}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Select {SOURCE_LABELS[dimension].toLowerCase()}</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Every matching value is searchable here, and selected values stay in a versus view.
              </p>
            </div>
            {currentSelections.length > 0 && (
              <button
                type="button"
                onClick={clearSelections}
                className="text-xs font-medium text-accent hover:text-accent/80"
              >
                Clear
              </button>
            )}
          </div>

          <label className="mt-3 block">
            <span className="sr-only">{SOURCE_LABELS[dimension]} search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={SOURCE_PLACEHOLDERS[dimension]}
              className="w-full rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/60"
            />
          </label>

          {currentSelections.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {currentSelections.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleSegmentValue(value)}
                  className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 max-h-72 overflow-y-auto pr-1">
            {rankedRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background/50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  No {dimension === "tags" ? "tags" : "labels"} matched that search.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Try another keyword or broaden the date range.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rankedRows.map((row) => {
                  const selected = currentSelections.includes(row.name);
                  const metricValue = getMetricValue(row, metric, activePlatforms);

                  return (
                    <button
                      key={row.name}
                      type="button"
                      onClick={() => toggleSegmentValue(row.name)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${
                        selected
                          ? "border-accent/40 bg-accent/10"
                          : "border-border/70 bg-background/60 hover:bg-muted/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.sales.toLocaleString("en-US")} sold
                        </p>
                      </div>
                      <span className={`shrink-0 tabular-nums text-sm font-semibold ${metric === "profit" && metricValue < 0 ? "text-danger" : "text-foreground"}`}>
                        {formatMetricValue(metric, metricValue)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
          {comparisonRows.length.toLocaleString("en-US")} available {dimension}
        </span>
        <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
          {activePlatforms.length.toLocaleString("en-US")} platform{activePlatforms.length === 1 ? "" : "s"} in view
        </span>
        <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
          {currentSelections.length > 0 ? `${currentSelections.length} selected` : `Showing top ${displayRows.length}`}
        </span>
        {topPerformer && (
          <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
            Top {METRIC_LABELS[metric].toLowerCase()}: {topPerformer.name}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        <p>Labels and tags overlap, so one sold item can contribute to multiple values.</p>
        <p>Select specific values to lock in a true versus view across your chosen platforms.</p>
      </div>

      {comparisonRows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No sold label or tag data matched the selected range.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a broader date range to repopulate the comparison workbench.</p>
        </div>
      ) : (
        <>
          <div className={`mt-5 grid gap-4 ${compact ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.95fr)]"}`}>
            <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-foreground">
                  {currentSelections.length > 0 ? "Versus view" : `Top ${SOURCE_LABELS[dimension]} by ${METRIC_LABELS[metric]}`}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Grouped bars show how each selected label or tag performs on the platforms in view.
                </p>
              </div>

              {activePlatforms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background/50 px-4 py-10 text-center text-sm text-muted-foreground">
                  No platform sales matched this range yet.
                </div>
              ) : (
                <>
                  <div className={compact ? "h-72" : "h-[22rem]"}>
                    {ready ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartRows}
                          margin={compact ? { top: 8, right: 8, left: -10, bottom: 20 } : { top: 8, right: 16, left: 0, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis
                            dataKey="shortName"
                            tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
                            axisLine={{ stroke: "#27272a" }}
                            tickLine={false}
                            interval={0}
                            angle={compact ? -20 : 0}
                            textAnchor={compact ? "end" : "middle"}
                            height={compact ? 56 : 40}
                          />
                          <YAxis
                            tick={{ fill: "#a1a1aa", fontSize: compact ? 10 : 12 }}
                            axisLine={{ stroke: "#27272a" }}
                            tickLine={false}
                            width={compact ? 44 : 56}
                            tickFormatter={(value) => formatMetricTick(metric, Number(value))}
                          />
                          <Tooltip cursor={{ fill: "rgba(99, 102, 241, 0.08)" }} content={<ComparisonTooltip metric={metric} />} />
                          {activePlatforms.map((platform, index) => (
                            <Bar
                              key={platform}
                              dataKey={platform}
                              fill={getPlatformColor(platform, index)}
                              radius={[4, 4, 0, 0]}
                              name={platform}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full rounded-2xl bg-muted/20" />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {activePlatforms.map((platform, index) => (
                      <span
                        key={platform}
                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getPlatformColor(platform, index) }} />
                        {platform}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-foreground">Share view</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Positive {METRIC_LABELS[metric].toLowerCase()} share across the values on screen.
                </p>
              </div>

              {shareSlices.length > 0 ? (
                <>
                  <div className={compact ? "h-52" : "h-64"}>
                    {ready ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={shareSlices}
                            cx="50%"
                            cy="50%"
                            innerRadius={compact ? 42 : 58}
                            outerRadius={compact ? 76 : 90}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            strokeWidth={0}
                          >
                            {shareSlices.map((slice) => (
                              <Cell key={`${slice.name}-${slice.fill}`} fill={slice.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            cursor={{ fill: "transparent" }}
                            content={(props) => (
                              <ChartTooltip
                                {...props}
                                getTitle={({ payload }) => String(payload[0]?.payload?.name ?? "")}
                                getValueLabel={() => METRIC_LABELS[metric]}
                                valueFormatter={(value) => formatMetricValue(metric, Number(value))}
                              />
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full rounded-2xl bg-muted/20" />
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    {shareSlices.map((slice) => (
                      <div
                        key={slice.name}
                        className="flex items-center justify-between gap-3 rounded-xl bg-background/60 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.fill }} />
                          <span className="truncate text-sm text-foreground">{slice.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="tabular-nums text-sm font-medium text-foreground">
                            {formatMetricValue(metric, slice.value)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {shareTotal > 0 ? `${((slice.value / shareTotal) * 100).toFixed(1)}%` : "0.0%"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-background/50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">No positive values are available for the share chart yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border/70 bg-muted/10 p-4">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground">Comparison table</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Compare overall sales, revenue, and profit alongside each platform&apos;s {METRIC_LABELS[metric].toLowerCase()}.
              </p>
            </div>

            {compact ? (
              <div className="space-y-3">
                {tableRows.map((row, index) => (
                  <div
                    key={`${row.name}-${index}`}
                    className="rounded-2xl border border-border/70 bg-background/60 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{row.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{row.sales.toLocaleString("en-US")} sold</p>
                      </div>
                      <span className="rounded-full border border-border/70 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-xl bg-muted/30 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Revenue</p>
                        <p className="mt-1 tabular-nums font-medium text-foreground">{formatMetricValue("revenue", row.revenue)}</p>
                      </div>
                      <div className="rounded-xl bg-muted/30 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Profit</p>
                        <p className={`mt-1 tabular-nums font-medium ${row.profit < 0 ? "text-danger" : "text-foreground"}`}>
                          {formatMetricValue("profit", row.profit)}
                        </p>
                      </div>
                    </div>

                    {activePlatforms.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {activePlatforms.map((platform, platformIndex) => {
                          const platformValue = Number(row.platforms[platform]?.[metric] ?? 0);

                          return (
                            <div key={platform} className="flex items-center justify-between gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: getPlatformColor(platform, platformIndex) }}
                                />
                                <span>{platform}</span>
                              </div>
                              <span className={`tabular-nums font-medium ${metric === "profit" && platformValue < 0 ? "text-danger" : "text-foreground"}`}>
                                {formatMetricValue(metric, platformValue)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-left">
                      <th className="py-3 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {dimension === "tags" ? "Tag" : "Label"}
                      </th>
                      <th className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Sold</th>
                      <th className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue</th>
                      <th className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Profit</th>
                      {activePlatforms.map((platform) => (
                        <th
                          key={platform}
                          className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          {platform} {METRIC_LABELS[metric].toLowerCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.name} className="border-b border-border/50 last:border-b-0">
                        <td className="py-3 pr-4 font-medium text-foreground">{row.name}</td>
                        <td className="px-2 py-3 text-right tabular-nums text-muted-foreground">{row.sales.toLocaleString("en-US")}</td>
                        <td className="px-2 py-3 text-right tabular-nums text-foreground">{formatMetricValue("revenue", row.revenue)}</td>
                        <td className={`px-2 py-3 text-right tabular-nums font-medium ${row.profit < 0 ? "text-danger" : "text-foreground"}`}>
                          {formatMetricValue("profit", row.profit)}
                        </td>
                        {activePlatforms.map((platform) => {
                          const platformValue = Number(row.platforms[platform]?.[metric] ?? 0);

                          return (
                            <td
                              key={`${row.name}-${platform}`}
                              className={`px-2 py-3 text-right tabular-nums ${metric === "profit" && platformValue < 0 ? "text-danger" : "text-muted-foreground"}`}
                            >
                              {formatMetricValue(metric, platformValue)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
