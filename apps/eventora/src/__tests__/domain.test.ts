import { EVENT_TEMPLATES, TASK_LIBRARY, TIMELINE_LIBRARY } from '@/content/templates';
import { INVITATION_TEMPLATES } from '@/content/invitationTemplates';
import { EVENT_TYPES } from '@/content/eventTypes';
import { canAddGuests, canAddTable, canCreateEvent, canExport, canUseTableShape, FREE_LIMITS } from '@/config/limits';
import { spendingEvolution, summarizeBudget, validateExpense } from '@/domain/budget';
import { detectDelimiter, importGuestsCsv, parseCsv, sanitizeCell, toCsv } from '@/domain/csv';
import { copyName, countActive, eventPhase, suggestedStatus, validateEvent } from '@/domain/events';
import { giftSummary, nextVendorStatus, validateGift, validateVendor, vendorTotals, websiteUrl } from '@/domain/gifts';
import { duplicateClusters, filterGuests, findDuplicates, headcountOf, partySize, rsvpStats, validateGuest } from '@/domain/guests';
import { newId } from '@/domain/ids';
import { convertExplicit, currencyDigits, formatMoney, parseAmount, sumByCurrency } from '@/domain/money';
import { DEFAULT_NOTIFICATION_SETTINGS, planNotifications } from '@/domain/reminders';
import { autoPlace, canSeat, seatingSummary, seatPositions, tableUsage, unassignedGuests } from '@/domain/seating';
import { bucketOf, groupByBucket, isOverdue, sortTasks, taskProgress } from '@/domain/tasks';
import { dueDateFor, parseClock, payloadFromEvent, planFromPayload, planFromTemplate, splitBudget } from '@/domain/templateApply';
import { findGaps, findOverlaps, moveItem, shiftAll, sortTimeline, spanLabel, toSpan } from '@/domain/timeline';
import {
  addDaysTo,
  crossesMidnight,
  daysBetween,
  eventEndUtc,
  formatHm,
  isValidDate,
  isValidTime,
  monthGrid,
  todayIn,
  validateWhen,
  zonedParts,
  zonedToUtc,
} from '@/domain/time';
import type { EventRecord, Expense, Gift, Guest, SeatingTable, Task, TimelineItem, Vendor } from '@/domain/types';

/* ------------------------------------------------------------- factories */

let seq = 0;
const guest = (over: Partial<Guest> = {}): Guest => ({
  id: `g${++seq}`,
  eventId: 'e1',
  groupId: null,
  firstName: 'Ana',
  lastName: `Guest${seq}`,
  phone: '',
  email: '',
  category: 'friend',
  plusOnes: 0,
  children: 0,
  isChild: false,
  dietary: '',
  notes: '',
  rsvpStatus: 'invited',
  rsvpRespondedAt: null,
  rsvpNote: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const event = (over: Partial<EventRecord> = {}): EventRecord => ({
  id: 'e1',
  name: 'Party',
  typeId: 'birthday',
  coverUri: null,
  description: '',
  startDate: '2027-06-12',
  startTime: '20:00',
  endDate: null,
  endTime: '02:00',
  timezone: 'Europe/Paris',
  startUtc: '2027-06-12T18:00:00.000Z',
  venue: '',
  address: '',
  expectedGuests: 50,
  budgetMinor: 500000,
  currency: 'EUR',
  notes: '',
  status: 'planning',
  theme: 'birthday',
  templateId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const expense = (over: Partial<Expense> = {}): Expense => ({
  id: `x${++seq}`,
  eventId: 'e1',
  category: 'venue',
  title: 'Hall',
  vendorId: null,
  estimatedMinor: 0,
  actualMinor: 0,
  currency: 'EUR',
  fxRate: null,
  dueDate: null,
  paymentDate: null,
  paymentStatus: 'unpaid',
  receiptUri: null,
  notes: '',
  createdAt: '2026-03-01T10:00:00.000Z',
  ...over,
});

const task = (over: Partial<Task> = {}): Task => ({
  id: `t${++seq}`,
  eventId: 'e1',
  title: 'Task',
  description: '',
  assignee: '',
  dueDate: null,
  priority: 'medium',
  category: 'other',
  status: 'todo',
  notes: '',
  vendorId: null,
  sortOrder: seq,
  completedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const item = (id: string, startMin: number, endMin: number, sortOrder = 0): TimelineItem => ({ id, eventId: 'e1', title: id, description: '', startMin, endMin, location: '', owner: '', notes: '', sortOrder });

const table = (id: string, seats: number, over: Partial<SeatingTable> = {}): SeatingTable => ({ id, eventId: 'e1', name: id, shape: 'round', seats, notes: '', sortOrder: 0, ...over });

/* ----------------------------------------------------------------- time */

describe('time zones and dates', () => {
  it('validates dates and times strictly', () => {
    expect(isValidDate('2027-02-29')).toBe(false);
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('2027-13-01')).toBe(false);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('7:00')).toBe(false);
  });

  it('converts wall-clock time in the event zone to UTC', () => {
    expect(zonedToUtc('2027-06-12', '20:00', 'Europe/Paris').toISOString()).toBe('2027-06-12T18:00:00.000Z');
    expect(zonedToUtc('2027-01-12', '20:00', 'Europe/Paris').toISOString()).toBe('2027-01-12T19:00:00.000Z');
    expect(zonedToUtc('2027-06-12', '20:00', 'America/New_York').toISOString()).toBe('2027-06-13T00:00:00.000Z');
    expect(zonedToUtc('2027-06-12', null, 'Asia/Tokyo').toISOString()).toBe('2027-06-11T15:00:00.000Z');
  });

  it('round-trips through zonedParts regardless of the device zone', () => {
    const at = zonedToUtc('2027-11-07', '09:30', 'America/Los_Angeles');
    expect(zonedParts(at, 'America/Los_Angeles')).toMatchObject({ date: '2027-11-07', time: '09:30' });
    expect(zonedParts(at, 'Europe/Madrid').date).toBe('2027-11-07');
  });

  it('handles DST gaps (non-existent local time) without throwing', () => {
    // Paris springs forward on 2027-03-28 at 02:00 → 03:00.
    const at = zonedToUtc('2027-03-28', '02:30', 'Europe/Paris');
    expect(at.toISOString()).toBe('2027-03-28T01:30:00.000Z');
    // Ambiguous fall-back time resolves to the first occurrence.
    expect(zonedToUtc('2027-10-31', '02:30', 'Europe/Paris').toISOString()).toBe('2027-10-31T00:30:00.000Z');
  });

  it('computes event ends across midnight and multi-day events', () => {
    const ev = { startDate: '2027-06-12', startTime: '20:00', endDate: null, endTime: '02:00', timezone: 'Europe/Paris' };
    expect(crossesMidnight(ev)).toBe(true);
    expect(eventEndUtc(ev).toISOString()).toBe('2027-06-13T00:00:00.000Z');
    expect(eventEndUtc({ ...ev, endTime: null }).toISOString()).toBe('2027-06-12T22:00:00.000Z');
    expect(crossesMidnight({ ...ev, endTime: '23:00' })).toBe(false);
    expect(crossesMidnight({ ...ev, endDate: '2027-06-14', endTime: '12:00' })).toBe(true);
  });

  it('knows "today" in the event zone', () => {
    const now = new Date('2027-06-12T23:30:00Z');
    expect(todayIn('Europe/Paris', now)).toBe('2027-06-13');
    expect(todayIn('America/New_York', now)).toBe('2027-06-12');
  });

  it('does calendar arithmetic without zone drift', () => {
    expect(addDaysTo('2027-03-27', 2)).toBe('2027-03-29');
    expect(daysBetween('2027-01-01', '2027-12-31')).toBe(364);
    expect(formatHm(1470)).toBe('00:30');
    const grid = monthGrid(2027, 2);
    expect(grid.length % 7).toBe(0);
    expect(grid.filter(Boolean)).toHaveLength(28);
    expect(grid[0]).toBe('2027-02-01'); // Monday
  });

  it('validates event timing', () => {
    expect(validateWhen({ startDate: '2027-06-12', startTime: '20:00', endDate: '2027-06-11', endTime: null, timezone: 'Europe/Paris' })).toEqual(['endBeforeStart']);
    expect(validateWhen({ startDate: 'x', startTime: '25:00', endDate: null, endTime: null, timezone: 'Mars/Base' })).toEqual(['startDate', 'startTime', 'timezone']);
  });
});

/* ---------------------------------------------------------------- money */

describe('money', () => {
  it('parses localized amounts', () => {
    expect(parseAmount('1 234,56', 'EUR')).toBe(123456);
    expect(parseAmount('1,234.56', 'USD')).toBe(123456);
    expect(parseAmount('1.234,5', 'EUR')).toBe(123450);
    expect(parseAmount('12,5', 'EUR')).toBe(1250);
    expect(parseAmount('1.234', 'EUR')).toBe(123400);
    expect(parseAmount('€ 99', 'EUR')).toBe(9900);
    expect(parseAmount('1500', 'JPY')).toBe(1500);
    expect(parseAmount('-5', 'EUR')).toBeNull();
    expect(parseAmount('abc', 'EUR')).toBeNull();
    expect(parseAmount('1.999', 'USD')).toBe(199900);
  });

  it('knows minor units per currency', () => {
    expect(currencyDigits('EUR')).toBe(2);
    expect(currencyDigits('JPY')).toBe(0);
    expect(formatMoney(123456, 'EUR', 'fr')).toMatch(/1\s?234,56\s?€/);
  });

  it('never sums different currencies', () => {
    expect(sumByCurrency([{ amountMinor: 100, currency: 'EUR' }, { amountMinor: 50, currency: 'MAD' }, { amountMinor: 25, currency: 'EUR' }])).toEqual({ EUR: 125, MAD: 50 });
  });

  it('converts only with an explicit rate', () => {
    expect(convertExplicit({ amountMinor: 1000, currency: 'MAD' }, 'EUR', null)).toBeNull();
    expect(convertExplicit({ amountMinor: 1000, currency: 'MAD' }, 'EUR', 0.092)).toEqual({ amountMinor: 92, currency: 'EUR' });
    expect(convertExplicit({ amountMinor: 1000, currency: 'EUR' }, 'EUR', null)).toEqual({ amountMinor: 1000, currency: 'EUR' });
  });
});

/* --------------------------------------------------------------- guests */

describe('guests and RSVP', () => {
  it('counts companions and children', () => {
    expect(partySize({ plusOnes: 1, children: 2 })).toBe(4);
    expect(headcountOf({ plusOnes: 1, children: 2, isChild: false })).toEqual({ adults: 2, children: 2, total: 4 });
    expect(headcountOf({ plusOnes: 0, children: 0, isChild: true })).toEqual({ adults: 0, children: 1, total: 1 });
  });

  it('computes RSVP statistics', () => {
    const list = [
      guest({ rsvpStatus: 'confirmed', plusOnes: 1 }),
      guest({ rsvpStatus: 'confirmed', children: 2 }),
      guest({ rsvpStatus: 'declined' }),
      guest({ rsvpStatus: 'maybe', plusOnes: 1 }),
      guest({ rsvpStatus: 'invited' }),
      guest({ rsvpStatus: 'not_invited' }),
    ];
    const s = rsvpStats(list);
    expect(s).toMatchObject({ entries: 6, contacted: 5, confirmed: 2, declined: 1, maybe: 1, pending: 2, notInvited: 1, companions: 3 });
    expect(s.expected).toEqual({ adults: 3, children: 2, total: 5 });
    expect(s.potential).toBe(7);
    expect(s.responseRate).toBeCloseTo(3 / 5);
  });

  it('searches accent-insensitively and by phone', () => {
    const list = [guest({ firstName: 'Hélène', lastName: 'Dupré', phone: '+33 6 12 34 56 78' }), guest({ firstName: 'Bob' })];
    expect(filterGuests(list, { query: 'helene' })).toHaveLength(1);
    expect(filterGuests(list, { query: '0612' })).toHaveLength(1);
    expect(filterGuests(list, { statuses: ['confirmed'] })).toHaveLength(0);
  });

  it('detects duplicates by email, phone and name', () => {
    const existing = [
      guest({ id: 'a', firstName: 'Marie', lastName: 'Curie', email: 'marie@ex.com' }),
      guest({ id: 'b', firstName: 'Paul', lastName: 'X', phone: '06 12 34 56 78' }),
    ];
    expect(findDuplicates({ firstName: 'M', lastName: 'C', email: 'MARIE@ex.com ', phone: '' }, existing)).toEqual([{ guestId: 'a', reason: 'email' }]);
    expect(findDuplicates({ firstName: 'Z', lastName: 'Z', email: '', phone: '+33612345678' }, existing)).toEqual([{ guestId: 'b', reason: 'phone' }]);
    expect(findDuplicates({ firstName: 'marie', lastName: 'CURIE', email: '', phone: '' }, existing)).toEqual([{ guestId: 'a', reason: 'name' }]);
    expect(findDuplicates({ id: 'a', firstName: 'Marie', lastName: 'Curie', email: '', phone: '' }, existing)).toEqual([]);
    expect(duplicateClusters([...existing, guest({ id: 'c', firstName: 'Marié', lastName: 'Curie' })])).toEqual([['a', 'c']]);
  });

  it('validates guests', () => {
    expect(validateGuest({ firstName: '', lastName: '', email: 'bad', plusOnes: -1, children: 0 })).toEqual(['name', 'email', 'plusOnes']);
    expect(validateGuest({ firstName: 'A', lastName: '', email: 'a@b.co', plusOnes: 2, children: 1 })).toEqual([]);
  });
});

/* ------------------------------------------------------------------ CSV */

describe('CSV', () => {
  it('parses quotes, escaped quotes, CRLF and semicolons', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(parseCsv('name,notes\r\n"Doe, John","said ""hi"""\r\n\r\n')).toEqual([['name', 'notes'], ['Doe, John', 'said "hi"']]);
    expect(parseCsv('a,b\n"multi\nline",x')).toEqual([['a', 'b'], ['multi\nline', 'x']]);
  });

  it('escapes and neutralises formulas on export', () => {
    expect(sanitizeCell('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(toCsv([['a,b', '=1+1', 'ok']])).toBe('﻿"a,b",\'=1+1,ok\r\n');
  });

  it('imports guests with FR headers and reports bad rows', () => {
    const csv = ['Prénom;Nom;Téléphone;Email;Famille;Accompagnants;Enfants;Statut', 'Léa;Martin;0601020304;lea@ex.fr;Martin;1;2;oui', ';;;;;;;', 'Tom;;;bad-email;;x;0;', 'Zoé;Roux;;;;0;0;peut-être', 'Ana;Lima;;;;0;0;whatever'].join('\n');
    const r = importGuestsCsv(csv);
    expect(r.unrecognized).toBe(false);
    expect(r.guests.map((g) => g.guest.firstName)).toEqual(['Léa', 'Zoé', 'Ana']);
    expect(r.guests[0]).toMatchObject({ groupName: 'Martin', guest: { plusOnes: 1, children: 2, rsvpStatus: 'confirmed', email: 'lea@ex.fr' } });
    expect(r.guests[1]?.guest.rsvpStatus).toBe('maybe');
    expect(r.guests[2]?.guest.rsvpStatus).toBe('not_invited');
    expect(r.issues).toEqual([
      { row: 4, code: 'invalidCount' },
      { row: 6, code: 'unknownRsvp' },
    ]);
  });

  it('splits a full-name column and flags unknown files', () => {
    expect(importGuestsCsv('Name,Email\nJohn Ronald Smith,j@x.io').guests[0]?.guest).toMatchObject({ firstName: 'John', lastName: 'Ronald Smith' });
    expect(importGuestsCsv('foo,bar\n1,2').unrecognized).toBe(true);
    expect(importGuestsCsv('').unrecognized).toBe(true);
  });

  it('keeps rows with invalid e-mail but drops the e-mail', () => {
    const r = importGuestsCsv('first name,email\nAnn,not-an-email');
    expect(r.guests[0]?.guest.email).toBe('');
    expect(r.issues).toEqual([{ row: 2, code: 'invalidEmail' }]);
  });
});

/* --------------------------------------------------------------- budget */

describe('budget', () => {
  it('summarises in the event currency and isolates unconverted amounts', () => {
    const s = summarizeBudget({
      currency: 'EUR',
      initialMinor: 100000,
      envelopes: [{ id: 'b1', eventId: 'e1', category: 'venue', plannedMinor: 40000 }],
      expenses: [
        expense({ category: 'venue', estimatedMinor: 30000, actualMinor: 32000, paymentStatus: 'paid' }),
        expense({ category: 'catering', estimatedMinor: 50000, paymentStatus: 'unpaid' }),
        expense({ category: 'music', estimatedMinor: 100000, actualMinor: 100000, currency: 'MAD', paymentStatus: 'paid', fxRate: 0.09 }),
        expense({ category: 'flowers', estimatedMinor: 20000, currency: 'USD', paymentStatus: 'unpaid' }),
      ],
    });
    expect(s.estimatedMinor).toBe(30000 + 50000 + 9000);
    expect(s.spentMinor).toBe(32000 + 9000);
    expect(s.committedMinor).toBe(32000 + 50000 + 9000);
    expect(s.remainingMinor).toBe(100000 - 91000);
    expect(s.unconverted).toEqual({ USD: 20000 });
    expect(s.convertedCount).toBe(1);
    expect(s.overBudget).toBe(false);
    expect(s.byCategory.find((l) => l.category === 'venue')).toMatchObject({ plannedMinor: 40000, spentMinor: 32000 });
    expect(s.byCategory.some((l) => l.category === 'flowers')).toBe(false);
  });

  it('flags over-budget and builds the spending curve', () => {
    const list = [
      expense({ actualMinor: 60000, paymentStatus: 'paid', paymentDate: '2027-02-10' }),
      expense({ actualMinor: 50000, paymentStatus: 'deposit', paymentDate: '2027-01-05' }),
      expense({ actualMinor: 999, paymentStatus: 'unpaid' }),
    ];
    expect(summarizeBudget({ currency: 'EUR', initialMinor: 100000, envelopes: [], expenses: list }).overBudget).toBe(true);
    expect(spendingEvolution(list, 'EUR')).toEqual([
      { month: '2027-01', monthMinor: 50000, cumulativeMinor: 50000 },
      { month: '2027-02', monthMinor: 60000, cumulativeMinor: 110000 },
    ]);
  });

  it('validates expenses', () => {
    expect(validateExpense({ title: '', estimatedMinor: -1, actualMinor: 0, currency: 'eur', fxRate: null }, 'EUR')).toEqual(['title', 'amount', 'currency']);
    expect(validateExpense({ title: 'x', estimatedMinor: 0, actualMinor: 0, currency: 'USD', fxRate: -2 }, 'EUR')).toEqual(['fxRate']);
  });
});

/* ---------------------------------------------------------------- tasks */

describe('tasks', () => {
  const today = '2027-05-10';
  it('detects overdue tasks and progress', () => {
    expect(isOverdue(task({ dueDate: '2027-05-09' }), today)).toBe(true);
    expect(isOverdue(task({ dueDate: '2027-05-09', status: 'completed' }), today)).toBe(false);
    expect(taskProgress([task({ status: 'completed' }), task(), task({ status: 'cancelled' })])).toEqual({ done: 1, total: 2, ratio: 0.5 });
    expect(taskProgress([])).toEqual({ done: 0, total: 0, ratio: 0 });
  });

  it('buckets and sorts', () => {
    const list = [task({ id: 'late', dueDate: '2027-05-01' }), task({ id: 'now', dueDate: today }), task({ id: 'soon', dueDate: '2027-05-15' }), task({ id: 'far', dueDate: '2027-08-01' }), task({ id: 'none' }), task({ id: 'done', status: 'completed', dueDate: '2027-04-01' })];
    const b = groupByBucket(list, today);
    expect(Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.map((x) => x.id)]))).toEqual({ overdue: ['late'], today: ['now'], week: ['soon'], later: ['far'], undated: ['none'], done: ['done'] });
    expect(sortTasks(list).map((x) => x.id)[0]).toBe('late');
    expect(bucketOf(task({ dueDate: '2027-05-17' }), today)).toBe('week');
  });
});

/* ------------------------------------------------------------- timeline */

describe('timeline', () => {
  it('handles activities after midnight', () => {
    expect(toSpan('23:30', '00:30')).toEqual({ startMin: 1410, endMin: 1470 });
    expect(toSpan('01:00', '02:00', true)).toEqual({ startMin: 1500, endMin: 1560 });
    expect(spanLabel({ startMin: 1410, endMin: 1470 })).toEqual({ start: '23:30', end: '00:30', startNextDay: false, endNextDay: true });
  });

  it('detects overlaps, including across midnight, but not touching ends', () => {
    const items = [item('dinner', 1200, 1320), item('speech', 1300, 1330), item('dance', 1330, 1500), item('late', 1440, 1470)];
    expect(findOverlaps(items)).toEqual([
      { a: 'dinner', b: 'speech', minutes: 20 },
      { a: 'dance', b: 'late', minutes: 30 },
    ]);
    expect(findOverlaps([item('a', 0, 60), item('b', 60, 90)])).toEqual([]);
  });

  it('reorders by swapping slots and shifts the programme', () => {
    const items = [item('a', 600, 660, 0), item('b', 660, 690, 1), item('c', 720, 780, 2)];
    const moved = moveItem(items, 'a', 1);
    expect(moved.map((x) => [x.id, x.startMin, x.endMin])).toEqual([['b', 600, 630], ['a', 630, 690], ['c', 720, 780]]);
    expect(moveItem(items, 'a', -1).map((x) => x.id)).toEqual(['a', 'b', 'c']);
    expect(shiftAll(items, 30).map((x) => x.startMin)).toEqual([630, 690, 750]);
    expect(findGaps(items)).toEqual([{ fromMin: 690, toMin: 720 }]);
    expect(sortTimeline([item('z', 10, 20, 1), item('y', 10, 20, 0)]).map((x) => x.id)).toEqual(['y', 'z']);
  });
});

/* -------------------------------------------------------------- seating */

describe('seating', () => {
  const g1 = guest({ id: 's1', plusOnes: 1, groupId: 'fam', rsvpStatus: 'confirmed' });
  const g2 = guest({ id: 's2', children: 2, groupId: 'fam', rsvpStatus: 'confirmed' });
  const g3 = guest({ id: 's3', rsvpStatus: 'maybe' });
  const g4 = guest({ id: 's4', rsvpStatus: 'declined' });
  const guests = [g1, g2, g3, g4];

  it('counts seats with companions and detects overloaded tables', () => {
    const usage = tableUsage([table('t1', 4)], [{ id: 'a1', tableId: 't1', guestId: 's1' }, { id: 'a2', tableId: 't1', guestId: 's2' }], guests);
    expect(usage[0]).toMatchObject({ used: 5, free: 0, overloaded: true });
    expect(canSeat(g3, table('t1', 4), usage)).toEqual({ ok: false, reason: 'full', free: 0, needed: 1 });
    expect(canSeat(g1, table('t1', 4), usage)).toEqual({ ok: false, reason: 'full', free: 1, needed: 2 });
  });

  it('lists unassigned guests (declined excluded) and summarises', () => {
    expect(unassignedGuests(guests, []).map((g) => g.id)).toEqual(['s1', 's2', 's3']);
    expect(seatingSummary([table('t1', 10)], [{ id: 'a', tableId: 't1', guestId: 's3' }], guests)).toEqual({ tables: 1, capacity: 10, seated: 1, unseated: 5, overloadedTables: 0 });
  });

  it('auto-places families together', () => {
    const pairs = autoPlace([table('small', 3), table('big', 6)], [], guests);
    expect(pairs.filter((p) => p.guestId === 's1' || p.guestId === 's2').every((p) => p.tableId === 'big')).toBe(true);
    // Best fit: the single guest takes the last free seat of the big table.
    expect(pairs.find((p) => p.guestId === 's3')?.tableId).toBe('big');
    expect(pairs.some((p) => p.guestId === 's4')).toBe(false);
  });

  it('lays out seats per shape', () => {
    expect(seatPositions('round', 8)).toHaveLength(8);
    expect(seatPositions('rect', 5).filter((p) => p.y < 0.5)).toHaveLength(3);
    expect(seatPositions('head', 4).every((p) => p.y > 0.5)).toBe(true);
  });
});

/* ---------------------------------------------------- vendors and gifts */

describe('vendors and gifts', () => {
  const v = (over: Partial<Vendor>): Vendor => ({ id: newId(), eventId: 'e1', name: 'V', category: 'dj', contactName: '', phone: '', email: '', address: '', website: '', quote: '', amountMinor: 0, currency: 'EUR', status: 'to_contact', meetingAt: null, notes: '', createdAt: '', ...over });
  it('tracks the vendor pipeline per currency', () => {
    const t = vendorTotals([v({ status: 'contracted', amountMinor: 1000 }), v({ status: 'selected', amountMinor: 500, currency: 'MAD' }), v({ status: 'quoted', amountMinor: 300 })]);
    expect(t.committed).toEqual({ EUR: 1000, MAD: 500 });
    expect(t.quoted).toEqual({ EUR: 300 });
    expect(nextVendorStatus('quoted')).toBe('selected');
    expect(nextVendorStatus('contracted')).toBeNull();
    expect(validateVendor({ name: '', email: 'x', website: 'not a site', amountMinor: 0 })).toEqual(['name', 'email', 'website']);
    expect(websiteUrl('example.com')).toBe('https://example.com');
    expect(websiteUrl('javascript:alert(1)')).toBeNull();
  });

  it('summarises gifts and contributions', () => {
    const gift = (over: Partial<Gift>): Gift => ({ id: newId(), eventId: 'e1', guestId: null, kind: 'gift', contributor: 'X', description: 'Vase', amountMinor: 0, currency: 'EUR', receivedDate: null, thanked: false, thankedAt: null, notes: '', createdAt: '', ...over });
    const s = giftSummary([gift({}), gift({ kind: 'contribution', amountMinor: 5000, thanked: true }), gift({ kind: 'contribution', amountMinor: 2000, currency: 'USD' })]);
    expect(s).toEqual({ gifts: 1, contributions: 2, contributionTotals: { EUR: 5000, USD: 2000 }, toThank: 2, thanked: 1 });
    expect(validateGift({ kind: 'contribution', description: '', contributor: '', guestId: null, amountMinor: 0, currency: 'EUR' })).toEqual(['contributor', 'amount']);
  });
});

/* --------------------------------------------------------------- events */

describe('events', () => {
  it('counts active events and suggests status from time', () => {
    expect(countActive([event(), event({ status: 'completed' }), event({ status: 'cancelled' }), event({ status: 'draft' })])).toBe(2);
    const e = event();
    expect(eventPhase(e, new Date('2027-06-12T10:00:00Z'))).toBe('today');
    expect(eventPhase(e, new Date('2027-06-12T23:00:00Z'))).toBe('ongoing');
    expect(suggestedStatus(e, new Date('2027-06-13T01:00:00Z'))).toBe('completed');
    expect(suggestedStatus(event({ status: 'cancelled' }), new Date('2028-01-01'))).toBeNull();
  });

  it('validates and names copies', () => {
    expect(validateEvent({ ...event(), name: ' ', currency: 'eu', expectedGuests: -3 })).toEqual(['name', 'expectedGuests', 'currency']);
    expect(copyName('Gala', ['Gala (copy)'], 'copy')).toBe('Gala (copy 2)');
  });
});

/* ------------------------------------------------------------ templates */

describe('content and templates', () => {
  it('ships at least 20 planning templates and 20 invitation designs', () => {
    expect(EVENT_TEMPLATES.length).toBeGreaterThanOrEqual(20);
    expect(INVITATION_TEMPLATES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(EVENT_TEMPLATES.map((t) => t.id)).size).toBe(EVENT_TEMPLATES.length);
    expect(new Set(INVITATION_TEMPLATES.map((t) => t.id)).size).toBe(INVITATION_TEMPLATES.length);
    expect(EVENT_TYPES).toHaveLength(14);
  });

  it('has coherent templates (budget split = 100 %, valid times, known keys)', () => {
    for (const t of EVENT_TEMPLATES) {
      expect(Object.values(t.budgetSplit).reduce((a, b) => a + (b ?? 0), 0)).toBe(100);
      for (const key of t.tasks) expect(TASK_LIBRARY[key]).toBeDefined();
      for (const [key, start, duration] of t.timeline) {
        expect(TIMELINE_LIBRARY).toContain(key);
        expect(parseClock(start)).toBeGreaterThanOrEqual(0);
        expect(duration).toBeGreaterThan(0);
      }
      expect(findOverlaps(t.timeline.map(([k, s, d], i) => item(`${k}${i}`, parseClock(s), parseClock(s) + d, i)))).toEqual([]);
    }
  });

  it('plans tasks, programme and envelopes from a template', () => {
    const wedding = EVENT_TEMPLATES[0]!;
    const plan = planFromTemplate(wedding, { eventDate: '2027-09-18', today: '2027-06-01', budgetMinor: 2000000, t: (k) => `T(${k})` });
    expect(plan.tasks).toHaveLength(wedding.tasks.length);
    expect(plan.tasks[0]).toMatchObject({ title: 'T(taskLibrary.setBudget)', dueDate: '2027-06-01' }); // 200 days before is past → today
    expect(plan.tasks.find((x) => x.title.endsWith('thankYouNotes)'))?.dueDate).toBe('2027-09-25');
    expect(plan.envelopes.reduce((n, e) => n + e.plannedMinor, 0)).toBe(2000000);
    expect(plan.timeline.at(-1)).toMatchObject({ startMin: 1540, endMin: 1560 });
  });

  it('splits budgets exactly and computes due dates', () => {
    expect(splitBudget(1001, { venue: 50, catering: 50 }).reduce((n, l) => n + l.plannedMinor, 0)).toBe(1001);
    expect(dueDateFor('2027-06-30', 10, '2027-06-01')).toBe('2027-06-20');
    expect(dueDateFor('2027-06-30', 60, '2027-06-01')).toBe('2027-06-01');
  });

  it('round-trips a custom template', () => {
    const payload = payloadFromEvent({
      typeId: 'birthday', expectedGuests: 10, startTime: '19:00', endTime: null, currency: 'EUR', eventDate: '2027-06-12', budgetMinor: 1000,
      envelopes: [{ category: 'venue', plannedMinor: 750 }, { category: 'catering', plannedMinor: 250 }],
      tasks: [task({ title: 'Cake', dueDate: '2027-06-05' }), task({ title: 'Gone', status: 'cancelled' })],
      timeline: [item('Dinner', 1200, 1260)],
    });
    expect(payload.budgetSplit).toEqual({ venue: 75, catering: 25 });
    expect(payload.tasks).toEqual([{ title: 'Cake', category: 'other', priority: 'medium', daysBefore: 7 }]);
    const plan = planFromPayload(payload, { eventDate: '2027-12-24', today: '2027-01-01', budgetMinor: 4000 });
    expect(plan.tasks[0]?.dueDate).toBe('2027-12-17');
    expect(plan.envelopes).toEqual([{ category: 'venue', plannedMinor: 3000 }, { category: 'catering', plannedMinor: 1000 }]);
  });
});

/* ------------------------------------------------------- notifications */

describe('notification planner', () => {
  const base = {
    now: new Date(2027, 4, 1, 8, 0),
    masterEnabled: true,
    showEventNames: false,
    settings: DEFAULT_NOTIFICATION_SETTINGS,
    events: [event({ startDate: '2027-06-12' })],
    tasks: [task({ id: 'tk', dueDate: '2027-05-20', priority: 'high' }), task({ id: 'old', dueDate: '2027-04-01' }), task({ id: 'done', dueDate: '2027-05-20', status: 'completed' })],
    expenses: [expense({ id: 'pay', dueDate: '2027-05-15' }), expense({ id: 'paid', dueDate: '2027-05-15', paymentStatus: 'paid' })],
    vendors: [] as Vendor[],
    guests: [guest({ rsvpStatus: 'invited' }), guest({ rsvpStatus: 'confirmed', firstName: 'Secret' })],
  };

  it('plans future reminders only, sorted, without personal data', () => {
    const planned = planNotifications(base);
    expect(planned.map((p) => p.id)).toEqual(['eventora-pay-pay', 'eventora-soon-tk', 'eventora-task-tk', 'eventora-rsvp-e1', 'eventora-event-e1']);
    expect(planned.find((p) => p.kind === 'rsvp_followup')?.params).toEqual({ event: '', count: 1 });
    expect(JSON.stringify(planned)).not.toMatch(/Secret|Party/);
    expect(planned[0]?.fireAt).toEqual(new Date(2027, 4, 13, 9, 0));
  });

  it('respects the master switch, per-kind settings and inactive events', () => {
    expect(planNotifications({ ...base, masterEnabled: false })).toEqual([]);
    const off = { ...DEFAULT_NOTIFICATION_SETTINGS, task_due: { ...DEFAULT_NOTIFICATION_SETTINGS.task_due, enabled: false } };
    expect(planNotifications({ ...base, settings: off }).some((p) => p.kind === 'task_due')).toBe(false);
    expect(planNotifications({ ...base, events: [event({ status: 'cancelled' })] })).toEqual([]);
  });

  it('includes the event name only when opted in', () => {
    const named = planNotifications({ ...base, showEventNames: true });
    expect(named[0]).toMatchObject({ titleKey: 'notifications.paymentDue.titleNamed', params: { event: 'Party' } });
  });
});

/* --------------------------------------------------------------- limits */

describe('free plan limits', () => {
  it('limits active events, guests, tables, shapes and exports', () => {
    expect(canCreateEvent(false, FREE_LIMITS.activeEvents)).toEqual({ allowed: false, feature: 'unlimitedEvents', limit: 2 });
    expect(canCreateEvent(true, 99).allowed).toBe(true);
    expect(canAddGuests(false, 149, 1).allowed).toBe(true);
    expect(canAddGuests(false, 149, 2).allowed).toBe(false);
    expect(canAddTable(false, 6).allowed).toBe(false);
    expect(canUseTableShape(false, 'head')).toBe(false);
    expect(canExport(false, 'json')).toBe(true);
    expect(canExport(false, 'pdf')).toBe(false);
  });
});
