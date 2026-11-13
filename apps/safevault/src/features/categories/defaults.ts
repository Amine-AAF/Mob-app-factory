import { DEFAULT_CATEGORY_ID } from '@/vault/types';

/** Built-in categories. Names are translated (`categories.builtin.<key>`); ids are stable. */
export const BUILTIN_CATEGORIES = [
  { key: 'personal', id: 'cat_personal', color: '#2B59C3', icon: 'person' },
  { key: 'work', id: 'cat_work', color: '#7C3AED', icon: 'briefcase' },
  { key: 'finance', id: 'cat_finance', color: '#059669', icon: 'cash' },
  { key: 'social', id: 'cat_social', color: '#DB2777', icon: 'people' },
  { key: 'shopping', id: 'cat_shopping', color: '#EA580C', icon: 'cart' },
  { key: 'email', id: 'cat_email', color: '#0891B2', icon: 'mail' },
  { key: 'development', id: 'cat_development', color: '#4F46E5', icon: 'code-slash' },
  { key: 'servers', id: 'cat_servers', color: '#475569', icon: 'server' },
  { key: 'wifi', id: 'cat_wifi', color: '#0D9488', icon: 'wifi' },
  { key: 'other', id: DEFAULT_CATEGORY_ID, color: '#64748B', icon: 'folder' },
] as const;

export type BuiltinCategoryKey = (typeof BUILTIN_CATEGORIES)[number]['key'];

/** Palette offered for custom categories (all pass 3:1 contrast against white icons). */
export const CATEGORY_COLORS = ['#2B59C3', '#7C3AED', '#059669', '#DB2777', '#EA580C', '#0891B2', '#4F46E5', '#475569', '#0D9488', '#B45309', '#BE123C', '#64748B'] as const;

/** Ionicons names offered for custom categories. */
export const CATEGORY_ICONS = [
  'folder',
  'person',
  'briefcase',
  'cash',
  'card',
  'people',
  'cart',
  'mail',
  'code-slash',
  'server',
  'wifi',
  'home',
  'school',
  'medkit',
  'airplane',
  'game-controller',
  'key',
  'shield-checkmark',
  'cloud',
  'heart',
] as const;
