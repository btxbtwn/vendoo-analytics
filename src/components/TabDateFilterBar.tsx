"use client";

import type { TabDateFilter } from "../lib/types";
import DateRangePicker from "./ui/DateRangePicker";

interface TabDateFilterBarProps {
  dateFieldLabel: string;
  resultSummary: string;
  compact?: boolean;
  filter: TabDateFilter;
  onFilterChange: (filter: TabDateFilter) => void;
}

const PRESET_LABELS: Record<string, string> = {
  all: "All time",
  "7d": "Last 7 days",
  "14d": "Last 14 days",
  "30d": "Last 30 days",
  "60d": "Last 60 days",
  "90d": "Last 90 days",
  ytd: "Year to date",
  custom: "Custom range",
};

export default function TabDateFilterBar({
  dateFieldLabel,
  resultSummary,
  compact = false,
  filter,
  onFilterChange,
}: TabDateFilterBarProps) {
  return (
    <section className="border border-border bg-card p-4 md:p-5">
      <div className={`flex gap-3 ${compact ? "flex-col" : "flex-col xl:flex-row xl:items-start xl:justify-between"}`}>
        <div>
          <p className="section-kicker mb-2">Date filter</p>
          <h3 className="text-lg font-semibold text-foreground">{dateFieldLabel} range</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Narrow this tab with the most relevant date field for the view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-none border border-border/70 bg-muted/20 px-3 py-1.5">
            {resultSummary}
          </span>
          <span className="rounded-none border border-border/70 bg-muted/20 px-3 py-1.5">
            {PRESET_LABELS[filter.preset] ?? filter.preset}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <DateRangePicker filter={filter} onFilterChange={onFilterChange} />
      </div>
    </section>
  );
}
