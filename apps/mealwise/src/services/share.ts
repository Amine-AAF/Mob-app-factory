import type { TFunction } from 'i18next';
import { fromDayKey } from '@factory/app-core';

import { groupByCategory } from '@/domain/grocery';
import { ingredientName } from '@/domain/ingredients';
import { sortEntries } from '@/domain/planner';
import { servingsFactor } from '@/domain/quantity';
import type { AppLanguage, GroceryItem, PlanEntry, Recipe, UnitId } from '@/domain/types';

/**
 * Plain-text and CSV renderings for sharing (Android share sheet) and export.
 * Pure functions: labels and formatters are injected so they are testable.
 */
type T = TFunction;
type QuantityLabel = (quantity: number | null, unit: UnitId, opts?: { factor?: number }) => string;

export function recipeAsText(r: Recipe, servings: number, q: QuantityLabel, t: T, lng: AppLanguage): string {
  const factor = servingsFactor(r.servings, servings);
  return [
    r.title,
    t('recipe.servingsCount', { count: servings }),
    '',
    `${t('recipe.ingredients')}:`,
    ...r.ingredients.map((i) => `• ${q(i.quantity, i.unit, { factor })} ${ingredientName(i.key, lng, i.name)}${i.note ? ` (${i.note})` : ''}`),
    '',
    `${t('recipe.steps')}:`,
    ...r.steps.map((s, idx) => `${idx + 1}. ${s.text}`),
    '',
    t('share.footer'),
  ].join('\n');
}

/** Grocery list grouped by aisle, with ☐/☑ marks. Prices are included only when asked. */
export function groceryListAsText(name: string, items: readonly GroceryItem[], q: QuantityLabel, t: T, opts: { includeChecked?: boolean } = {}): string {
  const visible = opts.includeChecked === false ? items.filter((i) => !i.checked) : items;
  const lines = [name, ''];
  for (const section of groupByCategory(visible)) {
    lines.push(`${t(`groceryCategories.${section.category}`)}`);
    for (const i of section.items) {
      const qty = i.quantity === null && i.unit === 'to_taste' ? '' : ` — ${q(i.quantity, i.unit)}`;
      lines.push(`${i.checked ? '☑' : '☐'} ${i.name}${qty}${i.note ? ` (${i.note})` : ''}`);
    }
    lines.push('');
  }
  lines.push(t('share.footer'));
  return lines.join('\n');
}

function csvCell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: readonly (readonly (string | number | null | undefined)[])[]): string {
  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

export function groceryListAsCsv(items: readonly GroceryItem[], t: T): string {
  return toCsv([
    [t('export.colItem'), t('export.colQuantity'), t('export.colUnit'), t('export.colCategory'), t('export.colPrice'), t('export.colChecked')],
    ...items.map((i) => [i.name, i.quantity, i.unit === 'to_taste' ? '' : t(`unitsShort.${i.unit}`), t(`groceryCategories.${i.category}`), i.price, i.checked ? 1 : 0]),
  ]);
}

export function planAsText(entries: readonly PlanEntry[], titles: ReadonlyMap<number, string>, t: T, formatDay: (d: Date) => string): string {
  const lines: string[] = [];
  let day = '';
  for (const e of sortEntries(entries)) {
    if (e.day !== day) {
      day = e.day;
      if (lines.length) lines.push('');
      lines.push(formatDay(fromDayKey(e.day)));
    }
    lines.push(`• ${t(`slots.${e.slot}`)}: ${titles.get(e.id) ?? ''} (×${e.servings})`);
  }
  lines.push('', t('share.footer'));
  return lines.join('\n');
}

export function planAsCsv(entries: readonly PlanEntry[], titles: ReadonlyMap<number, string>, t: T): string {
  return toCsv([
    [t('export.colDate'), t('export.colMeal'), t('export.colRecipe'), t('export.colServings'), t('export.colCooked')],
    ...sortEntries(entries).map((e) => [e.day, t(`slots.${e.slot}`), titles.get(e.id) ?? '', e.servings, e.cookedAt ? 1 : 0]),
  ]);
}
