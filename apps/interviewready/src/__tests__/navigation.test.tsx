import { ThemeProvider } from '@factory/design-system';
import { fireEvent, render } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import type { i18n as I18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Text } from 'react-native';

import Index from '../../app/index';
import { QuestionCard } from '@/components/content';
import { brand } from '@/config/brand';
import { allQuestions } from '@/content';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', []);
});

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

describe('entry routing', () => {
  it('sends new users to onboarding', async () => {
    usePreferences.setState({ onboardingCompleted: false });
    useSession.setState({ profile: null });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING')).toBeTruthy();
  });

  it('sends onboarded users with a profile to the dashboard', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    useSession.setState({ profile: { jobRole: null, level: 'beginner', goal: 'practice', daysAvailable: null } });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByText('HOME')).toBeTruthy();
  });

  it('runs onboarding again after all data was deleted', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    useSession.setState({ profile: null });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING')).toBeTruthy();
  });
});

describe('QuestionCard', () => {
  const question = allQuestions('en').find((q) => q.premium)!;

  it('renders the question, its labels and a locked badge for free users', async () => {
    const onPress = jest.fn();
    const view = await render(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider brand={brand} preference="light">
          <QuestionCard question={question} onPress={onPress} locked />
        </ThemeProvider>
      </I18nextProvider>,
    );
    expect(view.getByText(question.question)).toBeTruthy();
    expect(view.getByText('Locked')).toBeTruthy();
    await fireEvent.press(view.getByTestId(`question-${question.id}`));
    expect(onPress).toHaveBeenCalled();
  });
});
