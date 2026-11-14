import type { DayWithActivities } from '@/database/repositories/itinerary';
import type { ExpenseWithShares } from '@/database/repositories/expenses';
import type { TripDetails } from '@/database/repositories/trips';
import type { Booking } from '@/types/models';

/**
 * Pure builders for exports. All user text is escaped: the itinerary HTML is rendered
 * by the system print engine, the CSV may be opened in a spreadsheet.
 */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export interface ItineraryLabels {
  title: (name: string) => string;
  dates: string;
  day: (n: number | null, date: string) => string;
  anytime: string;
  category: (c: string) => string;
  bookingsTitle: string;
  bookingType: (t: string) => string;
  reference: string;
  noActivities: string;
  footer: string;
  generated: string;
}

export function itineraryHtml(input: {
  trip: TripDetails;
  days: DayWithActivities[];
  bookings: Booking[];
  labels: ItineraryLabels;
  dayNumber: (date: string) => number | null;
  cityOf: (destinationId: string | null) => string | null;
  lang: string;
}): string {
  const { trip, days, bookings, labels: L } = input;
  const e = escapeHtml;
  const route = trip.destinations.map((d) => d.city).join(' → ') || trip.primaryDestination;
  const dayBlocks = days
    .map((d) => {
      const city = input.cityOf(d.destinationId);
      const rows = d.activities.length
        ? d.activities
            .map(
              (a) =>
                `<tr><td class="t">${e(a.startTime ? (a.endTime ? `${a.startTime}–${a.endTime}` : a.startTime) : L.anytime)}</td><td><strong>${e(a.name)}</strong>` +
                `<div class="m">${e([L.category(a.category), a.address].filter(Boolean).join(' · '))}</div>` +
                `${a.notes ? `<div class="n">${e(a.notes)}</div>` : ''}</td></tr>`,
            )
            .join('')
        : `<tr><td colspan="2" class="m">${e(L.noActivities)}</td></tr>`;
      const heading = [L.day(input.dayNumber(d.date), d.date), d.title, city].filter(Boolean).join(' — ');
      return `<section><h2>${e(heading)}</h2>${d.description ? `<p>${e(d.description)}</p>` : ''}<table>${rows}</table></section>`;
    })
    .join('');
  const bookingRows = bookings
    .filter((b) => b.status !== 'cancelled')
    .map(
      (b) =>
        `<tr><td class="t">${e([b.date, b.time].filter(Boolean).join(' '))}</td><td><strong>${e(L.bookingType(b.type))}${b.provider ? ` · ${e(b.provider)}` : ''}</strong>` +
        `<div class="m">${e([b.departureInfo, b.arrivalInfo].filter(Boolean).join(' → '))}</div>` +
        `${b.reference ? `<div class="m">${e(L.reference)}: ${e(b.reference)}</div>` : ''}</td></tr>`,
    )
    .join('');
  return `<!doctype html><html lang="${e(input.lang)}"><head><meta charset="utf-8"><title>${e(L.title(trip.name))}</title>
<style>
body{font-family:-apple-system,Roboto,Arial,sans-serif;color:#0E1222;margin:28px;font-size:12px}
h1{font-size:22px;margin:0 0 4px;color:#0F766E}h2{font-size:14px;margin:18px 0 6px;border-bottom:1px solid #E0E3EE;padding-bottom:4px}
.sub{color:#4E566E;margin-bottom:12px}table{width:100%;border-collapse:collapse}td{vertical-align:top;padding:4px 6px;border-bottom:1px solid #F0F2F7}
.t{width:90px;font-weight:700;white-space:nowrap}.m{color:#4E566E;font-size:11px}.n{font-size:11px;font-style:italic}
section{page-break-inside:avoid}footer{margin-top:24px;color:#5F6780;font-size:10px}
</style></head><body>
<h1>${e(L.title(trip.name))}</h1>
<div class="sub">${e([route, L.dates].filter(Boolean).join(' · '))}</div>
${dayBlocks}
${bookingRows ? `<h2>${e(L.bookingsTitle)}</h2><table>${bookingRows}</table>` : ''}
<footer>${e(L.footer)}<br>${e(L.generated)}</footer>
</body></html>`;
}

/**
 * CSV cell: quoted when needed, and neutralised against spreadsheet formula injection
 * (a cell starting with = + - @ tab or CR is prefixed with an apostrophe).
 */
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export interface CsvLabels {
  headers: string[];
  category: (c: string) => string;
  participant: (id: string | null) => string;
}

/** Expenses as CSV (UTF-8 with BOM so spreadsheets read accents correctly). Amounts in major units with a dot. */
export function expensesCsv(expenses: ExpenseWithShares[], tripCurrency: string, decimals: (c: string) => number, labels: CsvLabels): string {
  const amount = (minor: number, cur: string) => (minor / 10 ** decimals(cur)).toFixed(decimals(cur));
  const lines = [labels.headers.map(csvCell).join(',')];
  for (const x of expenses) {
    const shares = x.shares.map((s) => `${labels.participant(s.participantId)}: ${amount(s.shareMinor, x.currency)}`).join(' | ');
    lines.push(
      [
        x.date,
        x.description,
        labels.category(x.category),
        amount(x.amountMinor, x.currency),
        x.currency,
        x.currency === tripCurrency ? '' : String(x.rateToTrip),
        amount(x.tripAmountMinor, tripCurrency),
        tripCurrency,
        x.city,
        x.paymentMethod,
        labels.participant(x.paidByParticipantId),
        shares,
        x.notes,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** Safe file name from a trip name (no path characters, no personal data beyond the trip name). */
export function exportFileName(tripName: string, suffix: string, ext: 'pdf' | 'csv'): string {
  const base = tripName
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base || 'trip'}-${suffix}.${ext}`;
}
