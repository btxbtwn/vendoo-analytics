import { NextResponse } from "next/server";
import { loadServerListingsWithWarnings } from "@/lib/server-listings";

export const dynamic = "force-dynamic";

export async function GET() {
  const { warnings, listings } = await loadServerListingsWithWarnings();
  return NextResponse.json({
    count: warnings.length,
    totalRows: listings.length,
    warnings: warnings.slice(0, 50), // limit for fetch size
    summary: summarize(warnings),
  });
}

function summarize(warnings: Array<{ field: string }>) {
  const byField = new Map<string, number>();
  for (const w of warnings) {
    byField.set(w.field, (byField.get(w.field) || 0) + 1);
  }
  return Array.from(byField.entries()).map(([field, count]) => ({ field, count }));
}
