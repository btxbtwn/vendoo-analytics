"use client";

import { useState } from "react";
import { DateFilterPreset, TabDateFilter } from "../../lib/types";
import { Input } from "./Input";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  filter: TabDateFilter;
  onFilterChange: (filter: TabDateFilter) => void;
}

const PRESETS = [
  { id: "all", label: "All" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "ytd", label: "YTD" },
  { id: "custom", label: "Custom" },
];

function getPresetDates(preset: string): { from: string; to: string } {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  switch (preset) {
    case "7d":
      return { from: new Date(today.getTime() - 7 * 864e5).toISOString().slice(0, 10), to };
    case "30d":
      return { from: new Date(today.getTime() - 30 * 864e5).toISOString().slice(0, 10), to };
    case "90d":
      return { from: new Date(today.getTime() - 90 * 864e5).toISOString().slice(0, 10), to };
    case "ytd": {
      const ytd = new Date(today.getFullYear(), 0, 1);
      return { from: ytd.toISOString().slice(0, 10), to };
    }
    default:
      return { from: new Date(today.getTime() - 7 * 864e5).toISOString().slice(0, 10), to };
  }
}

export default function DateRangePicker({ filter, onFilterChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<string>(filter.preset || "7d");
  const [showCustom, setShowCustom] = useState(filter.preset === "custom");

  function selectPreset(presetId: string) {
    setActivePreset(presetId);
    if (presetId === "custom") {
      setShowCustom(true);
      onFilterChange({ preset: "custom", from: filter.from, to: filter.to });
    } else if (presetId === "all") {
      setShowCustom(false);
      onFilterChange({ preset: "all", from: "", to: "" });
    } else {
      setShowCustom(false);
      const { from, to } = getPresetDates(presetId);
      onFilterChange({ preset: presetId as DateFilterPreset, from, to });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Preset pills */}
      <div
        className="flex items-center gap-0.5 rounded-none border border-[var(--color-border)] p-0.5"
        style={{ background: "var(--color-bg-elevated)" }}
      >
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPreset(p.id)}
            className={`
              px-3 py-1.5 md:px-2.5 md:py-1 rounded-none text-xs md:text-xs font-medium transition-all duration-[var(--duration-fast)] min-h-[36px] md:min-h-0
              ${activePreset === p.id
                ? "text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"}
            `}
            style={activePreset === p.id ? { background: "var(--color-accent)" } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="inline-flex items-center gap-2">
          <div className="relative w-fit">
            <Input
              type="date"
              value={filter.from}
              onChange={(e) => onFilterChange({ ...filter, preset: "custom", from: e.target.value })}
              className="!w-32 pr-8"
            />
            <Calendar size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
          </div>
          <span className="text-[var(--color-text-tertiary)] text-xs">–</span>
          <div className="relative w-fit">
            <Input
              type="date"
              value={filter.to}
              onChange={(e) => onFilterChange({ ...filter, preset: "custom", to: e.target.value })}
              className="!w-32 pr-8"
            />
            <Calendar size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
          </div>
        </div>
      )}


    </div>
  );
}