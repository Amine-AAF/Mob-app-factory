import { RECENT_TX_COUNT, UPCOMING_DAYS } from '@/constants';
import type { Repositories } from '@/database';
import type { DueOccurrence } from '@/database/repositories/planning';
import type { Account, Category, SavingsGoal, Transaction } from '@/types';
import { monthEnd, monthOf, monthStart, type DayKey } from '@/utils/dates';

import { totalsByCurrency } from '../accounts/balances';
import { activeAlerts, evaluateBudget, type BudgetLine } from '../budgets/budgets';
import { rankCategories, rateMap, summarize, type Summary } from '../reports/stats';
import { goalProgress, type GoalProgress } from '../savings-goals/goals';
import { upcomingBillings } from '../subscriptions/estimates';

export interface DashboardData {
  hasAccounts: boolean;
  accounts: Account[];
  balances: Record<string, number>;
  /** Available balance per currency (non-archived accounts). Never a fictional figure. */
  totals: Record<string, number>;
  month: Summary;
  budget: { total: BudgetLine; categories: BudgetLine[]; currency: string } | null;
  alerts: BudgetLine[];
  recent: Transaction[];
  topCategories: { categoryId: string; amount: number }[];
  categories: Map<string, Category>;
  goals: { goal: SavingsGoal; progress: GoalProgress }[];
  pending: DueOccurrence[];
  upcoming: { name: string; date: DayKey; amount: number; currency: string; kind: 'subscription' | 'recurring' }[];
}

export async function loadDashboard(r: Repositories, today: DayKey, mainCurrency: string): Promise<DashboardData> {
  const month = monthOf(today);
  const [accounts, balances, txs, recent, categories, rates, budget, goals, settings, pending, plannedRules, subs] = await Promise.all([
    r.accounts.list(),
    r.accounts.balances(),
    r.transactions.list({ from: monthStart(month), to: monthEnd(month) }),
    r.transactions.list({ limit: RECENT_TX_COUNT }),
    r.categories.list({ includeArchived: true }),
    r.rates.list(),
    r.budgets.getByMonth(month),
    r.goals.list(),
    r.settings.getAll(),
    r.recurring.due(today, { autoPost: false }),
    r.recurring.upcoming(today, UPCOMING_DAYS),
    r.subscriptions.list(),
  ]);
  const rm = rateMap(rates);
  const summary = summarize(txs, mainCurrency, rm);
  let budgetView: DashboardData['budget'] = null;
  let alerts: BudgetLine[] = [];
  if (budget) {
    const s = budget.budget.currency === mainCurrency ? summary : summarize(txs, budget.budget.currency, rm);
    const e = evaluateBudget(budget.budget, budget.limits, s.spendingByCategory, s.spending, settings.alertThresholds);
    budgetView = { ...e, currency: budget.budget.currency };
    alerts = activeAlerts([e.total, ...e.categories]);
  }
  const goalViews = await Promise.all(
    goals.slice(0, 3).map(async (g) => ({ goal: g, progress: goalProgress(g.target, await r.goals.contributions(g.id), g.targetDate, today) })),
  );
  const upcoming = [
    ...upcomingBillings(subs, today, UPCOMING_DAYS).map((u) => ({ name: u.sub.name, date: u.date, amount: u.sub.price, currency: u.sub.currency, kind: 'subscription' as const })),
    ...plannedRules.map((o) => ({ name: o.rule.description, date: o.date, amount: o.rule.type === 'expense' ? -o.rule.amount : o.rule.amount, currency: o.rule.currency, kind: 'recurring' as const })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return {
    hasAccounts: accounts.length > 0,
    accounts,
    balances,
    totals: totalsByCurrency(accounts, balances),
    month: summary,
    budget: budgetView,
    alerts,
    recent,
    topCategories: rankCategories(summary.spendingByCategory).slice(0, 4),
    categories: new Map(categories.map((c) => [c.id, c])),
    goals: goalViews,
    pending,
    upcoming,
  };
}
