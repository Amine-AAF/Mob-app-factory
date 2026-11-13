import { contrastRatio, createTheme, ThemeProvider, type ThemePreference } from '@factory/design-system';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OperationFeedback, ProcessingView } from '@/components/processing';
import { brand } from '@/config/brand';
import CompressorScreen from '@/features/image-compressor/CompressorScreen';
import ConverterScreen from '@/features/image-converter/ConverterScreen';
import ResizerScreen from '@/features/image-resizer/ResizerScreen';
import ImageToPdfScreen from '@/features/image-to-pdf/ImageToPdfScreen';
import MergeScreen from '@/features/pdf-tools/MergeScreen';
import PdfToolsScreen from '@/features/pdf-tools/PdfToolsScreen';
import SplitScreen from '@/features/pdf-tools/SplitScreen';
import PdfToImagesScreen from '@/features/pdf-to-images/PdfToImagesScreen';
import Paywall from '@/features/premium/PaywallScreen';
import { initI18n } from '@/i18n';

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), dismissAll: jest.fn() };
  return {
    router,
    useLocalSearchParams: () => ({ source: 'test' }),
    useFocusEffect: (cb: () => void | (() => void)) => {
      const { useEffect } = require('react');
      useEffect(cb, [cb]);
    },
    Stack: { Screen: () => null },
  };
});

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: null })) }));

async function wrapper(lng: 'en' | 'fr' | 'es' = 'en', theme: ThemePreference = 'light') {
  const i18n = await initI18n(lng, []);
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: ReactNode }) => (
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
      <ThemeProvider brand={brand} preference={theme}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('brand theme', () => {
  it.each(['light', 'dark'] as const)('meets WCAG AA contrast in %s mode', (scheme) => {
    const t = createTheme(brand, scheme);
    expect(contrastRatio(t.colors.text, t.colors.background)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(t.colors.primary, t.colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.onPrimary, t.colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.accent, t.colors.surface)).toBeGreaterThanOrEqual(3);
  });
});

describe('processing screen', () => {
  it('shows real progress with a page counter and lets the user cancel', async () => {
    const onCancel = jest.fn();
    await render(<ProcessingView title="Rendering pages" done={3} total={10} unit="page" onCancel={onCancel} />, { wrapper: await wrapper('en', 'dark') });
    expect(screen.getByText('Page 3 of 10')).toBeTruthy();
    expect(screen.getByText('Processing on your device. Nothing is uploaded.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('cancel-processing'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows no percentage when progress is unknown (no fake progress)', async () => {
    await render(<ProcessingView title="Compressing" done={0} total={0} onCancel={() => undefined} />, { wrapper: await wrapper('fr') });
    expect(screen.queryByText(/%/)).toBeNull();
    expect(screen.getByText('Traitement en cours…')).toBeTruthy();
  });

  it('explains errors in the user language', async () => {
    await render(<OperationFeedback state={{ phase: 'failed', code: 'pdf_encrypted' }} />, { wrapper: await wrapper('es') });
    expect(screen.getByText(/protegido con contraseña/)).toBeTruthy();
  });
});

describe('paywall', () => {
  it('says purchases are unavailable instead of simulating them when the store is not configured', async () => {
    await render(<Paywall />, { wrapper: await wrapper('en') });
    expect(await screen.findByTestId('store-not-configured')).toBeTruthy();
    expect(screen.getByText('Purchases are not available in this build.')).toBeTruthy();
  });
});

describe('tool screens (empty state)', () => {
  it.each([
    ['compressor', CompressorScreen, 'Choose an image to compress'],
    ['resizer', ResizerScreen, 'Choose an image to resize'],
    ['converter', ConverterScreen, 'Choose an image to convert'],
    ['merge', MergeScreen, 'Choose the PDFs to merge'],
    ['split', SplitScreen, 'Choose a PDF to split or extract pages from'],
    ['image to pdf', ImageToPdfScreen, 'Choose images for your PDF'],
  ] as const)('%s renders its selection step', async (_name, Screen, title) => {
    await render(<Screen />, { wrapper: await wrapper('en') });
    expect(screen.getByText(title)).toBeTruthy();
  });

  it('PDF -> images reports the missing native renderer honestly', async () => {
    await render(<PdfToImagesScreen />, { wrapper: await wrapper('en') });
    expect(screen.getByText("This feature isn't available in this version of the app.")).toBeTruthy();
  });

  it('the PDF hub states that PDF compression is not offered', async () => {
    await render(<PdfToolsScreen />, { wrapper: await wrapper('fr') });
    expect(screen.getByTestId('pdf-compression-unavailable')).toBeTruthy();
    expect(screen.getByText('Pas encore disponible', { exact: false })).toBeTruthy();
  });
});
