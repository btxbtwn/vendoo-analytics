import { describe, it, expect } from "vitest";
import {
  parseListingDate,
  calculateKPIMetrics,
  calculateKPIs,
  filterListingsByDate,
  getListingProfit,
  startOfDay,
  endOfDay,
  addDays,
  formatDayKey,
} from "../src/lib/analytics";
import type { VendooListing, TabDateFilter } from "../src/lib/types";

// ── Date parsing ──
describe("parseListingDate", () => {
  it("parses valid YYYY-MM-DD", () => {
    const d = parseListingDate("2024-06-15");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2024);
    expect(d!.getMonth()).toBe(5); // June = 5
    expect(d!.getDate()).toBe(15);
  });

  it("returns null for empty string", () => {
    expect(parseListingDate("")).toBeNull();
    expect(parseListingDate("   ")).toBeNull();
  });

  it("returns null for unsupported formats", () => {
    expect(parseListingDate("06/15/2024")).toBeNull();
    expect(parseListingDate("not a date")).toBeNull();
    expect(parseListingDate("2024-06-15T00:00:00Z")).toBeNull();
  });

  it("rejects impossible calendar dates", () => {
    expect(parseListingDate("2024-02-30")).toBeNull();
    expect(parseListingDate("2024-13-01")).toBeNull();
    expect(parseListingDate("2024-00-01")).toBeNull();
  });

  it("handles leap year", () => {
    expect(parseListingDate("2024-02-29")).not.toBeNull();
    expect(parseListingDate("2023-02-29")).toBeNull();
  });
});

// ── KPI calculations ──
function makeListing(overrides: Partial<VendooListing> = {}): VendooListing {
  return {
    images: "", title: "Test Item", description: "", brand: "TestBrand",
    condition: "New", primaryColor: "Black", secondaryColor: "",
    tags: "", sku: "", category: "Test", price: 100,
    status: "Active", listedDate: "", soldDate: "", shippedDate: "",
    listingPlatforms: "", soldPlatform: "", internalNotes: "",
    priceSold: 0, costOfGoods: 0, marketplaceFees: 0,
    shippingExpenses: 0, labels: "", quantityLeft: 1, quantitySold: 0,
    ...overrides,
  };
}

describe("calculateKPIMetrics", () => {
  it("returns zeros for empty array", () => {
    const m = calculateKPIMetrics([]);
    expect(m.totalRevenue).toBe(0);
    expect(m.totalProfit).toBe(0);
    expect(m.soldItems).toBe(0);
    expect(m.profitMargin).toBe(0);
  });

  it("computes revenue and profit correctly", () => {
    const listings = [
      makeListing({ status: "Sold", priceSold: 100, costOfGoods: 30, marketplaceFees: 10, shippingExpenses: 5 }),
      makeListing({ status: "Sold", priceSold: 50, costOfGoods: 15, marketplaceFees: 5, shippingExpenses: 0 }),
    ];
    const m = calculateKPIMetrics(listings);
    expect(m.totalRevenue).toBe(150);
    expect(m.totalCOGS).toBe(45);
    expect(m.totalFees).toBe(15);
    expect(m.totalShipping).toBe(5);
    expect(m.totalProfit).toBe(85); // 150 - 45 - 15 - 5
    expect(m.profitMargin).toBe(56.7); // 85/150 * 100
    expect(m.soldItems).toBe(2);
  });

  it("handles negative profit", () => {
    const listings = [
      makeListing({ status: "Sold", priceSold: 20, costOfGoods: 50, marketplaceFees: 5, shippingExpenses: 0 }),
    ];
    const m = calculateKPIMetrics(listings);
    expect(m.totalProfit).toBe(-35);
    expect(m.profitMargin).toBe(-175);
  });

  it("excludes active/draft from sold metrics", () => {
    const listings = [
      makeListing({ status: "Sold", priceSold: 100 }),
      makeListing({ status: "Active" }),
      makeListing({ status: "Draft" }),
    ];
    const m = calculateKPIMetrics(listings);
    expect(m.soldItems).toBe(1);
    expect(m.totalListings).toBe(3);
    expect(m.activeListings).toBe(1);
  });
});

describe("calculateKPIs (formatted)", () => {
  it("returns formatted strings", () => {
    const listings = [
      makeListing({ status: "Sold", priceSold: 100, costOfGoods: 30, marketplaceFees: 10, shippingExpenses: 5 }),
    ];
    const k = calculateKPIs(listings);
    expect(k.totalRevenue).toBe("$100.00");
    expect(k.totalProfit).toBe("$55.00");
    expect(k.profitMargin).toBe("55%");
  });
});

// ── Profit calculation ──
describe("getListingProfit", () => {
  it("computes profit = priceSold - COGS - fees - shipping", () => {
    const listing = makeListing({
      status: "Sold", priceSold: 100, costOfGoods: 30,
      marketplaceFees: 10, shippingExpenses: 5,
    });
    expect(getListingProfit(listing)).toBe(55);
  });
});

// ── Date filtering ──
describe("filterListingsByDate", () => {
  const now = new Date("2024-06-15T12:00:00Z");

  it("returns all when filter is 'all'", () => {
    const listings = [makeListing({ soldDate: "2024-06-01" })];
    const filter: TabDateFilter = { preset: "all", from: "", to: "" };
    const result = filterListingsByDate(listings, "soldDate", filter, now);
    expect(result).toHaveLength(1);
  });

  it("filters by 7d preset", () => {
    const listings = [
      makeListing({ status: "Sold", soldDate: "2024-06-14" }),
      makeListing({ status: "Sold", soldDate: "2024-06-01" }),
    ];
    const filter: TabDateFilter = { preset: "7d", from: "", to: "" };
    const result = filterListingsByDate(listings, "soldDate", filter, now);
    expect(result).toHaveLength(1);
  });

  it("excludes invalid dates", () => {
    const listings = [
      makeListing({ status: "Sold", soldDate: "" }),
      makeListing({ status: "Sold", soldDate: "invalid" }),
    ];
    const filter: TabDateFilter = { preset: "30d", from: "", to: "" };
    const result = filterListingsByDate(listings, "soldDate", filter, now);
    expect(result).toHaveLength(0);
  });

  it("handles custom date range", () => {
    const listings = [
      makeListing({ status: "Sold", soldDate: "2024-03-15" }),
      makeListing({ status: "Sold", soldDate: "2024-03-01" }),
      makeListing({ status: "Sold", soldDate: "2024-02-15" }),
    ];
    const filter: TabDateFilter = { preset: "custom", from: "2024-03-01", to: "2024-03-31" };
    const result = filterListingsByDate(listings, "soldDate", filter, now);
    expect(result).toHaveLength(2);
  });
});
