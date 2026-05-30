"use client";

interface PageSizeSelectorProps {
  value: number;
  options: number[];
  onChange: (size: number) => void;
}

export default function PageSizeSelector({
  value,
  options,
  onChange,
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-[var(--color-text-tertiary)]">Show</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-none border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]/50"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
