/** Parse warnings collected during CSV import. */
export interface ParseWarning {
  row: number;
  field: string;
  rawValue: string;
  reason: string;
}

/** Result of loading and normalizing Vendoo CSV data. */
export interface ListingImport {
  listings: import("./types").VendooListing[];
  warnings: ParseWarning[];
}

/** Create a warning for a specific row and field. */
export function warn(row: number, field: string, rawValue: string, reason: string): ParseWarning {
  return { row, field, rawValue, reason };
}

/** Summarize warnings into a human-readable report. */
export function summarizeWarnings(warnings: ParseWarning[]): string[] {
  if (warnings.length === 0) return [];

  const byField = new Map<string, number>();
  for (const w of warnings) {
    byField.set(w.field, (byField.get(w.field) || 0) + 1);
  }

  const lines: string[] = [];
  lines.push(`${warnings.length} parse warning${warnings.length !== 1 ? "s" : ""}:`);
  for (const [field, count] of byField) {
    lines.push(`  - ${field}: ${count} row${count !== 1 ? "s" : ""}`);
  }

  return lines;
}
