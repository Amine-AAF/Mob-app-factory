import { createI18n, formatDate, formatNumber, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import { en, es, fr } from './resources';

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

/** Regional formats follow the interface language (decimal separators, date order, currency placement). */
export const fmt = {
  number: (n: number, options?: Intl.NumberFormatOptions) => formatNumber(n, currentLanguage(), options),
  /** Amount in its own currency; never converted. */
  money: (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(currentLanguage(), { style: 'currency', currency, maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
    } catch {
      return `${formatNumber(amount, currentLanguage(), { maximumFractionDigits: 2 })} ${currency}`;
    }
  },
  date: (d: Date, options?: Intl.DateTimeFormatOptions) => formatDate(d, currentLanguage(), options),
  day: (key: string, options?: Intl.DateTimeFormatOptions) => {
    const [y, m, d] = key.split('-').map(Number) as [number, number, number];
    return formatDate(new Date(y, m - 1, d), currentLanguage(), options ?? { dateStyle: 'medium' });
  },
  monthYear: (monthKey: string) => {
    const [y, m] = monthKey.split('-').map(Number) as [number, number];
    return formatDate(new Date(y, m - 1, 1), currentLanguage(), { month: 'long', year: 'numeric' });
  },
  weekdayShort: (key: string) => {
    const [y, m, d] = key.split('-').map(Number) as [number, number, number];
    return formatDate(new Date(y, m - 1, d), currentLanguage(), { weekday: 'short' });
  },
  time: (hour: number, minute: number) => formatDate(new Date(2026, 0, 1, hour, minute), currentLanguage(), { hour: '2-digit', minute: '2-digit' }),
};
