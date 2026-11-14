import { contrastRatio, createTheme, ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { BarChart, ShareBars } from '@/components/charts';
import { ChoiceChips, readNumber, Segmented, StatusBadge } from '@/components/ui';
import { BRAND, VEHICLE_COLORS } from '@/config/brand';
import { initI18n } from '@/i18n';

jest.mock('@/services/ads', () => ({ adsSdk: () => null, adUnits: { banner: null }, bannerAllowed: () => false, onAdsStateChange: () => () => undefined }));
jest.mock('@/services/fileStore', () => ({ fileExists: () => false, fileUri: (n: string) => n }));

async function wrapper() {
  const i18n = await initI18n('en', []);
  function Providers({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider brand={BRAND} preference="light">
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </ThemeProvider>
    );
  }
  return Providers;
}

describe('brand & accessibility', () => {
  it.each(['light', 'dark'] as const)('primary text keeps WCAG AA contrast in %s mode', (scheme) => {
    const theme = createTheme(BRAND, scheme);
    expect(contrastRatio(theme.colors.primary, theme.colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.colors.text, theme.colors.surface)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(theme.colors.onPrimary, theme.colors.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it('vehicle card colors keep white icons readable', () => {
    for (const c of VEHICLE_COLORS) expect(contrastRatio('#FFFFFF', c)).toBeGreaterThanOrEqual(3);
  });
});

describe('components', () => {
  it('Segmented exposes radio semantics and reports changes', async () => {
    const Wrapper = await wrapper();
    const onChange = jest.fn();
    await render(<Segmented value="km" options={[{ value: 'km', label: 'km' }, { value: 'mi', label: 'mi' }]} onChange={onChange} />, { wrapper: Wrapper });
    await fireEvent.press(screen.getByLabelText('mi'));
    expect(onChange).toHaveBeenCalledWith('mi');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('ChoiceChips marks the selected option', async () => {
    const Wrapper = await wrapper();
    await render(<ChoiceChips label="Fuel" value="diesel" options={[{ value: 'gasoline', label: 'Gasoline' }, { value: 'diesel', label: 'Diesel' }]} onChange={() => undefined} />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Diesel').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('StatusBadge shows translated statuses', async () => {
    const Wrapper = await wrapper();
    await render(<StatusBadge status="overdue" />, { wrapper: Wrapper });
    expect(screen.getByText('Overdue')).toBeTruthy();
  });

  it('charts expose a text summary to screen readers', async () => {
    const Wrapper = await wrapper();
    await render(
      <>
        <BarChart data={[{ label: 'Jan', value: 10 }, { label: 'Feb', value: null }]} summary="January: 10" />
        <ShareBars rows={[{ label: 'Fuel', value: '€10', share: 0.5 }]} />
      </>,
      { wrapper: Wrapper },
    );
    expect(screen.getByLabelText('January: 10')).toBeTruthy();
    expect(screen.getByLabelText('Fuel: €10, 50%')).toBeTruthy();
  });

  it('number fields accept comma decimals and flag invalid input', () => {
    expect(readNumber('')).toBeNull();
    expect(readNumber('1,879')).toBeCloseTo(1.879, 6);
    expect(Number.isNaN(readNumber('abc'))).toBe(true);
  });
});
