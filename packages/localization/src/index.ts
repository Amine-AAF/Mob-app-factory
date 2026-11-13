import { createInstance, type i18n, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * Shared i18next bootstrap.
 * - Language resolution: persisted choice > device locales > default.
 * - Missing keys fall back to the default language and are reported in dev.
 * - Pluralisation uses i18next's Intl.PluralRules based "_one/_other" suffixes.
 */
export interface LocalizationOptions<L extends string> {
  resources: Record<L, Resource[string]>;
  supported: readonly L[];
  fallback: L;
  initial: L;
  rtl?: readonly string[];
  onMissingKey?: (lng: string, key: string) => void;
}

export function resolveLanguage<L extends string>(
  persisted: string | null | undefined,
  deviceLanguageCodes: readonly (string | null | undefined)[],
  supported: readonly L[],
  fallback: L,
): L {
  const isSupported = (code: string | null | undefined): code is L => !!code && (supported as readonly string[]).includes(code);
  if (isSupported(persisted)) return persisted;
  for (const code of deviceLanguageCodes) {
    const base = code?.toLowerCase().split(/[-_]/)[0];
    if (isSupported(base)) return base;
  }
  return fallback;
}

export async function createI18n<L extends string>(opts: LocalizationOptions<L>): Promise<i18n> {
  const instance = createInstance();
  const resources: Resource = {};
  for (const lng of opts.supported) resources[lng] = opts.resources[lng];

  await instance.use(initReactI18next).init({
    resources,
    lng: opts.initial,
    fallbackLng: opts.fallback,
    supportedLngs: [...opts.supported],
    defaultNS: 'translation',
    interpolation: { escapeValue: false }, // React already escapes.
    returnNull: false,
    saveMissing: Boolean(opts.onMissingKey),
    missingKeyHandler: opts.onMissingKey
      ? (lngs, _ns, key) => opts.onMissingKey?.(String(lngs[0] ?? ''), key)
      : undefined,
  });
  return instance;
}

export function isRtl(lng: string, rtl: readonly string[] = ['ar', 'he', 'fa', 'ur']): boolean {
  return rtl.includes(lng);
}

/** Locale-aware formatters built on Intl (available in Hermes). */
export function formatNumber(value: number, lng: string, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(lng, options).format(value);
}

export function formatDate(date: Date, lng: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(lng, options ?? { dateStyle: 'medium' }).format(date);
}

export function formatPercent(ratio: number, lng: string): string {
  return new Intl.NumberFormat(lng, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);
}

/** Collects every key path of a nested resource object (for completeness tests). */
export function flattenKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => flattenKeys(v, prefix ? `${prefix}.${k}` : k));
}

/** Normalises plural keys ("x_one", "x_other", "x_many") to their base key. */
export function basePluralKey(key: string): string {
  return key.replace(/_(zero|one|two|few|many|other)$/, '');
}
