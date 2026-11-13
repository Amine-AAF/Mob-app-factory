import { createI18n, formatDate, formatNumber, formatPercent, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import type { Translate } from '@/engine';

import contentEn from './content/en.json';
import contentEs from './content/es.json';
import contentFr from './content/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

/**
 * Two namespaces:
 *   translation — interface strings (src/i18n/locales)
 *   content     — challenge templates rendered by the engine (src/i18n/content)
 * Future languages (pt, de, ar) only need two JSON files each; Arabic also
 * needs the RTL audit described in factory/documentation.
 */
export const INTERFACE_LANGUAGES = ['en', 'fr', 'es'] as const;
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];
export const PLANNED_LANGUAGES = ['pt', 'de', 'ar'] as const;

export const LANGUAGE_NAMES: Record<InterfaceLanguage, string> = { en: 'English', fr: 'Français', es: 'Español' };

export const resources = { en, fr, es } as const;
export const contentResources = { en: contentEn, fr: contentFr, es: contentEs } as const;

let instance: i18n | null = null;

export async function initI18n(persisted: string | null, deviceLanguages: (string | null)[]): Promise<i18n> {
  const initial = resolveLanguage(persisted, deviceLanguages, INTERFACE_LANGUAGES, 'en');
  instance = await createI18n({
    resources: {
      en: { translation: en, content: contentEn },
      fr: { translation: fr, content: contentFr },
      es: { translation: es, content: contentEs },
    },
    supported: INTERFACE_LANGUAGES,
    fallback: 'en',
    initial,
    onMissingKey: __DEV__ && process.env.NODE_ENV !== 'test' ? (lng, key) => console.warn(`[i18n] missing "${key}" for ${lng}`) : undefined,
  });
  return instance;
}

export function currentLanguage(): InterfaceLanguage {
  const lng = instance?.language;
  return (INTERFACE_LANGUAGES as readonly string[]).includes(lng ?? '') ? (lng as InterfaceLanguage) : 'en';
}

/** French elision for composed sentences ("Si il pleut" → "S'il pleut"). */
export function fixFrench(text: string): string {
  return text.replace(/\b([Ss])i il(s?)\b/g, '$1’il$2').replace(/\b([Qq])ue il(s?)\b/g, '$1u’il$2');
}

/** Engine translator for challenge content in the given (or current) language. */
export function contentTranslator(i18nInstance: i18n, lng: string = i18nInstance.language): Translate {
  const t = i18nInstance.getFixedT(lng, 'content');
  return (key, params) => {
    const out = String(t(key, params ?? {}));
    return lng === 'fr' ? fixFrench(out) : out;
  };
}

export const fmt = {
  number: (n: number) => formatNumber(n, currentLanguage()),
  percent: (ratio: number) => formatPercent(ratio, currentLanguage()),
  date: (d: Date, options?: Intl.DateTimeFormatOptions) => formatDate(d, currentLanguage(), options),
  weekday: (d: Date) => formatDate(d, currentLanguage(), { weekday: 'narrow' }),
};
