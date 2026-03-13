"use client";

import { VendooListing } from "../lib/types";

interface RecentSalesTableProps {
  sales: VendooListing[];
  compact?: boolean;
}

const PLATFORM_BADGE: Record<string, string> = {
  eBay: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Poshmark: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  Mercari: "bg-red-500/15 text-red-400 border-red-500/20",
  Depop: "bg-green-500/15 text-green-400 border-green-500/20",
  Etsy: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "In-Person": "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

export default function RecentSalesTable({
  sales,
  compact = false,
}: RecentSalesTableProps) {
  if (compact) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Sales</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your latest completed transactions
          </p>
        </div>
        <div className="space-y-3">
          {sales.map((sale, index) => {
            const profit =
              sale.priceSold -
              sale.costOfGoods -
              sale.marketplaceFees -
              sale.shippingExpenses;
            const profitPositive = profit >= 0;

            return (
              <article
                key={`${sale.title}-${index}`}
                className="rounded-2xl border border-border/70 bg-muted/20 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="line-clamp-2 text-sm font-medium text-foreground">
                      {sale.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sale.brand || "Unknown brand"} · {sale.category || "Uncategorized"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      PLATFORM_BADGE[sale.soldPlatform] ||
                      "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {sale.soldPlatform || "Unknown"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Sold
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      ${sale.priceSold.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Profit
                    </p>
                    <p
                      className={`mt-1 font-semibold ${
                        profitPositive ? "text-success" : "text-danger"
                      }`}
                    >
                      {profitPositive ? "+" : ""}${profit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Date
                    </p>
                    <p className="mt-1 text-foreground">
                      {new Date(sale.soldDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Sales</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your latest completed transactions
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Item
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Platform
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sold Date
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sold Price
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                COGS
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Profit
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, i) => {
              const profit =
                sale.priceSold -
                sale.costOfGoods -
                sale.marketplaceFees -
                sale.shippingExpenses;
              const profitPositive = profit >= 0;
              return (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-2 max-w-[250px]">
                    <p className="truncate font-medium text-foreground">
                      {sale.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sale.brand} · {sale.category}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        PLATFORM_BADGE[sale.soldPlatform] ||
                        "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {sale.soldPlatform}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {new Date(sale.soldDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-foreground">
                    ${sale.priceSold.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    ${sale.costOfGoods.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-semibold ${
                      profitPositive ? "text-success" : "text-danger"
                    }`}
                  >
                    {profitPositive ? "+" : ""}${profit.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
