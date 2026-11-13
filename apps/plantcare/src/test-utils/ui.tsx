import { ThemeProvider } from '@factory/design-system';
import { FREE_STATE } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';
import { Slot } from 'expo-router';
import type { i18n as I18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';

import { brand } from '@/config/brand';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import { initI18n, type InterfaceLanguage } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

/**
 * Shared setup for screen tests (renderRouter + in-memory SQLite).
 *
 * Known test-environment quirk (RN 0.88 + jest-expo 58): inside one test file, only the
 * first rendered screen that contains a TextInput mounts; later ones never appear. Screen
 * tests that render a TextInput therefore live in their own file (one such test per file).
 */
export const slow = { timeout: 30_000 };

export const basePlant = {
  commonName: '',
  scientificName: null,
  speciesId: null,
  category: 'tropical' as const,
  photoPath: null,
  acquiredOn: null,
  plantedOn: null,
  locationId: null,
  description: '',
  notes: '',
  favorite: false,
};

export interface UiContext {
  i18n: I18n;
  repos: Repositories;
  layout: () => React.JSX.Element;
}

export async function setupUi(lng: InterfaceLanguage = 'en'): Promise<UiContext> {
  clock.set(() => new Date('2026-05-10T08:00:00'));
  const i18n = await initI18n(lng, []);
  const repos = await initDatabase(await createTestDatabase(), clock.now);
  setRepositories(repos);
  useSession.setState({ entitlement: FREE_STATE, dataVersion: 0 });
  usePreferences.setState({ onboardingCompleted: true, units: 'metric', temperature: 'c', climate: 'north', notificationsEnabled: false });
  const layout = () => (
    <ThemeProvider brand={brand} preference="light">
      <I18nextProvider i18n={i18n}>
        <Slot />
      </I18nextProvider>
    </ThemeProvider>
  );
  return { i18n, repos, layout };
}
