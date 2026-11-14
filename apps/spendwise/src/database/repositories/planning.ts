import type { SqlDatabase } from '@factory/storage';

import { MAX_CATCH_UP } from '@/constants';
import { isValidSchedule, nextOccurrence, occurrencesBetween } from '@/features/recurring/schedule';
import { ValidationError } from '@/features/transactions/validation';
import type { Budget, BudgetCategoryLimit, Frequency, RecurringRule, SavingsContribution, SavingsGoal, Subscription, SubscriptionKind } from '@/types';
import { addDays, addMonths, isValidDayKey, type DayKey, type MonthKey } from '@/utils/dates';
import { newId } from '@/utils/id';
import { isSupportedCurrency, MAX_MINOR } from '@/utils/money';

import type { createTransactionsRepository } from './transactions';

const nowIso = () => new Date().toISOString();
const validAmount = (n: number) => Number.isSafeInteger(n) && n > 0 && n <= MAX_MINOR;

/* ------------------------------------------------------------------ Budgets */

interface BudgetRow {
  id: string;
  month: string;
  currency: string;
  total_limit: number | null;
  created_at: string;
}
const mapBudget = (r: BudgetRow): Budget => ({ id: r.id, month: r.month, currency: r.currency, totalLimit: r.total_limit, createdAt: r.created_at });

export function createBudgetsRepository(db: SqlDatabase) {
  const repo = {
    async getByMonth(month: MonthKey): Promise<{ budget: Budget; limits: BudgetCategoryLimit[] } | null> {
      const b = await db.getFirstAsync<BudgetRow>('SELECT * FROM budgets WHERE month = ?', [month]);
      if (!b) return null;
      const limits = await db.getAllAsync<{ budget_id: string; category_id: string; limit_amount: number }>('SELECT * FROM budget_categories WHERE budget_id = ?', [b.id]);
      return { budget: mapBudget(b), limits: limits.map((l) => ({ budgetId: l.budget_id, categoryId: l.category_id, limit: l.limit_amount })) };
    },
    async months(): Promise<MonthKey[]> {
      return (await db.getAllAsync<{ month: string }>('SELECT month FROM budgets ORDER BY month DESC', [])).map((r) => r.month);
    },
    /** Creates or replaces the budget of a month atomically (limits are fully replaced). */
    async save(month: MonthKey, input: { currency: string; totalLimit: number | null; limits: { categoryId: string; limit: number }[] }): Promise<Budget> {
      if (!isSupportedCurrency(input.currency)) throw new ValidationError('currency');
      if (input.totalLimit !== null && !(Number.isSafeInteger(input.totalLimit) && input.totalLimit >= 0 && input.totalLimit <= MAX_MINOR)) throw new ValidationError('amount');
      if (input.limits.some((l) => !(Number.isSafeInteger(l.limit) && l.limit >= 0 && l.limit <= MAX_MINOR))) throw new ValidationError('amount');
      let id = '';
      await db.withTransactionAsync(async () => {
        const existing = await db.getFirstAsync<BudgetRow>('SELECT * FROM budgets WHERE month = ?', [month]);
        id = existing?.id ?? newId('bud');
        if (existing) await db.runAsync('UPDATE budgets SET currency = ?, total_limit = ? WHERE id = ?', [input.currency, input.totalLimit, id]);
        else await db.runAsync('INSERT INTO budgets (id, month, currency, total_limit, created_at) VALUES (?, ?, ?, ?, ?)', [id, month, input.currency, input.totalLimit, nowIso()]);
        await db.runAsync('DELETE FROM budget_categories WHERE budget_id = ?', [id]);
        const seen = new Set<string>();
        for (const l of input.limits) {
          if (seen.has(l.categoryId)) continue;
          seen.add(l.categoryId);
          await db.runAsync('INSERT INTO budget_categories (budget_id, category_id, limit_amount) VALUES (?, ?, ?)', [id, l.categoryId, l.limit]);
        }
      });
      return (await repo.getByMonth(month))!.budget;
    },
    /**
     * Copies the most recent earlier budget into `month`. Never touches the source month:
     * each month keeps its own budget history.
     */
    async copyFromPrevious(month: MonthKey): Promise<Budget | null> {
      if (await repo.getByMonth(month)) return null;
      const prev = await db.getFirstAsync<{ month: string }>('SELECT month FROM budgets WHERE month < ? ORDER BY month DESC LIMIT 1', [month]);
      if (!prev) return null;
      const src = (await repo.getByMonth(prev.month))!;
      return repo.save(month, { currency: src.budget.currency, totalLimit: src.budget.totalLimit, limits: src.limits.map((l) => ({ categoryId: l.categoryId, limit: l.limit })) });
    },
    async previousMonthWithBudget(month: MonthKey): Promise<MonthKey | null> {
      return (await db.getFirstAsync<{ month: string }>('SELECT month FROM budgets WHERE month < ? ORDER BY month DESC LIMIT 1', [month]))?.month ?? null;
    },
    async remove(month: MonthKey): Promise<void> {
      await db.withTransactionAsync(async () => {
        const b = await db.getFirstAsync<{ id: string }>('SELECT id FROM budgets WHERE month = ?', [month]);
        if (!b) return;
        await db.runAsync('DELETE FROM budget_alert_log WHERE budget_id = ?', [b.id]);
        await db.runAsync('DELETE FROM budget_categories WHERE budget_id = ?', [b.id]);
        await db.runAsync('DELETE FROM budgets WHERE id = ?', [b.id]);
      });
    },
    /** Records that an alert was notified; returns false if it already was (no duplicate notification). */
    async markAlert(budgetId: string, scope: string, threshold: number): Promise<boolean> {
      const r = await db.runAsync('INSERT OR IGNORE INTO budget_alert_log (budget_id, scope, threshold, sent_at) VALUES (?, ?, ?, ?)', [budgetId, scope, threshold, nowIso()]);
      return r.changes > 0;
    },
    async countCategoryLimits(month: MonthKey): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM budget_categories bc JOIN budgets b ON b.id = bc.budget_id WHERE b.month = ?', [month]))?.n ?? 0;
    },
  };
  return repo;
}

/* ------------------------------------------------------------------ Recurring */

interface RuleRow {
  id: string;
  type: string;
  amount: number;
  currency: string;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  description: string;
  frequency: string;
  interval: number;
  start_date: string;
  end_date: string | null;
  auto_post: number;
  active: number;
  created_at: string;
}
const mapRule = (r: RuleRow): RecurringRule => ({
  id: r.id,
  type: r.type as RecurringRule['type'],
  amount: r.amount,
  currency: r.currency,
  accountId: r.account_id,
  toAccountId: r.to_account_id,
  categoryId: r.category_id,
  description: r.description,
  frequency: r.frequency as Frequency,
  interval: r.interval,
  startDate: r.start_date,
  endDate: r.end_date,
  autoPost: r.auto_post === 1,
  active: r.active === 1,
  createdAt: r.created_at,
});

export type RuleInput = Omit<RecurringRule, 'id' | 'createdAt' | 'currency'>;

export interface DueOccurrence {
  rule: RecurringRule;
  date: DayKey;
}

export function createRecurringRepository(db: SqlDatabase, txRepo: ReturnType<typeof createTransactionsRepository>) {
  async function accountCurrency(id: string): Promise<string | null> {
    return (await db.getFirstAsync<{ currency: string }>('SELECT currency FROM accounts WHERE id = ?', [id]))?.currency ?? null;
  }

  async function validate(input: RuleInput): Promise<string> {
    if (!validAmount(input.amount)) throw new ValidationError('amount');
    if (!isValidDayKey(input.startDate) || (input.endDate && !isValidDayKey(input.endDate))) throw new ValidationError('date');
    if (!isValidSchedule(input)) throw new ValidationError('schedule');
    const currency = await accountCurrency(input.accountId);
    if (!currency) throw new ValidationError('account');
    if (input.type === 'transfer') {
      if (!input.toAccountId || input.toAccountId === input.accountId) throw new ValidationError('to_account');
      if ((await accountCurrency(input.toAccountId)) !== currency) throw new ValidationError('currency_mismatch');
    } else if (!input.categoryId) throw new ValidationError('category');
    return currency;
  }

  async function ledgerDates(ruleId: string, from: DayKey, to: DayKey): Promise<Set<string>> {
    const rows = await db.getAllAsync<{ occurrence_date: string }>('SELECT occurrence_date FROM recurring_occurrences WHERE rule_id = ? AND occurrence_date BETWEEN ? AND ?', [ruleId, from, to]);
    return new Set(rows.map((r) => r.occurrence_date));
  }

  /**
   * Records ONE occurrence. Idempotent: the ledger primary key (rule, date) makes a second
   * call a no-op, so a due date can never produce two transactions.
   */
  async function post(rule: RecurringRule, date: DayKey): Promise<boolean> {
    let created = false;
    await db.withTransactionAsync(async () => {
      const claim = await db.runAsync("INSERT OR IGNORE INTO recurring_occurrences (rule_id, occurrence_date, status, transaction_id, created_at) VALUES (?, ?, 'posted', NULL, ?)", [rule.id, date, nowIso()]);
      if (claim.changes === 0) return;
      const txId = await txRepo.insertRaw({
        type: rule.type,
        amount: rule.amount,
        currency: rule.currency,
        accountId: rule.accountId,
        toAccountId: rule.type === 'transfer' ? rule.toAccountId : null,
        toAmount: rule.type === 'transfer' ? rule.amount : null,
        categoryId: rule.type === 'transfer' ? null : rule.categoryId,
        date,
        time: null,
        description: rule.description,
        notes: '',
        paymentMethod: null,
        recurringRuleId: rule.id,
      });
      await db.runAsync('UPDATE recurring_occurrences SET transaction_id = ? WHERE rule_id = ? AND occurrence_date = ?', [txId, rule.id, date]);
      created = true;
    });
    return created;
  }

  const repo = {
    async list(): Promise<RecurringRule[]> {
      return (await db.getAllAsync<RuleRow>('SELECT * FROM recurring_rules ORDER BY active DESC, created_at', [])).map(mapRule);
    },
    async get(id: string): Promise<RecurringRule | null> {
      const r = await db.getFirstAsync<RuleRow>('SELECT * FROM recurring_rules WHERE id = ?', [id]);
      return r ? mapRule(r) : null;
    },
    async create(input: RuleInput): Promise<RecurringRule> {
      const currency = await validate(input);
      const id = newId('rule');
      await db.runAsync(
        `INSERT INTO recurring_rules (id, type, amount, currency, account_id, to_account_id, category_id, description, frequency, interval, start_date, end_date, auto_post, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.type, input.amount, currency, input.accountId, input.type === 'transfer' ? input.toAccountId : null, input.type === 'transfer' ? null : input.categoryId, input.description.trim().slice(0, 200), input.frequency, input.interval, input.startDate, input.endDate, input.autoPost ? 1 : 0, input.active ? 1 : 0, nowIso()],
      );
      return (await repo.get(id))!;
    },
    /** Editing a rule affects FUTURE occurrences only; already-recorded transactions are kept as they are. */
    async update(id: string, input: RuleInput): Promise<void> {
      const currency = await validate(input);
      await db.runAsync(
        `UPDATE recurring_rules SET type = ?, amount = ?, currency = ?, account_id = ?, to_account_id = ?, category_id = ?, description = ?, frequency = ?, interval = ?,
           start_date = ?, end_date = ?, auto_post = ?, active = ? WHERE id = ?`,
        [input.type, input.amount, currency, input.accountId, input.type === 'transfer' ? input.toAccountId : null, input.type === 'transfer' ? null : input.categoryId, input.description.trim().slice(0, 200), input.frequency, input.interval, input.startDate, input.endDate, input.autoPost ? 1 : 0, input.active ? 1 : 0, id],
      );
    },
    async setActive(id: string, active: boolean): Promise<void> {
      await db.runAsync('UPDATE recurring_rules SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
    },
    /** Deletes the rule; transactions it created stay (unlinked) because they are real history. */
    async remove(id: string): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE transactions SET recurring_rule_id = NULL WHERE recurring_rule_id = ?', [id]);
        await db.runAsync('DELETE FROM recurring_occurrences WHERE rule_id = ?', [id]);
        await db.runAsync('DELETE FROM recurring_rules WHERE id = ?', [id]);
      });
    },
    /** Due (date <= today) occurrences without a ledger entry. */
    async due(today: DayKey, opts: { autoPost?: boolean } = {}): Promise<DueOccurrence[]> {
      const out: DueOccurrence[] = [];
      for (const rule of await repo.list()) {
        if (!rule.active || (opts.autoPost !== undefined && rule.autoPost !== opts.autoPost)) continue;
        // Auto-post rules are posted in date order, so the last ledger date is a safe watermark.
        // Manual rules only look back one year for pending confirmations.
        let from = rule.startDate;
        if (rule.autoPost) {
          const last = (await db.getFirstAsync<{ d: string | null }>('SELECT MAX(occurrence_date) AS d FROM recurring_occurrences WHERE rule_id = ?', [rule.id]))?.d;
          if (last && last >= from) from = addDays(last, 1);
        } else {
          const floor = addDays(today, -366);
          if (floor > from) from = floor;
        }
        const dates = occurrencesBetween(rule, from, today, MAX_CATCH_UP * 4);
        if (!dates.length) continue;
        const done = await ledgerDates(rule.id, dates[0]!, dates[dates.length - 1]!);
        for (const d of dates) if (!done.has(d)) out.push({ rule, date: d });
      }
      return out.sort((a, b) => a.date.localeCompare(b.date));
    },
    /**
     * Generates due occurrences of auto-post rules up to TODAY (never future dates).
     * Safe to call at every start-up and resume: idempotent through the ledger.
     */
    async runAutoPost(today: DayKey): Promise<number> {
      let created = 0;
      for (const occ of (await repo.due(today, { autoPost: true })).slice(0, MAX_CATCH_UP)) {
        if (await post(occ.rule, occ.date)) created++;
      }
      return created;
    },
    /** User confirms a pending (manual) occurrence. */
    async confirm(ruleId: string, date: DayKey): Promise<boolean> {
      const rule = await repo.get(ruleId);
      if (!rule) return false;
      return post(rule, date);
    },
    /**
     * Links an already-recorded transaction as the occurrence of `date` (used by "Repeat" in the
     * transaction form): the rule will not generate a second transaction for that date.
     */
    async attachExisting(ruleId: string, date: DayKey, transactionId: string): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync("INSERT OR IGNORE INTO recurring_occurrences (rule_id, occurrence_date, status, transaction_id, created_at) VALUES (?, ?, 'posted', ?, ?)", [ruleId, date, transactionId, nowIso()]);
        await db.runAsync('UPDATE transactions SET recurring_rule_id = ? WHERE id = ?', [ruleId, transactionId]);
      });
    },
    async skip(ruleId: string, date: DayKey): Promise<void> {
      await db.runAsync("INSERT OR IGNORE INTO recurring_occurrences (rule_id, occurrence_date, status, transaction_id, created_at) VALUES (?, ?, 'skipped', NULL, ?)", [ruleId, date, nowIso()]);
    },
    /** PLANNED occurrences (after today, within `days`). They are projections, never stored. */
    async upcoming(today: DayKey, days: number): Promise<DueOccurrence[]> {
      const out: DueOccurrence[] = [];
      const end = addDays(today, days);
      for (const rule of await repo.list()) {
        if (!rule.active) continue;
        for (const d of occurrencesBetween(rule, addDays(today, 1), end, 60)) out.push({ rule, date: d });
      }
      return out.sort((a, b) => a.date.localeCompare(b.date));
    },
    nextFor(rule: RecurringRule, today: DayKey): DayKey | null {
      return rule.active ? nextOccurrence(rule, today) : null;
    },
  };
  return repo;
}

/* ------------------------------------------------------------------ Subscriptions */

interface SubRow {
  id: string;
  name: string;
  kind: string;
  price: number;
  currency: string;
  frequency: string;
  interval: number;
  start_date: string;
  end_date: string | null;
  category_id: string | null;
  reminder_days: number | null;
  active: number;
  notes: string;
  created_at: string;
}
const mapSub = (r: SubRow): Subscription => ({
  id: r.id,
  name: r.name,
  kind: r.kind as SubscriptionKind,
  price: r.price,
  currency: r.currency,
  frequency: r.frequency as Frequency,
  interval: r.interval,
  startDate: r.start_date,
  endDate: r.end_date,
  categoryId: r.category_id,
  reminderDays: r.reminder_days,
  active: r.active === 1,
  notes: r.notes,
  createdAt: r.created_at,
});

export type SubscriptionInput = Omit<Subscription, 'id' | 'createdAt'>;

export function createSubscriptionsRepository(db: SqlDatabase) {
  const validate = (s: SubscriptionInput) => {
    if (!s.name.trim()) throw new ValidationError('name');
    if (!validAmount(s.price)) throw new ValidationError('amount');
    if (!isSupportedCurrency(s.currency)) throw new ValidationError('currency');
    if (!isValidDayKey(s.startDate) || !isValidSchedule(s)) throw new ValidationError('schedule');
    if (s.reminderDays !== null && !(Number.isInteger(s.reminderDays) && s.reminderDays >= 0 && s.reminderDays <= 30)) throw new ValidationError('reminder');
  };
  const repo = {
    async list(): Promise<Subscription[]> {
      return (await db.getAllAsync<SubRow>('SELECT * FROM subscriptions ORDER BY active DESC, name', [])).map(mapSub);
    },
    async get(id: string): Promise<Subscription | null> {
      const r = await db.getFirstAsync<SubRow>('SELECT * FROM subscriptions WHERE id = ?', [id]);
      return r ? mapSub(r) : null;
    },
    async create(s: SubscriptionInput): Promise<string> {
      validate(s);
      const id = newId('sub');
      await db.runAsync(
        `INSERT INTO subscriptions (id, name, kind, price, currency, frequency, interval, start_date, end_date, category_id, reminder_days, active, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, s.name.trim().slice(0, 60), s.kind, s.price, s.currency, s.frequency, s.interval, s.startDate, s.endDate, s.categoryId, s.reminderDays, s.active ? 1 : 0, s.notes.trim().slice(0, 500), nowIso()],
      );
      return id;
    },
    async update(id: string, s: SubscriptionInput): Promise<void> {
      validate(s);
      await db.runAsync(
        `UPDATE subscriptions SET name = ?, kind = ?, price = ?, currency = ?, frequency = ?, interval = ?, start_date = ?, end_date = ?, category_id = ?,
           reminder_days = ?, active = ?, notes = ? WHERE id = ?`,
        [s.name.trim().slice(0, 60), s.kind, s.price, s.currency, s.frequency, s.interval, s.startDate, s.endDate, s.categoryId, s.reminderDays, s.active ? 1 : 0, s.notes.trim().slice(0, 500), id],
      );
    },
    async setActive(id: string, active: boolean): Promise<void> {
      await db.runAsync('UPDATE subscriptions SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
    },
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
    },
  };
  return repo;
}

/* ------------------------------------------------------------------ Savings goals */

interface GoalRow {
  id: string;
  name: string;
  target: number;
  currency: string;
  target_date: string | null;
  description: string;
  color: string;
  icon: string;
  archived: number;
  created_at: string;
}
const mapGoal = (r: GoalRow): SavingsGoal => ({
  id: r.id,
  name: r.name,
  target: r.target,
  currency: r.currency,
  targetDate: r.target_date,
  description: r.description,
  color: r.color,
  icon: r.icon,
  archived: r.archived === 1,
  createdAt: r.created_at,
});

export type GoalInput = Omit<SavingsGoal, 'id' | 'createdAt' | 'archived'>;

export function createGoalsRepository(db: SqlDatabase) {
  const validate = (g: GoalInput) => {
    if (!g.name.trim()) throw new ValidationError('name');
    if (!validAmount(g.target)) throw new ValidationError('amount');
    if (!isSupportedCurrency(g.currency)) throw new ValidationError('currency');
    if (g.targetDate && !isValidDayKey(g.targetDate)) throw new ValidationError('date');
  };
  const repo = {
    async list(opts: { includeArchived?: boolean } = {}): Promise<(SavingsGoal & { saved: number })[]> {
      const rows = await db.getAllAsync<GoalRow & { saved: number }>(
        `SELECT g.*, COALESCE((SELECT SUM(amount) FROM savings_contributions c WHERE c.goal_id = g.id), 0) AS saved
         FROM savings_goals g ${opts.includeArchived ? '' : 'WHERE g.archived = 0'} ORDER BY g.archived, g.created_at`,
        [],
      );
      return rows.map((r) => ({ ...mapGoal(r), saved: r.saved }));
    },
    async get(id: string): Promise<SavingsGoal | null> {
      const r = await db.getFirstAsync<GoalRow>('SELECT * FROM savings_goals WHERE id = ?', [id]);
      return r ? mapGoal(r) : null;
    },
    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM savings_goals WHERE archived = 0', []))?.n ?? 0;
    },
    /** `initialSaved` becomes the first traceable contribution. */
    async create(g: GoalInput, initialSaved = 0, today?: DayKey): Promise<string> {
      validate(g);
      if (initialSaved < 0 || !Number.isSafeInteger(initialSaved)) throw new ValidationError('amount');
      const id = newId('goal');
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          'INSERT INTO savings_goals (id, name, target, currency, target_date, description, color, icon, archived, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)',
          [id, g.name.trim().slice(0, 60), g.target, g.currency, g.targetDate, g.description.trim().slice(0, 500), g.color, g.icon, nowIso()],
        );
        if (initialSaved > 0) await repo.addContribution(id, initialSaved, today ?? nowIso().slice(0, 10), 'initial');
      });
      return id;
    },
    /** The currency of a goal can't change once it has contributions. */
    async update(id: string, g: GoalInput): Promise<void> {
      validate(g);
      const current = await repo.get(id);
      if (!current) throw new ValidationError('not_found');
      const n = (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM savings_contributions WHERE goal_id = ?', [id]))?.n ?? 0;
      if (n > 0 && current.currency !== g.currency) throw new ValidationError('currency_locked');
      await db.runAsync('UPDATE savings_goals SET name = ?, target = ?, currency = ?, target_date = ?, description = ?, color = ?, icon = ? WHERE id = ?', [
        g.name.trim().slice(0, 60),
        g.target,
        g.currency,
        g.targetDate,
        g.description.trim().slice(0, 500),
        g.color,
        g.icon,
        id,
      ]);
    },
    async setArchived(id: string, archived: boolean): Promise<void> {
      await db.runAsync('UPDATE savings_goals SET archived = ? WHERE id = ?', [archived ? 1 : 0, id]);
    },
    async remove(id: string): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM savings_contributions WHERE goal_id = ?', [id]);
        await db.runAsync('DELETE FROM savings_goals WHERE id = ?', [id]);
      });
    },
    async contributions(goalId: string): Promise<SavingsContribution[]> {
      const rows = await db.getAllAsync<{ id: string; goal_id: string; amount: number; date: string; note: string; created_at: string }>(
        'SELECT * FROM savings_contributions WHERE goal_id = ? ORDER BY date DESC, created_at DESC',
        [goalId],
      );
      return rows.map((r) => ({ id: r.id, goalId: r.goal_id, amount: r.amount, date: r.date, note: r.note, createdAt: r.created_at }));
    },
    /** Signed amount: positive adds, negative withdraws (cannot go below zero saved). */
    async addContribution(goalId: string, amount: number, date: DayKey, note = ''): Promise<string> {
      if (!Number.isSafeInteger(amount) || amount === 0 || Math.abs(amount) > MAX_MINOR) throw new ValidationError('amount');
      if (!isValidDayKey(date)) throw new ValidationError('date');
      if (amount < 0) {
        const saved = (await db.getFirstAsync<{ s: number }>('SELECT COALESCE(SUM(amount), 0) AS s FROM savings_contributions WHERE goal_id = ?', [goalId]))?.s ?? 0;
        if (saved + amount < 0) throw new ValidationError('withdraw_too_much');
      }
      const id = newId('ctb');
      await db.runAsync('INSERT INTO savings_contributions (id, goal_id, amount, date, note, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, goalId, amount, date, note.trim().slice(0, 200), nowIso()]);
      return id;
    },
    /** Removing a contribution may not leave the goal with a negative saved amount. */
    async removeContribution(id: string): Promise<void> {
      const c = await db.getFirstAsync<{ goal_id: string; amount: number }>('SELECT goal_id, amount FROM savings_contributions WHERE id = ?', [id]);
      if (!c) return;
      const saved = (await db.getFirstAsync<{ s: number }>('SELECT COALESCE(SUM(amount), 0) AS s FROM savings_contributions WHERE goal_id = ?', [c.goal_id]))?.s ?? 0;
      if (saved - c.amount < 0) throw new ValidationError('withdraw_too_much');
      await db.runAsync('DELETE FROM savings_contributions WHERE id = ?', [id]);
    },
  };
  return repo;
}

/** Helper kept here so screens don't import date math for the default budget month list. */
export function recentMonths(current: MonthKey, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, i) => addMonths(current, -i));
}
