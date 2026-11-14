import type { SqlDatabase, SqlValue } from '@factory/storage';

import type { DayKey } from '@/domain/dates';
import { newId } from '@/domain/ids';
import type { Money } from '@/domain/money';
import { firstOccurrenceFrom, planCatchUp } from '@/domain/recurringExpenses';
import type { Expense, ExpenseCategory, RecurringExpense } from '@/domain/types';

import { createTable, likePattern } from '../table';

export type ExpenseInput = Omit<Expense, 'id' | 'homeId' | 'createdAt' | 'updatedAt' | 'recurringId' | 'occurrenceDate'>;
export type RecurringInput = Omit<RecurringExpense, 'id' | 'homeId' | 'nextDate' | 'createdAt' | 'updatedAt'>;

export interface ExpenseFilters {
  from?: DayKey | null;
  to?: DayKey | null;
  category?: ExpenseCategory | null;
  assetId?: string | null;
  search?: string;
}

export interface MonthCurrencyTotal extends Money {
  month: string; // YYYY-MM
}

export function createExpensesRepository(db: SqlDatabase, now: () => Date) {
  const expenses = createTable<Expense>(db, 'expenses');
  const recurring = createTable<RecurringExpense>(db, 'recurring_expenses', ['autoRecord', 'reminderEnabled', 'active']);
  const stamp = () => now().toISOString();

  const filters = (homeId: string, f: ExpenseFilters) => {
    const where = ['home_id = ?'];
    const params: SqlValue[] = [homeId];
    if (f.from) {
      where.push('spent_on >= ?');
      params.push(f.from);
    }
    if (f.to) {
      where.push('spent_on <= ?');
      params.push(f.to);
    }
    if (f.category) {
      where.push('category = ?');
      params.push(f.category);
    }
    if (f.assetId) {
      where.push('asset_id = ?');
      params.push(f.assetId);
    }
    if (f.search?.trim()) {
      where.push("(LOWER(COALESCE(title,'')) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(notes,'')) LIKE ? ESCAPE '\\')");
      const p = likePattern(f.search);
      params.push(p, p);
    }
    return { where: where.join(' AND '), params };
  };

  return {
    get: (id: string) => expenses.get(id),

    list(homeId: string, f: ExpenseFilters = {}): Promise<Expense[]> {
      const q = filters(homeId, f);
      return expenses.select(q.where, q.params, 'spent_on DESC, created_at DESC');
    },

    async create(homeId: string, input: ExpenseInput): Promise<Expense> {
      const id = newId('e_');
      const ts = stamp();
      await expenses.insert({ ...input, id, homeId, createdAt: ts, updatedAt: ts });
      return (await expenses.get(id)) as Expense;
    },

    async update(id: string, patch: Partial<ExpenseInput>): Promise<void> {
      await expenses.update(id, { ...patch, updatedAt: stamp() });
    },

    remove: (id: string) => expenses.delete(id),

    /** Totals per currency (never mixed) for a period. */
    async totals(homeId: string, f: ExpenseFilters = {}): Promise<Money[]> {
      const q = filters(homeId, f);
      const rows = await db.getAllAsync<{ currency: string; total: number }>(
        `SELECT currency, SUM(amount_minor) AS total FROM expenses WHERE ${q.where} GROUP BY currency ORDER BY total DESC`,
        q.params,
      );
      return rows.map((r) => ({ currency: r.currency, amountMinor: r.total }));
    },

    async monthlyTotals(homeId: string, from: DayKey, to: DayKey): Promise<MonthCurrencyTotal[]> {
      const rows = await db.getAllAsync<{ month: string; currency: string; total: number }>(
        `SELECT substr(spent_on, 1, 7) AS month, currency, SUM(amount_minor) AS total FROM expenses
         WHERE home_id = ? AND spent_on BETWEEN ? AND ? GROUP BY month, currency ORDER BY month`,
        [homeId, from, to],
      );
      return rows.map((r) => ({ month: r.month, currency: r.currency, amountMinor: r.total }));
    },

    async byCategory(homeId: string, from: DayKey, to: DayKey): Promise<(Money & { category: ExpenseCategory })[]> {
      const rows = await db.getAllAsync<{ category: ExpenseCategory; currency: string; total: number }>(
        `SELECT category, currency, SUM(amount_minor) AS total FROM expenses
         WHERE home_id = ? AND spent_on BETWEEN ? AND ? GROUP BY category, currency ORDER BY total DESC`,
        [homeId, from, to],
      );
      return rows.map((r) => ({ category: r.category, currency: r.currency, amountMinor: r.total }));
    },

    /* Recurring ------------------------------------------------------- */

    getRecurring: (id: string) => recurring.get(id),
    listRecurring: (homeId: string) => recurring.select('home_id = ?', [homeId], 'active DESC, next_date ASC'),
    activeRecurring: (homeIds: string[]) =>
      homeIds.length ? recurring.select(`home_id IN (${homeIds.map(() => '?').join(',')}) AND active = 1`, homeIds, 'next_date ASC') : Promise.resolve([]),

    async createRecurring(homeId: string, input: RecurringInput): Promise<RecurringExpense> {
      const id = newId('re_');
      const ts = stamp();
      // A schedule that started in the past is caught up by `catchUp` (bounded by MAX_CATCH_UP),
      // so the history is complete; `next_date` starts at the anchor.
      await recurring.insert({ ...input, id, homeId, title: input.title.trim(), nextDate: input.startDate, createdAt: ts, updatedAt: ts });
      return (await recurring.get(id)) as RecurringExpense;
    },

    async updateRecurring(id: string, patch: Partial<RecurringInput>, today: DayKey): Promise<void> {
      const current = await recurring.get(id);
      if (!current) return;
      const next: Partial<RecurringExpense> = { ...patch, updatedAt: stamp() };
      // Changing the schedule re-anchors the next occurrence without re-recording the past.
      if ((patch.startDate && patch.startDate !== current.startDate) || (patch.frequency && patch.frequency !== current.frequency)) {
        next.nextDate = firstOccurrenceFrom(patch.startDate ?? current.startDate, patch.frequency ?? current.frequency, today);
      }
      await recurring.update(id, next);
    },

    /** Past expenses keep their data; only the link is cleared (ON DELETE SET NULL). */
    removeRecurring: (id: string) => recurring.delete(id),

    /**
     * Records every due occurrence of auto-recorded recurring expenses up to today,
     * in one transaction. Idempotent (unique index on recurring_id + occurrence_date).
     * Returns the number of expenses added.
     */
    async catchUp(homeId: string, today: DayKey): Promise<number> {
      const list = await recurring.select('home_id = ? AND active = 1', [homeId]);
      let added = 0;
      await db.withTransactionAsync(async () => {
        for (const rec of list) {
          const plan = planCatchUp(rec, today);
          if (rec.autoRecord) {
            for (const date of plan.dates) {
              const ts = stamp();
              const r = await db.runAsync(
                `INSERT OR IGNORE INTO expenses (id, home_id, category, title, amount_minor, currency, spent_on, payment_method, recurring_id, occurrence_date, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newId('e_'), homeId, rec.category, rec.title, rec.amountMinor, rec.currency, date, rec.paymentMethod, rec.id, date, ts, ts],
              );
              added += r.changes;
            }
          }
          if (plan.nextDate !== rec.nextDate || plan.stillActive !== rec.active) {
            await recurring.update(rec.id, { nextDate: plan.nextDate, active: plan.stillActive, updatedAt: stamp() });
          }
        }
      });
      return added;
    },
  };
}

export type ExpensesRepository = ReturnType<typeof createExpensesRepository>;
