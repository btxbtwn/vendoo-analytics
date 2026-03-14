"use client";

import { DateFilterPreset, TabDateFilter } from "../lib/types";

const PRESET_OPTIONS: Array<{ id: DateFilterPreset; label: string }> = [
  { id: "all", label: "All time" },
  { id: "7d", label: "7D" },
  { id: "14d", label: "14D" },
  { id: "30d", label: "30D" },
  { id: "60d", label: "60D" },
  { id: "90d", label: "90D" },
  { id: "custom", label: "Custom" },
];

const PRESET_LABELS: Record<DateFilterPreset, string> = {
  all: "All time",
  "7d": "Last 7 days",
  "14d": "Last 14 days",
  "30d": "Last 30 days",
  "60d": "Last 60 days",
  "90d": "Last 90 days",
  custom: "Custom range",
};

interface TabDateFilterBarProps {
  dateFieldLabel: string;
  filter: TabDateFilter;
  onChange: (nextFilter: TabDateFilter) => void;
  resultSummary: string;
  compact?: boolean;
}

export default function TabDateFilterBar({
  dateFieldLabel,
  filter,
  onChange,
  resultSummary,
  compact = false,
}: TabDateFilterBarProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className={`flex gap-3 ${compact ? "flex-col" : "flex-col xl:flex-row xl:items-start xl:justify-between"}`}>
        <div>
          <p className="section-kicker mb-2">Date filter</p>
          <h3 className="text-lg font-semibold text-foreground">{dateFieldLabel} range</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Narrow this tab with the most relevant date field for the view.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
            {resultSummary}
          </span>
          <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1.5">
            {PRESET_LABELS[filter.preset]}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESET_OPTIONS.map((option) => {
          const active = filter.preset === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange({ ...filter, preset: option.id })}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filter.preset === "custom" && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">From</span>
            <input
              type="date"
              value={filter.from}
              onChange={(event) => onChange({ ...filter, preset: "custom", from: event.target.value })}
              className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-foreground outline-none transition-colors focus:border-accent/60"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">To</span>
            <input
              type="date"
              value={filter.to}
              onChange={(event) => onChange({ ...filter, preset: "custom", to: event.target.value })}
              className="w-full rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-foreground outline-none transition-colors focus:border-accent/60"
            />
          </label>
        </div>
      )}
    </section>
  );
}
