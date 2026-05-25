"use client";

import { useState } from "react";
import { useAppFilter } from "../../lib/AppContext";
import { DateFilterPreset } from "../../lib/types";
import { Input } from "./Input";
import { Calendar } from "lucide-react";

const PRESETS = [
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

export default function DateRangePicker() {
  const { filter, setFilter } = useAppFilter();
  const [activePreset, setActivePreset] = useState<string>(filter.preset || "7d");
  const [showCustom, setShowCustom] = useState(filter.preset === "custom");

  function selectPreset(presetId: string) {
    setActivePreset(presetId);
    if (presetId === "custom") {
      setShowCustom(true);
      setFilter({ preset: "custom", from: filter.from, to: filter.to });
    } else {
      setShowCustom(false);
      const { from, to } = getPresetDates(presetId);
      setFilter({ preset: presetId as DateFilterPreset, from, to });
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Preset pills */}
      <div
        className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] p-1"
        style={{ background: "var(--color-bg-elevated)" }}
      >
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPreset(p.id)}
            className={`
              px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium transition-all duration-[var(--duration-fast)]
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
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filter.from}
            onChange={(e) => setFilter({ ...filter, preset: "custom", from: e.target.value })}
            className="w-32"
          />
          <span className="text-[var(--color-text-tertiary)] text-xs">–</span>
          <Input
            type="date"
            value={filter.to}
            onChange={(e) => setFilter({ ...filter, preset: "custom", to: e.target.value })}
            className="w-32"
          />
        </div>
      )}

      {/* Calendar icon indicator */}
      <Calendar size={14} className="text-[var(--color-text-tertiary)]" />
    </div>
  );
}