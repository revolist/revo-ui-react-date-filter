import {
  addDays, diffInCalendarDays, formatCalendarDateDisplay,
  isValidIsoDate, startOfMonth,
} from '@revolist/ui/dates';
import type { CalendarDateRange } from '@revolist/ui/calendar/types';

export type DateRange = CalendarDateRange;
export type Order = { id: string; bookedOn: string; customer: string; cents: number };

// A frozen reporting date keeps the tutorial reproducible next month or year.
export const REFERENCE_DATE = '2026-11-16';
export const EARLIEST_DATE = '2026-10-01';
export const MAX_REPORT_DAYS = 31;
export function inclusiveDays(range: DateRange): number {
  return diffInCalendarDays(range.from, range.to) + 1;
}

export function presetRange(preset: 'last7' | 'month', reference = REFERENCE_DATE): DateRange {
  if (!isValidIsoDate(reference)) throw new Error('Expected a valid reporting date.');
  return {
    from: preset === 'last7' ? addDays(reference, -6) : startOfMonth(reference),
    to: reference,
  };
}

export function validateRange(range: DateRange): string {
  if (!isValidIsoDate(range.from) || !isValidIsoDate(range.to)) {
    return 'Choose two valid dates in YYYY-MM-DD format.';
  }
  if (range.from > range.to) return 'The start date must not be after the end date.';
  if (range.from < EARLIEST_DATE || range.to > REFERENCE_DATE) {
    return `Choose dates from ${EARLIEST_DATE} through ${REFERENCE_DATE}.`;
  }
  if (inclusiveDays(range) > MAX_REPORT_DAYS) {
    return `Choose at most ${MAX_REPORT_DAYS} calendar days, including both endpoints.`;
  }
  return '';
}

// Fixture values are fictional; cents avoid floating-point addition for totals.
export const ORDERS: readonly Order[] = [
  { id: 'INV-101', bookedOn: '2026-10-01', customer: 'North Studio', cents: 89000 },
  { id: 'INV-102', bookedOn: '2026-10-15', customer: 'Atlas Works', cents: 25000 },
  { id: 'INV-103', bookedOn: '2026-10-31', customer: 'Fern Systems', cents: 120000 },
  { id: 'INV-104', bookedOn: '2026-11-01', customer: 'North Studio', cents: 45000 },
  { id: 'INV-105', bookedOn: '2026-11-03', customer: 'Orbit Design', cents: 67000 },
  { id: 'INV-106', bookedOn: '2026-11-09', customer: 'Atlas Works', cents: 21000 },
  { id: 'INV-107', bookedOn: '2026-11-10', customer: 'North Studio', cents: 125000 },
  { id: 'INV-108', bookedOn: '2026-11-12', customer: 'Fern Systems', cents: 33000 },
  { id: 'INV-109', bookedOn: '2026-11-14', customer: 'Orbit Design', cents: 190000 },
  { id: 'INV-110', bookedOn: '2026-11-16', customer: 'Atlas Works', cents: 52000 },
];

export function filterOrders(orders: readonly Order[], range: DateRange): Order[] {
  return orders.filter(order => order.bookedOn >= range.from && order.bookedOn <= range.to);
}

export function totalCents(orders: readonly Order[]): number {
  return orders.reduce((sum, order) => sum + order.cents, 0);
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function formatDate(value: string, locale = 'en-GB'): string {
  return formatCalendarDateDisplay(value, locale) ?? '';
}
