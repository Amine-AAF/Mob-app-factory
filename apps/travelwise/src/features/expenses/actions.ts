import type { BudgetCategory } from '@/constants/domain';
import { repos } from '@/database';
import type { ExpenseInput } from '@/database/repositories/expenses';
import type { RateQuote } from '@/features/currency/rates';
import { track } from '@/services/analytics';
import { notifyDataChanged } from '@/store/session';
import type { Id, LocalDate } from '@/types/models';

/** No ad is ever shown around these operations (expense entry is a protected flow). */
export async function createExpense(tripId: Id, input: ExpenseInput) {
  const e = await repos().expenses.create(tripId, input);
  notifyDataChanged();
  return e;
}

export async function updateExpense(id: Id, input: ExpenseInput) {
  const e = await repos().expenses.update(id, input);
  notifyDataChanged();
  return e;
}

export async function deleteExpense(id: Id) {
  await repos().expenses.remove(id);
  notifyDataChanged();
}

export async function saveBudget(tripId: Id, planned: Partial<Record<BudgetCategory, number | null>>) {
  const hadBudget = Object.keys(await repos().expenses.getBudget(tripId)).length > 0;
  await repos().expenses.setBudget(tripId, planned);
  const count = Object.values(planned).filter((v) => v !== null && v !== undefined).length;
  // Count of categories only: never the amounts.
  if (!hadBudget && count > 0) track('budget_created', { categories: count });
  notifyDataChanged();
}

export async function saveRate(input: { base: string; quote: string; rate: number; rateDate: LocalDate; tripId?: Id | null }) {
  const r = await repos().currency.saveRate(input);
  notifyDataChanged();
  return r;
}

export async function deleteRate(id: Id) {
  await repos().currency.deleteRate(id);
  notifyDataChanged();
}

export async function convertAndRecord(amountMinor: number, quote: RateQuote) {
  const c = await repos().currency.convert(amountMinor, quote);
  notifyDataChanged();
  return c;
}

export async function clearConversionHistory() {
  await repos().currency.clearHistory();
  notifyDataChanged();
}
