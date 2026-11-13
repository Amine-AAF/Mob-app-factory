import { ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { TripCard } from '@/components/TripCard';
import { TripForm } from '@/components/TripForm';
import { brand } from '@/config/brand';
import { TripValidationError, type TripInput } from '@/database/repositories/trips';
import { initI18n } from '@/i18n';
import type { Trip } from '@/types/models';

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', []);
});

async function wrap(node: ReactNode, scheme: 'light' | 'dark' = 'light') {
  return render(
    <ThemeProvider brand={brand} preference={scheme}>
      <I18nextProvider i18n={i18n}>{node}</I18nextProvider>
    </ThemeProvider>,
  );
}

const trip: Trip = {
  id: 't1',
  name: 'My Portugal Trip',
  primaryDestination: 'Porto',
  countryCode: 'PT',
  city: 'Porto',
  startDate: '2026-07-30',
  endDate: '2026-08-06',
  timeZone: 'Europe/Lisbon',
  description: '',
  coverUri: null,
  tripType: 'couple',
  budgetMinor: null,
  currency: 'EUR',
  status: 'upcoming',
  isDemo: false,
  archivedAt: null,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

const summary = { tripId: 't1', destinations: 2, days: 0, activities: 8, activitiesDone: 0, bookings: 3, documents: 0, packed: 6, packingTotal: 8, tasksDone: 2, tasksTotal: 2, spentMinor: 0 };

// The very first React Native render initialises Animated, vector icons and the renderer,
// which can take > 30 s on a loaded machine. Pay that cost once, outside the assertions.
beforeAll(async () => {
  const warm = await wrap(<TripCard trip={trip} route={[]} summary={summary} today="2026-07-20" onPress={() => undefined} />);
  warm.unmount();
}, 180_000);

describe('TripCard', () => {
  it.each(['light', 'dark'] as const)('shows route, dates, countdown and real preparation progress (%s)', async (scheme) => {
    const onPress = jest.fn();
    await wrap(<TripCard trip={trip} route={['Porto', 'Lisbon']} summary={summary} today="2026-07-20" onPress={onPress} />, scheme);
    expect(screen.getByText('My Portugal Trip')).toBeTruthy();
    expect(screen.getByText('Porto → Lisbon')).toBeTruthy();
    expect(screen.getByText('10 days to go')).toBeTruthy();
    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText('Upcoming')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Open trip My Portugal Trip'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows the current day while travelling and never invents a progress value', async () => {
    await wrap(<TripCard trip={trip} route={[]} today="2026-08-01" onPress={() => undefined} />);
    expect(screen.getByText('Day 3 of 8')).toBeTruthy();
    expect(screen.getByText('Ongoing')).toBeTruthy();
    expect(screen.getByText('Add packing items or tasks to track preparation')).toBeTruthy();
  });

  it('labels demo trips clearly', async () => {
    await wrap(<TripCard trip={{ ...trip, isDemo: true }} route={[]} today="2026-07-20" onPress={() => undefined} />);
    expect(screen.getByText('Demo')).toBeTruthy();
  });
});

describe('TripForm', () => {
  it('submits normalised input', async () => {
    const onSubmit = jest.fn(async (_: TripInput) => undefined);
    const onDone = jest.fn();
    await wrap(<TripForm defaultCurrency="EUR" submitLabel="Create" onSubmit={onSubmit} onDone={onDone} />);
    await fireEvent.changeText(screen.getByTestId('trip-name'), 'Weekend in Rome');
    await fireEvent.changeText(screen.getByTestId('trip-city-0'), 'Rome');
    await fireEvent.changeText(screen.getByTestId('trip-start'), '2026-10-09');
    await fireEvent.changeText(screen.getByTestId('trip-end'), '2026-10-11');
    await fireEvent.changeText(screen.getByTestId('trip-budget'), '450,50');
    await fireEvent.press(screen.getByTestId('trip-type-weekend'));
    await fireEvent.press(screen.getByTestId('trip-submit'));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      name: 'Weekend in Rome',
      startDate: '2026-10-09',
      endDate: '2026-10-11',
      currency: 'EUR',
      tripType: 'weekend',
      budgetMinor: 45050,
      destinations: [{ city: 'Rome', countryCode: null, timeZone: null }],
    });
  });

  it('shows the validation message returned by the repository and stays open', async () => {
    const onDone = jest.fn();
    const onSubmit = jest.fn(async () => {
      throw new TripValidationError('end_before_start', 'trip');
    });
    await wrap(<TripForm defaultCurrency="USD" submitLabel="Create" onSubmit={onSubmit} onDone={onDone} />);
    await fireEvent.changeText(screen.getByTestId('trip-name'), 'Oops');
    await fireEvent.press(screen.getByTestId('trip-submit'));
    expect(await screen.findByText('The return date must be on or after the departure date.')).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('rejects an invalid budget before saving', async () => {
    const onSubmit = jest.fn(async () => undefined);
    await wrap(<TripForm defaultCurrency="USD" submitLabel="Create" onSubmit={onSubmit} onDone={() => undefined} />);
    await fireEvent.changeText(screen.getByTestId('trip-name'), 'Trip');
    await fireEvent.changeText(screen.getByTestId('trip-budget'), 'lots');
    await fireEvent.press(screen.getByTestId('trip-submit'));
    expect(await screen.findByText('Enter a valid amount.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
