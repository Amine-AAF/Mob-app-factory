import type { AccountType, CategoryKind } from '@/types';

/** Built-in categories. Ids are stable so seeding stays idempotent. Names come from i18n (`categories.<key>`). */
export const DEFAULT_CATEGORIES: readonly { key: string; kind: CategoryKind; icon: string; color: string }[] = [
  { key: 'food', kind: 'expense', icon: 'cart-outline', color: '#16A34A' },
  { key: 'restaurants', kind: 'expense', icon: 'restaurant-outline', color: '#EA580C' },
  { key: 'transportation', kind: 'expense', icon: 'car-outline', color: '#2563EB' },
  { key: 'housing', kind: 'expense', icon: 'home-outline', color: '#7C3AED' },
  { key: 'utilities', kind: 'expense', icon: 'flash-outline', color: '#CA8A04' },
  { key: 'shopping', kind: 'expense', icon: 'bag-handle-outline', color: '#DB2777' },
  { key: 'health', kind: 'expense', icon: 'medkit-outline', color: '#DC2626' },
  { key: 'education', kind: 'expense', icon: 'school-outline', color: '#0891B2' },
  { key: 'entertainment', kind: 'expense', icon: 'film-outline', color: '#9333EA' },
  { key: 'travel', kind: 'expense', icon: 'airplane-outline', color: '#0284C7' },
  { key: 'subscriptions', kind: 'expense', icon: 'repeat-outline', color: '#4F46E5' },
  { key: 'insurance', kind: 'expense', icon: 'shield-checkmark-outline', color: '#475569' },
  { key: 'family', kind: 'expense', icon: 'people-outline', color: '#E11D48' },
  { key: 'other_expense', kind: 'expense', icon: 'ellipsis-horizontal-circle-outline', color: '#64748B' },
  { key: 'salary', kind: 'income', icon: 'briefcase-outline', color: '#059669' },
  { key: 'freelance', kind: 'income', icon: 'laptop-outline', color: '#0D9488' },
  { key: 'business', kind: 'income', icon: 'storefront-outline', color: '#0E7490' },
  { key: 'investments', kind: 'income', icon: 'trending-up-outline', color: '#65A30D' },
  { key: 'gifts', kind: 'income', icon: 'gift-outline', color: '#C026D3' },
  { key: 'other_income', kind: 'income', icon: 'add-circle-outline', color: '#64748B' },
];

export const systemCategoryId = (key: string) => `cat_${key}`;
export const FALLBACK_CATEGORY = { expense: systemCategoryId('other_expense'), income: systemCategoryId('other_income') } as const;

export const ACCOUNT_ICONS: Record<AccountType, string> = {
  cash: 'cash-outline',
  bank: 'business-outline',
  savings: 'shield-outline',
  credit_card: 'card-outline',
  wallet: 'phone-portrait-outline',
  custom: 'wallet-outline',
};

/** Palette offered for accounts, categories and goals (all readable in light and dark mode). */
export const PALETTE = ['#0F766E', '#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0891B2', '#475569'] as const;

export const CATEGORY_ICONS = [
  'cart-outline', 'restaurant-outline', 'car-outline', 'home-outline', 'flash-outline', 'bag-handle-outline',
  'medkit-outline', 'school-outline', 'film-outline', 'airplane-outline', 'repeat-outline', 'shield-checkmark-outline',
  'people-outline', 'paw-outline', 'barbell-outline', 'cafe-outline', 'game-controller-outline', 'gift-outline',
  'briefcase-outline', 'laptop-outline', 'storefront-outline', 'trending-up-outline', 'heart-outline', 'construct-outline',
  'shirt-outline', 'beer-outline', 'bus-outline', 'wifi-outline', 'phone-portrait-outline', 'ellipsis-horizontal-circle-outline',
] as const;

export const GOAL_ICONS = ['shield-outline', 'car-outline', 'airplane-outline', 'home-outline', 'school-outline', 'star-outline', 'heart-outline', 'laptop-outline', 'gift-outline', 'trophy-outline'] as const;

export const GOAL_PRESETS = ['emergency', 'car', 'vacation', 'home', 'education', 'personal'] as const;

/** Free tier limits (Premium removes them). Kept deliberately generous. */
export const FREE_LIMITS = {
  accounts: 3,
  categoryBudgets: 5,
  customCategories: 5,
  savingsGoals: 2,
} as const;

export const RECENT_TX_COUNT = 5;
export const UPCOMING_DAYS = 30;
/** Max occurrences a single recurring catch-up run may create (protects against absurd backlogs). */
export const MAX_CATCH_UP = 366;
export const CSV_MAX_ROWS = 20_000;
