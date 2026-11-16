import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, isValidIsoDate } from '@revolist/ui/dates';
import {
  ORDERS, filterOrders, formatDate, inclusiveDays,
  presetRange, totalCents, validateRange,
} from './report.ts';

test('ISO dates reject rollover dates and honor Gregorian leap rules', () => {
  assert.equal(isValidIsoDate('2026-02-29'), false);
  assert.equal(isValidIsoDate('2000-02-29'), true);
  assert.equal(isValidIsoDate('1900-02-29'), false);
  assert.equal(isValidIsoDate('2026-04-31'), false);
  assert.equal(isValidIsoDate('2026-1-01'), false);
});

test('last seven days include the reporting day, including month boundaries', () => {
  assert.deepEqual(presetRange('last7'), { from: '2026-11-10', to: '2026-11-16' });
  assert.deepEqual(presetRange('last7', '2026-03-02'), { from: '2026-02-24', to: '2026-03-02' });
  assert.equal(inclusiveDays(presetRange('last7')), 7);
});

test('month preset is month-to-date, not a future month-end range', () => {
  assert.deepEqual(presetRange('month'), { from: '2026-11-01', to: '2026-11-16' });
});

test('day arithmetic crosses leap days and DST dates without changing its count', () => {
  assert.equal(addDays('2024-03-01', -1), '2024-02-29');
  assert.equal(addDays('2026-03-30', -1), '2026-03-29');
  assert.equal(inclusiveDays({ from: '2026-03-28', to: '2026-03-30' }), 3);
});

test('report limits allow 31 days and reject 32, invalid dates, reversed dates and bounds', () => {
  assert.equal(validateRange({ from: '2026-10-17', to: '2026-11-16' }), '');
  assert.match(validateRange({ from: '2026-10-16', to: '2026-11-16' }), /at most 31/);
  assert.match(validateRange({ from: '2026-11-17', to: '2026-11-16' }), /start date/);
  assert.match(validateRange({ from: '2026-11-01', to: '2026-11-31' }), /valid dates/);
  assert.match(validateRange({ from: '2026-11-01', to: '2026-11-17' }), /Choose dates from/);
});

test('filtering includes both boundaries and totals the fixed fixtures', () => {
  const lastWeek = filterOrders(ORDERS, presetRange('last7'));
  assert.deepEqual(lastWeek.map(row => row.id), ['INV-107', 'INV-108', 'INV-109', 'INV-110']);
  assert.equal(totalCents(lastWeek), 400000);
  const month = filterOrders(ORDERS, presetRange('month'));
  assert.equal(month.length, 7);
  assert.equal(totalCents(month), 533000);
});

test('single-day and empty ranges are valid report results', () => {
  assert.equal(filterOrders(ORDERS, { from: '2026-11-16', to: '2026-11-16' }).length, 1);
  assert.equal(filterOrders(ORDERS, { from: '2026-11-05', to: '2026-11-06' }).length, 0);
});

test('report date labels use the shared formatter and host locale', () => {
  assert.equal(formatDate('2026-11-16'), '16 Nov 2026');
  assert.equal(formatDate('2026-11-16', 'fr-FR'), '16 nov. 2026');
});
