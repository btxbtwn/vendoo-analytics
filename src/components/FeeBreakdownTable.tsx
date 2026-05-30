"use client";

import { PLATFORM_COLORS } from "../lib/platform-colors";
import { formatCurrency } from "./ChartTooltip";

interface FeeBreakdownProps {
  data: { name: string; avgFee: number; totalFees: number; sales: number; avgFeePct: number }[];
  compact?: boolean;
}

export default function FeeBreakdownTable({ data, compact = false }: FeeBreakdownProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-transparent border border-[var(--color-border)] rounded-none p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[360px]">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-2 px-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]">
                Platform
              </th>
              <th className="text-right py-2 px-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]">
                Sales
              </th>
              <th className="text-right py-2 px-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]">
                Total Fees
              </th>
              <th className="text-right py-2 px-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]">
                Avg Fee
              </th>
              <th className="text-right py-2 px-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]">
                Fee %
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const color = PLATFORM_COLORS[row.name] || "#95A5A6";
              return (
                <tr
                  key={row.name}
                  className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-none shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-[var(--color-text-primary)]">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right text-[var(--color-text-secondary)]">
                    {row.sales}
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium text-[var(--color-text-primary)]">
                    {formatCurrency(row.totalFees)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-[var(--color-text-secondary)]">
                    {formatCurrency(row.avgFee)}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span
                      className="inline-block px-2 py-0.5 text-xs font-medium rounded-none"
                      style={{
                        color,
                        backgroundColor: `${color}15`,
                      }}
                    >
                      {row.avgFeePct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
