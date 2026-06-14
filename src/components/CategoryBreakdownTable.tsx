"use client";

import { ReactNode } from "react";
import { CategoryBreakdownRow, SortDirection } from "../lib/types";
import { Badge } from "./ui/Badge";
import { DataTable, ColumnConfig } from "./ui/DataTable";

function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}

interface CategoryBreakdownTableProps {
  data: CategoryBreakdownRow[];
  compact?: boolean;
}

function MarginBadge({ margin }: { margin: number }) {
  return (
    <Badge variant={margin >= 30 ? "success" : margin >= 10 ? "warning" : "danger"}>
      {fmtPct(margin)}
    </Badge>
  );
}

export default function CategoryBreakdownTable({ data, compact = false }: CategoryBreakdownTableProps) {
  const columns: ColumnConfig<CategoryBreakdownRow>[] = [
    {
      key: "category",
      header: "Category",
      sortable: true,
    },
    {
      key: "listed",
      header: "Items",
      numeric: true,
      sortable: true,
    },
    {
      key: "sold",
      header: "Sold",
      numeric: true,
      sortable: true,
    },
    {
      key: "sellThroughRate",
      header: "STR",
      accessor: (row) => fmtPct(row.sellThroughRate),
      numeric: true,
      sortable: true,
    },
    {
      key: "avgCOGS",
      header: "Avg COGS",
      accessor: (row) => fmtCurrency(row.avgCOGS),
      numeric: true,
      sortable: true,
    },
    {
      key: "avgSalePrice",
      header: "Avg ASP",
      accessor: (row) => fmtCurrency(row.avgSalePrice),
      numeric: true,
      sortable: true,
    },
    {
      key: "avgProfit",
      header: "Avg Profit",
      accessor: (row) => fmtCurrency(row.avgProfit),
      numeric: true,
      sortable: true,
    },
    {
      key: "profitMargin",
      header: "Margin",
      accessor: (row) => <MarginBadge margin={row.profitMargin} />,
      numeric: true,
      sortable: true,
    },
    {
      key: "totalRevenue",
      header: "Revenue",
      accessor: (row) => <span className="font-medium">{fmtCurrency(row.totalRevenue)}</span>,
      numeric: true,
      sortable: true,
    },
  ];

  if (compact) {
    return (
      <div className="w-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-none p-4">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Category Breakdown</h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">COGS, ASP, and profit by category</p>
        </div>
        <DataTable
          data={data}
          columns={columns}
          keyField="category"
          compact={true}
          pageSizeOptions={[5, 10, 20, 50]}
          defaultPageSize={5}
          defaultSortField="totalRevenue"
          defaultSortDir="desc"
          emptyMessage="No listing data available."
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] rounded-none p-4 md:p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Category Breakdown</h3>
        <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">COGS, ASP, and profit by category</p>
      </div>
      <DataTable
        data={data}
        columns={columns}
        keyField="category"
        pageSizeOptions={[10, 25, 50, 100]}
        defaultPageSize={10}
        defaultSortField="totalRevenue"
        defaultSortDir="desc"
        emptyMessage="No listing data available."
      />
    </div>
  );
}
