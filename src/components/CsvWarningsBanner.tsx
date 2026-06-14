"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";

interface WarningSummary {
  field: string;
  count: number;
}

interface WarningsData {
  count: number;
  totalRows: number;
  warnings: { row: number; field: string; rawValue: string; reason: string }[];
  summary: WarningSummary[];
}

export default function CsvWarningsBanner() {
  const [data, setData] = useState<WarningsData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/parse-warnings")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
      })
      .catch(() => {});
  }, []);

  if (!data || dismissed) return null;

  const hasWarnings = data.count > 0;
  const cleanRows = data.totalRows - data.count;
  const preview = data.warnings.slice(0, expanded ? data.warnings.length : 3);

  return (
    <div
      className="rounded-none p-4 mb-4 text-sm"
      style={{
        border: hasWarnings
          ? "1px solid var(--color-warning)"
          : "1px solid var(--color-success)",
        background: hasWarnings
          ? "var(--color-warning-muted)"
          : "var(--color-success-muted)",
        color: "var(--color-text-primary)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {hasWarnings ? (
            <AlertTriangle size={16} style={{ color: "var(--color-warning)" }} />
          ) : (
            <CheckCircle size={16} style={{ color: "var(--color-success)" }} />
          )}
          <span className="font-medium">
            {hasWarnings
              ? `${data.count} parse warning${data.count !== 1 ? "s" : ""}`
              : "Import successful"}
          </span>
          <span style={{ color: "var(--color-text-secondary)" }}>
            · {data.totalRows.toLocaleString()} row{data.totalRows !== 1 ? "s" : ""} loaded
            {hasWarnings ? `, ${cleanRows.toLocaleString()} clean` : ""}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-0.5 hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      {/* Summary — only when there are warnings */}
      {hasWarnings && (
        <>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {data.summary.map((s) => (
              <span key={s.field} style={{ color: "var(--color-text-secondary)" }}>
                {s.field}: {s.count}
              </span>
            ))}
          </div>

          {/* Detail rows */}
          {preview.length > 0 && (
            <div className="mt-2 space-y-1 font-mono text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
              {preview.map((w, i) => (
                <div key={i}>
                  Row {w.row}:{" "}
                  <span style={{ color: "var(--color-warning)" }}>{w.field}</span>{" "}
                  = &ldquo;{w.rawValue}&rdquo; → {w.reason}
                </div>
              ))}
              {data.warnings.length > 3 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors mt-1 cursor-pointer"
                >
                  {expanded ? (
                    <><ChevronUp size={12} /> Show less</>
                  ) : (
                    <><ChevronDown size={12} /> Show all {data.warnings.length} warnings</>
                  )}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
