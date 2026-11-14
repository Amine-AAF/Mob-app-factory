import type { TFunction } from 'i18next';

import { currencyDecimals } from '@/constants/currencies';
import { repos } from '@/database';
import { fmt } from '@/i18n';
import { exportExpensesCsv, exportItineraryPdf, type ExportResult } from '@/services/export';
import type { Id } from '@/types/models';
import { clock } from '@/utils/clock';
import { dayNumber } from '@/utils/dates';

import { exportFileName, expensesCsv, itineraryHtml } from './builders';

/** Premium: the itinerary (days, activities, bookings) as a PDF, shared from the phone. */
export async function exportTripPdf(tripId: Id, t: TFunction, lang: string): Promise<ExportResult> {
  const r = repos();
  const trip = await r.trips.get(tripId);
  if (!trip) return 'failed';
  const [days, bookings] = await Promise.all([r.itinerary.listDays(tripId), r.bookings.list(tripId)]);
  const dates = trip.startDate && trip.endDate ? t('common.dateRange', { start: fmt.date(trip.startDate), end: fmt.date(trip.endDate) }) : '';
  const html = itineraryHtml({
    trip,
    days,
    bookings,
    lang,
    dayNumber: (d) => dayNumber(trip.startDate, trip.endDate, d),
    cityOf: (destId) => trip.destinations.find((x) => x.id === destId)?.city ?? null,
    labels: {
      title: (name) => name,
      dates,
      day: (n, date) => [n ? t('itinerary.dayNumber', { number: n }) : null, fmt.date(date, { weekday: 'long', day: 'numeric', month: 'long' })].filter(Boolean).join(' · '),
      anytime: t('itinerary.anytime'),
      category: (c) => t(`enums.activityCategory.${c}`),
      bookingsTitle: t('tripDetail.tabs.bookings'),
      bookingType: (x) => t(`enums.bookingType.${x}`),
      reference: t('booking.reference'),
      noActivities: t('itinerary.noActivities'),
      footer: t('export.footer'),
      generated: t('export.generated', { date: fmt.date(clock.today()) }),
    },
  });
  return exportItineraryPdf(html, exportFileName(trip.name, 'itinerary', 'pdf'), t('export.shareTitle'));
}

/** Premium: all expenses of a trip as CSV (amounts, currencies, rates, shares). */
export async function exportTripCsv(tripId: Id, t: TFunction): Promise<ExportResult> {
  const r = repos();
  const trip = await r.trips.get(tripId);
  if (!trip) return 'failed';
  const expenses = await r.expenses.list(tripId, { sort: 'date_asc' });
  const name = (pid: string | null) => trip.participants.find((p) => p.id === pid)?.name ?? '';
  const csv = expensesCsv(expenses, trip.currency, currencyDecimals, {
    headers: [
      t('export.csv.date'),
      t('export.csv.description'),
      t('export.csv.category'),
      t('export.csv.amount'),
      t('export.csv.currency'),
      t('export.csv.rate'),
      t('export.csv.tripAmount'),
      t('export.csv.tripCurrency'),
      t('export.csv.city'),
      t('export.csv.payment'),
      t('export.csv.paidBy'),
      t('export.csv.shares'),
      t('export.csv.notes'),
    ],
    category: (c) => t(`enums.budgetCategory.${c}`),
    participant: name,
  });
  return exportExpensesCsv(csv, exportFileName(trip.name, 'expenses', 'csv'), t('export.shareTitle'));
}
