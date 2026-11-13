import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button, OptionCard, ProgressBar, Text, ThemeProvider, contrastRatio, createTheme } from '../index';

const brand = { primary: '#5B4BF5', accent: '#2EE6A8' };
const wrap = async (ui: React.ReactElement, preference: 'light' | 'dark' = 'light') => await render(<ThemeProvider brand={brand} preference={preference}>{ui}</ThemeProvider>);

describe('theme', () => {
  it.each(['light', 'dark'] as const)('meets WCAG AA contrast for body text in %s mode', (scheme) => {
    const t = createTheme(brand, scheme);
    expect(contrastRatio(t.colors.text, t.colors.background)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(t.colors.textMuted, t.colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.textSubtle, t.colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.onPrimary, t.colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.primary, t.colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.colors.danger, t.colors.background)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('components', () => {
  it('Button is accessible and fires onPress', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Save" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled Button does not fire', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Save" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('OptionCard exposes its checked state', async () => {
    await wrap(<OptionCard title="Beginner" selected onPress={() => undefined} />);
    expect(screen.getByRole('radio', { name: 'Beginner' }).props.accessibilityState).toMatchObject({ checked: true });
  });

  it('ProgressBar clamps and reports its value', async () => {
    await wrap(<ProgressBar progress={1.7} label="Goal" />);
    expect(screen.getByLabelText('Goal').props.accessibilityValue).toEqual({ min: 0, max: 100, now: 100 });
  });

  it('Text caps font scaling', async () => {
    await wrap(<Text>Hello</Text>, 'dark');
    expect(screen.getByText('Hello').props.maxFontSizeMultiplier).toBe(1.6);
  });
});
