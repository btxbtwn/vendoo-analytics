"use client";

import { useMemo } from "react";

import { filterListingsByDate } from "../../lib/analytics";
import { TabDateFilter, VendooListing } from "../../lib/types";
import LabelTagComparisonPanel from "../LabelTagComparisonPanel";
import TabDateFilterBar from "../TabDateFilterBar";

interface LabelsPanelProps {
  listings: VendooListing[];
  compact: boolean;
  filter: TabDateFilter;
  onFilterChange: (nextFilter: TabDateFilter) => void;
}

export default function LabelsPanel({
  listings,
  compact,
  filter,
  onFilterChange,
}: LabelsPanelProps) {
  const soldListings = useMemo(
    () => filterListingsByDate(listings.filter((l) => l.status === "Sold"), "soldDate", filter),
    [filter, listings],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <TabDateFilterBar
        dateFieldLabel="Sold date"
        resultSummary={`${soldListings.length.toLocaleString("en-US")} sold items`}
        compact={compact}
        filter={filter}
        onFilterChange={onFilterChange}
      />
      <LabelTagComparisonPanel listings={soldListings} compact={compact} />
    </div>
  );
}
