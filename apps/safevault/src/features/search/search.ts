import type { EntryType, VaultItem } from '@/vault/types';

/**
 * In-memory search over decrypted *meta* only (title, username, email, URL, tags, cardholder).
 * Secrets (passwords, note bodies, card numbers) are intentionally not searchable: that would
 * require keeping them decrypted in memory.
 */
export interface ItemFilter {
  query?: string;
  type?: EntryType | 'all';
  categoryId?: string | null;
  favoritesOnly?: boolean;
  tag?: string | null;
}

export type ItemSort = 'recent' | 'updated' | 'title';

export function foldText(s: string): string {
  const lower = s.toLowerCase();
  try {
    return lower.normalize('NFD').replace(/[̀-ͯ]/g, '');
  } catch {
    return lower;
  }
}

export function searchableText(item: VaultItem): string {
  const m = item.meta;
  const parts = [m.title, ...m.tags];
  if (item.type === 'login') parts.push(item.meta.username, item.meta.email, hostOf(item.meta.url));
  if (item.type === 'card') parts.push(item.meta.cardholder, item.meta.brand);
  return foldText(parts.join(' '));
}

export function hostOf(url: string): string {
  const m = /^(?:[a-z][a-z0-9+.-]*:\/\/)?([^/?#:@]+@)?([^/?#:]+)/i.exec(url.trim());
  return m?.[2]?.replace(/^www\./i, '') ?? '';
}

export function filterItems(items: readonly VaultItem[], f: ItemFilter, sort: ItemSort = 'title'): VaultItem[] {
  const terms = foldText(f.query ?? '')
    .split(/\s+/)
    .filter(Boolean);
  const out = items.filter((i) => {
    if (f.type && f.type !== 'all' && i.type !== f.type) return false;
    if (f.categoryId && i.meta.categoryId !== f.categoryId) return false;
    if (f.favoritesOnly && !i.meta.favorite) return false;
    if (f.tag && !i.meta.tags.some((t) => t.toLowerCase() === f.tag!.toLowerCase())) return false;
    if (terms.length) {
      const text = searchableText(i);
      return terms.every((t) => text.includes(t));
    }
    return true;
  });
  return sortItems(out, sort);
}

export function sortItems(items: VaultItem[], sort: ItemSort): VaultItem[] {
  const copy = [...items];
  if (sort === 'title') copy.sort((a, b) => foldText(a.meta.title).localeCompare(foldText(b.meta.title)));
  else if (sort === 'updated') copy.sort((a, b) => b.updatedAt - a.updatedAt);
  else copy.sort((a, b) => (b.meta.lastViewedAt ?? 0) - (a.meta.lastViewedAt ?? 0) || b.updatedAt - a.updatedAt);
  return copy;
}

export function recentlyViewed(items: readonly VaultItem[], limit = 5): VaultItem[] {
  return [...items]
    .filter((i) => i.meta.lastViewedAt)
    .sort((a, b) => (b.meta.lastViewedAt ?? 0) - (a.meta.lastViewedAt ?? 0))
    .slice(0, limit);
}

export function allTags(items: readonly VaultItem[]): string[] {
  const map = new Map<string, string>();
  for (const i of items) for (const t of i.meta.tags) if (!map.has(t.toLowerCase())) map.set(t.toLowerCase(), t);
  return [...map.values()].sort((a, b) => a.localeCompare(b));
}

/** Only http(s) URLs may be opened from the vault (no intent://, javascript:, file:…). */
export function safeOpenableUrl(url: string): string | null {
  const u = url.trim();
  if (!u) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(withScheme) ? withScheme : null;
}
