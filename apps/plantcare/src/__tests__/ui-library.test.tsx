import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';


import Library from '../../app/(tabs)/library';
import { setupUi, slow } from '@/test-utils/ui';

jest.setTimeout(120_000);

// Locked sheets → paywall: rule unit-tested (canOpenSpecies); the navigation itself is checked on device.
it('library: pet-safe filter hides toxic plants and shows locked premium sheets', async () => {
  const { layout } = await setupUi();
  await renderRouter({ _layout: layout, index: Library }, { initialUrl: '/' });
  expect(await screen.findByTestId('library-more', undefined, slow)).toBeTruthy();
  fireEvent.press(screen.getByTestId('filter-pet_safe'));
  await waitFor(() => expect(screen.getByTestId('filter-pet_safe').props.accessibilityState?.checked).toBe(true), slow);
  // Only ASPCA "non-toxic" sheets remain: no toxic badge is shown anymore.
  expect(screen.queryAllByText('Toxic to pets')).toHaveLength(0);
  expect(screen.getAllByText('Pet safe').length).toBeGreaterThan(1);
  expect(screen.getByLabelText(/Areca palm, Dypsis lutescens, Premium/)).toBeTruthy();
});
