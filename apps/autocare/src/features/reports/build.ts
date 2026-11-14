import type { TFunction } from 'i18next';

import { byCategory, inRange, toCostEntries, totalCostOfOwnership, totals, totalsByMonth } from '@/features/expenses/aggregate';
import type { Formatter } from '@/features/format/format';
import { computeConsumption, unitsInUse } from '@/features/fuel/consumption';
import { currenciesOf } from '@/features/money/money';
import { distanceBetween } from '@/features/odometer/mileage';
import type { DayKey, Expense, FuelRecord, MaintenanceRecord, TireRecord, Vehicle } from '@/types';
import { lastNMonths } from '@/utils/dates';

import { toCsv } from './csv';
import type { PdfBlock } from './pdf';

export type ReportKind = 'annual' | 'expenses' | 'consumption' | 'maintenance' | 'tco';
export const REPORT_KINDS: ReportKind[] = ['annual', 'expenses', 'consumption', 'maintenance', 'tco'];

export interface ReportInput {
  vehicle: Vehicle;
  readings: { day: DayKey; odometerKm: number }[];
  fuel: FuelRecord[];
  expenses: Expense[];
  maintenance: MaintenanceRecord[];
  tires: TireRecord[];
}

export interface ReportPeriod {
  from: DayKey;
  to: DayKey;
}

/** Report as PDF blocks — the same data feeds the CSV export below. */
export function buildReport(kind: ReportKind, input: ReportInput, period: ReportPeriod, t: TFunction, f: Formatter, generatedOn: DayKey): PdfBlock[] {
  const v = input.vehicle;
  const entries = inRange(toCostEntries(input), period.from, period.to);
  const blocks: PdfBlock[] = [
    { type: 'title', text: t(`reports.kinds.${kind}`) },
    { type: 'subtitle', text: `${v.name} — ${[v.make, v.model, v.year].filter(Boolean).join(' ')}${v.plate ? ` · ${v.plate}` : ''}` },
    { type: 'subtitle', text: t('reports.periodLine', { from: f.day(period.from), to: f.day(period.to), date: f.day(generatedOn) }) },
  ];

  const distance = distanceBetween(input.readings, period.from, period.to);
  const total = totals(entries);
  const summaryRows: string[][] = [
    [t('reports.totalSpend'), f.totals(total, v.currency)],
    [t('reports.distance'), distance === null ? t('reports.notEnoughData') : f.distance(distance)],
  ];
  if (distance && distance > 0) {
    const perKm = currenciesOf(total, v.currency).map((c) => f.costPerDistance((total[c] ?? 0) / distance, c));
    summaryRows.push([t('reports.costPerDistance', { unit: f.distanceUnit }), perKm.join(' + ') || '—']);
  }

  if (kind === 'annual' || kind === 'tco' || kind === 'expenses') {
    blocks.push({ type: 'heading', text: t('reports.summary') }, { type: 'table', columns: [t('reports.metric'), t('reports.value')], rows: summaryRows, widths: [1, 1.4] });
  }

  if (kind === 'tco') {
    const tco = totalCostOfOwnership(toCostEntries(input), { minor: v.purchasePriceMinor, currency: v.currency });
    blocks.push(
      { type: 'heading', text: t('reports.kinds.tco') },
      {
        type: 'table',
        columns: [t('reports.metric'), t('reports.value')],
        rows: [
          [t('vehicle.purchasePrice'), v.purchasePriceMinor ? f.money(v.purchasePriceMinor, v.currency) : '—'],
          [t('reports.runningCostsAllTime'), f.totals(totals(toCostEntries(input)), v.currency)],
          [t('reports.tcoTotal'), f.totals(tco, v.currency)],
        ],
        widths: [1, 1.4],
      },
      { type: 'text', text: t('reports.tcoNote') },
    );
  }

  if (kind === 'annual' || kind === 'expenses' || kind === 'tco') {
    for (const currency of currenciesOf(total, v.currency)) {
      const cats = byCategory(entries, currency);
      if (!cats.length) continue;
      blocks.push(
        { type: 'heading', text: `${t('reports.byCategory')} (${currency})` },
        { type: 'table', columns: [t('expenses.category'), t('reports.amount'), t('reports.share')], rows: cats.map((c) => [t(`expenseCategories.${c.category}`), f.money(c.minor, currency), f.percent(c.share)]), widths: [2, 1.2, 0.8], align: ['left', 'right', 'right'] },
      );
    }
    const months = monthsBetween(period.from, period.to);
    if (months.length <= 24) {
      blocks.push(
        { type: 'heading', text: t('reports.byMonth') },
        { type: 'table', columns: [t('reports.month'), t('reports.amount')], rows: totalsByMonth(entries, months).map((m) => [f.month(m.month, 'long'), f.totals(m.totals, v.currency)]), widths: [1, 1.4], align: ['left', 'right'] },
      );
    }
  }

  if (kind === 'annual' || kind === 'consumption') {
    const fills = input.fuel.filter((x) => x.day >= period.from && x.day <= period.to);
    blocks.push({ type: 'heading', text: t('reports.consumption') });
    const units = unitsInUse(fills);
    if (!units.length) blocks.push({ type: 'text', text: t('reports.noFuel') });
    for (const unit of units) {
      const c = computeConsumption(fills, unit);
      blocks.push({
        type: 'table',
        columns: [t('reports.metric'), t('reports.value')],
        rows: [
          [t('fuel.average'), f.consumption(c.averagePer100km, unit) ?? t('fuel.notReliable')],
          [t('fuel.segments'), String(c.segments.filter((s) => !s.suspicious).length)],
          [t('fuel.totalQuantity'), f.quantity(fills.filter((x) => x.quantityUnit === unit).reduce((s, x) => s + x.quantity, 0), unit)],
        ],
        widths: [1, 1.4],
      });
      if (kind === 'consumption' && c.segments.length) {
        blocks.push({
          type: 'table',
          columns: [t('fuel.from'), t('fuel.to'), t('reports.distance'), t('fuel.quantity'), t('fuel.consumption')],
          rows: c.segments.map((s) => [f.day(s.startDay), f.day(s.endDay), f.distance(s.distanceKm), f.quantity(s.quantity, unit), `${f.consumption(s.per100km, unit) ?? '—'}${s.suspicious ? ' *' : ''}`]),
          align: ['left', 'left', 'right', 'right', 'right'],
        });
        if (c.segments.some((s) => s.suspicious)) blocks.push({ type: 'text', text: t('fuel.suspiciousNote') });
      }
    }
  }

  if (kind === 'annual' || kind === 'maintenance') {
    const recs = input.maintenance.filter((m) => m.day >= period.from && m.day <= period.to);
    blocks.push({ type: 'heading', text: t('reports.maintenanceHistory') });
    if (!recs.length) blocks.push({ type: 'text', text: t('reports.noMaintenance') });
    else
      blocks.push({
        type: 'table',
        columns: [t('common.date'), t('maintenance.type'), t('common.odometer'), t('maintenance.provider'), t('maintenance.cost')],
        rows: recs.map((m) => [f.day(m.day), m.title ?? t(`maintenanceTypes.${m.type}`), m.odometerKm === null ? '—' : f.distance(m.odometerKm), m.provider ?? '—', m.costMinor === null ? '—' : f.money(m.costMinor, m.currency)]),
        widths: [1, 1.8, 1, 1.4, 1],
        align: ['left', 'left', 'right', 'left', 'right'],
      });
  }

  blocks.push({ type: 'spacer', size: 12 }, { type: 'text', text: t('reports.disclaimer') });
  return blocks;
}

function monthsBetween(from: DayKey, to: DayKey): string[] {
  const all = lastNMonths(to, 240);
  return all.filter((m) => m >= from.slice(0, 7));
}

export type CsvKind = 'costs' | 'fuel' | 'maintenance';

/** Raw data export (numbers unformatted, metric units + unit columns) for spreadsheets. */
export function buildCsv(kind: CsvKind, input: ReportInput, period: ReportPeriod, t: TFunction): string {
  const v = input.vehicle;
  if (kind === 'fuel') {
    const rows = input.fuel.filter((x) => x.day >= period.from && x.day <= period.to).sort((a, b) => (a.day < b.day ? -1 : 1));
    return toCsv(
      ['vehicle', 'date', 'odometer_km', 'quantity', 'quantity_unit', 'unit_price', 'total', 'currency', 'fuel_type', 'full', 'missed_previous', 'station', 'notes'],
      rows.map((x) => [v.name, x.day, x.odometerKm, x.quantity, x.quantityUnit, x.unitPrice, x.totalMinor / 100, x.currency, x.fuelType, x.isFull, x.missedPrevious, x.station, x.notes]),
    );
  }
  if (kind === 'maintenance') {
    const rows = input.maintenance.filter((x) => x.day >= period.from && x.day <= period.to).sort((a, b) => (a.day < b.day ? -1 : 1));
    return toCsv(
      ['vehicle', 'date', 'type', 'title', 'odometer_km', 'provider', 'cost', 'currency', 'parts', 'description', 'notes'],
      rows.map((x) => [v.name, x.day, t(`maintenanceTypes.${x.type}`), x.title, x.odometerKm, x.provider, x.costMinor === null ? null : x.costMinor / 100, x.currency, x.parts, x.description, x.notes]),
    );
  }
  const entries = inRange(toCostEntries(input), period.from, period.to).sort((a, b) => (a.day < b.day ? -1 : 1));
  return toCsv(['vehicle', 'date', 'category', 'source', 'amount', 'currency'], entries.map((e) => [v.name, e.day, t(`expenseCategories.${e.category}`), e.source, e.minor / 100, e.currency]));
}
