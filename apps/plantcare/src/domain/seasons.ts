import { fromDayKey } from '@factory/app-core';

import type { DayKey, Season } from './types';

/**
 * Seasons depend on where the user gardens. We never assume the northern hemisphere:
 * the user picks a climate profile in Settings.
 * - north / south: meteorological seasons (3-month blocks), inverted between hemispheres.
 * - tropical / none: no temperate seasons are assumed; checklists stay available but the
 *   user chooses which one is relevant (no automatic "current season").
 */
export type ClimateProfile = 'north' | 'south' | 'tropical' | 'none';

const NORTH: Season[] = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
const FLIP: Record<Season, Season> = { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' };

export function currentSeason(day: DayKey, profile: ClimateProfile): Season | null {
  if (profile === 'tropical' || profile === 'none') return null;
  const month = fromDayKey(day).getMonth();
  const north = NORTH[month]!;
  return profile === 'north' ? north : FLIP[north];
}

/**
 * Identifies one season instance, e.g. "2026-spring". Northern winter spans two years
 * and is attributed to the year in which it starts (December).
 */
export function seasonKey(day: DayKey, season: Season, profile: ClimateProfile): string {
  const date = fromDayKey(day);
  let year = date.getFullYear();
  const month = date.getMonth();
  const winterSeason: Season = profile === 'south' ? 'summer' : 'winter';
  if (season === winterSeason && month <= 1) year -= 1;
  return `${year}-${season}`;
}

/** Built-in checklist items (translated via `seasonal.items.<key>`). Users can add their own. */
export const BUILT_IN_SEASONAL: Record<Season, string[]> = {
  spring: ['spring_repot_check', 'spring_resume_feeding', 'spring_inspect_pests', 'spring_clean_pots', 'spring_prune_dead', 'spring_harden_off'],
  summer: ['summer_check_water_often', 'summer_shade_hot_hours', 'summer_humidity', 'summer_deadhead', 'summer_holiday_plan', 'summer_pests'],
  autumn: ['autumn_bring_inside', 'autumn_reduce_feeding', 'autumn_collect_seeds', 'autumn_clean_leaves', 'autumn_protect_frost', 'autumn_plant_bulbs'],
  winter: ['winter_reduce_water', 'winter_away_from_heaters', 'winter_max_light', 'winter_check_drafts', 'winter_plan_garden', 'winter_dust_leaves'],
};
