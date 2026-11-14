import { createI18n, formatNumber, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import { fromDayKey, type DayKey } from '@/domain/dates';
import { formatMoney, type Money } from '@/domain/money';
import { formatArea, type UnitSystem } from '@/domain/units';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

export const INTERFACE_LANGUAGES = ['en', 'fr', 'es'] as const;
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<InterfaceLanguage, string> = { en: 'English', fr: 'Français', es: 'Español' };

export const resources = { en, fr, es } as const;

let instance: i18n | null = null;
/** Device locale tag (e.g. "fr-CA", "en-GB") for regional formats. */
let regionLocale: string | null = null;
let dateOrder: 'auto' | 'dmy' | 'mdy' | 'ymd' = 'auto';

export async function initI18n(persisted: string | null, deviceLanguages: (string | null)[], deviceLocaleTag?: string | null): Promise<i18n> {
  const initial = resolveLanguage(persisted, deviceLanguages, INTERFACE_LANGUAGES, 'en');
  regionLocale = deviceLocaleTag ?? null;
  instance = await createI18n({
    resources: { en: { translation: en }, fr: { translation: fr }, es: { translation: es } },
    supported: INTERFACE_LANGUAGES,
    fallback: 'en',
    initial,
    onMissingKey: __DEV__ && process.env.NODE_ENV !== 'test' ? (lng, key) => console.warn(`[i18n] missing "${key}" for ${lng}`) : undefined,
  });
  return instance;
}

export function setDateOrder(order: typeof dateOrder): void {
  dateOrder = order;
}

export function currentLanguage(): InterfaceLanguage {
  const lng = instance?.language;
  return (INTERFACE_LANGUAGES as readonly string[]).includes(lng ?? '') ? (lng as InterfaceLanguage) : 'en';
}

/**
 * Locale used for numbers and dates: the device region when it speaks the UI language
 * ("fr-CA" for a French UI in Canada), otherwise the UI language alone.
 */
export function formatLocale(): string {
  const lng = currentLanguage();
  if (regionLocale && regionLocale.toLowerCase().startsWith(`${lng}-`)) return regionLocale;
  return lng;
}

const pad = (n: number) => String(n).padStart(2, '0');

function formatDay(key: DayKey, style: 'short' | 'medium' | 'long'): string {
  const d = fromDayKey(key);
  if (dateOrder !== 'auto' && style === 'short') {
    const [y, m, day] = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())];
    return dateOrder === 'dmy' ? `${day}/${m}/${y}` : dateOrder === 'mdy' ? `${m}/${day}/${y}` : `${y}-${m}-${day}`;
  }
  return new Intl.DateTimeFormat(formatLocale(), { dateStyle: style }).format(d);
}

export const fmt = {
  number: (n: number) => formatNumber(n, formatLocale()),
  money: (m: Money) => formatMoney(m, formatLocale()),
  /** Several currencies side by side, never summed: "€120.00 · $35.00". */
  moneyList: (list: Money[], empty = '—') => (list.length ? list.map((m) => formatMoney(m, formatLocale())).join(' · ') : empty),
  day: (key: DayKey | null | undefined, style: 'short' | 'medium' | 'long' = 'medium') => (key ? formatDay(key, style) : '—'),
  shortDay: (key: DayKey) => new Intl.DateTimeFormat(formatLocale(), { day: 'numeric', month: 'short' }).format(fromDayKey(key)),
  month: (monthKey: string, style: 'short' | 'long' = 'short') => new Intl.DateTimeFormat(formatLocale(), { month: style, year: style === 'long' ? 'numeric' : undefined }).format(fromDayKey(`${monthKey}-01`)),
  monthTitle: (monthKey: string) => new Intl.DateTimeFormat(formatLocale(), { month: 'long', year: 'numeric' }).format(fromDayKey(`${monthKey}-01`)),
  weekdayNarrow: (d: Date) => new Intl.DateTimeFormat(formatLocale(), { weekday: 'narrow' }).format(d),
  time: (hour: number, minute: number) => new Intl.DateTimeFormat(formatLocale(), { hour: 'numeric', minute: '2-digit' }).format(new Date(2026, 0, 1, hour, minute)),
  area: (m2: number, units: UnitSystem) => formatArea(m2, units, formatLocale()),
  fileSize: (bytes: number | null | undefined) => {
    if (bytes == null) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let v = bytes;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${formatNumber(v, formatLocale(), { maximumFractionDigits: v < 10 && i > 0 ? 1 : 0 })} ${units[i]}`;
  },
};
