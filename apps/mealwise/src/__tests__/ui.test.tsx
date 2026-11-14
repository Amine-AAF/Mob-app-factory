import { contrastRatio, createTheme, ThemeProvider, type ThemePreference } from '@factory/design-system';
import { createTestDatabase } from '@factory/testing';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GroceryScreen from '../../app/(tabs)/grocery';
import HomeScreen from '../../app/(tabs)/index';
import RecipesScreen from '../../app/(tabs)/recipes';
import CookingMode from '../../app/cook/[id]';
import Paywall from '../../app/paywall';
import RecipeScreen from '../../app/recipe/[id]';
import { brand } from '@/config/brand';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import { initI18n } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

const mockParams: { current: Record<string, string> } = { current: {} };

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), navigate: jest.fn() };
  return {
    router,
    useLocalSearchParams: () => mockParams.current,
    Stack: { Screen: () => null },
    Redirect: () => null,
  };
});
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: null })) }));
jest.mock('expo-clipboard', () => ({ getStringAsync: jest.fn(async () => '') }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => false), shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { cache: '/tmp' } }));

let repos: Repositories;

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

beforeEach(async () => {
  clock.set(() => new Date(2026, 10, 16, 9, 0)); // Monday 16 Nov 2026
  repos = await initDatabase(await createTestDatabase());
  setRepositories(repos);
  useSession.setState({ dbReady: true, dataVersion: 0 });
  usePreferences.setState({ unitSystem: 'metric', keepOriginalUnits: false, firstDayOfWeek: 'monday', householdSize: 2, diet: 'none', currency: 'EUR' });
  mockParams.current = {};
});
afterAll(() => clock.set(null));

describe('brand theme', () => {
  it.each(['light', 'dark'] as const)('meets WCAG AA contrast in %s mode', (scheme) => {
    const t = createTheme(brand, scheme);
    expect(contrastRatio(t.colors.text, t.colors.background)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(t.colors.primary, t.colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.onPrimary, t.colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.accent, t.colors.surface)).toBeGreaterThanOrEqual(3);
  });
});

describe('dashboard', () => {
  it('shows the next meal and today’s plan', async () => {
    await repos.plan.add({ day: '2026-11-16', slot: 'dinner', recipeId: 'di-beef-tacos', customTitle: null, servings: 2, note: null });
    await render(<HomeScreen />, { wrapper: await wrapper('en') });
    expect(await screen.findByTestId('next-meal')).toBeTruthy();
    expect(screen.getAllByText(/Tacos/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Good morning')).toBeTruthy();
  });

  it('renders in French and dark mode with an empty week', async () => {
    await render(<HomeScreen />, { wrapper: await wrapper('fr', 'dark') });
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
    expect(screen.queryByTestId('next-meal')).toBeNull();
  });
});

describe('recipe book', () => {
  it('searches recipes by ingredient', async () => {
    await render(<RecipesScreen />, { wrapper: await wrapper('en') });
    expect((await screen.findAllByTestId(/^recipe-/)).length).toBeGreaterThan(5);
    await fireEvent.changeText(screen.getByTestId('recipes-search'), 'lentil');
    expect(screen.getByTestId('recipe-lu-red-lentil-soup')).toBeTruthy();
    expect(screen.queryByTestId('recipe-di-beef-tacos')).toBeNull();
  });

  it('scales ingredients when servings change and converts to imperial', async () => {
    mockParams.current = { id: 'lu-red-lentil-soup' };
    usePreferences.setState({ unitSystem: 'imperial' });
    await render(<RecipeScreen />, { wrapper: await wrapper('en') });
    expect(await screen.findByTestId('recipe-screen')).toBeTruthy();
    expect(screen.getByText('Ingredients')).toBeTruthy();
    // No metric mass unit is shown to an imperial user.
    expect(screen.queryByText(/^\d+ g$/)).toBeNull();
    expect(screen.getByTestId('start-cooking')).toBeTruthy();
  });

  it('locks premium recipes for free users', async () => {
    mockParams.current = { id: 'di-sunday-roast-chicken' };
    await render(<RecipeScreen />, { wrapper: await wrapper('es') });
    expect(await screen.findByTestId('premium-gate')).toBeTruthy();
    expect(screen.queryByTestId('start-cooking')).toBeNull();
  });
});

describe('cooking mode', () => {
  it('walks through steps one at a time', async () => {
    mockParams.current = { id: 'lu-red-lentil-soup', servings: '4' };
    await render(<CookingMode />, { wrapper: await wrapper('en') });
    expect(await screen.findByTestId('cooking-mode')).toBeTruthy();
    expect(screen.getByText(/Step 1 of/, { exact: false })).toBeTruthy();
    await fireEvent.press(screen.getByTestId('cook-next'));
    expect(screen.getAllByText(/Step 2 of/).length).toBeGreaterThan(0);
  });
});

describe('grocery list', () => {
  it('adds items and merges compatible quantities', async () => {
    const listId = await repos.grocery.createList('Week', { start: null, end: null }, [{ key: 'milk', name: 'Milk', category: 'dairy_eggs', quantity: 500, unit: 'ml', pantry: 'none' }]);
    await render(<GroceryScreen />, { wrapper: await wrapper('en') });
    expect(await screen.findByText('Week')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('grocery-add-input'), '1 l milk');
    await fireEvent.press(screen.getByLabelText('Add item'));
    await screen.findByText(/1.5 l/);
    const items = await repos.grocery.items(listId);
    expect(items.filter((i) => i.key === 'milk')).toHaveLength(1);
    expect(items[0]?.unit).toBe('l');
  });

  it('offers to generate a list when there is none', async () => {
    await render(<GroceryScreen />, { wrapper: await wrapper('es') });
    expect(await screen.findByTestId('grocery-generate')).toBeTruthy();
  });
});

describe('paywall', () => {
  it('says purchases are unavailable instead of simulating them when the store is not configured', async () => {
    useSession.setState({ plans: [], storeAvailable: false });
    await render(<Paywall />, { wrapper: await wrapper('en') });
    expect(await screen.findByTestId('paywall-unavailable')).toBeTruthy();
  });
});
