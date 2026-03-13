"use client";

import { topBrands } from "../../lib/analytics";
import { VendooListing } from "../../lib/types";
import BrandChart from "../BrandChart";

interface BrandsPanelProps {
  listings: VendooListing[];
  compact: boolean;
}

export default function BrandsPanel({ listings, compact }: BrandsPanelProps) {
  const topBrandData = topBrands(listings, compact ? 8 : 20);
  const allBrandRows = topBrands(listings, compact ? 18 : 50);

  function renderBrandRows() {
    if (compact) {
      return (
        <div className="space-y-3">
          {allBrandRows.map((brand) => (
            <div
              key={brand.name}
              className="rounded-2xl border border-border/70 bg-muted/20 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-medium text-foreground">
                    {brand.name}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(brand.sales as number)} sales
                  </p>
                </div>
                <p className="text-sm font-semibold text-success">
                  ${(brand.profit as number).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium text-foreground">
                  ${(brand.revenue as number).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Brand
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sales
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Revenue
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Profit
              </th>
            </tr>
          </thead>
          <tbody>
            {allBrandRows.map((brand) => (
              <tr
                key={brand.name}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-2 font-medium text-foreground">
                  {brand.name}
                </td>
                <td className="py-3 px-2 text-right text-muted-foreground">
                  {brand.sales as number}
                </td>
                <td className="py-3 px-2 text-right text-foreground font-medium">
                  ${(brand.revenue as number).toFixed(2)}
                </td>
                <td
                  className={`py-3 px-2 text-right font-semibold ${
                    (brand.profit as number) >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  ${(brand.profit as number).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <BrandChart data={topBrandData} compact={compact} />
      <div className="w-full max-w-full rounded-2xl border border-border bg-card p-4 md:p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          All Brands Performance
        </h3>
        {renderBrandRows()}
      </div>
    </>
  );
}