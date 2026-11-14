import type { EventSnapshot } from '@/database';
import { toCsv } from '@/domain/csv';
import { fullName, partySize } from '@/domain/guests';
import { currencyDigits, toMajor } from '@/domain/money';
import { sortTimeline, spanLabel } from '@/domain/timeline';

import type { ReportContext } from './html';

/** Spreadsheet exports. Amounts are plain decimal numbers with their currency column. */
export type CsvKind = 'guests' | 'expenses' | 'vendors' | 'timeline' | 'gifts' | 'tasks' | 'seating';

const amount = (minor: number, currency: string) => toMajor(minor, currency).toFixed(currencyDigits(currency));

export function buildCsv(kind: CsvKind, snap: EventSnapshot, ctx: Pick<ReportContext, 't'>, opts: { includeContacts?: boolean } = {}): string {
  const t = ctx.t;
  const contacts = opts.includeContacts ?? false;
  const groups = new Map(snap.groups.map((g) => [g.id, g.name]));
  const guestNames = new Map(snap.guests.map((g) => [g.id, fullName(g)]));
  const vendorNames = new Map(snap.vendors.map((v) => [v.id, v.name]));
  switch (kind) {
    case 'guests':
      return toCsv([
        ['first name', 'last name', 'group', 'category', 'rsvp', 'responded on', 'plus ones', 'children', 'party size', ...(contacts ? ['phone', 'email', 'dietary', 'notes'] : [])],
        ...snap.guests.map((g) => [
          g.firstName, g.lastName, g.groupId ? (groups.get(g.groupId) ?? '') : '', g.category, g.rsvpStatus, g.rsvpRespondedAt ?? '', g.plusOnes, g.children, partySize(g),
          ...(contacts ? [g.phone, g.email, g.dietary, g.notes] : []),
        ]),
      ]);
    case 'expenses':
      return toCsv([
        [t('expense.title'), t('budget.category'), t('expense.vendor'), t('expense.status'), t('expense.estimated'), t('expense.actual'), t('expense.currency'), t('expense.fxRate'), t('expense.due'), t('expense.paidOn')],
        ...snap.expenses.map((x) => [x.title, x.category, x.vendorId ? (vendorNames.get(x.vendorId) ?? '') : '', x.paymentStatus, amount(x.estimatedMinor, x.currency), amount(x.actualMinor, x.currency), x.currency, x.fxRate ?? '', x.dueDate ?? '', x.paymentDate ?? '']),
      ]);
    case 'vendors':
      return toCsv([
        [t('vendor.name'), t('vendor.category'), t('vendor.status'), t('vendor.amount'), t('expense.currency'), ...(contacts ? [t('vendor.contact'), t('vendor.phone'), t('vendor.email'), t('vendor.website')] : [])],
        ...snap.vendors.map((v) => [v.name, v.category, v.status, amount(v.amountMinor, v.currency), v.currency, ...(contacts ? [v.contactName, v.phone, v.email, v.website] : [])]),
      ]);
    case 'timeline':
      return toCsv([
        [t('timeline.start'), t('timeline.end'), t('timeline.activity'), t('timeline.location'), t('timeline.owner'), t('timeline.description')],
        ...sortTimeline(snap.timeline).map((x) => {
          const s = spanLabel(x);
          return [`${s.start}${s.startNextDay ? ' (+1)' : ''}`, `${s.end}${s.endNextDay ? ' (+1)' : ''}`, x.title, x.location, x.owner, x.description];
        }),
      ]);
    case 'gifts':
      return toCsv([
        [t('gift.from'), t('gift.kind'), t('gift.description'), t('gift.amount'), t('expense.currency'), t('gift.received'), t('gift.thanked')],
        ...snap.gifts.map((g) => [g.guestId ? (guestNames.get(g.guestId) ?? g.contributor) : g.contributor, g.kind, g.description, g.kind === 'contribution' ? amount(g.amountMinor, g.currency) : '', g.kind === 'contribution' ? g.currency : '', g.receivedDate ?? '', g.thanked ? 'yes' : 'no']),
      ]);
    case 'tasks':
      return toCsv([
        [t('task.title'), t('task.status'), t('task.priority'), t('task.category'), t('task.due'), t('task.assignee'), t('task.description')],
        ...snap.tasks.map((x) => [x.title, x.status, x.priority, x.category, x.dueDate ?? '', x.assignee, x.description]),
      ]);
    case 'seating': {
      const tables = new Map(snap.tables.map((x) => [x.id, x.name]));
      return toCsv([
        [t('seating.table'), t('guest.name'), t('guest.party')],
        ...snap.assignments.map((a) => {
          const g = snap.guests.find((x) => x.id === a.guestId);
          return [tables.get(a.tableId) ?? '', g ? fullName(g) : '', g ? partySize(g) : ''];
        }),
      ]);
    }
  }
}
