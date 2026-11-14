import { contrastRatio, createTheme, ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { BarChart, LineChart, ProgressRing } from '@/components/charts';
import { ExerciseRow } from '@/components/ExerciseRow';
import { Segmented, Stepper, ToggleRow } from '@/components/ui';
import { BRAND } from '@/config/brand';
import { libraryExercises } from '@/features/library/library';
import { initI18n } from '@/i18n';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() }, useFocusEffect: jest.fn() }));

// First render transforms the whole RN tree; generous timeout for slow CI machines.
jest.setTimeout(60_000);

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', []);
});

const wrap = (ui: ReactNode) => (
  <ThemeProvider brand={BRAND} preference="light">
    <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
  </ThemeProvider>
);

describe('brand & accessibility', () => {
  it('FitTrack colors meet WCAG AA contrast in light and dark themes', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const c = createTheme(BRAND, scheme).colors;
      expect(contrastRatio(c.primary, c.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.text, c.surface)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(c.accent, c.surface)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('Stepper (gym-friendly input)', () => {
  it('increments, decrements within bounds and accepts typed decimals', async () => {
    const onChange = jest.fn();
    await render(wrap(<Stepper label="Weight" value={20} step={2.5} min={0} max={22} decimals={2} onChange={onChange} testID="w" />));
    await fireEvent.press(screen.getByLabelText('Increase Weight'));
    expect(onChange).toHaveBeenLastCalledWith(22); // clamped to max
    await fireEvent.press(screen.getByLabelText('Decrease Weight'));
    expect(onChange).toHaveBeenLastCalledWith(17.5);
    await fireEvent.changeText(screen.getByTestId('w'), '12,5');
    expect(onChange).toHaveBeenLastCalledWith(12.5);
    await fireEvent.changeText(screen.getByTestId('w'), '');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('Segmented & toggles', () => {
  it('reports the selected tab and switch state', async () => {
    const onChange = jest.fn();
    await render(wrap(<Segmented value="kg" onChange={onChange} options={[{ value: 'kg', label: 'Kilograms' }, { value: 'lb', label: 'Pounds' }]} />));
    expect(screen.getByRole('tab', { name: 'Kilograms' }).props.accessibilityState).toMatchObject({ selected: true });
    await fireEvent.press(screen.getByLabelText('Pounds'));
    expect(onChange).toHaveBeenCalledWith('lb');
    const toggle = jest.fn();
    await render(wrap(<ToggleRow title="Sounds" value={false} onChange={toggle} />));
    await fireEvent.press(screen.getByRole('switch', { name: 'Sounds' }));
    expect(toggle).toHaveBeenCalledWith(true);
  });
});

describe('ExerciseRow', () => {
  it('shows localized name, muscle and equipment, and is pressable', async () => {
    const e = libraryExercises('en').find((x) => x.id === 'goblet-squat')!;
    const onPress = jest.fn();
    await render(wrap(<ExerciseRow exercise={e} onPress={onPress} favorite />));
    expect(screen.getByText(e.name)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('charts', () => {
  it('expose an accessibility summary and handle empty data', async () => {
    await render(wrap(<BarChart data={[{ label: 'W1', value: 2 }, { label: 'W2', value: null }]} summary="2 then nothing" />));
    expect(screen.getByLabelText('2 then nothing')).toBeTruthy();
    const { toJSON } = await render(wrap(<LineChart points={[]} summary="none" formatValue={String} />));
    expect(toJSON()).toBeNull();
    await render(wrap(<ProgressRing ratio={1.7} label="ring" />));
    expect(screen.getByLabelText('ring').props.accessibilityValue).toMatchObject({ now: 100 });
  });
});
