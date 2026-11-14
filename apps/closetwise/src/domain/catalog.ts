/**
 * Built-in taxonomy. Keys are stable identifiers stored in SQLite; labels come from i18n
 * (`catalog.<group>.<key>`). User-created styles/occasions carry a free-text name instead.
 */

export const CATEGORY_KEYS = [
  'tops',
  'shirts',
  'tshirts',
  'sweaters',
  'jackets',
  'coats',
  'pants',
  'jeans',
  'shorts',
  'skirts',
  'dresses',
  'shoes',
  'bags',
  'accessories',
  'sportswear',
  'formalwear',
  'other',
] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const STYLE_KEYS = ['casual', 'smart_casual', 'business', 'formal', 'sport', 'streetwear', 'minimalist', 'classic', 'elegant', 'vintage', 'other'] as const;
export type StyleKey = (typeof STYLE_KEYS)[number];

export const OCCASION_KEYS = ['work', 'meeting', 'wedding', 'party', 'travel', 'weekend', 'sport', 'daily', 'special_event'] as const;
export type OccasionKey = (typeof OCCASION_KEYS)[number];

/** Seasons are stored as a bitmask so "summer + spring" fits in one indexed integer. */
export const SEASONS = { spring: 1, summer: 2, autumn: 4, winter: 8 } as const;
export type Season = keyof typeof SEASONS;
export const SEASON_KEYS = Object.keys(SEASONS) as Season[];
export const ALL_SEASONS_MASK = 15;

export function seasonsToMask(seasons: readonly Season[]): number {
  return seasons.reduce((m, s) => m | SEASONS[s], 0);
}

export function maskToSeasons(mask: number): Season[] {
  return SEASON_KEYS.filter((s) => (mask & SEASONS[s]) !== 0);
}

/** A mask of 0 means "not specified", treated as all-season by filters and suggestions. */
export function matchesSeason(mask: number, season: Season): boolean {
  return mask === 0 || (mask & SEASONS[season]) !== 0;
}

/** Northern-hemisphere default; the user can override the current season in settings. */
export function seasonForDate(date: Date, hemisphere: 'north' | 'south' = 'north'): Season {
  const m = date.getMonth();
  const north: Season = m <= 1 || m === 11 ? 'winter' : m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'autumn';
  if (hemisphere === 'north') return north;
  return ({ winter: 'summer', summer: 'winter', spring: 'autumn', autumn: 'spring' } as const)[north];
}

export const CONDITIONS = ['new', 'like_new', 'good', 'worn', 'needs_repair'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const CARE_STATUSES = ['clean', 'to_wash', 'in_laundry', 'to_iron', 'ready'] as const;
export type CareStatus = (typeof CARE_STATUSES)[number];
/** Items in these states are not offered by the suggestion engine (unless the user opts in). */
export const UNAVAILABLE_CARE_STATUSES: readonly CareStatus[] = ['to_wash', 'in_laundry'];

/**
 * Built-in colors. `neutral` colors are the only "rule" the suggestion engine uses:
 * it prefers outfits with at most two non-neutral colors. This is a simple heuristic,
 * shown to the user as such, not a claim of perfect harmony.
 */
export const COLORS = [
  { key: 'black', hex: '#111111', neutral: true },
  { key: 'white', hex: '#FAFAF7', neutral: true },
  { key: 'grey', hex: '#8E8E8E', neutral: true },
  { key: 'charcoal', hex: '#3C3C3C', neutral: true },
  { key: 'beige', hex: '#D9C7A7', neutral: true },
  { key: 'cream', hex: '#F1E9D8', neutral: true },
  { key: 'camel', hex: '#B98D5B', neutral: true },
  { key: 'brown', hex: '#6B4A33', neutral: true },
  { key: 'navy', hex: '#1F2A44', neutral: true },
  { key: 'denim', hex: '#4A6A8F', neutral: true },
  { key: 'khaki', hex: '#9A8F5E', neutral: false },
  { key: 'olive', hex: '#5F6B3A', neutral: false },
  { key: 'green', hex: '#2F7D4F', neutral: false },
  { key: 'teal', hex: '#1F7A7A', neutral: false },
  { key: 'blue', hex: '#2D5BD1', neutral: false },
  { key: 'light_blue', hex: '#9CC3E6', neutral: false },
  { key: 'purple', hex: '#6B3FA0', neutral: false },
  { key: 'lavender', hex: '#BBA6DD', neutral: false },
  { key: 'pink', hex: '#E58BB0', neutral: false },
  { key: 'red', hex: '#C62F2F', neutral: false },
  { key: 'burgundy', hex: '#6E1F2C', neutral: false },
  { key: 'orange', hex: '#E07A2E', neutral: false },
  { key: 'yellow', hex: '#E8C33C', neutral: false },
  { key: 'gold', hex: '#C9A13B', neutral: false },
  { key: 'silver', hex: '#C0C3C7', neutral: true },
  { key: 'multicolor', hex: '#999999', neutral: false },
] as const;
export type ColorKey = (typeof COLORS)[number]['key'];
export const COLOR_KEYS = COLORS.map((c) => c.key) as ColorKey[];
const colorIndex = new Map<string, (typeof COLORS)[number]>(COLORS.map((c) => [c.key, c]));
export const colorHex = (key: string | null | undefined): string => (key && colorIndex.get(key)?.hex) || '#999999';
export const isNeutralColor = (key: string | null | undefined): boolean => !!key && colorIndex.get(key)?.neutral === true;

/** Outfit builder slots and which categories can fill them. */
export const SLOTS = ['top', 'bottom', 'onepiece', 'outerwear', 'shoes', 'bag', 'accessory', 'extra'] as const;
export type Slot = (typeof SLOTS)[number];
export const MULTI_SLOTS: readonly Slot[] = ['accessory', 'extra'];

export const SLOT_CATEGORIES: Record<Slot, readonly CategoryKey[]> = {
  top: ['tops', 'shirts', 'tshirts', 'sweaters', 'sportswear', 'formalwear'],
  bottom: ['pants', 'jeans', 'shorts', 'skirts', 'sportswear', 'formalwear'],
  onepiece: ['dresses', 'formalwear'],
  outerwear: ['jackets', 'coats'],
  shoes: ['shoes'],
  bag: ['bags'],
  accessory: ['accessories'],
  extra: CATEGORY_KEYS,
};

/** Default slot for an item of a given category (used when adding an item from its detail page). */
export function defaultSlotFor(category: string): Slot {
  const order: Slot[] = ['shoes', 'bag', 'accessory', 'outerwear', 'onepiece', 'bottom', 'top'];
  return order.find((s) => (SLOT_CATEGORIES[s] as readonly string[]).includes(category)) ?? 'extra';
}

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'MAD', 'CAD', 'CHF', 'MXN', 'ARS', 'COP', 'CLP', 'JPY', 'AUD'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Size systems are labels only: no automatic conversion (brand sizing differs too much). */
export const SIZE_SYSTEMS = ['intl', 'eu', 'us', 'uk', 'fr', 'it', 'jp', 'other'] as const;
export type SizeSystem = (typeof SIZE_SYSTEMS)[number];
export const COMMON_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'One size'] as const;

export const WISHLIST_STATUSES = ['wanted', 'planned', 'purchased', 'cancelled'] as const;
export type WishlistStatus = (typeof WISHLIST_STATUSES)[number];

export const TRIP_TEMPLATES = ['weekend', 'business', 'summer', 'winter', 'beach', 'city'] as const;
export type TripTemplate = (typeof TRIP_TEMPLATES)[number];

export const PACKING_SECTIONS = ['clothes', 'shoes', 'accessories', 'care', 'other'] as const;
export type PackingSection = (typeof PACKING_SECTIONS)[number];

export const CARE_LOG_KINDS = ['washed', 'dry_cleaned', 'ironed', 'repaired'] as const;
export type CareLogKind = (typeof CARE_LOG_KINDS)[number];
export const WASH_METHODS = ['machine', 'hand', 'dry_clean_only', 'do_not_wash'] as const;
export type WashMethod = (typeof WASH_METHODS)[number];
export const DRYING_METHODS = ['tumble_low', 'tumble_normal', 'line_dry', 'flat_dry', 'do_not_tumble'] as const;
export type DryingMethod = (typeof DRYING_METHODS)[number];
export const IRONING_LEVELS = ['low', 'medium', 'high', 'do_not_iron'] as const;
export type IroningLevel = (typeof IRONING_LEVELS)[number];
