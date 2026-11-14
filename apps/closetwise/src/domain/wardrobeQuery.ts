import { matchesSeason, type CareStatus, type Season } from './catalog';
import type { WardrobeItem } from './types';

export type SortKey = 'newest' | 'oldest' | 'name' | 'most_worn' | 'least_worn' | 'price_high' | 'price_low';
export const SORT_KEYS: SortKey[] = ['newest', 'oldest', 'name', 'most_worn', 'least_worn', 'price_high', 'price_low'];

export interface WardrobeFilter {
  query: string;
  categoryIds: string[];
  colors: string[];
  season: Season | null;
  styleIds: string[];
  occasionIds: string[];
  careStatuses: CareStatus[];
  favoritesOnly: boolean;
  archived: boolean;
}

export const EMPTY_FILTER: WardrobeFilter = {
  query: '',
  categoryIds: [],
  colors: [],
  season: null,
  styleIds: [],
  occasionIds: [],
  careStatuses: [],
  favoritesOnly: false,
  archived: false,
};

export function activeFilterCount(f: WardrobeFilter): number {
  return (
    (f.categoryIds.length ? 1 : 0) +
    (f.colors.length ? 1 : 0) +
    (f.season ? 1 : 0) +
    (f.styleIds.length ? 1 : 0) +
    (f.occasionIds.length ? 1 : 0) +
    (f.careStatuses.length ? 1 : 0) +
    (f.favoritesOnly ? 1 : 0)
  );
}

/** Lower-cases and strips accents so "Été" matches "ete". */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesQuery(item: WardrobeItem, query: string, extraText?: (item: WardrobeItem) => string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const hay = normalize([item.name, item.brandName, item.subcategory, item.notes, item.size, extraText?.(item)].filter(Boolean).join(' '));
  return q.split(/\s+/).every((word) => hay.includes(word));
}

export function filterItems(items: readonly WardrobeItem[], f: WardrobeFilter, extraText?: (item: WardrobeItem) => string): WardrobeItem[] {
  return items.filter(
    (i) =>
      i.archived === f.archived &&
      (!f.favoritesOnly || i.favorite) &&
      (f.categoryIds.length === 0 || f.categoryIds.includes(i.categoryId)) &&
      (f.colors.length === 0 || (i.primaryColor != null && f.colors.includes(i.primaryColor)) || i.secondaryColors.some((c) => f.colors.includes(c))) &&
      (!f.season || matchesSeason(i.seasons, f.season)) &&
      (f.styleIds.length === 0 || (i.styleId != null && f.styleIds.includes(i.styleId))) &&
      (f.occasionIds.length === 0 || i.occasionIds.some((o) => f.occasionIds.includes(o))) &&
      (f.careStatuses.length === 0 || f.careStatuses.includes(i.careStatus)) &&
      matchesQuery(i, f.query, extraText),
  );
}

export function sortItems(items: readonly WardrobeItem[], sort: SortKey, collator?: Intl.Collator): WardrobeItem[] {
  const c = collator ?? new Intl.Collator(undefined, { sensitivity: 'base' });
  const byNewest = (a: WardrobeItem, b: WardrobeItem) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id);
  const price = (i: WardrobeItem) => i.purchasePrice ?? -1;
  const cmp: Record<SortKey, (a: WardrobeItem, b: WardrobeItem) => number> = {
    newest: byNewest,
    oldest: (a, b) => -byNewest(a, b),
    name: (a, b) => c.compare(a.name, b.name) || byNewest(a, b),
    most_worn: (a, b) => b.wearCount - a.wearCount || byNewest(a, b),
    least_worn: (a, b) => a.wearCount - b.wearCount || byNewest(a, b),
    price_high: (a, b) => price(b) - price(a) || byNewest(a, b),
    // Unknown prices go last when sorting by lowest price.
    price_low: (a, b) => (a.purchasePrice == null ? 1 : 0) - (b.purchasePrice == null ? 1 : 0) || price(a) - price(b) || byNewest(a, b),
  };
  return [...items].sort(cmp[sort]);
}

/**
 * Potential duplicates: same category, same primary color and a similar name
 * (or same brand + size). Used to warn, never to block.
 */
export function findPossibleDuplicates(
  candidate: Pick<WardrobeItem, 'name' | 'categoryId' | 'primaryColor' | 'brandName' | 'size'> & { id?: string },
  items: readonly WardrobeItem[],
): WardrobeItem[] {
  const name = normalize(candidate.name);
  return items.filter((i) => {
    if (i.id === candidate.id || i.archived) return false;
    if (i.categoryId !== candidate.categoryId || i.primaryColor !== candidate.primaryColor) return false;
    const sameName = name.length > 0 && normalize(i.name) === name;
    const sameBrandSize = !!candidate.brandName && !!candidate.size && normalize(i.brandName ?? '') === normalize(candidate.brandName) && i.size === candidate.size;
    return sameName || sameBrandSize;
  });
}
