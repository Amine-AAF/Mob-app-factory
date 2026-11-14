import type { TFunction } from 'i18next';

import { currentLanguage } from '@/i18n';

import type { Species } from './schema';

export function speciesName(s: Species): string {
  return s.names[currentLanguage()];
}

const join = (t: TFunction, items: string[]) => (items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} ${t('common.and')} ${items[items.length - 1]}`);

/**
 * Description composed only from the documented attributes, in the current language.
 * No free-text botanical claims are generated.
 */
export function describeSpecies(s: Species, t: TFunction): string {
  const origin = join(
    t,
    s.origin.map((o) => t(`regions.${o}`)),
  );
  const parts = [
    t('library.desc.intro', { name: speciesName(s), family: s.family, category: t(`categories.${s.category}`).toLowerCase() }),
    s.origin.includes('cultivated') ? t('library.desc.cultivated') : t('library.desc.origin', { origin }),
    t(`library.desc.placement.${s.placement}`),
    t(`library.desc.difficulty.${s.difficulty}`),
  ];
  return parts.join(' ');
}

export function bloomLabel(s: Species, t: TFunction): string {
  if (s.bloom === 'all_year') return t('library.bloomAllYear');
  if (s.bloom.length === 0) return t('library.bloomNone');
  return join(
    t,
    s.bloom.map((b) => t(`seasons.${b}`)),
  );
}
