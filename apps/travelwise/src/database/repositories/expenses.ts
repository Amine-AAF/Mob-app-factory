import { placeholders, type SqlDatabase } from '@factory/storage';

import { isCurrencyCode } from '@/constants/currencies';
import { BUDGET_CATEGORIES, SPLIT_MODES, type BudgetCategory, type SplitMode } from '@/constants/domain';
import { splitEqually, validateCustomShares, type SplitError } from '@/features/shared-expenses/split';
import type { Expense, ExpenseShare, Id, LocalDate } from '@/types/models';
import { clock } from '@/utils/clock';
import { isValidDate } from '@/utils/dates';
import { createId } from '@/utils/ids';
import { convertMinor } from '@/utils/money';

export type ExpenseValidationCode =
  | 'invalid_amount'
  | 'invalid_currency'
  | 'invalid_rate'
  | 'invalid_date'
  | 'invalid_category'
  | 'invalid_split'
  | 'payer_required'
  | 'unknown_participant'
  | 'looks_like_card_number'
  | 'too_long'
  | 'trip_not_found'
  | 'not_found'
  | SplitError;

export class ExpenseValidationError extends Error {
  constructor(
    public readonly code: ExpenseValidationCode,
    public readonly field?: string,
  ) {
    super(`Invalid expense: ${code}${field ? ` (${field})` : ''}`);
    this.name = 'ExpenseValidationError';
  }
}

interface ExpenseRow {
  id: string;
  trip_id: string;
  amount_minor: number;
  currency: string;
  trip_amount_minor: number;
  rate_to_trip: number;
  category: string;
  date: string;
  description: string;
  city: string;
  payment_method: string;
  notes: string;
  paid_by_participant_id: string | null;
  split_mode: string;
  created_at: string;
  updated_at: string;
}

const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  tripId: r.trip_id,
  amountMinor: r.amount_minor,
  currency: r.currency,
  tripAmountMinor: r.trip_amount_minor,
  rateToTrip: r.rate_to_trip,
  category: r.category as BudgetCategory,
  date: r.date,
  description: r.description,
  city: r.city,
  paymentMethod: r.payment_method,
  notes: r.notes,
  paidByParticipantId: r.paid_by_participant_id,
  splitMode: r.split_mode as SplitMode,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface ExpenseInput {
  amountMinor: number;
  currency: string;
  /** 1 expense currency = rateToTrip trip currency. Ignored (=1) when currencies match. */
  rateToTrip?: number;
  category: BudgetCategory;
  date: LocalDate;
  description?: string;
  city?: string;
  /** Free label ("Card", "Cash"…). Never a card number. */
  paymentMethod?: string;
  notes?: string;
  paidBy?: Id | null;
  splitMode?: SplitMode;
  /** Participants sharing the expense (equal split) or their custom shares in minor units. */
  sharedWith?: Id[];
  customShares?: Record<Id, number>;
}

export interface ExpenseWithShares extends Expense {
  shares: ExpenseShare[];
}

export type ExpenseSort = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export interface ExpenseFilter {
  category?: BudgetCategory | null;
  paidBy?: Id | null;
  from?: LocalDate | null;
  to?: LocalDate | null;
  search?: string | null;
  sort?: ExpenseSort;
}

const CARD_LIKE = /(\d[ -]?){12,19}/;

/** Validates, converts to the trip currency and computes shares. */
export function prepareExpense(input: ExpenseInput, tripCurrency: string, participantIds: Id[]) {
  if (!Number.isInteger(input.amountMinor) || input.amountMinor < 0) throw new ExpenseValidationError('invalid_amount', 'amount');
  if (!isCurrencyCode(input.currency)) throw new ExpenseValidationError('invalid_currency', 'currency');
  if (!isValidDate(input.date)) throw new ExpenseValidationError('invalid_date', 'date');
  if (!BUDGET_CATEGORIES.includes(input.category)) throw new ExpenseValidationError('invalid_category', 'category');
  const splitMode = input.splitMode ?? 'none';
  if (!SPLIT_MODES.includes(splitMode)) throw new ExpenseValidationError('invalid_split', 'split');
  const same = input.currency === tripCurrency;
  const rate = same ? 1 : (input.rateToTrip ?? NaN);
  if (!Number.isFinite(rate) || rate <= 0) throw new ExpenseValidationError('invalid_rate', 'rate');
  const paymentMethod = input.paymentMethod?.trim() ?? '';
  if (CARD_LIKE.test(paymentMethod) || CARD_LIKE.test(input.notes ?? '')) throw new ExpenseValidationError('looks_like_card_number', 'paymentMethod');
  const description = input.description?.trim() ?? '';
  if (description.length > 200 || paymentMethod.length > 60) throw new ExpenseValidationError('too_long', 'description');
  const known = new Set(participantIds);
  const paidBy = input.paidBy ?? null;
  if (paidBy && !known.has(paidBy)) throw new ExpenseValidationError('unknown_participant', 'paidBy');

  let shares = new Map<Id, number>();
  if (splitMode !== 'none') {
    if (!paidBy) throw new ExpenseValidationError('payer_required', 'paidBy');
    if (splitMode === 'equal') {
      const ids = (input.sharedWith ?? participantIds).filter((id, i, arr) => arr.indexOf(id) === i);
      if (!ids.length) throw new ExpenseValidationError('no_participants', 'split');
      if (ids.some((id) => !known.has(id))) throw new ExpenseValidationError('unknown_participant', 'split');
      shares = splitEqually(input.amountMinor, ids);
    } else {
      shares = new Map(Object.entries(input.customShares ?? {}).filter(([, v]) => v !== 0));
      if ([...shares.keys()].some((id) => !known.has(id))) throw new ExpenseValidationError('unknown_participant', 'split');
      const err = validateCustomShares(input.amountMinor, shares);
      if (err) throw new ExpenseValidationError(err, 'split');
    }
  }
  return {
    amountMinor: input.amountMinor,
    currency: input.currency,
    rateToTrip: rate,
    tripAmountMinor: convertMinor(input.amountMinor, input.currency, tripCurrency, rate),
    category: input.category,
    date: input.date,
    description,
    city: input.city?.trim() ?? '',
    paymentMethod,
    notes: input.notes?.trim() ?? '',
    paidBy,
    splitMode,
    shares,
  };
}

export function createExpenseRepository(db: SqlDatabase) {
  async function tripContext(tripId: Id) {
    const trip = await db.getFirstAsync<{ currency: string }>('SELECT currency FROM trips WHERE id = ?', [tripId]);
    if (!trip) throw new ExpenseValidationError('trip_not_found');
    const people = await db.getAllAsync<{ id: string }>('SELECT id FROM participants WHERE trip_id = ? ORDER BY position', [tripId]);
    return { currency: trip.currency, participantIds: people.map((p) => p.id) };
  }

  async function writeShares(expenseId: Id, shares: Map<Id, number>) {
    await db.runAsync('DELETE FROM expense_participants WHERE expense_id = ?', [expenseId]);
    for (const [pid, share] of shares) await db.runAsync('INSERT INTO expense_participants (expense_id, participant_id, share_minor) VALUES (?, ?, ?)', [expenseId, pid, share]);
  }

  async function attachShares(list: Expense[]): Promise<ExpenseWithShares[]> {
    if (!list.length) return [];
    const rows = await db.getAllAsync<{ expense_id: string; participant_id: string; share_minor: number }>(
      `SELECT ep.expense_id, ep.participant_id, ep.share_minor FROM expense_participants ep JOIN participants p ON p.id = ep.participant_id
       WHERE ep.expense_id IN ${placeholders(list.length)} ORDER BY p.position`,
      list.map((e) => e.id),
    );
    const by = new Map<Id, ExpenseShare[]>();
    for (const r of rows) by.set(r.expense_id, [...(by.get(r.expense_id) ?? []), { expenseId: r.expense_id, participantId: r.participant_id, shareMinor: r.share_minor }]);
    return list.map((e) => ({ ...e, shares: by.get(e.id) ?? [] }));
  }

  const repo = {
    async get(id: Id): Promise<ExpenseWithShares | null> {
      const row = await db.getFirstAsync<ExpenseRow>('SELECT * FROM expenses WHERE id = ?', [id]);
      return row ? (await attachShares([toExpense(row)]))[0]! : null;
    },

    async list(tripId: Id, filter: ExpenseFilter = {}): Promise<ExpenseWithShares[]> {
      const where = ['trip_id = ?'];
      const params: (string | number)[] = [tripId];
      const add = (clause: string, value: string) => {
        where.push(clause);
        params.push(value);
      };
      if (filter.category) add('category = ?', filter.category);
      if (filter.paidBy) add('paid_by_participant_id = ?', filter.paidBy);
      if (filter.from) add('date >= ?', filter.from);
      if (filter.to) add('date <= ?', filter.to);
      if (filter.search?.trim()) {
        where.push("(description LIKE ? ESCAPE '\\' OR city LIKE ? ESCAPE '\\' OR notes LIKE ? ESCAPE '\\')");
        const like = `%${filter.search.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
        params.push(like, like, like);
      }
      const order = {
        date_desc: 'date DESC, created_at DESC',
        date_asc: 'date ASC, created_at ASC',
        amount_desc: 'trip_amount_minor DESC, date DESC',
        amount_asc: 'trip_amount_minor ASC, date DESC',
      }[filter.sort ?? 'date_desc'];
      const rows = await db.getAllAsync<ExpenseRow>(`SELECT * FROM expenses WHERE ${where.join(' AND ')} ORDER BY ${order}`, params);
      return attachShares(rows.map(toExpense));
    },

    async create(tripId: Id, input: ExpenseInput): Promise<ExpenseWithShares> {
      const ctx = await tripContext(tripId);
      const e = prepareExpense(input, ctx.currency, ctx.participantIds);
      const id = createId();
      const now = clock.instant();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO expenses (id, trip_id, amount_minor, currency, trip_amount_minor, rate_to_trip, category, date, description, city, payment_method, notes,
             paid_by_participant_id, split_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, tripId, e.amountMinor, e.currency, e.tripAmountMinor, e.rateToTrip, e.category, e.date, e.description, e.city, e.paymentMethod, e.notes, e.paidBy, e.splitMode, now, now],
        );
        await writeShares(id, e.shares);
      });
      return (await repo.get(id))!;
    },

    async update(id: Id, input: ExpenseInput): Promise<ExpenseWithShares> {
      const existing = await repo.get(id);
      if (!existing) throw new ExpenseValidationError('not_found');
      const ctx = await tripContext(existing.tripId);
      const e = prepareExpense(input, ctx.currency, ctx.participantIds);
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE expenses SET amount_minor = ?, currency = ?, trip_amount_minor = ?, rate_to_trip = ?, category = ?, date = ?, description = ?, city = ?,
             payment_method = ?, notes = ?, paid_by_participant_id = ?, split_mode = ?, updated_at = ? WHERE id = ?`,
          [e.amountMinor, e.currency, e.tripAmountMinor, e.rateToTrip, e.category, e.date, e.description, e.city, e.paymentMethod, e.notes, e.paidBy, e.splitMode, clock.instant(), id],
        );
        await writeShares(id, e.shares);
      });
      return (await repo.get(id))!;
    },

    async remove(id: Id): Promise<void> {
      await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
    },

    /** Planned amounts per category (trip currency). */
    async getBudget(tripId: Id): Promise<Partial<Record<BudgetCategory, number>>> {
      const rows = await db.getAllAsync<{ category: string; planned_minor: number }>('SELECT category, planned_minor FROM budgets WHERE trip_id = ?', [tripId]);
      return Object.fromEntries(rows.map((r) => [r.category, r.planned_minor]));
    },

    /** Replaces the category budget; a null/absent value removes the category line. */
    async setBudget(tripId: Id, planned: Partial<Record<BudgetCategory, number | null>>): Promise<void> {
      for (const [cat, v] of Object.entries(planned)) {
        if (!BUDGET_CATEGORIES.includes(cat as BudgetCategory)) throw new ExpenseValidationError('invalid_category', cat);
        if (v !== null && v !== undefined && (!Number.isInteger(v) || v < 0)) throw new ExpenseValidationError('invalid_amount', cat);
      }
      await db.withTransactionAsync(async () => {
        for (const [cat, v] of Object.entries(planned)) {
          if (v === null || v === undefined) await db.runAsync('DELETE FROM budgets WHERE trip_id = ? AND category = ?', [tripId, cat]);
          else
            await db.runAsync('INSERT INTO budgets (trip_id, category, planned_minor) VALUES (?, ?, ?) ON CONFLICT(trip_id, category) DO UPDATE SET planned_minor = excluded.planned_minor', [
              tripId,
              cat,
              v,
            ]);
        }
      });
    },

    /** Planned budgets per itinerary day (from `itinerary_days.budget_minor`). */
    async dayBudgets(tripId: Id): Promise<Map<LocalDate, number>> {
      const rows = await db.getAllAsync<{ date: string; budget_minor: number }>('SELECT date, budget_minor FROM itinerary_days WHERE trip_id = ? AND budget_minor IS NOT NULL', [tripId]);
      return new Map(rows.map((r) => [r.date, r.budget_minor]));
    },
  };
  return repo;
}

export type ExpenseRepository = ReturnType<typeof createExpenseRepository>;
