import type { EntryType, VaultItem } from '@/vault/types';

/**
 * Free vs Premium. Rules that protect trust:
 *  - A user is NEVER locked out of existing data: viewing, copying, editing, deleting and
 *    exporting always work, even if Premium expired or the item count exceeds the free limit.
 *  - Limits only apply to creating new items / custom categories.
 *  - Encrypted backup is free.
 */
export const FREE_LIMITS: Record<EntryType, number> = {
  login: 50,
  note: 10,
  card: 2,
  identity: 2,
};

export const HISTORY_LIMIT = { free: 1, premium: 10 } as const;

export type PremiumFeature = 'unlimited_items' | 'custom_categories' | 'security_audit' | 'advanced_history' | 'separate_backup_password' | 'accent_colors';

export function canCreate(type: EntryType, items: readonly VaultItem[], isPremium: boolean): boolean {
  if (isPremium) return true;
  return items.filter((i) => i.type === type).length < FREE_LIMITS[type];
}

export function remaining(type: EntryType, items: readonly VaultItem[], isPremium: boolean): number | null {
  if (isPremium) return null;
  return Math.max(0, FREE_LIMITS[type] - items.filter((i) => i.type === type).length);
}

export function historyLimit(isPremium: boolean): number {
  return isPremium ? HISTORY_LIMIT.premium : HISTORY_LIMIT.free;
}

/** Accent colours offered with Premium (all keep WCAG AA contrast with the design system). */
export const ACCENT_CHOICES = ['#2B59C3', '#0F766E', '#6D28D9', '#BE123C', '#B45309', '#334155'] as const;
