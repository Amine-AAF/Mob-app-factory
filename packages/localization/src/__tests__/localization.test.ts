import { basePluralKey, createI18n, flattenKeys, formatNumber, isRtl, resolveLanguage } from '../index';

describe('resolveLanguage', () => {
  const supported = ['en', 'fr', 'es'] as const;
  it('prefers the persisted choice', () => {
    expect(resolveLanguage('es', ['fr-FR'], supported, 'en')).toBe('es');
  });
  it('falls back to the first supported device language', () => {
    expect(resolveLanguage(null, ['de-DE', 'fr-CA'], supported, 'en')).toBe('fr');
    expect(resolveLanguage('xx', ['es_MX'], supported, 'en')).toBe('es');
  });
  it('uses the default when nothing matches', () => {
    expect(resolveLanguage(undefined, ['ja-JP', null], supported, 'en')).toBe('en');
  });
});

describe('i18n instance', () => {
  it('handles plurals, interpolation and missing keys', async () => {
    const missing: string[] = [];
    const i18n = await createI18n({
      resources: {
        en: { translation: { items_one: '{{count}} item', items_other: '{{count}} items', only: 'English only' } },
        fr: { translation: { items_one: '{{count}} élément', items_other: '{{count}} éléments' } },
      },
      supported: ['en', 'fr'] as const,
      fallback: 'en',
      initial: 'fr',
      onMissingKey: (_l, k) => missing.push(k),
    });
    expect(i18n.t('items', { count: 1 })).toBe('1 élément');
    expect(i18n.t('items', { count: 3 })).toBe('3 éléments');
    expect(i18n.t('only')).toBe('English only'); // fallback
  });
});

describe('helpers', () => {
  it('flattens keys and normalises plural suffixes', () => {
    expect(flattenKeys({ a: { b: 'x', c_one: 'y' } })).toEqual(['a.b', 'a.c_one']);
    expect(basePluralKey('a.c_other')).toBe('a.c');
  });
  it('formats numbers per locale and detects RTL', () => {
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    expect(isRtl('ar')).toBe(true);
    expect(isRtl('fr')).toBe(false);
  });
});
