import { contrastRatio, createTheme, ThemeProvider, type ThemePreference } from '@factory/design-system';
import { createTestDatabase } from '@factory/testing';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CompressionPanel } from '@/components/CompressionPanel';
import { ExportDialog } from '@/components/ExportDialog';
import { FormatSelector } from '@/components/FormatSelector';
import { ProcessingProgress } from '@/components/ProcessingProgress';
import { brand } from '@/constants/brand';
import { initDatabase, setRepositories } from '@/database';
import EditorScreen from '@/features/editor/EditorScreen';
import HomeScreen from '@/features/home/HomeScreen';
import OnboardingScreen from '@/features/onboarding/OnboardingScreen';
import PaywallScreen from '@/features/premium/PaywallScreen';
import { initI18n } from '@/i18n';
import { createMemoryFileStore } from '@/services/files/fileStore';
import { createWorkspace } from '@/services/files/workspace';
import { setProcessingEnv } from '@/services/env';
import { createFallbackRenderer } from '@/services/image/renderer';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: () => ({ source: 'test' }),
}));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => true), shareAsync: jest.fn(async () => undefined) }));
jest.mock('expo-file-system', () => ({ File: class {}, Directory: class {}, Paths: { cache: { uri: 'mem://cache' }, document: { uri: 'mem://documents' } } }));

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

jest.setTimeout(60_000);

beforeAll(async () => {
  setRepositories(await initDatabase(await createTestDatabase()));
  const fs = createMemoryFileStore();
  setProcessingEnv({ fs, workspace: createWorkspace(fs), renderer: createFallbackRenderer(fs) });
});

describe('brand theme', () => {
  it.each(['light', 'dark'] as const)('meets WCAG AA contrast in %s mode', (scheme) => {
    const t = createTheme(brand, scheme);
    expect(contrastRatio(t.colors.text, t.colors.background)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(t.colors.primary, t.colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.onPrimary, t.colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.accent, t.colors.surface)).toBeGreaterThanOrEqual(3);
  });
});

describe('screens', () => {
  it.each(['en', 'fr', 'es'] as const)('Home offers one-tap import and the quick tools (%s)', async (lng) => {
    await render(<HomeScreen />, { wrapper: await wrapper(lng) });
    await act(async () => undefined);
    expect(screen.getByTestId('import-hero')).toBeTruthy();
    for (const id of ['compress', 'resize', 'crop', 'convert']) expect(screen.getByTestId(`quick-${id}`)).toBeTruthy();
    expect(screen.getByTestId('home-social')).toBeTruthy();
    expect(screen.getByTestId('home-collage')).toBeTruthy();
  });

  it('renders in dark mode', async () => {
    await render(<HomeScreen />, { wrapper: await wrapper('en', 'dark') });
    await act(async () => undefined);
    expect(screen.getByTestId('home-screen')).toBeTruthy();
  });

  it('onboarding has three short steps and asks for no permission', async () => {
    const picker = jest.requireMock('expo-image-picker') as { launchImageLibraryAsync: jest.Mock };
    await render(<OnboardingScreen />, { wrapper: await wrapper() });
    expect(screen.getByText('Welcome to ImageCraft')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('onboarding-next'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));
    expect(screen.getByText('Your photos stay on your device')).toBeTruthy();
    expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it('the editor without a photo invites to import', async () => {
    await render(<EditorScreen />, { wrapper: await wrapper() });
    expect(screen.getByTestId('editor-empty')).toBeTruthy();
    expect(screen.getByTestId('editor-import')).toBeTruthy();
  });

  it('the paywall never shows a hard-coded price or a fake purchase without a store', async () => {
    await render(<PaywallScreen />, { wrapper: await wrapper() });
    await act(async () => undefined);
    expect(screen.getByTestId('store-unavailable')).toBeTruthy();
    expect(screen.queryByTestId('subscribe')).toBeNull();
    expect(screen.queryByText(/\$|€/)).toBeNull();
  });
});

describe('components', () => {
  it('format selector warns that JPEG drops transparency', async () => {
    const onChange = jest.fn();
    await render(<FormatSelector value="jpeg" onChange={onChange} hasAlpha />, { wrapper: await wrapper() });
    expect(screen.getByText(/JPEG cannot keep them/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('format-webp'));
    expect(onChange).toHaveBeenCalledWith('webp');
  });

  it('compression panel shows the original size and an estimate range, labelled as such', async () => {
    await render(<CompressionPanel format="jpeg" quality={70} range={[30, 95]} onQuality={jest.fn()} originalBytes={4_000_000} estimate={{ bytes: 1_000_000, low: 800_000, high: 1_250_000, method: 'sampled' }} />, {
      wrapper: await wrapper(),
    });
    expect(screen.getByText('4 MB')).toBeTruthy();
    expect(screen.getByText('800 KB – 1.3 MB')).toBeTruthy();
    expect(screen.getByText(/estimate/)).toBeTruthy();
    expect(screen.getByText(/known only after processing/)).toBeTruthy();
  });

  it('PNG has no quality slider and says it is lossless', async () => {
    await render(<CompressionPanel format="png" quality={70} range={[30, 95]} onQuality={jest.fn()} originalBytes={1000} estimate={null} />, { wrapper: await wrapper() });
    expect(screen.queryByTestId('quality-slider')).toBeNull();
    expect(screen.getByText(/always lossless/)).toBeTruthy();
  });

  it('processing progress can be cancelled', async () => {
    const onCancel = jest.fn();
    await render(<ProcessingProgress done={2} total={5} onCancel={onCancel} />, { wrapper: await wrapper() });
    expect(screen.getByText('2 / 5')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('cancel-job'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('the export sheet reports the exact size, savings and lossy/lossless honestly', async () => {
    const file = { uri: 'mem://documents/outputs/a.jpg', name: 'a-compressed.jpg', width: 4000, height: 3000, bytes: 1_000_000, format: 'jpeg' as const, lossless: false };
    await render(<ExportDialog visible files={[file]} inputBytes={4_000_000} tool="compress" onDone={jest.fn()} />, { wrapper: await wrapper() });
    expect(screen.getByText('Lossy compression')).toBeTruthy();
    expect(screen.getByTestId('saved-percent')).toHaveTextContent('75% smaller');
    expect(screen.getByTestId('save-gallery')).toBeTruthy();
    expect(screen.getByTestId('share')).toBeTruthy();
  });
});
