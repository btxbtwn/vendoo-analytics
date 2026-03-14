"use client";

import { useMemo } from "react";

import {
  calculateKPIs,
  filterListingsByDate,
  getTimeGrouping,
  listingsByMonth,
  recentListings,
  statusDistribution,
} from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import ListingsChart from "../ListingsChart";
import RecentListingsTable from "../RecentListingsTable";
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
  const kpis = useMemo(() => calculateKPIs(filteredListings), [filteredListings]);
  const grouping = getTimeGrouping(filter);

  return (
    <>
      <TabDateFilterBar
        dateFieldLabel="Listed date"
        filter={filter}
        onChange={onFilterChange}
        resultSummary={`${filteredListings.length.toLocaleString("en-US")} listings`}
        compact={compact}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total Listings", value: kpis.totalListings, color: "text-foreground" },
          { label: "Active", value: kpis.activeListing, color: "text-accent" },
          { label: "Sold", value: kpis.soldItems, color: "text-success" },
          { label: "Sell-Through", value: kpis.sellThroughRate, color: "text-teal-400" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-4 md:p-5"
          >
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground md:text-xs">
              {card.label}
            </p>
            <p className={`text-lg font-bold md:text-2xl ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <ListingsChart data={listingsByMonth(filteredListings, grouping)} compact={compact} />
      <StatusChart data={statusDistribution(filteredListings)} compact={compact} />
      <RecentListingsTable
        listings={recentListings(filteredListings, compact ? 14 : 50)}
        compact={compact}
      />
    </>
  );
}
