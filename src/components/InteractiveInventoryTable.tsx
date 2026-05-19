"use client";

import { useState, useMemo } from "react";
import {
  InventoryTableRow,
  InventorySortField,
  StatusFilter,
  SortDirection,
  VendooListing,
} from "../lib/types";

function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_BADGE: Record<string, string> = {
  Active: "border-accent/20 text-accent",
  Sold: "border-success/20 text-success",
  Draft: "border-border text-muted-foreground",
};

const PAGE_SIZE = 50;

interface InteractiveInventoryTableProps {
  listings: VendooListing[];
  compact?: boolean;
}

function rowToTableRow(listing: VendooListing, index: number): InventoryTableRow {
  const listedDate = new Date(listing.listedDate);
  const soldDate = new Date(listing.soldDate);
  let daysToSell: number | null = null;
  if (listing.status === "Sold" && listing.listedDate && listing.soldDate) {
    const diff = (soldDate.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= 0) daysToSell = Math.round(diff);
  }
  const profit =
    listing.status === "Sold"
      ? listing.priceSold - listing.costOfGoods - listing.marketplaceFees - listing.shippingExpenses
      : 0;
  return {
    id: listing.sku || `${index}`,
    title: listing.title,
    brand: listing.brand || "Unknown",
    category: listing.category || "Unknown",
    status: listing.status,
    costOfGoods: listing.costOfGoods,
    price: listing.price,
    priceSold: listing.status === "Sold" ? listing.priceSold : 0,
    profit,
    marketplaceFees: listing.marketplaceFees,
    shippingExpenses: listing.shippingExpenses,
    daysToSell,
    platform: listing.soldPlatform || listing.listingPlatforms || "—",
    listedDate: listing.listedDate,
    soldDate: listing.soldDate,
  };
}

type SortField = InventorySortField;

export default function InteractiveInventoryTable({
  listings,
  compact = false,
}: InteractiveInventoryTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandSearch, setBrandSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("listedDate");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);

  const allRows = useMemo(() => listings.map(rowToTableRow), [listings]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allRows.map((r) => r.category))).sort();
    return ["all", ...cats];
  }, [allRows]);

  const filtered = useMemo(() => {
    let rows = allRows;
    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      rows = rows.filter((r) => r.category === categoryFilter);
    }
    if (brandSearch.trim()) {
      const q = brandSearch.toLowerCase();
      rows = rows.filter((r) => r.brand.toLowerCase().includes(q));
    }
    if (textSearch.trim()) {
      const q = textSearch.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.brand.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [allRows, statusFilter, categoryFilter, brandSearch, textSearch]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number | null = a[sortField];
      let bv: string | number | null = b[sortField];
      if (av === null) av = sortDir === "asc" ? Infinity : -Infinity;
      if (bv === null) bv = sortDir === "asc" ? Infinity : -Infinity;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [filtered, sortField, sortDir]);

  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  }

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        costOfGoods: acc.costOfGoods + r.costOfGoods,
        priceSold: acc.priceSold + r.priceSold,
        profit: acc.profit + r.profit,
        fees: acc.fees + r.marketplaceFees,
        shipping: acc.shipping + r.shippingExpenses,
      }),
      { costOfGoods: 0, priceSold: 0, profit: 0, fees: 0, shipping: 0 }
    );
  }, [filtered]);

  function SortIcon({ field }: { field: SortField }) {
    if (field !== sortField) return <span className="ml-1 text-muted-foreground/30">↕</span>;
    return <span className="ml-1 text-accent">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const thClass = "px-2 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap";
  const tdClass = "px-2 py-3 text-sm text-foreground whitespace-nowrap";

  if (allRows.length === 0) {
    return (
      <div className="card w-full rounded-2xl border border-border bg-card p-4 md:p-6">
        <h3 className="text-base font-semibold text-foreground">Inventory Table</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">No inventory data available.</p>
      </div>
    );
  }

  return (
    <div className="card w-full rounded-2xl border border-border bg-card p-4 md:p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-foreground">Inventory Table</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {filtered.length.toLocaleString()} items
          {filtered.length !== allRows.length && ` (of ${allRows.length} total)`}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(["all", "Active", "Sold", "Draft"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          className="rounded-xl border border-border bg-card px-3 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search brand..."
          value={brandSearch}
          onChange={(e) => { setBrandSearch(e.target.value); setPage(0); }}
          className="rounded-xl border border-border bg-card px-3 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
        />

        <input
          type="text"
          placeholder="Search title, brand, category..."
          value={textSearch}
          onChange={(e) => { setTextSearch(e.target.value); setPage(0); }}
          className="flex-1 min-w-[200px] rounded-xl border border-border bg-card px-3 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className={thClass} onClick={() => handleSort("title")}>
                Item <SortIcon field="title" />
              </th>
              <th className={thClass} onClick={() => handleSort("brand")}>
                Brand <SortIcon field="brand" />
              </th>
              <th className={thClass} onClick={() => handleSort("category")}>
                Category <SortIcon field="category" />
              </th>
              <th className={thClass} onClick={() => handleSort("status")}>
                Status <SortIcon field="status" />
              </th>
              <th className={`${thClass} text-right`} onClick={() => handleSort("costOfGoods")}>
                COGS <SortIcon field="costOfGoods" />
              </th>
              <th className={`${thClass} text-right`} onClick={() => handleSort("priceSold")}>
                Sold Price <SortIcon field="priceSold" />
              </th>
              <th className={`${thClass} text-right`} onClick={() => handleSort("profit")}>
                Profit <SortIcon field="profit" />
              </th>
              <th className={`${thClass} text-right`}>Fees</th>
              <th className={`${thClass} text-right`}>Ship</th>
              <th className={`${thClass} text-right`} onClick={() => handleSort("daysToSell")}>
                Days <SortIcon field="daysToSell" />
              </th>
              <th className={thClass}>Platform</th>
              <th className={thClass} onClick={() => handleSort("listedDate")}>
                Listed <SortIcon field="listedDate" />
              </th>
              <th className={thClass} onClick={() => handleSort("soldDate")}>
                Sold <SortIcon field="soldDate" />
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-border/50 last:border-b-0 transition-all hover:bg-muted/20 ${
                  i % 2 === 0 ? "bg-card" : "bg-muted/5"
                }`}
              >
                <td className={`${tdClass} max-w-[200px]`}>
                  <p className="truncate font-medium" title={row.title}>{row.title}</p>
                </td>
                <td className={`${tdClass} text-muted-foreground`}>{row.brand}</td>
                <td className={`${tdClass} text-muted-foreground`}>{row.category}</td>
                <td className={`${tdClass}`}>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_BADGE[row.status] || "border-border text-muted-foreground"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(row.costOfGoods)}</td>
                <td className={`${tdClass} text-right tabular-nums`}>
                  {row.priceSold > 0 ? fmtCurrency(row.priceSold) : "—"}
                </td>
                <td className={`${tdClass} text-right tabular-nums font-medium ${
                  row.profit > 0 ? "text-success" : row.profit < 0 ? "text-danger" : "text-muted-foreground"
                }`}>
                  {row.status === "Sold" ? fmtCurrency(row.profit) : "—"}
                </td>
                <td className={`${tdClass} text-right tabular-nums text-muted-foreground`}>
                  {row.marketplaceFees > 0 ? fmtCurrency(row.marketplaceFees) : "—"}
                </td>
                <td className={`${tdClass} text-right tabular-nums text-muted-foreground`}>
                  {row.shippingExpenses > 0 ? fmtCurrency(row.shippingExpenses) : "—"}
                </td>
                <td className={`${tdClass} text-right tabular-nums text-muted-foreground`}>
                  {row.daysToSell !== null ? `${row.daysToSell}d` : "—"}
                </td>
                <td className={`${tdClass} text-muted-foreground`}>{row.platform}</td>
                <td className={`${tdClass} text-muted-foreground`}>
                  {row.listedDate ? new Date(row.listedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                </td>
                <td className={`${tdClass} text-muted-foreground`}>
                  {row.soldDate ? new Date(row.soldDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                </td>
              </tr>
            ))}

            <tr className="border-t-2 border-border bg-muted/30 font-medium">
              <td className={`${tdClass}`} colSpan={4}>Totals ({filtered.length} items)</td>
              <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(totals.costOfGoods)}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{fmtCurrency(totals.priceSold)}</td>
              <td className={`${tdClass} text-right tabular-nums ${
                totals.profit > 0 ? "text-success" : totals.profit < 0 ? "text-danger" : ""
              }`}>{fmtCurrency(totals.profit)}</td>
              <td className={`${tdClass} text-right tabular-nums text-muted-foreground`}>{fmtCurrency(totals.fees)}</td>
              <td className={`${tdClass} text-right tabular-nums text-muted-foreground`}>{fmtCurrency(totals.shipping)}</td>
              <td className={`${tdClass}`} colSpan={3}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of{" "}
            {sorted.length.toLocaleString()}
          </p>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-border px-3 py-1 text-xs text-foreground disabled:opacity-30 hover:border-accent/50 transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i : page < 3 ? i : page > totalPages - 4 ? totalPages - 7 + i : page - 3 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-xl border px-3 py-1 text-xs transition-colors ${
                    page === p
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-foreground hover:border-accent/50"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-border px-3 py-1 text-xs text-foreground disabled:opacity-30 hover:border-accent/50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
