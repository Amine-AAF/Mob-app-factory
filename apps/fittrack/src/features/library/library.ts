import { LIBRARY } from '@/content/exercises';
import type { Equipment, ExerciseCategory, ExerciseSeed, Level, MuscleGroup } from '@/content/types';
import type { Exercise } from '@/types';
import { normalizeSearch } from '@/utils';

export type ContentLanguage = 'en' | 'fr' | 'es';

/** Library exercises at the "advanced" level are part of the Premium advanced library. */
export const isPremiumExercise = (e: Pick<Exercise, 'source' | 'level'>) => e.source === 'library' && e.level === 'advanced';

export function fromSeed(seed: ExerciseSeed, lng: ContentLanguage): Exercise {
  const text = seed.i18n[lng] ?? seed.i18n.en;
  return {
    id: seed.id,
    source: 'library',
    category: seed.category,
    primary: seed.primary,
    secondary: seed.secondary,
    equipment: seed.equipment,
    level: seed.level,
    tracking: seed.tracking,
    name: text.name,
    description: text.description,
    steps: text.steps,
    tips: text.tips,
    mistakes: text.mistakes,
    easier: text.easier || null,
    harder: text.harder || null,
    easierId: seed.easierId ?? null,
    harderId: seed.harderId ?? null,
  };
}

const cache = new Map<ContentLanguage, Exercise[]>();

export function libraryExercises(lng: ContentLanguage): Exercise[] {
  let list = cache.get(lng);
  if (!list) {
    list = LIBRARY.map((s) => fromSeed(s, lng));
    cache.set(lng, list);
  }
  return list;
}

export const LIBRARY_IDS: ReadonlySet<string> = new Set(LIBRARY.map((s) => s.id));

export interface LibraryFilter {
  query?: string;
  categories?: ExerciseCategory[];
  muscles?: MuscleGroup[];
  equipment?: Equipment[];
  levels?: Level[];
  /** Restrict to these ids (favorites / recent). */
  ids?: ReadonlySet<string> | null;
}

/**
 * Search is accent- and case-insensitive and matches the localized name, the English
 * name (people often know gym names in English) and muscle/category labels.
 * Equipment filter = "I have this": an exercise matches when it needs ONLY selected
 * equipment (bodyweight is always available), so "Dumbbells" returns what can be done
 * with dumbbells, not everything that also happens to use them.
 */
export function filterExercises(list: readonly Exercise[], f: LibraryFilter, labels?: (e: Exercise) => string[]): Exercise[] {
  const q = f.query ? normalizeSearch(f.query) : '';
  const english = q ? new Map(libraryExercises('en').map((e) => [e.id, normalizeSearch(e.name)])) : null;
  const words = q.split(/\s+/).filter(Boolean);
  const equipment = f.equipment?.length ? new Set<Equipment>([...f.equipment, 'bodyweight']) : null;
  return list.filter((e) => {
    if (f.ids && !f.ids.has(e.id)) return false;
    if (f.categories?.length && !f.categories.includes(e.category)) return false;
    if (f.muscles?.length && !f.muscles.includes(e.primary) && !e.secondary.some((m) => f.muscles!.includes(m))) return false;
    if (f.levels?.length && !f.levels.includes(e.level)) return false;
    if (equipment && !e.equipment.every((x) => equipment.has(x))) return false;
    if (words.length) {
      const hay = [normalizeSearch(e.name), english?.get(e.id) ?? '', ...(labels ? labels(e).map(normalizeSearch) : [])].join(' ');
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}

/** Relevance for search results: name starts with the query first, then alphabetical. */
export function sortByRelevance(list: Exercise[], query: string, locale: string): Exercise[] {
  const q = normalizeSearch(query);
  return [...list].sort((a, b) => {
    const sa = q && normalizeSearch(a.name).startsWith(q) ? 0 : 1;
    const sb = q && normalizeSearch(b.name).startsWith(q) ? 0 : 1;
    return sa - sb || a.name.localeCompare(b.name, locale);
  });
}
