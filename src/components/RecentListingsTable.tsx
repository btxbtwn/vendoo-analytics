"use client";

import { splitSegmentValues } from "../lib/analytics";
import { VendooListing } from "../lib/types";

const STATUS_BADGE: Record<string, string> = {
  Active: "border-accent/20 bg-accent/10 text-accent",
  Sold: "border-success/20 bg-success/10 text-success",
  Draft: "border-border bg-muted/30 text-muted-foreground",
};

interface RecentListingsTableProps {
  listings: VendooListing[];
  compact?: boolean;
}

export default function RecentListingsTable({
  listings,
  compact = false,
}: RecentListingsTableProps) {
  if (listings.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-4 md:p-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Listings</h3>
        <p className="mt-1 text-sm text-muted-foreground">No listings matched the selected range.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Listings</h3>
          <p className="mt-1 text-sm text-muted-foreground">Newest inventory added in the selected range</p>
        </div>
        <div className="space-y-3">
          {listings.map((listing, index) => {
            const platforms = splitSegmentValues(listing.listingPlatforms);

            return (
              <article
                key={`${listing.sku || listing.title}-${index}`}
                className="rounded-2xl border border-border/70 bg-muted/20 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="line-clamp-2 text-sm font-medium text-foreground">{listing.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {listing.brand || "Unknown brand"} · {listing.category || "Uncategorized"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      STATUS_BADGE[listing.status] || "border-border bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Listed</p>
                    <p className="mt-1 text-foreground">
                      {new Date(listing.listedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Asking</p>
                    <p className="mt-1 font-medium text-foreground">${listing.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Platforms</p>
                    <p className="mt-1 text-foreground">{platforms.length || 0}</p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {platforms.length > 0 ? platforms.join(", ") : "No platforms recorded"}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Listings</h3>
        <p className="mt-1 text-sm text-muted-foreground">Newest inventory added in the selected range</p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[720px] w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Item</th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Listed Date</th>
              <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Platforms</th>
              <th className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Asking Price</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing, index) => {
              const platforms = splitSegmentValues(listing.listingPlatforms);

              return (
                <tr key={`${listing.sku || listing.title}-${index}`} className="border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="max-w-[280px] px-2 py-3">
                    <p className="truncate font-medium text-foreground">{listing.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{listing.brand || "Unknown brand"} · {listing.category || "Uncategorized"}</p>
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                        STATUS_BADGE[listing.status] || "border-border bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">
                    {new Date(listing.listedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{platforms.length > 0 ? platforms.join(", ") : "No platforms recorded"}</td>
                  <td className="px-2 py-3 text-right font-medium text-foreground">${listing.price.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
