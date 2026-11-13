import { contrastRatio, createTheme, ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { brand } from '@/config/brand';
import { forceEngine } from '@/crypto/kdf';
import { initI18n } from '@/i18n';
import { setContext } from '@/services/context';
import { initVaultStore, lockVault, useVault } from '@/store/vault';
import { emptyMeta, emptySecret } from '@/vault/schema';
import type { LoginSecret } from '@/vault/types';

import { MASTER, setupVault } from '@/test-utils/vault';

jest.setTimeout(60_000);

const mockParams: Record<string, string> = {};
jest.mock('expo-router', () => {
  const router = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), dismissAll: jest.fn(), canDismiss: () => false };
  return {
    router,
    useRouter: () => router,
    useLocalSearchParams: () => mockParams,
    useSegments: () => [],
    Redirect: () => null,
    Stack: { Screen: () => null },
  };
});
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: null })) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => false), shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Directory: { pickDirectoryAsync: jest.fn() }, Paths: { cache: 'cache' } }));

async function wrapper(lng: 'en' | 'fr' | 'es' = 'en', theme: 'light' | 'dark' = 'light') {
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

async function withVault() {
  const ctx = await setupVault();
  setContext(ctx.db, ctx.vault);
  await ctx.vault.create(MASTER);
  await initVaultStore();
  useVault.setState({ status: 'unlocked' });
  useVault.getState().sync();
  return ctx;
}

afterEach(() => {
  forceEngine(null);
  for (const k of Object.keys(mockParams)) delete mockParams[k];
});

describe('screens', () => {
  it('welcome screen renders in all languages', async () => {
    const Welcome = require('../../app/welcome').default;
    for (const lng of ['en', 'fr', 'es'] as const) {
      const { unmount } = await render(<Welcome />, { wrapper: await wrapper(lng) });
      expect(screen.getByTestId('welcome-create')).toBeTruthy();
      await unmount();
    }
  });

  it('create screen requires a strong confirmed password and the no-recovery acknowledgement', async () => {
    const Create = require('../../app/create').default;
    await render(<Create />, { wrapper: await wrapper() });
    const submit = screen.getByTestId('create-submit');
    expect(submit.props.accessibilityState.disabled).toBe(true);
    await fireEvent.changeText(screen.getByTestId('master-password'), 'password1234');
    await fireEvent.changeText(screen.getByTestId('master-confirm'), 'password1234');
    await fireEvent.press(screen.getByTestId('create-understand'));
    expect(screen.getByTestId('create-submit').props.accessibilityState.disabled).toBe(true); // too weak
    await fireEvent.changeText(screen.getByTestId('master-password'), MASTER + ' Zq9!');
    await fireEvent.changeText(screen.getByTestId('master-confirm'), MASTER + ' Zq9!');
    expect(screen.getByTestId('create-submit').props.accessibilityState.disabled).toBe(false);
  });

  it('unlock screen rejects a wrong password and unlocks with the right one', async () => {
    const ctx = await withVault();
    lockVault();
    const Unlock = require('../../app/unlock').default;
    await render(<Unlock />, { wrapper: await wrapper() });
    await fireEvent.changeText(screen.getByTestId('unlock-password'), 'definitely wrong');
    await fireEvent.press(screen.getByTestId("unlock-submit"));
    await waitFor(() => expect(screen.getByText(/Wrong master password/)).toBeTruthy());
    await fireEvent.changeText(screen.getByTestId('unlock-password'), MASTER);
    await fireEvent.press(screen.getByTestId("unlock-submit"));
    await waitFor(() => expect(useVault.getState().status).toBe('unlocked'));
    expect(ctx.vault.isUnlocked()).toBe(true);
  });

  it('item detail never shows the password by default, and reveals it on demand', async () => {
    const ctx = await withVault();
    const item = await ctx.vault.saveItem(
      { type: 'login', meta: { ...emptyMeta('login'), title: 'Bank', username: 'alice' }, secret: { ...emptySecret('login', 0), password: 'Hidden-Pass-42' } as LoginSecret },
      { historyLimit: 1 },
    );
    mockParams.id = item.id;
    const Detail = require('../../app/item/[id]').default;
    await render(<Detail />, { wrapper: await wrapper() });
    await waitFor(() => expect(screen.getByText('alice')).toBeTruthy());
    await waitFor(() => expect(screen.getAllByLabelText('Password, hidden').length).toBeGreaterThan(0));
    expect(screen.queryByText('Hidden-Pass-42')).toBeNull();
    await fireEvent.press(screen.getAllByLabelText('Show')[0]!);
    expect(screen.getByText('Hidden-Pass-42')).toBeTruthy();
  });

  it('dashboard lists items without secrets and renders in dark mode', async () => {
    const ctx = await withVault();
    await ctx.vault.saveItem(
      { type: 'login', meta: { ...emptyMeta('login'), title: 'Mail', username: 'bob' }, secret: { ...emptySecret('login', 0), password: 'Never-Shown-1' } as LoginSecret },
      { historyLimit: 1 },
    );
    useVault.getState().sync();
    const Dashboard = require('../../app/(tabs)/index').default;
    await render(<Dashboard />, { wrapper: await wrapper('fr', 'dark') });
    expect(screen.getAllByText('Mail').length).toBeGreaterThan(0);
    expect(screen.queryByText('Never-Shown-1')).toBeNull();
  });

  it('generator produces a value and regenerates', async () => {
    await withVault();
    const Generator = require('../../app/(tabs)/generator').default;
    await render(<Generator />, { wrapper: await wrapper('es') });
    const first = screen.getByTestId('generated-value').props.children;
    expect(String(first).length).toBeGreaterThanOrEqual(8);
    await fireEvent.press(screen.getByTestId('regenerate'));
    expect(screen.getByTestId('generated-value').props.children).not.toBe(first);
  });

  it('brand colors keep readable contrast in both themes', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const th = createTheme(brand, scheme);
      expect(contrastRatio(th.colors.primary, th.colors.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(th.colors.onPrimary, th.colors.primary)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
