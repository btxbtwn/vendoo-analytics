"use client";

import { useMemo } from "react";

import { filterListingsByDate, salesByPlatform } from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import LabelTagComparisonPanel from "../LabelTagComparisonPanel";
import PlatformChart from "../PlatformChart";
import TabDateFilterBar from "../TabDateFilterBar";

interface PlatformsPanelProps {
  listings: VendooListing[];
  compact: boolean;
  filter: TabDateFilter;
  onFilterChange: (nextFilter: TabDateFilter) => void;
}

export default function PlatformsPanel({
  listings,
  compact,
  filter,
  onFilterChange,
}: PlatformsPanelProps) {
  const soldListings = useMemo(
    () => filterListingsByDate(listings.filter((listing) => listing.status === "Sold"), "soldDate", filter),
    [filter, listings],
  );

  return (
    <>
      <TabDateFilterBar
        dateFieldLabel="Sold date"
        filter={filter}
        onChange={onFilterChange}
        resultSummary={`${soldListings.length.toLocaleString("en-US")} sold items`}
        compact={compact}
      />
      <PlatformChart data={salesByPlatform(soldListings)} compact={compact} />
      <LabelTagComparisonPanel listings={soldListings} compact={compact} />
    </>
  );
}
