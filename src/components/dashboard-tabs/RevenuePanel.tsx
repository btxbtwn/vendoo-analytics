"use client";

import { calculateKPIs, profitBreakdown, revenueByMonth, salesByCategory } from "../../lib/analytics";
import { VendooListing } from "../../lib/types";
import RevenueChart from "../RevenueChart";
import ProfitBreakdownChart from "../ProfitBreakdownChart";
import CategoryChart from "../CategoryChart";

interface RevenuePanelProps {
  listings: VendooListing[];
  compact: boolean;
}

export default function RevenuePanel({ listings, compact }: RevenuePanelProps) {
  const kpis = calculateKPIs(listings);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Total Revenue", value: kpis.totalRevenue, color: "text-accent" },
          { label: "Net Profit", value: kpis.totalProfit, color: "text-success" },
          { label: "Total COGS", value: kpis.totalCOGS, color: "text-danger" },
          { label: "Fees", value: kpis.totalFees, color: "text-warning" },
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
      <RevenueChart data={revenueByMonth(listings)} compact={compact} />
      <ProfitBreakdownChart data={profitBreakdown(listings)} compact={compact} />
      <CategoryChart data={salesByCategory(listings)} compact={compact} />
    </>
  );
}