"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useMemo } from "react";
import type { VendooListing } from "../lib/types";
import { parseListingDate } from "../lib/analytics";

interface InventoryAgingProps {
  listings: VendooListing[];
  compact?: boolean;
}

type AgingBucket = { label: string; min: number; max: number; color: string };

const BUCKETS: AgingBucket[] = [
  { label: "Fresh", min: 0, max: 30, color: "#22c55e" },
  { label: "Warming", min: 30, max: 60, color: "#f59e0b" },
  { label: "Stale", min: 60, max: 90, color: "#f97316" },
  { label: "Dead", min: 90, max: Infinity, color: "#ef4444" },
];

function daysSinceListed(listing: VendooListing): number | null {
  const listed = parseListingDate(listing.listedDate);
  if (!listed) return null;
  const diff = (Date.now() - listed.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 ? Math.round(diff) : null;
}

export function inventoryAging(listings: VendooListing[]) {
  const buckets = BUCKETS.map((b) => ({ ...b, count: 0, value: 0 }));

  for (const l of listings) {
    const days = daysSinceListed(l);
    if (days === null) continue;
    const b = buckets.find((b) => days >= b.min && days < b.max);
    if (b) {
      b.count += 1;
      b.value += l.costOfGoods; // tie up capital
    }
  }

  return buckets;
}

export function staleItems(listings: VendooListing[], staleDays = 90): VendooListing[] {
  return listings.filter((l) => {
    const days = daysSinceListed(l);
    return days !== null && days >= staleDays;
  });
}

export default function InventoryAgingCard({ listings, compact }: InventoryAgingProps) {
  const data = useMemo(() => inventoryAging(listings), [listings]);
  const total = data.reduce((sum, b) => sum + b.count, 0);
  const staleCount = data.find((b) => b.label === "Dead")?.count ?? 0;
  const staleValue = data.find((b) => b.label === "Dead")?.value ?? 0;

  if (compact) {
    return (
      <div className="surface-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-secondary" />
            <span className="text-sm font-semibold text-foreground">Inventory Aging</span>
          </div>
          {staleCount > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-medium text-danger">
              <AlertTriangle size={10} />
              {staleCount} stale
            </div>
          )}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1">
          {data.map((b) => (
            <div key={b.label} className="text-center">
              <div
                className="mx-auto h-1.5 w-full rounded-full"
                style={{ background: b.color }}
              />
              <p className="mt-1 text-xs font-bold text-foreground">{b.count}</p>
              <p className="text-[9px] uppercase tracking-wider text-tertiary">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-secondary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Inventory Aging</h3>
            <p className="text-xs text-tertiary">{total} active items · ${staleValue.toFixed(2)} tied up in stale stock</p>
          </div>
        </div>
        {staleCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger">
            <AlertTriangle size={12} />
            {staleCount} items older than 90d
          </div>
        )}
      </div>

      <div className="mt-4 flex h-3 overflow-hidden rounded-full" style={{ background: '#111118' }}>
        {data.map((b) =>
          b.count > 0 ? (
            <div
              key={b.label}
              className="h-full transition-all duration-500"
              style={{
                width: `${total > 0 ? (b.count / total) * 100 : 0}%`,
                background: b.color,
              }}
            />
          ) : null,
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {data.map((b) => (
          <div key={b.label} className="text-center">
            <p className="text-lg font-bold text-foreground">{b.count}</p>
            <p className="text-[10px] uppercase tracking-wider text-tertiary">{b.label}</p>
            <p className="text-xs text-secondary">${b.value.toFixed(0)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
