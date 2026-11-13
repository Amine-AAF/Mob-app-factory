import { ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { ActivityCard } from '@/components/ActivityCard';
import { BookingCard } from '@/components/BookingCard';
import { monthGrid } from '@/components/DateField';
import { PackingItems } from '@/components/PackingList';
import { brand } from '@/config/brand';
import { initI18n } from '@/i18n';
import type { Activity, Booking, PackingItem } from '@/types/models';

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', []);
  // Warm-up: the first RN render is slow on loaded machines.
  (await wrap(<BookingCard booking={booking} onPress={() => undefined} />)).unmount();
}, 180_000);

async function wrap(node: ReactNode, scheme: 'light' | 'dark' = 'light') {
  return render(
    <ThemeProvider brand={brand} preference={scheme}>
      <I18nextProvider i18n={i18n}>{node}</I18nextProvider>
    </ThemeProvider>,
  );
}

const activity: Activity = {
  id: 'a1',
  tripId: 't',
  dayId: 'd',
  placeId: null,
  name: 'Riverside walk',
  description: '',
  address: 'Old town quay',
  category: 'sightseeing',
  startTime: '17:00',
  endTime: '18:30',
  durationMinutes: 90,
  priceMinor: null,
  currency: null,
  notes: '',
  url: null,
  status: 'planned',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const booking: Booking = {
  id: 'b1',
  tripId: 't',
  type: 'flight',
  provider: 'My airline',
  reference: 'AB12CD',
  date: '2026-07-30',
  time: '07:15',
  endDate: null,
  endTime: '08:05',
  timeZone: null,
  address: '',
  departureInfo: 'Home',
  arrivalInfo: 'Porto',
  priceMinor: 12999,
  currency: 'EUR',
  status: 'confirmed',
  notes: '',
  url: null,
  attachmentDocumentId: null,
  createdAt: '',
  updatedAt: '',
};

describe('ActivityCard', () => {
  it.each(['light', 'dark'] as const)('shows time range, category and toggles done (%s)', async (scheme) => {
    const onToggle = jest.fn();
    const onPress = jest.fn();
    await wrap(<ActivityCard activity={activity} isLast onPress={onPress} onToggleDone={onToggle} onMoveDown={() => undefined} />, scheme);
    expect(screen.getByText('17:00–18:30')).toBeTruthy();
    expect(screen.getByText('Sightseeing')).toBeTruthy();
    expect(screen.getByText('Old town quay')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Mark as done'));
    expect(onToggle).toHaveBeenCalled();
    expect(screen.getByLabelText('Move down')).toBeTruthy();
    expect(screen.queryByLabelText('Move up')).toBeNull();
  });

  it('labels activities without a fixed time', async () => {
    await wrap(<ActivityCard activity={{ ...activity, startTime: null, endTime: null, status: 'completed' }} isLast={false} onPress={() => undefined} onToggleDone={() => undefined} />);
    expect(screen.getByText('Anytime')).toBeTruthy();
    expect(screen.getByLabelText('Mark as planned')).toBeTruthy();
  });
});

describe('BookingCard', () => {
  it('shows the user-entered reference, route and price', async () => {
    await wrap(<BookingCard booking={booking} onPress={() => undefined} />);
    expect(screen.getByText('My airline')).toBeTruthy();
    expect(screen.getByText('Ref. AB12CD')).toBeTruthy();
    expect(screen.getByText('Home → Porto')).toBeTruthy();
    expect(screen.getByText('Confirmed')).toBeTruthy();
    expect(screen.queryByText('Incomplete')).toBeNull();
  });

  it('flags incomplete bookings without inventing data', async () => {
    await wrap(<BookingCard booking={{ ...booking, provider: '', reference: '', time: null }} onPress={() => undefined} />);
    expect(screen.getByText('Flight')).toBeTruthy();
    expect(screen.getByText('Incomplete')).toBeTruthy();
    expect(screen.queryByText(/Ref\./)).toBeNull();
  });
});

describe('PackingItems', () => {
  it('groups by category and toggles items', async () => {
    const items: PackingItem[] = [
      { id: 'p1', listId: 'l', name: 'Passport', category: 'documents', quantity: 1, notes: '', priority: 'high', packed: true, position: 0 },
      { id: 'p2', listId: 'l', name: 'Socks', category: 'clothing', quantity: 3, notes: '', priority: 'medium', packed: false, position: 1 },
    ];
    const onToggle = jest.fn();
    await wrap(<PackingItems items={items} onToggle={onToggle} onEdit={() => undefined} />);
    expect(screen.getByText('Documents · 1/1')).toBeTruthy();
    expect(screen.getByText('Clothing · 0/1')).toBeTruthy();
    expect(screen.getByText('Socks ×3')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('packing-item-p2'));
    expect(onToggle).toHaveBeenCalledWith(items[1]);
  });
});

describe('calendar grid', () => {
  it('pads months to whole weeks for Sunday- and Monday-first locales', () => {
    // 1 July 2026 is a Wednesday.
    const sunday = monthGrid(2026, 7, 0);
    const monday = monthGrid(2026, 7, 1);
    expect(sunday.slice(0, 4)).toEqual([null, null, null, '2026-07-01']);
    expect(monday.slice(0, 3)).toEqual([null, null, '2026-07-01']);
    expect(sunday.length % 7).toBe(0);
    expect(sunday.filter(Boolean)).toHaveLength(31);
    expect(monthGrid(2028, 2, 1).filter(Boolean)).toHaveLength(29);
  });
});
