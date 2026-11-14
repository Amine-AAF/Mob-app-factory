import { createI18n, formatDate, formatNumber, formatPercent, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import { formatDimensions, formatFileSize } from '@/utils/format';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

/** Launch languages. Planned next: pt, de, ar. */
export const INTERFACE_LANGUAGES = ['en', 'fr', 'es'] as const;
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<InterfaceLanguage, string> = { en: 'English', fr: 'Français', es: 'Español' };

export const resources = { en, fr, es } as const;

let instance: i18n | null = null;

export async function initI18n(persisted: string | null, deviceLanguages: (string | null)[]): Promise<i18n> {
  const initial = resolveLanguage(persisted, deviceLanguages, INTERFACE_LANGUAGES, 'en');
  instance = await createI18n({
    resources: { en: { translation: en }, fr: { translation: fr }, es: { translation: es } },
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

/** Locale-aware formatters for the current interface language. */
export const fmt = {
  number: (n: number) => formatNumber(n, currentLanguage()),
  percent: (ratio: number) => formatPercent(ratio, currentLanguage()),
  size: (bytes: number) => formatFileSize(bytes, currentLanguage()),
  dims: (w: number, h: number) => formatDimensions(w, h, currentLanguage()),
  date: (d: Date) => formatDate(d, currentLanguage(), { dateStyle: 'medium', timeStyle: 'short' }),
  day: (d: Date) => formatDate(d, currentLanguage(), { dateStyle: 'medium' }),
};
