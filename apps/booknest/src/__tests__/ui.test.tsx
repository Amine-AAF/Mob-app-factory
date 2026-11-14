import { contrastRatio, createTheme, ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen } from '@testing-library/react-native';
import fs from 'fs';
import type { i18n as I18n } from 'i18next';
import path from 'path';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { BookRow, BookTile, StatusPicker } from '@/components/books';
import { BookCover, ProgressLine, Ring, StarRating } from '@/components/ui';
import { paper, PALETTES } from '@/config/brand';
import { initI18n } from '@/i18n';
import type { BookListItem } from '@/types';

jest.setTimeout(60_000);

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', []);
});

const wrap = (ui: ReactNode) => (
  <ThemeProvider brand={PALETTES.library} preference="light">
    <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
  </ThemeProvider>
);

const item = (extra: Partial<BookListItem> = {}): BookListItem => ({
  id: 'b1', title: 'The Left Hand of Darkness', authorName: 'Ursula K. Le Guin', coverThumbUri: null, format: 'paperback', pageCount: 300,
  status: 'reading', currentPage: 150, isFavorite: true, isArchived: false, rating: 4, genreName: 'Science fiction', updatedAt: '2026-11-10T00:00:00Z',
  audioProgress: null, ...extra,
});

describe('book components', () => {
  it('renders a tile with an accessible label and opens the book', async () => {
    const onPress = jest.fn();
    await render(wrap(<BookTile book={item()} width={100} onPress={onPress} />));
    await fireEvent.press(screen.getByLabelText('The Left Hand of Darkness by Ursula K. Le Guin, Reading'));
    expect(onPress).toHaveBeenCalledWith('b1');
  });

  it('shows progress percentage in list rows only when the page count is known', async () => {
    const { rerender } = await render(wrap(<BookRow book={item()} onPress={jest.fn()} />));
    expect(screen.getByText('50%')).toBeTruthy();
    await rerender(wrap(<BookRow book={item({ pageCount: null })} onPress={jest.fn()} />));
    expect(screen.queryByText('50%')).toBeNull();
  });

  it('generates a cover with the title when no image exists', async () => {
    await render(wrap(<BookCover uri={null} title="Dune" author="Frank Herbert" width={120} />));
    expect(screen.getByText('Dune')).toBeTruthy();
  });

  it('lets the user pick a status and a rating', async () => {
    const onStatus = jest.fn();
    const onRate = jest.fn();
    await render(wrap(<><StatusPicker value="want_to_read" onChange={onStatus} /><StarRating value={2} onChange={onRate} testID="stars" /></>));
    await fireEvent.press(screen.getByTestId('status-completed'));
    expect(onStatus).toHaveBeenCalledWith('completed');
    await fireEvent.press(screen.getByTestId('stars-4'));
    expect(onRate).toHaveBeenCalledWith(4);
    await fireEvent.press(screen.getByTestId('stars-2'));
    expect(onRate).toHaveBeenLastCalledWith(null);
  });

  it('exposes progress to accessibility and hides unknown progress', async () => {
    await render(wrap(<><ProgressLine ratio={0.42} label="Progress A" /><ProgressLine ratio={null} label="Progress B" /><Ring ratio={0.5} label="Ring" /></>));
    expect(screen.getByLabelText('Progress A').props.accessibilityValue).toMatchObject({ now: 42 });
    expect(screen.getByLabelText('Progress B').props.accessibilityValue).toBeUndefined();
    expect(screen.getByLabelText('Ring').props.accessibilityValue).toMatchObject({ now: 50 });
  });
});

describe('design system', () => {
  it.each(Object.entries(PALETTES))('palette %s keeps readable text contrast on paper in both themes', (_id, brand) => {
    for (const scheme of ['light', 'dark'] as const) {
      const theme = createTheme(brand, scheme);
      const bg = paper[scheme];
      expect(contrastRatio(theme.colors.text, bg.background)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(theme.colors.textMuted, bg.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(theme.colors.primary, bg.surface)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('policies enforced in code', () => {
  const appDir = path.join(__dirname, '..', '..', 'app');
  const srcDir = path.join(__dirname, '..');
  const files = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === '__tests__' ? [] : files(p);
      return /\.(tsx?)$/.test(e.name) ? [p] : [];
    });

  it('offline-first: app code never calls the network', () => {
    const offenders = [...files(appDir), ...files(srcDir)].filter((f) => /\bfetch\(|XMLHttpRequest|axios|WebSocket\(/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('no ads while reading, writing a note/review or saving a quote', () => {
    const adFree = ['book', 'session', 'quotes', 'journal', 'goals', 'onboarding.tsx', 'paywall.tsx', 'settings'].flatMap((n) => {
      const p = path.join(appDir, n);
      return fs.statSync(p).isDirectory() ? files(p) : [p];
    });
    expect(adFree.filter((f) => /AdBanner|BannerAd|Interstitial/.test(fs.readFileSync(f, 'utf8')))).toEqual([]);
  });

  it('never logs personal content (no console calls outside dev-only helpers)', () => {
    const allowed = ['analytics.ts', 'index.ts'];
    const offenders = [...files(appDir), ...files(srcDir)].filter((f) => !allowed.includes(path.basename(f)) && /console\.(log|info|warn|error)/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('analytics events carry no free-text user content', () => {
    const src = fs.readFileSync(path.join(srcDir, 'services', 'analytics.ts'), 'utf8');
    expect(src).not.toMatch(/title: string|text: string|note: string|quote: string|author: string/);
  });
});
