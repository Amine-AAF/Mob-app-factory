import {
  isNeutralColor,
  matchesSeason,
  SLOT_CATEGORIES,
  UNAVAILABLE_CARE_STATUSES,
  type OccasionKey,
  type Season,
  type Slot,
  type StyleKey,
} from './catalog';
import type { OutfitItemRef, WardrobeItem } from './types';

/**
 * Local outfit suggestion engine.
 *
 * This is a transparent, rule-based scorer running entirely on the device — not an AI model.
 * It combines the user's own items using: requested style/occasion, season tags, a simple
 * color heuristic (prefer at most two non-neutral colors), how rarely items are worn, and the
 * user's ratings of previous suggestions. Results are starting points the user can edit.
 */

export const SUGGESTION_PRESETS = ['casual', 'business_casual', 'formal', 'weekend', 'sport', 'summer', 'winter', 'evening'] as const;
export type SuggestionPreset = (typeof SUGGESTION_PRESETS)[number];
/** Presets available without Premium. */
export const FREE_PRESETS: readonly SuggestionPreset[] = ['casual', 'weekend', 'summer', 'winter'];

interface PresetRule {
  styles: StyleKey[];
  occasions: OccasionKey[];
  season?: Season;
  outerwear: 'never' | 'optional' | 'required';
  preferCategories?: string[];
}

export const PRESET_RULES: Record<SuggestionPreset, PresetRule> = {
  casual: { styles: ['casual', 'streetwear', 'minimalist', 'classic'], occasions: ['daily', 'weekend'], outerwear: 'optional' },
  business_casual: { styles: ['smart_casual', 'business', 'classic', 'minimalist'], occasions: ['work', 'meeting'], outerwear: 'optional' },
  formal: { styles: ['formal', 'elegant', 'business'], occasions: ['wedding', 'special_event', 'meeting'], outerwear: 'optional', preferCategories: ['formalwear', 'dresses'] },
  weekend: { styles: ['casual', 'streetwear', 'vintage', 'minimalist'], occasions: ['weekend', 'travel'], outerwear: 'optional' },
  sport: { styles: ['sport'], occasions: ['sport'], outerwear: 'never', preferCategories: ['sportswear'] },
  summer: { styles: [], occasions: [], season: 'summer', outerwear: 'never' },
  winter: { styles: [], occasions: [], season: 'winter', outerwear: 'required' },
  evening: { styles: ['elegant', 'formal', 'smart_casual'], occasions: ['party', 'special_event'], outerwear: 'optional', preferCategories: ['dresses', 'formalwear'] },
};

export type SuggestionReason = 'style_match' | 'occasion_match' | 'season_match' | 'neutral_palette' | 'rarely_worn' | 'liked_before';

export interface Suggestion {
  signature: string;
  items: OutfitItemRef[];
  score: number;
  reasons: SuggestionReason[];
}

export interface SuggestionContext {
  items: readonly WardrobeItem[];
  categoryKeyOf: (categoryId: string) => string;
  styleKeyOf: (styleId: string | null) => string | null;
  occasionKeyOf: (occasionId: string) => string | null;
}

export interface SuggestionOptions {
  preset: SuggestionPreset;
  /** Current season, used when the preset has none. */
  season: Season;
  /** Restrict to a specific occasion tag id (built-in or custom). */
  occasionId?: string | null;
  excludedItemIds?: readonly string[];
  includeUnavailable?: boolean;
  /** "Discover" mode: strongly favour items that are rarely or never worn. */
  discover?: boolean;
  /** Signatures of outfits already saved (skipped so suggestions bring something new). */
  savedSignatures?: ReadonlySet<string>;
  /** Ratings of previous suggestions: signature -> -1 | 1. */
  feedback?: ReadonlyMap<string, number>;
  count?: number;
  seed?: number;
  rarelyWornIds?: ReadonlySet<string>;
}

export function signatureOf(itemIds: readonly string[]): string {
  return [...new Set(itemIds)].sort().join('+');
}

/** Deterministic PRNG (mulberry32) so the same seed gives the same suggestions. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Scored {
  item: WardrobeItem;
  score: number;
  reasons: Set<SuggestionReason>;
}

function scoreItem(item: WardrobeItem, rule: PresetRule, ctx: SuggestionContext, opts: SuggestionOptions): Scored {
  const reasons = new Set<SuggestionReason>();
  let score = 1;
  const style = ctx.styleKeyOf(item.styleId);
  if (style && (rule.styles as string[]).includes(style)) {
    score += 2;
    reasons.add('style_match');
  }
  const occasions = item.occasionIds.map(ctx.occasionKeyOf);
  if (opts.occasionId ? item.occasionIds.includes(opts.occasionId) : occasions.some((o) => o && (rule.occasions as string[]).includes(o))) {
    score += 2;
    reasons.add('occasion_match');
  }
  if (item.seasons !== 0) {
    score += 1;
    reasons.add('season_match');
  }
  if (rule.preferCategories?.includes(ctx.categoryKeyOf(item.categoryId))) score += 2;
  if (opts.rarelyWornIds?.has(item.id) || item.wearCount === 0) {
    score += opts.discover ? 3 : 0.5;
    reasons.add('rarely_worn');
  }
  if (item.favorite) score += 0.5;
  return { item, score, reasons };
}

function pickWeighted(list: readonly Scored[], rand: () => number, exclude: ReadonlySet<string>): Scored | null {
  const pool = list.filter((s) => !exclude.has(s.item.id));
  if (pool.length === 0) return null;
  // Square the score so better matches are clearly favoured while keeping variety.
  const weights = pool.map((s) => s.score * s.score);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return pool[i]!;
  }
  return pool[pool.length - 1]!;
}

/** +2 for a mostly neutral palette, -2 when more than two non-neutral colors compete. */
export function colorScore(colors: readonly (string | null)[]): number {
  const loud = new Set(colors.filter((c): c is string => !!c && !isNeutralColor(c)));
  if (loud.size <= 1) return 2;
  if (loud.size === 2) return 1;
  return -2;
}

export function generateSuggestions(ctx: SuggestionContext, opts: SuggestionOptions): Suggestion[] {
  const rule = PRESET_RULES[opts.preset];
  const season = rule.season ?? opts.season;
  const excluded = new Set(opts.excludedItemIds ?? []);
  const available = ctx.items.filter(
    (i) =>
      !i.archived &&
      !excluded.has(i.id) &&
      (opts.includeUnavailable || !UNAVAILABLE_CARE_STATUSES.includes(i.careStatus)) &&
      matchesSeason(i.seasons, season),
  );

  const bySlot = (slot: Slot) =>
    available
      .filter((i) => (SLOT_CATEGORIES[slot] as readonly string[]).includes(ctx.categoryKeyOf(i.categoryId)))
      .map((i) => scoreItem(i, rule, ctx, opts));
  const tops = bySlot('top');
  const bottoms = bySlot('bottom');
  const onepieces = bySlot('onepiece');
  const outer = bySlot('outerwear');
  const shoes = bySlot('shoes');
  const bags = bySlot('bag');
  const accessories = bySlot('accessory');

  const rand = seededRandom(opts.seed ?? 1);
  const count = opts.count ?? 6;
  const results = new Map<string, Suggestion>();
  const attempts = Math.max(40, count * 15);

  for (let n = 0; n < attempts && results.size < count * 3; n++) {
    const used = new Set<string>();
    const chosen: { s: Scored; slot: Slot }[] = [];
    const take = (list: Scored[], slot: Slot) => {
      const s = pickWeighted(list, rand, used);
      if (s) {
        used.add(s.item.id);
        chosen.push({ s, slot });
      }
      return s;
    };

    const canTwoPiece = tops.length > 0 && bottoms.length > 0;
    const useOnePiece = onepieces.length > 0 && (!canTwoPiece || rand() < onepieces.length / (onepieces.length + tops.length));
    if (useOnePiece) take(onepieces, 'onepiece');
    else if (canTwoPiece) {
      take(tops, 'top');
      take(bottoms, 'bottom');
    } else continue;

    if (rule.outerwear === 'required' || (rule.outerwear === 'optional' && (season === 'autumn' || season === 'winter' || rand() < 0.3))) take(outer, 'outerwear');
    take(shoes, 'shoes');
    if (rand() < 0.5) take(bags, 'bag');
    if (rand() < 0.4) take(accessories, 'accessory');

    const ids = chosen.map((c) => c.s.item.id);
    const signature = signatureOf(ids);
    if (results.has(signature) || opts.savedSignatures?.has(signature)) continue;
    const rating = opts.feedback?.get(signature) ?? 0;
    if (rating < 0) continue; // The user said "not for me": never propose it again.

    const reasons = new Set<SuggestionReason>();
    let score = 0;
    for (const c of chosen) {
      score += c.s.score;
      c.s.reasons.forEach((r) => reasons.add(r));
    }
    score = score / chosen.length;
    const palette = colorScore(chosen.map((c) => c.s.item.primaryColor));
    score += palette;
    if (palette === 2) reasons.add('neutral_palette');
    if (rating > 0) {
      score += 1;
      reasons.add('liked_before');
    }
    results.set(signature, {
      signature,
      score: Math.round(score * 100) / 100,
      reasons: [...reasons],
      items: chosen.map((c, position) => ({ itemId: c.s.item.id, slot: c.slot, position })),
    });
  }

  return [...results.values()].sort((a, b) => b.score - a.score || a.signature.localeCompare(b.signature)).slice(0, count);
}

/** Explains why no suggestion could be produced, so the UI can tell the user what to add. */
export function missingForSuggestions(ctx: SuggestionContext): ('top' | 'bottom' | 'shoes')[] {
  const has = (slot: Slot) => ctx.items.some((i) => !i.archived && (SLOT_CATEGORIES[slot] as readonly string[]).includes(ctx.categoryKeyOf(i.categoryId)));
  const missing: ('top' | 'bottom' | 'shoes')[] = [];
  if (!has('onepiece')) {
    if (!has('top')) missing.push('top');
    if (!has('bottom')) missing.push('bottom');
  }
  if (!has('shoes')) missing.push('shoes');
  return missing;
}
