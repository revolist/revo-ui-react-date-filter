import { useState } from 'react';
import { Badge, Button, Checkbox, DateRangePicker } from '@revolist/ui/react';
import {
  EARLIEST_DATE, ORDERS, REFERENCE_DATE, filterOrders, formatDate,
  formatMoney, inclusiveDays, presetRange, totalCents, validateRange,
} from './report.ts';
import type { DateRange, InvoiceStatus } from './report.ts';
import { invoiceMessages } from './invoice-messages.ts';
import type { InvoiceLocale } from './invoice-messages.ts';

export default function App({ locale = 'en' }: { locale?: InvoiceLocale }) {
  const copy = invoiceMessages[locale];
  const [orders, setOrders] = useState(() => [...ORDERS]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [invoiceNotice, setInvoiceNotice] = useState('');
  const [draft, setDraft] = useState<DateRange>(() => presetRange('last7'));
  const [applied, setApplied] = useState<DateRange>(() => presetRange('last7'));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('Showing the last 7 days in the demo data.');
  const dirty = draft.from !== applied.from || draft.to !== applied.to;
  const rows = filterOrders(orders, applied);
  const selectedRows = rows.filter(row => selected.has(row.id));
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;

  function toggleInvoice(id: string, checked: boolean) {
    setSelected(previous => {
      const next = new Set(previous);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }

  function changeStatus(ids: readonly string[], next: InvoiceStatus) {
    setOrders(previous => previous.map(order => ids.includes(order.id) ? { ...order, status: next } : order));
    setInvoiceNotice(copy.saved(ids.length, copy.statuses[next]));
  }

  function changeDraft(next: DateRange) {
    setDraft(next);
    setError('');
    setNotice('');
  }

  function apply() {
    const message = validateRange(draft);
    setError(message);
    if (message) return; // Keep the previous report visible on failure.
    setApplied({ ...draft });
    setSelected(new Set());
    setInvoiceNotice('');
    setNotice(`Applied ${formatDate(draft.from)} to ${formatDate(draft.to)}.`);
  }

  function reset() {
    const initial = presetRange('last7');
    setDraft(initial);
    setApplied(initial);
    setSelected(new Set());
    setInvoiceNotice('');
    setError('');
    setNotice('Reset to the last 7 days in the demo data.');
  }

  return (
    <main>
      <header className="page-header">
        <div><p className="eyebrow">Reporting / React recipe</p><h1>Revenue report</h1></div>
        <span className="fixture-note">Fictional data · as of {formatDate(REFERENCE_DATE)}</span>
      </header>

      <section className="filter-panel" aria-labelledby="filter-heading">
        <div className="section-heading">
          <div><h2 id="filter-heading">Report window</h2><p>Choose a range, then apply it to the report.</p></div>
          <span className="rule">Maximum 31 days</span>
        </div>
        <div className="presets" role="group" aria-label="Date presets">
          <Button type="button" variant="secondary" onClick={() => changeDraft(presetRange('last7'))}>Last 7 days</Button>
          <Button type="button" variant="secondary" onClick={() => changeDraft(presetRange('month'))}>This month</Button>
        </div>
        <DateRangePicker
          label="Report dates"
          fromLabel="Start date"
          toLabel="End date"
          openLabel="Choose report dates"
          value={draft}
          onChange={changeDraft}
          minDate={EARLIEST_DATE}
          maxDate={REFERENCE_DATE}
          referenceDate={REFERENCE_DATE}
          captionLayout="dropdown"
          weekStartsOn={1}
        />
        <p className="hint">“This month” means 1–16 November in this frozen example. Dates include both endpoints.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="filter-actions">
          <Button type="button" variant="primary" onClick={apply}>Apply filters</Button>
          <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
          <span className={dirty ? 'pending' : 'applied'} data-testid="filter-state">
            {dirty ? 'Unapplied changes' : 'Filters applied'}
          </span>
        </div>
        <p className="notice" role="status">{notice}</p>
      </section>

      <section className="results" aria-labelledby="results-heading">
        <div className="results-heading">
          <div><p className="eyebrow">Applied range</p><h2 id="results-heading">{formatDate(applied.from)} – {formatDate(applied.to)}</h2></div>
          <span className="day-count">{inclusiveDays(applied)} calendar days</span>
        </div>
        <div className="metrics">
          <div><span>Booked revenue</span><strong data-testid="revenue">{formatMoney(totalCents(rows))}</strong></div>
          <div><span>Invoices</span><strong data-testid="invoice-count">{rows.length}</strong></div>
        </div>
        <div className="invoice-actions" role="group" aria-label={copy.selection}>
          <span data-testid="selected-count" aria-live="polite">{copy.selected(selectedRows.length)}</span>
          <Button type="button" variant="secondary" disabled={!selectedRows.length} onClick={() => changeStatus(selectedRows.map(row => row.id), 'awaiting')}>{copy.markAwaiting}</Button>
          <Button type="button" variant="secondary" disabled={!selectedRows.length} onClick={() => changeStatus(selectedRows.map(row => row.id), 'paid')}>{copy.markPaid}</Button>
          <Button type="button" variant="ghost" disabled={!selectedRows.length} onClick={() => setSelected(new Set())}>{copy.clear}</Button>
        </div>
        <p className="invoice-notice" role="status">{invoiceNotice}</p>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">Invoices matching the applied date range</caption>
            <thead><tr>
              <th scope="col" className="check-cell"><Checkbox ariaLabel={copy.selectAll} checked={allSelected} indeterminate={selectedRows.length > 0 && !allSelected} disabled={!rows.length} onChange={(checked: boolean) => setSelected(checked ? new Set(rows.map(row => row.id)) : new Set())} /></th>
              <th scope="col">Invoice</th><th scope="col">{copy.client}</th><th scope="col">Booked date</th><th scope="col" className="amount">Amount</th><th scope="col">{copy.statusHeading}</th>
            </tr></thead>
            <tbody>
              {rows.map(order => <tr key={order.id} className={selected.has(order.id) ? 'invoice-selected' : undefined}>
                <td className="check-cell"><Checkbox ariaLabel={copy.select(order.id)} checked={selected.has(order.id)} onChange={(checked: boolean) => toggleInvoice(order.id, checked)} /></td>
                <td className="invoice-id">{order.id}</td><td>{order.customer}</td><td>{formatDate(order.bookedOn)}</td>
                <td className="amount">{formatMoney(order.cents)}</td>
                <td className="status-cell"><Badge variant="neutral" shape="pill" className={`invoice-status status-${order.status}`}>{copy.statuses[order.status]}</Badge></td>
              </tr>)}
              {rows.length === 0 && <tr><td colSpan={6} className="empty">No invoices in this range. Choose another date window.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <footer>Date controls: <a href="https://ui.rv-grid.com/components/calendar-and-dates/">Revo UI</a>. Filtering and reporting rules belong to this example.</footer>
    </main>
  );
}
