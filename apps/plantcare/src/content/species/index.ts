import { FOLIAGE } from './foliage';
import { GARDEN } from './garden';
import { decodeRow, type Light, type Species } from './schema';
import { SUCCULENTS } from './succulents';

export * from './schema';

/** Bump when sheets change so the SQLite copy is re-seeded (user data is never touched). */
export const LIBRARY_VERSION = 1;

export const SPECIES: readonly Species[] = [...FOLIAGE, ...SUCCULENTS, ...GARDEN].map(decodeRow);

const byId = new Map(SPECIES.map((s) => [s.id, s]));

export function getSpecies(id: string | null | undefined): Species | null {
  return id ? (byId.get(id) ?? null) : null;
}

export type LibraryFilter =
  | 'indoor'
  | 'outdoor'
  | 'low_light'
  | 'medium_light'
  | 'bright_light'
  | 'easy_care'
  | 'pet_safe'
  | 'flowering'
  | 'succulents'
  | 'herbs';

export const LIBRARY_FILTERS: LibraryFilter[] = ['indoor', 'outdoor', 'low_light', 'medium_light', 'bright_light', 'easy_care', 'pet_safe', 'flowering', 'succulents', 'herbs'];

const hasLight = (s: Species, l: Light) => s.light.includes(l);

export function matchesFilter(s: Species, f: LibraryFilter): boolean {
  switch (f) {
    case 'indoor':
      return s.placement !== 'outdoor';
    case 'outdoor':
      return s.placement !== 'indoor';
    case 'low_light':
      return hasLight(s, 'low');
    case 'medium_light':
      return hasLight(s, 'medium');
    case 'bright_light':
      return hasLight(s, 'bright') || hasLight(s, 'direct');
    case 'easy_care':
      return s.difficulty === 'easy';
    case 'pet_safe':
      // Only plants verified as non-toxic; "unknown" is never presented as safe.
      return s.pets === 'non_toxic';
    case 'flowering':
      return s.bloom === 'all_year' || s.bloom.length > 0;
    case 'succulents':
      return s.category === 'succulent' || s.category === 'cactus';
    case 'herbs':
      return s.category === 'herb';
  }
}

/** Accent- and case-insensitive search key. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[×’']/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Searches common names in every language, scientific names and synonyms. */
export function searchSpecies(query: string, filters: LibraryFilter[] = [], list: readonly Species[] = SPECIES): Species[] {
  const q = normalize(query);
  return list.filter((s) => {
    if (!filters.every((f) => matchesFilter(s, f))) return false;
    if (!q) return true;
    const hay = normalize([s.scientificName, s.family, s.names.en, s.names.fr, s.names.es, ...s.synonyms].join(' '));
    return q.split(' ').every((part) => hay.includes(part));
  });
}
