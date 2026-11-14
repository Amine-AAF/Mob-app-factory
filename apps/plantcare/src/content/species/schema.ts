import type { PlantCategory, Season } from '@/domain/types';

/**
 * Plant library sheet. Every field is structured (enums, numbers) rather than free text:
 * - it is translated through i18n, so all three languages say exactly the same thing;
 * - descriptions are composed from verified attributes, so nothing botanical is "written"
 *   that is not in the documented data (see CONTENT_SOURCES.md).
 * Scientific names and families are never translated.
 */
export type Light = 'low' | 'medium' | 'bright' | 'direct';
export type WaterNeed = 'low' | 'moderate' | 'high';
export type Humidity = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'moderate' | 'demanding';
/** ASPCA Toxic and Non-Toxic Plant List status for cats and dogs; "unknown" = not verified. */
export type PetSafety = 'toxic' | 'non_toxic' | 'unknown';
export type Placement = 'indoor' | 'outdoor' | 'both';
export type SoilType = 'universal' | 'well_draining' | 'cactus' | 'aroid' | 'orchid' | 'rich' | 'acidic' | 'loam' | 'sandy' | 'none';
export type Region =
  | 'mexico'
  | 'c_america'
  | 's_america'
  | 'caribbean'
  | 'n_america'
  | 'trop_africa'
  | 'e_africa'
  | 's_africa'
  | 'madagascar'
  | 'macaronesia'
  | 'mediterranean'
  | 'europe'
  | 'w_asia'
  | 'c_asia'
  | 's_asia'
  | 'se_asia'
  | 'china'
  | 'japan'
  | 'e_asia'
  | 'arabia'
  | 'australia'
  | 'pacific'
  | 'cultivated';

export interface Species {
  id: string;
  scientificName: string;
  synonyms: string[];
  family: string;
  names: { en: string; fr: string; es: string };
  category: PlantCategory;
  placement: Placement;
  light: Light[];
  water: WaterNeed;
  soil: SoilType[];
  /** Indicative comfortable range in °C (min = lowest temperature generally tolerated without damage). */
  tempC: [min: number, max: number];
  humidity: Humidity;
  /** Flowering seasons where the plant commonly flowers in cultivation (empty = grown for foliage / rarely flowers). */
  bloom: Season[] | 'all_year';
  difficulty: Difficulty;
  pets: PetSafety;
  origin: Region[];
  /** Part of the free basic library. */
  core: boolean;
}

/* ---------------------------------------------------------- compact row decoding */

/**
 * Compact authoring row (keeps 150+ sheets reviewable on one screen each):
 * [id, scientific, family, en, fr, es, category, placement I|O|B, light "LMBS", water L|M|H,
 *  soil codes, tMin, tMax, humidity L|M|H, bloom "sp su au wi" | "all" | "", difficulty E|M|D,
 *  pets T|N|U, origin codes, core 0|1, synonyms?]
 */
export type Row = [
  id: string,
  scientific: string,
  family: string,
  en: string,
  fr: string,
  es: string,
  category: PlantCategory,
  placement: 'I' | 'O' | 'B',
  light: string,
  water: 'L' | 'M' | 'H',
  soil: string,
  tMin: number,
  tMax: number,
  humidity: 'L' | 'M' | 'H',
  bloom: string,
  difficulty: 'E' | 'M' | 'D',
  pets: 'T' | 'N' | 'U',
  origin: string,
  core: 0 | 1,
  synonyms?: string,
];

const LIGHT: Record<string, Light> = { L: 'low', M: 'medium', B: 'bright', S: 'direct' };
const LEVEL = { L: 'low', M: 'moderate', H: 'high' } as const;
const HUM = { L: 'low', M: 'medium', H: 'high' } as const;
const PLACE = { I: 'indoor', O: 'outdoor', B: 'both' } as const;
const DIFF = { E: 'easy', M: 'moderate', D: 'demanding' } as const;
const PETS = { T: 'toxic', N: 'non_toxic', U: 'unknown' } as const;
const SOIL: Record<string, SoilType> = {
  uni: 'universal',
  wd: 'well_draining',
  cac: 'cactus',
  aro: 'aroid',
  orc: 'orchid',
  rich: 'rich',
  acid: 'acidic',
  loam: 'loam',
  sand: 'sandy',
  none: 'none',
};
const SEASON: Record<string, Season> = { sp: 'spring', su: 'summer', au: 'autumn', wi: 'winter' };

function must<T>(map: Record<string, T>, key: string, id: string, field: string): T {
  const v = map[key];
  if (v === undefined) throw new Error(`Species ${id}: invalid ${field} "${key}"`);
  return v;
}

export function decodeRow(r: Row): Species {
  const [id, scientificName, family, en, fr, es, category, place, light, water, soil, tMin, tMax, hum, bloom, diff, pets, origin, core, syn] = r;
  return {
    id,
    scientificName,
    synonyms: syn ? syn.split('|').map((s) => s.trim()) : [],
    family,
    names: { en, fr, es },
    category,
    placement: PLACE[place],
    light: light.split('').map((c) => must(LIGHT, c, id, 'light')),
    water: LEVEL[water],
    soil: soil.split(' ').map((c) => must(SOIL, c, id, 'soil')),
    tempC: [tMin, tMax],
    humidity: HUM[hum],
    bloom: bloom === 'all' ? 'all_year' : bloom === '' ? [] : bloom.split(' ').map((c) => must(SEASON, c, id, 'bloom')),
    difficulty: DIFF[diff],
    pets: PETS[pets],
    origin: origin.split(' ') as Region[],
    core: core === 1,
  };
}
