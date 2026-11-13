import { createI18n, formatDate, formatNumber, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import { APP_LANGUAGES, type AppLanguage } from '@/domain/types';
import { usePreferences } from '@/store/preferences';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

export const LANGUAGE_NAMES: Record<AppLanguage, string> = { en: 'English', fr: 'Français', es: 'Español' };

export const resources = { en, fr, es } as const;

let instance: i18n | null = null;

export async function initI18n(persisted: string | null, deviceLanguages: (string | null)[]): Promise<i18n> {
  const initial = resolveLanguage(persisted, deviceLanguages, APP_LANGUAGES, 'en');
  instance = await createI18n({
    resources: { en: { translation: en }, fr: { translation: fr }, es: { translation: es } },
    supported: APP_LANGUAGES,
    fallback: 'en',
    initial,
    onMissingKey: __DEV__ && process.env.NODE_ENV !== 'test' ? (lng, key) => console.warn(`[i18n] missing "${key}" for ${lng}`) : undefined,
  });
  return instance;
}

export function currentLanguage(): AppLanguage {
  const lng = instance?.language;
  return (APP_LANGUAGES as readonly string[]).includes(lng ?? '') ? (lng as AppLanguage) : 'en';
}

function hour12(): boolean | undefined {
  const f = usePreferences.getState().timeFormat;
  return f === 'auto' ? undefined : f === '12h';
}

/** Locale-aware formatting following the user's regional preferences. */
export const fmt = {
  number: (n: number, digits = 0) => formatNumber(n, currentLanguage(), { maximumFractionDigits: digits }),
  date: (d: Date, options?: Intl.DateTimeFormatOptions) => formatDate(d, currentLanguage(), options),
  dayShort: (d: Date) => formatDate(d, currentLanguage(), { weekday: 'short', day: 'numeric' }),
  dayLong: (d: Date) => formatDate(d, currentLanguage(), { weekday: 'long', day: 'numeric', month: 'long' }),
  weekday: (d: Date) => formatDate(d, currentLanguage(), { weekday: 'short' }),
  monthYear: (d: Date) => formatDate(d, currentLanguage(), { month: 'long', year: 'numeric' }),
  time: (d: Date) => new Intl.DateTimeFormat(currentLanguage(), { hour: 'numeric', minute: '2-digit', hour12: hour12() }).format(d),
  minutes: (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ''}` : `${m} min`),
};
