import { ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen as routerScreen } from 'expo-router/testing-library';
import type { i18n as I18n } from 'i18next';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Index from '../../app/index';
import { BarChart } from '@/components/charts';
import { MedicalDisclaimer, StatusBadge } from '@/components/pet';
import { brand } from '@/config/brand';
import { RecordForm } from '@/features/records/RecordForm';
import { SPECS, type FormValues } from '@/features/records/specs';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';

jest.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' }, cache: { uri: 'file:///cache/' } },
  Directory: jest.fn().mockImplementation(() => ({ exists: true, create: jest.fn(), list: () => [] })),
  File: jest.fn().mockImplementation(() => ({ exists: false, uri: 'file:///x' })),
}));

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', []);
});

function wrap(node: React.ReactNode) {
  return (
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
      <ThemeProvider brand={brand} preference="light">
        <I18nextProvider i18n={i18n}>{node}</I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('components', () => {
  it('always shows the medical disclaimer text', async () => {
    await render(wrap(<MedicalDisclaimer />));
    expect(screen.getByText(/does not replace your veterinarian/)).toBeTruthy();
  });

  it('translates statuses', async () => {
    await render(wrap(<StatusBadge status="overdue" />));
    expect(screen.getByText('Overdue')).toBeTruthy();
  });

  it('exposes chart values to screen readers', async () => {
    await render(wrap(<BarChart values={[1, 2]} labels={['J', 'F']} formatValue={(v) => `${v} €`} accessibilityLabel="Spending" />));
    expect(screen.getByLabelText('Spending. J: 1 €, F: 2 €')).toBeTruthy();
  });

  it('renders a treatment form and hides reminder times when frequency is "as needed"', async () => {
    function Harness() {
      const [values, setValues] = useState<FormValues>(SPECS.treatment.defaults({ petId: 'p1', today: '2026-11-13', nowTime: '10:00', weightUnit: 'kg', currency: 'EUR' }));
      return <RecordForm spec={SPECS.treatment} values={values} errors={{}} pets={[]} onChange={(p) => setValues((v) => ({ ...v, ...p }))} />;
    }
    await render(wrap(<Harness />));
    expect(screen.getByText('Reminder times')).toBeTruthy();
    expect(screen.getByText(/Copy the instructions exactly as prescribed/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('field-frequency-as_needed'));
    expect(screen.queryByText('Reminder times')).toBeNull();
  });

  it('shows validation errors next to fields', async () => {
    await render(wrap(<RecordForm spec={SPECS.health} values={{ reason: '', date: '2026-11-13' }} errors={{ reason: 'errors.required' }} pets={[]} onChange={() => undefined} />));
    expect(screen.getByText('Required')).toBeTruthy();
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

  it('sends onboarded users to the dashboard', async () => {
    usePreferences.setState({ onboardingCompleted: true });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await routerScreen.findByText('HOME')).toBeTruthy();
  });
});
