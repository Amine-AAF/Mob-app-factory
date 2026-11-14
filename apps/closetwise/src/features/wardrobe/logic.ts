import type { CareStatus } from '@/domain/catalog';
import type { WardrobeItem } from '@/domain/types';
import { activeFilterCount, type WardrobeFilter } from '@/domain/wardrobeQuery';

/**
 * Name used when the user leaves the name empty (quick add): "<Color> <type>" where the type
 * is the subcategory if typed, else the category label. `compose` comes from i18n so the
 * word order follows the interface language.
 */
export function resolveItemName(
  name: string | null | undefined,
  parts: { category: string; subcategory?: string | null; color?: string | null },
  compose: (color: string, base: string) => string,
): string {
  const typed = (name ?? '').trim();
  if (typed) return typed;
  const base = (parts.subcategory ?? '').trim() || parts.category.trim();
  const color = (parts.color ?? '').trim();
  if (!base) return color;
  return color ? compose(color, base).trim() : base;
}

/** Parses a wash temperature typed by the user: empty = not specified, else an integer 0–95 °C. */
export function parseTemperature(input: string): { value: number | null; valid: boolean } {
  const s = input.trim();
  if (!s) return { value: null, valid: true };
  if (!/^\d{1,3}$/.test(s)) return { value: null, valid: false };
  const n = Number(s);
  return n >= 0 && n <= 95 ? { value: n, valid: true } : { value: null, valid: false };
}

/** Number of filters set in the filter sheet (the category quick filter is shown separately). */
export function sheetFilterCount(f: WardrobeFilter): number {
  return activeFilterCount({ ...f, categoryIds: [] });
}

/** Groups items by care status, keeping every status (possibly empty) in catalog order. */
export function groupByCareStatus(items: readonly WardrobeItem[], statuses: readonly CareStatus[]): Record<CareStatus, WardrobeItem[]> {
  const out = Object.fromEntries(statuses.map((s) => [s, [] as WardrobeItem[]])) as Record<CareStatus, WardrobeItem[]>;
  for (const it of items) (out[it.careStatus] ?? (out[it.careStatus] = [])).push(it);
  return out;
}

/** Toggles an id in a selection list. */
export function toggleId(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Keeps only the suggestions that match what has been typed (case-insensitive), excluding exact matches. */
export function matchingSuggestions(all: readonly string[], typed: string, max = 8): string[] {
  const q = typed.trim().toLowerCase();
  return all.filter((s) => s.toLowerCase() !== q && (!q || s.toLowerCase().includes(q))).slice(0, max);
}
