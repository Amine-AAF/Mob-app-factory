import { createI18n, formatNumber, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import { formatMoney } from '@/domain/money';
import { formatHm, zonedToUtc } from '@/domain/time';

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

/** Regional locale for Intl (keeps the device region when it matches the UI language, e.g. fr-CA). */
let region: string | null = null;
export function setRegion(languageTag: string | null): void {
  region = languageTag;
}
export function locale(): string {
  const lng = currentLanguage();
  return region && region.toLowerCase().startsWith(lng) ? region : lng;
}

const safeFormat = (options: Intl.DateTimeFormatOptions, date: Date, timeZone?: string) => {
  try {
    return new Intl.DateTimeFormat(locale(), { ...options, ...(timeZone ? { timeZone } : {}) }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale(), options).format(date);
  }
};

/**
 * Formatters. Event dates are formatted *in the event's zone* (passing the
 * zone to Intl), so "18:00 in Lisbon" displays as 18:00 wherever the phone is.
 */
export const fmt = {
  number: (n: number) => formatNumber(n, locale()),
  percent: (ratio: number) => formatNumber(ratio, locale(), { style: 'percent', maximumFractionDigits: 0 }),
  money: (minor: number, currency: string) => formatMoney(minor, currency, locale()),
  /** A calendar date "YYYY-MM-DD" (no zone shift: noon UTC is safe everywhere). */
  day: (date: string, style: 'short' | 'medium' | 'long' | 'full' = 'medium') => safeFormat({ dateStyle: style, timeZone: 'UTC' }, new Date(`${date}T12:00:00Z`)),
  dayShort: (date: string) => safeFormat({ day: 'numeric', month: 'short', timeZone: 'UTC' }, new Date(`${date}T12:00:00Z`)),
  weekday: (date: string) => safeFormat({ weekday: 'short', timeZone: 'UTC' }, new Date(`${date}T12:00:00Z`)),
  monthYear: (year: number, month1: number) => safeFormat({ month: 'long', year: 'numeric', timeZone: 'UTC' }, new Date(Date.UTC(year, month1 - 1, 15))),
  /** A wall-clock time "HH:mm" or minutes, in the user's 12/24 h convention. */
  time: (value: string | number) => {
    const hm = typeof value === 'number' ? formatHm(value) : value;
    const [h, m] = hm.split(':').map(Number) as [number, number];
    return safeFormat({ hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }, new Date(Date.UTC(2026, 0, 1, h, m)));
  },
  /** An instant shown in a given zone (vendor meetings, response dates). */
  instant: (iso: string, timeZone?: string) => safeFormat({ dateStyle: 'medium', timeStyle: 'short' }, new Date(iso), timeZone),
  /** Event start "Sat 14 Jun 2027 · 18:00" in the event zone. */
  eventStart: (e: { startDate: string; startTime: string | null; timezone: string }) =>
    e.startTime ? safeFormat({ dateStyle: 'full', timeStyle: 'short' }, zonedToUtc(e.startDate, e.startTime, e.timezone), e.timezone) : fmt.day(e.startDate, 'full'),
  /** Short label for a zone, e.g. "GMT+2" at the event date. */
  zoneLabel: (timeZone: string, at: Date) => {
    try {
      const parts = new Intl.DateTimeFormat(locale(), { timeZone, timeZoneName: 'short' }).formatToParts(at);
      return parts.find((p) => p.type === 'timeZoneName')?.value ?? timeZone;
    } catch {
      return timeZone;
    }
  },
};

/** The initialised instance (after boot). */
export function i18nInstance(): i18n | null {
  return instance;
}
