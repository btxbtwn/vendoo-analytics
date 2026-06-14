"use client";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export default function EmptyState({ title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={compact ? "py-8 px-4" : "py-16 px-6"}
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: compact ? "120px" : "200px",
      }}
    >
      <h3
        className="font-semibold"
        style={{
          fontSize: compact ? "var(--text-base)" : "var(--text-lg)",
          color: "var(--color-text-primary)",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            maxWidth: "48ch",
            margin: "0 auto",
          }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const emptyStateMessages = {
  noCsv: {
    title: "No data loaded",
    description: "Upload a Vendoo CSV export to start analyzing your reselling metrics. Use the CSV upload button to get started.",
  },
  noResults: {
    title: "No results found",
    description: "Try expanding the date range or clearing your filters to see more data.",
  },
  noRevenue: {
    title: "No revenue data",
    description: "No sales recorded in this time window. Try a different date range or check if your listings have sold dates.",
  },
  noPlatform: {
    title: "No platform data",
    description: "No platform-level metrics available for the selected filters. Try broadening your date range.",
  },
  noBrand: {
    title: "No brand data",
    description: "No brand analytics available for the selected time window.",
  },
  noLabel: {
    title: "No label data",
    description: "No label or tag comparisons available. Add labels to your listings to unlock this view.",
  },
  noInventory: {
    title: "No inventory items",
    description: "No listings match the current filters. Try changing status or date range.",
  },
} as const;
