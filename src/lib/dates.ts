/** Date parsing, formatting, and manipulation utilities. */

import { TimeGrouping } from "./types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function startOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

export function endOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function parseListingDate(rawValue: string): Date | null {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return null;
  }

  const localDateMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (localDateMatch) {
    const [, year, month, day] = localDateMatch;
    const y = Number(year);
    const m = Number(month) - 1;
    const d = Number(day);
    const parsedDate = new Date(y, m, d);
    // Reject impossible dates that JS auto-corrects (e.g., 2024-13-45 → Jan 14 2025)
    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== y ||
      parsedDate.getMonth() !== m ||
      parsedDate.getDate() !== d
    ) {
      return null;
    }
    return parsedDate;
  }

  // Reject non-YYYY-MM-DD formats — "today" is never a valid fallback
  return null;
}

export function formatDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(yyyymm: string): string {
  const [year, month] = yyyymm.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function formatDayLabel(yyyymmdd: string): string {
  const [year, month, day] = yyyymmdd.split("-").map((value) => Number(value));
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatPeriodLabel(key: string, grouping: TimeGrouping): string {
  return grouping === "day" ? formatDayLabel(key) : formatMonthLabel(key);
}

export function getGroupingKey(date: Date, grouping: TimeGrouping): string {
  return grouping === "day" ? formatDayKey(date) : formatMonthKey(date);
}

export { MS_PER_DAY };
