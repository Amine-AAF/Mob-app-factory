import { addDays, fromDayKey, toDayKey } from '@factory/app-core';

import { isNoShopping, isStaple } from './ingredients';
import type { DayKey, Recipe, UnitId } from './types';
import { areCompatible, toBase } from './units';

/**
 * Budget & costs. MealWise knows no shop prices: every price comes from the
 * user (price book or grocery items). Estimates say how much of the recipe
 * they cover.
 */
export interface PriceEntry {
  key: string;
  /** Price paid for `quantity` `unit` of the ingredient, in the user's currency. */
  price: number;
  quantity: number;
  unit: UnitId;
}

export interface Expense {
  id: number;
  day: DayKey;
  amount: number;
  note: string | null;
  listId: number | null;
}

/** Cost of `quantity unit` from a price entry; null when units are not comparable. */
export function costFromPrice(entry: PriceEntry, quantity: number, unit: UnitId): number | null {
  if (!(entry.quantity > 0) || !(entry.price >= 0) || unit === 'to_taste') return null;
  if (!areCompatible(entry.unit, unit)) return null;
  return (entry.price * toBase(quantity, unit)) / toBase(entry.quantity, entry.unit);
}

export interface CostEstimate {
  total: number;
  perServing: number;
  /** Share of priced ingredients among those that matter for cost. */
  coverage: number;
  missing: string[];
}

export function estimateRecipeCost(recipe: Pick<Recipe, 'ingredients' | 'servings'>, servings: number, prices: ReadonlyMap<string, PriceEntry>): CostEstimate {
  const factor = recipe.servings > 0 && servings > 0 ? servings / recipe.servings : 1;
  let total = 0;
  let relevant = 0;
  let priced = 0;
  const missing: string[] = [];
  for (const ing of recipe.ingredients) {
    if (ing.optional || isStaple(ing.key) || isNoShopping(ing.key) || ing.quantity === null || ing.unit === 'to_taste') continue;
    relevant++;
    const entry = prices.get(ing.key);
    const cost = entry ? costFromPrice(entry, ing.quantity * factor, ing.unit) : null;
    if (cost === null) {
      missing.push(ing.key);
      continue;
    }
    priced++;
    total += cost;
  }
  const t = Math.round(total * 100) / 100;
  return { total: t, perServing: servings > 0 ? Math.round((t / servings) * 100) / 100 : t, coverage: relevant ? priced / relevant : 0, missing };
}

export function spentBetween(expenses: readonly Expense[], from: DayKey, toInclusive: DayKey): number {
  const sum = expenses.filter((e) => e.day >= from && e.day <= toInclusive).reduce((s, e) => s + e.amount, 0);
  return Math.round(sum * 100) / 100;
}

export function weekSpent(expenses: readonly Expense[], start: DayKey): number {
  return spentBetween(expenses, start, addDays(start, 6));
}

export type BudgetStatus = 'none' | 'under' | 'near' | 'over';

export function compareBudget(budget: number | null, spent: number): { status: BudgetStatus; remaining: number | null; ratio: number | null } {
  if (budget === null || !(budget > 0)) return { status: 'none', remaining: null, ratio: null };
  const ratio = spent / budget;
  const remaining = Math.round((budget - spent) * 100) / 100;
  return { status: ratio > 1 ? 'over' : ratio >= 0.85 ? 'near' : 'under', remaining, ratio };
}

export function monthKey(day: DayKey): string {
  return day.slice(0, 7);
}

/** Totals for the last `count` months (oldest first), months without spending included as 0. */
export function monthlyHistory(expenses: readonly Expense[], today: DayKey, count = 6): { month: string; total: number }[] {
  const base = fromDayKey(today);
  const months = Array.from({ length: count }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() - (count - 1 - i), 1);
    return toDayKey(d).slice(0, 7);
  });
  return months.map((month) => ({
    month,
    total: Math.round(expenses.filter((e) => monthKey(e.day) === month).reduce((s, e) => s + e.amount, 0) * 100) / 100,
  }));
}

/** Parses a user-typed money amount ("12,50", "12.5", "€12") into a non-negative number. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^\d.,-]/g, '').trim();
  if (!cleaned || cleaned.startsWith('-')) return null;
  // Last separator is the decimal separator ("1.234,56" and "1,234.56").
  const lastSep = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
  let normalized = cleaned;
  if (lastSep >= 0) {
    const decimals = cleaned.length - lastSep - 1;
    const intPart = cleaned.slice(0, lastSep).replace(/[.,]/g, '');
    normalized = decimals > 0 && decimals <= 2 ? `${intPart}.${cleaned.slice(lastSep + 1)}` : cleaned.replace(/[.,]/g, '');
  }
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 && n < 1_000_000 ? Math.round(n * 100) / 100 : null;
}

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'MAD', 'MXN', 'ARS', 'COP', 'CLP', 'BRL', 'INR', 'JPY', 'XOF'] as const;
export type Currency = (typeof CURRENCIES)[number];

export function formatMoney(amount: number, currency: string, lng: string): string {
  try {
    return new Intl.NumberFormat(lng, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
