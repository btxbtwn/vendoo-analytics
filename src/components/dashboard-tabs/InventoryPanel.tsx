"use client";

import { calculateKPIs, listingsByMonth, recentSales, statusDistribution } from "../../lib/analytics";
import { VendooListing } from "../../lib/types";
import ListingsChart from "../ListingsChart";
import RecentSalesTable from "../RecentSalesTable";
import StatusChart from "../StatusChart";

interface InventoryPanelProps {
  listings: VendooListing[];
  compact: boolean;
}

export default function InventoryPanel({ listings, compact }: InventoryPanelProps) {
  const kpis = calculateKPIs(listings);

  return (
    <>
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
      <ListingsChart data={listingsByMonth(listings)} compact={compact} />
      <StatusChart data={statusDistribution(listings)} compact={compact} />
      <RecentSalesTable
        sales={recentSales(listings, compact ? 14 : 50)}
        compact={compact}
      />
    </>
  );
}