"use client";

import { splitSegmentValues } from "../lib/analytics";
import { VendooListing } from "../lib/types";
import { Badge } from "./ui/Badge";

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
 <div className="w-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] p-4 md:p-6">
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Listings</h3>
 <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">No listings matched the selected range.</p>
 </div>
 );
 }

 if (compact) {
 return (
 <div className="w-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] p-4">
 <div className="mb-4">
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Listings</h3>
 <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">Newest inventory added in the selected range</p>
 </div>
 <div className="space-y-3">
 {listings.map((listing, index) => {
 const platforms = splitSegmentValues(listing.listingPlatforms);

 return (
 <article
 key={`${listing.sku || listing.title}-${index}`}
 className="border-b-[0.5px] border-[color:rgba(255,255,255,0.07)] p-4 transition-colors hover:bg-[var(--color-bg-hover)]"
 >
 <div className="mb-3 flex items-start justify-between gap-3">
 <div className="min-w-0">
 <h4 className="line-clamp-2 text-sm font-medium text-[var(--color-text-primary)]">{listing.title}</h4>
 <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
 {listing.brand || "Unknown brand"} · {listing.category || "Uncategorized"}
 </p>
 </div>
 <Badge variant={listing.status === "Active" ? "accent" : listing.status === "Sold" ? "success" : "neutral"}>
 {listing.status}
 </Badge>
 </div>

 <div className="grid grid-cols-3 gap-2 text-sm">
 <div>
 <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Listed</p>
 <p className="mt-1 text-[var(--color-text-primary)]">
 {new Date(listing.listedDate).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 })}
 </p>
 </div>
 <div>
 <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Asking</p>
 <p className="mt-1 font-medium text-[var(--color-text-primary)]">${listing.price.toFixed(2)}</p>
 </div>
 <div>
 <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Platforms</p>
 <p className="mt-1 text-[var(--color-text-primary)]">{platforms.length || 0}</p>
 </div>
 </div>

 <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
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
 <div className="w-full max-w-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] p-4 md:p-6">
 <div className="mb-6">
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Listings</h3>
 <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">Newest inventory added in the selected range</p>
 </div>
 <div className="w-full overflow-x-auto">
 <table className="min-w-[720px] w-full text-sm">
 <thead>
 <tr>
 <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">Item</th>
 <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">Status</th>
 <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">Listed Date</th>
 <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">Platforms</th>
 <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b-[0.5px] border-[color:rgba(255,255,255,0.12)]">Asking Price</th>
 </tr>
 </thead>
 <tbody>
 {listings.map((listing, index) => {
 const platforms = splitSegmentValues(listing.listingPlatforms);

 return (
 <tr key={`${listing.sku || listing.title}-${index}`} className="border-b-[0.5px] border-[color:rgba(255,255,255,0.07)] last:border-b-0 hover:bg-[rgba(255,255,255,0.03)] transition-colors">
 <td className="max-w-[280px] px-3 py-2">
 <p className="truncate font-medium text-[var(--color-text-primary)]">{listing.title}</p>
 <p className="truncate text-xs text-[var(--color-text-tertiary)]">{listing.brand || "Unknown brand"} · {listing.category || "Uncategorized"}</p>
 </td>
 <td className="px-3 py-2">
 <Badge variant={listing.status === "Active" ? "accent" : listing.status === "Sold" ? "success" : "neutral"}>
 {listing.status}
 </Badge>
 </td>
 <td className="px-3 py-2 text-[var(--color-text-secondary)]">
 {new Date(listing.listedDate).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 })}
 </td>
 <td className="px-3 py-2 text-[var(--color-text-secondary)]">{platforms.length > 0 ? platforms.join(", ") : "No platforms recorded"}</td>
 <td className="px-3 py-2 text-right font-medium text-[var(--color-text-primary)]">${listing.price.toFixed(2)}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 );
}
