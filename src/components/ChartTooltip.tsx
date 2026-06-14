"use client";

type TooltipValue = number | string | readonly (number | string)[];

interface TooltipPayloadItem {
  color?: string;
  name?: string | number;
  payload?: {
    name?: string | number;
  };
  value?: TooltipValue;
}

interface ChartTooltipContentProps {
  active?: boolean;
  getTitle?: (args: {
    label?: string | number;
    payload: readonly TooltipPayloadItem[];
  }) => string;
  getValueLabel?: (args: {
    label?: string | number;
    payload: readonly TooltipPayloadItem[];
  }) => string;
  label?: string | number;
  payload?: readonly TooltipPayloadItem[];
  valueFormatter?: (value: TooltipValue) => string;
}

export function formatCurrency(value: TooltipValue): string {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function ChartTooltip({
  active,
  getTitle,
  getValueLabel,
  label,
  payload,
  valueFormatter = (value) => String(value),
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const primaryItem = payload[0];
  const title = getTitle?.({ label, payload })
    ?? String(label ?? primaryItem.payload?.name ?? primaryItem.name ?? "");
  const valueLabel = getValueLabel?.({ label, payload })
    ?? String(primaryItem.name ?? "Value");
  const formattedValue = valueFormatter(primaryItem.value ?? 0);

  return (
    <div
      className="bg-elevated border rounded-[6px] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
    >
      <p className="text-[var(--text-base)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </p>
      <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <span
          className="h-2.5 w-2.5 rounded-none shrink-0"
          style={{ backgroundColor: primaryItem.color ?? "var(--chart-1)" }}
        />
        <span>{valueLabel}</span>
        <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{formattedValue}</span>
      </div>
    </div>
  );
}
