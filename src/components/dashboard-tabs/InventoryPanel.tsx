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

  return (
    <>
      <TabDateFilterBar
        dateFieldLabel="Listed date"
        filter={filter}
        onChange={onFilterChange}
        resultSummary={`${filteredListings.length.toLocaleString("en-US")} listings`}
        compact={compact}
      />
      <InventoryCostSummary data={costSummary} compact={compact} />
      <CategoryBreakdownTable data={catBreakdown} compact={compact} />
      <InteractiveInventoryTable listings={filteredListings} compact={compact} />
      <ListingsChart data={listingsByMonth(filteredListings, grouping)} compact={compact} />
      <StatusChart data={statusDistribution(filteredListings)} compact={compact} />
    </>
  );
}
