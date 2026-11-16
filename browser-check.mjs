import { chromium, expect } from '@playwright/test';

const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
  // The report has a light layout, so controls must stay light under either OS preference.
  for (const colorScheme of ['dark', 'light']) {
    await page.emulateMedia({ colorScheme });
    await expect.poll(() => page.getByLabel('Start date', { exact: true }).evaluate(
      input => getComputedStyle(input).getPropertyValue('--rv-ui-color-scheme').trim(),
    )).toBe('light');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  }
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.getByTestId('revenue')).toHaveText('$4,000.00');
  await expect(page.getByTestId('invoice-count')).toHaveText('4');

  await page.getByRole('button', { name: 'This month', exact: true }).click();
  await expect(page.getByLabel('Start date', { exact: true })).toHaveValue('2026-11-01');
  await expect(page.getByTestId('filter-state')).toHaveText('Unapplied changes');
  await expect(page.getByTestId('revenue')).toHaveText('$4,000.00');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByTestId('revenue')).toHaveText('$5,330.00');
  await expect(page.getByTestId('invoice-count')).toHaveText('7');

  await page.getByLabel('Start date', { exact: true }).fill('2026-10-01');
  await page.getByLabel('Start date', { exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('at most 31 calendar days');
  await expect(page.getByTestId('revenue')).toHaveText('$5,330.00');
  await expect(page.getByTestId('invoice-count')).toHaveText('7');

  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByLabel('Start date', { exact: true })).toHaveValue('2026-11-10');
  await expect(page.getByLabel('End date', { exact: true })).toHaveValue('2026-11-16');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByTestId('revenue')).toHaveText('$4,000.00');
  await expect(page.getByTestId('filter-state')).toHaveText('Filters applied');

  await page.getByLabel('Start date', { exact: true }).fill('2026-11-05');
  await page.getByLabel('Start date', { exact: true }).press('Tab');
  await page.getByLabel('End date', { exact: true }).fill('2026-11-06');
  await page.getByLabel('End date', { exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByTestId('revenue')).toHaveText('$0.00');
  await expect(page.getByTestId('invoice-count')).toHaveText('0');
  await expect(page.getByText('No invoices in this range. Choose another date window.')).toBeVisible();

  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Choose report dates', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Report dates', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Report dates', exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Apply filters', exact: true })).toBeVisible();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (horizontalOverflow) throw new Error('Page overflows the mobile viewport horizontally.');
  if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
  console.log('PASS: initial fixture, draft/apply, validation retention, reset, empty range, calendar dismissal, mobile width, light controls under dark/light OS preferences, no page errors.');
} finally {
  await browser.close();
}
