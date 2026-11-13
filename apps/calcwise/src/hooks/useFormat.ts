import { getLocales } from 'expo-localization';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePreferences, type NumberFormatPreference } from '@/store/preferences';
import type { HistoryLine } from '@/types';
import { Dec } from '@/utils/decimal';
import { currencyDigits, formatDecimal, formatMoney, formatPercentValue, getSeparators, parseLocalizedNumber, type FormatOptions } from '@/utils/numberFormat';

/** Device locale tag ("fr-FR") and currency ("EUR"), with safe fallbacks. */
export function deviceLocale(): { tag: string; currency: string } {
  try {
    const l = getLocales()[0];
    return { tag: l?.languageTag ?? 'en-US', currency: l?.currencyCode ?? 'USD' };
  } catch {
    return { tag: 'en-US', currency: 'USD' };
  }
}

export function resolveNumberLocale(pref: NumberFormatPreference): string {
  return pref === 'auto' ? deviceLocale().tag : pref;
}

/** Every formatter a screen needs, bound to the user's number format and currency. */
export function useFormat() {
  const { i18n } = useTranslation();
  const numberFormat = usePreferences((s) => s.numberFormat);
  const currencyPref = usePreferences((s) => s.currency);
  return useMemo(() => {
    const locale = resolveNumberLocale(numberFormat);
    const currency = currencyPref ?? deviceLocale().currency;
    const separators = getSeparators(locale);
    const number = (v: Dec, opts?: FormatOptions) => formatDecimal(v, locale, opts);
    const money = (v: Dec) => formatMoney(v, currency, locale);
    const percent = (v: Dec, digits = 2) => formatPercentValue(v, locale, digits);
    const date = (iso: string) => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    const line = (l: HistoryLine, lineCurrency = currency): string => {
      if (l.kind === 'text') return l.value;
      const v = new Dec(l.value);
      if (l.kind === 'money') return formatMoney(v, lineCurrency, locale);
      if (l.kind === 'percent') return formatPercentValue(v, locale);
      if (l.kind === 'integer') return formatDecimal(v, locale, { fractionDigits: 0 });
      return formatDecimal(v, locale) + (l.suffix ? ` ${l.suffix}` : '');
    };
    return {
      locale,
      currency,
      currencyDigits: currencyDigits(currency),
      separators,
      number,
      money,
      percent,
      date,
      line,
      parse: (raw: string) => parseLocalizedNumber(raw, locale),
    };
  }, [numberFormat, currencyPref, i18n.language]);
}

export type Formatters = ReturnType<typeof useFormat>;
