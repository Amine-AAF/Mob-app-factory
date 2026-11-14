import { createI18n, formatDate, formatNumber, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import { fromDayKey } from '@/domain/dates';
import { fromKg, type WeightUnit } from '@/domain/units';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

export const INTERFACE_LANGUAGES = ['en', 'fr', 'es'] as const;
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<InterfaceLanguage, string> = { en: 'English', fr: 'Français', es: 'Español' };

export const resources = { en, fr, es } as const;

let instance: i18n | null = null;
/** Device locale tag (e.g. 'fr-CA') used for regional formats when it matches the UI language. */
let regionTag: string | null = null;

export async function initI18n(persisted: string | null, deviceLanguages: (string | null)[], deviceTag?: string | null): Promise<i18n> {
  const initial = resolveLanguage(persisted, deviceLanguages, INTERFACE_LANGUAGES, 'en');
  regionTag = deviceTag ?? null;
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

/** Locale for Intl: the device's regional variant when it matches the UI language (fr-CA, es-MX…). */
export function formatLocale(): string {
  const lng = currentLanguage();
  return regionTag && regionTag.toLowerCase().startsWith(`${lng}-`) ? regionTag : lng;
}

export const fmt = {
  number: (n: number, digits = 1) => formatNumber(n, formatLocale(), { maximumFractionDigits: digits }),
  /** Date-only values are formatted from their local day key (no time-zone shift). */
  day: (day: string | null | undefined, style: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) => (day ? formatDate(fromDayKey(day), formatLocale(), style) : ''),
  dayShort: (day: string) => formatDate(fromDayKey(day), formatLocale(), { day: 'numeric', month: 'short' }),
  month: (day: string) => formatDate(fromDayKey(day), formatLocale(), { month: 'long', year: 'numeric' }),
  monthShort: (monthIndex: number) => formatDate(new Date(2026, monthIndex, 1), formatLocale(), { month: 'narrow' }),
  dateTime: (iso: string) => formatDate(new Date(iso), formatLocale(), { dateStyle: 'medium', timeStyle: 'short' }),
  time: (iso: string) => formatDate(new Date(iso), formatLocale(), { timeStyle: 'short' }),
  weekday: (iso: string) => formatDate(new Date(iso), formatLocale(), { weekday: 'long' }),
  money: (amount: number, currency: string) => {
    try {
      return formatNumber(amount, formatLocale(), { style: 'currency', currency });
    } catch {
      return `${formatNumber(amount, formatLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
    }
  },
  weight: (kg: number, unit: WeightUnit) => `${formatNumber(fromKg(kg, unit), formatLocale(), { maximumFractionDigits: 2 })} ${unit}`,
};
