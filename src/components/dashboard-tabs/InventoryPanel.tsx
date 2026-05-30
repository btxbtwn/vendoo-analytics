"use client";

import { useMemo } from "react";

import {
  filterListingsByDate,
  getTimeGrouping,
  inventoryCostSummary,
  categoryBreakdown,
  listingsByMonth,
  statusDistribution,
  conditionDistribution,
  colorDistribution,
} from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import ColorChart from "../ColorChart";
import ConditionChart from "../ConditionChart";
import InventoryCostSummary from "../InventoryCostSummary";
import CategoryBreakdownTable from "../CategoryBreakdownTable";
import InteractiveInventoryTable from "../InteractiveInventoryTable";
import ListingsChart from "../ListingsChart";
import StatusChart from "../StatusChart";
import TabDateFilterBar from "../TabDateFilterBar";

const STALE_BUCKETS = [
  { label: "< 30 days", maxDays: 30 },
  { label: "30–60 days", maxDays: 60 },
  { label: "60–90 days", maxDays: 90 },
  { label: "90–160 days", maxDays: 160 },
  { label: "160+ days", maxDays: Infinity },
];

function computeStaleBreakdown(listings: VendooListing[]) {
  const now = Date.now();
  const msPerDay = 86400000;
  const active = listings.filter((l) => l.status === "Active" && l.listedDate);

  return STALE_BUCKETS.map((bucket) => {
    const count = active.filter((l) => {
      const age = (now - new Date(l.listedDate).getTime()) / msPerDay;
      const prevMax = STALE_BUCKETS[STALE_BUCKETS.indexOf(bucket) - 1]?.maxDays ?? 0;
      return age >= prevMax && age < bucket.maxDays;
    }).length;
    return { label: bucket.label, count, total: active.length };
  });
}

interface InventoryPanelProps {
  listings: VendooListing[];
  compact: boolean;
  filter: TabDateFilter;
  onFilterChange: (nextFilter: TabDateFilter) => void;
}

export default function InventoryPanel({
  listings,
  compact,
  filter,
  onFilterChange,
}: InventoryPanelProps) {
  const filteredListings = useMemo(
    () => filterListingsByDate(listings, "listedDate", filter),
    [filter, listings],
  );
  const grouping = getTimeGrouping(filter);

  const costSummary = useMemo(() => inventoryCostSummary(filteredListings), [filteredListings]);
  const catBreakdown = useMemo(() => categoryBreakdown(filteredListings), [filteredListings]);
  const statusDist = useMemo(() => statusDistribution(filteredListings), [filteredListings]);
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of statusDist) {
      map[item.name] = item.value;
    }
    return map;
  }, [statusDist]);

  const staleData = useMemo(() => computeStaleBreakdown(listings), [listings]);

  const conditionData = useMemo(() => conditionDistribution(listings), [listings]);
  const colorData = useMemo(() => colorDistribution(listings), [listings]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <TabDateFilterBar
        dateFieldLabel="Listed date"
        resultSummary={`${filteredListings.length.toLocaleString("en-US")} listings`}
        compact={compact}
        filter={filter}
        onFilterChange={onFilterChange}
      />
      {/* Cost Summary */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Cost Summary
        </h2>
        <InventoryCostSummary data={costSummary} compact={compact} />
      </div>
      {/* Status Counts */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Status Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active", value: statusCounts["Active"] ?? 0, color: "text-primary" },
            { label: "Draft", value: statusCounts["Draft"] ?? 0, color: "text-primary" },
            { label: "Sold", value: statusCounts["Sold"] ?? 0, color: "text-primary" },
            { label: "Archived", value: statusCounts["Archived"] ?? 0, color: "text-muted-foreground" },
          ].map((card) => (
            <div
              key={card.label}
              className="border border-[var(--color-border)] rounded-none bg-[var(--color-bg-surface)] p-4 md:p-5"
            >
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] md:text-xs">
                {card.label}
              </p>
              <p className={`text-lg font-bold md:text-2xl ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Stale Inventory Tracker */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Stale Inventory Tracker
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {staleData.map((bucket) => {
            const pct = bucket.total > 0 ? Math.round((bucket.count / bucket.total) * 100) : 0;
            const isStale = bucket.label === "160+ days" || bucket.label === "90–160 days";
            return (
              <div
                key={bucket.label}
                className="border border-[var(--color-border)] rounded-none bg-[var(--color-bg-surface)] p-4 md:p-5"
              >
                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] md:text-xs">
                  {bucket.label}
                </p>
                <p className={`text-lg font-bold md:text-2xl text-primary`}>
                  {bucket.count}
                </p>
                <div className="mt-2 h-1 w-full bg-[var(--color-bg-hover)]">
                  <div
                    className={`h-full bg-[var(--color-accent)]`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">{pct}% of active</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Listings & Status Charts */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Listings &amp; Status
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ListingsChart data={listingsByMonth(filteredListings, grouping)} compact={compact} />
          <StatusChart data={statusDistribution(filteredListings)} compact={compact} />
        </div>
      </div>
      {/* Condition & Color Breakdown */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Condition &amp; Color
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ConditionChart data={conditionData} compact={compact} />
          <ColorChart data={colorData} compact={compact} />
        </div>
      </div>
      {/* Category Breakdown + Inventory Table */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] mb-3">
          Category &amp; Inventory
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryBreakdownTable data={catBreakdown} compact={compact} />
          <InteractiveInventoryTable listings={filteredListings} compact={compact} />
        </div>
      </div>
    </div>
  );
}
