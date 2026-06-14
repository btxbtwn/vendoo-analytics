/** Number and currency formatting utilities. */

export function round(n: number, d = 2): number {
  return Math.round(n * 10 ** d) / 10 ** d;
}

export function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtCurrency(n: number): string {
  return "$" + fmt(n);
}

export function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}
