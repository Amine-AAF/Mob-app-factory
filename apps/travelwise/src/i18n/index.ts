import { createI18n, formatDate, formatNumber, formatPercent, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import type { LocalDate } from '@/types/models';
import { dateForDisplay, isValidDate } from '@/utils/dates';
import { formatMoney } from '@/utils/money';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

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

/**
 * Locale-aware formatters. Calendar dates are formatted in UTC from a noon-UTC Date
 * so "2026-07-30" displays as 30 July on every phone, whatever its time zone.
 */
export const fmt = {
  number: (n: number) => formatNumber(n, currentLanguage()),
  percent: (ratio: number) => formatPercent(ratio, currentLanguage()),
  money: (minor: number, currency: string) => formatMoney(minor, currency, currentLanguage()),
  date: (d: LocalDate, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
    isValidDate(d) ? formatDate(dateForDisplay(d), currentLanguage(), { ...options, timeZone: 'UTC' }) : d,
  shortDate: (d: LocalDate) => (isValidDate(d) ? formatDate(dateForDisplay(d), currentLanguage(), { day: 'numeric', month: 'short', timeZone: 'UTC' }) : d),
  weekday: (d: LocalDate) => (isValidDate(d) ? formatDate(dateForDisplay(d), currentLanguage(), { weekday: 'long', timeZone: 'UTC' }) : d),
};
