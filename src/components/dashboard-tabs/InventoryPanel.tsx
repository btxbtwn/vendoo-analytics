"use client";

import { useMemo } from "react";

import {
  filterListingsByDate,
  getTimeGrouping,
  inventoryCostSummary,
  categoryBreakdown,
  listingsByMonth,
  statusDistribution,
} from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import InventoryCostSummary from "../InventoryCostSummary";
import CategoryBreakdownTable from "../CategoryBreakdownTable";
import InteractiveInventoryTable from "../InteractiveInventoryTable";
import ListingsChart from "../ListingsChart";
import StatusChart from "../StatusChart";
import TabDateFilterBar from "../TabDateFilterBar";

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

  return (
    <div className="flex flex-col gap-6 p-6">
      <TabDateFilterBar
        dateFieldLabel="Listed date"
        resultSummary={`${filteredListings.length.toLocaleString("en-US")} listings`}
        compact={compact}
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
            { label: "Draft", value: statusCounts["Draft"] ?? 0, color: "text-warning" },
            { label: "Sold", value: statusCounts["Sold"] ?? 0, color: "text-primary" },
            { label: "Archived", value: statusCounts["Archived"] ?? 0, color: "text-muted-foreground" },
          ].map((card) => (
            <div
              key={card.label}
              className="border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-4 md:p-5"
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
    </div>
  );
}
