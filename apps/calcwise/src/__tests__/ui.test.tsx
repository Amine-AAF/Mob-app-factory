import { ThemeProvider } from '@factory/design-system';
import { createTestDatabase } from '@factory/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen as routerScreen } from 'expo-router/testing-library';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CalculatorScreen from '../../app/(tabs)/calculator';
import Index from '../../app/index';
import { brand } from '@/constants/theme';
import { initDatabase, repos, setRepositories } from '@/database';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageTag: 'en-US', languageCode: 'en', currencyCode: 'USD' }] }));
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return { ...actual, useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]), useLocalSearchParams: () => ({}), router: { push: jest.fn(), navigate: jest.fn(), setParams: jest.fn(), back: jest.fn() } };
});

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', ['en']);
  const db = await createTestDatabase();
  setRepositories(await initDatabase(db));
  useSession.getState().markDbReady();
});

const wrap = (node: ReactNode) => (
  <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
    <ThemeProvider brand={brand} preference="light">
      <I18nextProvider i18n={i18n}>{node}</I18nextProvider>
    </ThemeProvider>
  </SafeAreaProvider>
);

const tap = async (...ids: string[]) => {
  for (const id of ids) await fireEvent.press(screen.getByTestId(`key-${id}`));
};

describe('Calculator screen', () => {
  beforeEach(() => usePreferences.setState({ calculatorMode: 'standard', angleMode: 'deg', numberFormat: 'en-US', haptics: false }));

  it('computes with a live preview, then "=" shows the result', async () => {
    await render(wrap(<CalculatorScreen />));
    await tap('1', '2', 'plus', '3', 'multiply', '2');
    expect(screen.getByTestId('calc-expression').props.children).toBe('12+3×2');
    expect(screen.getByTestId('calc-result').props.children).toBe('= 18');
    await tap('equals');
    expect(screen.getByTestId('calc-result').props.children).toBe('18');
  });

  it('shows a translated error and keeps the expression on division by zero', async () => {
    await render(wrap(<CalculatorScreen />));
    await tap('8', 'divide', '0', 'equals');
    expect(screen.getByTestId('calc-error').props.children).toBe("Can't divide by zero");
    expect(screen.getByTestId('calc-expression').props.children).toBe('8÷0');
  });

  it('uses the locale decimal separator on the keypad and display', async () => {
    usePreferences.setState({ numberFormat: 'fr-FR' });
    await render(wrap(<CalculatorScreen />));
    expect(screen.getByTestId('key-decimal')).toBeTruthy();
    await tap('1', 'decimal', '5', 'plus', '1');
    expect(screen.getByTestId('calc-result').props.children).toBe('= 2,5');
  });

  it('scientific mode: degrees by default', async () => {
    usePreferences.setState({ calculatorMode: 'scientific' });
    await render(wrap(<CalculatorScreen />));
    await tap('sin', '3', '0', 'close', 'equals');
    expect(screen.getByTestId('calc-result').props.children).toBe('0.5');
  });

  it('every key has an accessible label', async () => {
    usePreferences.setState({ calculatorMode: 'scientific' });
    await render(wrap(<CalculatorScreen />));
    for (const key of screen.getAllByRole('button')) expect(key.props.accessibilityLabel?.length ?? 0).toBeGreaterThan(0);
  });

  it('saves "=" results to the local history', async () => {
    await render(wrap(<CalculatorScreen />));
    await tap('clear', '7', 'multiply', '6', 'equals');
    await waitFor(async () => expect((await repos().history.list())[0]?.result).toBe('42'));
  });
});

describe('entry routing', () => {
  const routes = {
    _layout: () => (
      <ThemeProvider brand={brand} preference="light">
        <Slot />
      </ThemeProvider>
    ),
    index: Index,
    onboarding: () => <Text>ONBOARDING</Text>,
    '(tabs)/index': () => <Text>HOME</Text>,
  };

  it('sends new users to onboarding', async () => {
    usePreferences.setState({ onboardingCompleted: false });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await routerScreen.findByText('ONBOARDING')).toBeTruthy();
  });

  it('sends returning users to Home', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await routerScreen.findByText('HOME')).toBeTruthy();
  });
});
