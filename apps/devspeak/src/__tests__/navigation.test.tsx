import { ThemeProvider } from '@factory/design-system';
import { Slot } from 'expo-router';
import { Text } from 'react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import Index from '../../app/index';
import { brand } from '@/config/brand';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

const routes = {
  _layout: () => (
    <ThemeProvider brand={brand} preference="light">
      <Slot />
    </ThemeProvider>
  ),
  index: Index,
  'onboarding/index': () => <Text>ONBOARDING</Text>,
  '(tabs)/index': () => <Text>HOME</Text>,
};

describe('entry routing', () => {
  it('sends new users to onboarding', async () => {
    usePreferences.setState({ onboardingCompleted: false });
    useSession.setState({ profile: null });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING')).toBeTruthy();
  });

  it('sends onboarded users with a profile to the dashboard', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    useSession.setState({ profile: { englishLevel: 'beginner', role: 'qa', objectives: ['meetings'], dailyMinutes: 5 } });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByText('HOME')).toBeTruthy();
  });

  it('re-runs onboarding after all data was deleted', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    useSession.setState({ profile: null });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING')).toBeTruthy();
  });
});
