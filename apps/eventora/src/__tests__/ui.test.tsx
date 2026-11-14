import { ThemeProvider } from '@factory/design-system';
import { FREE_STATE } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';
import { router, Stack } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import type { i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Alert, Text } from 'react-native';

import EventsTab from '../../app/(tabs)/events';
import GuestsTab from '../../app/(tabs)/guests';
import HomeTab from '../../app/(tabs)/index';
import SettingsTab from '../../app/(tabs)/settings';
import TasksTab from '../../app/(tabs)/tasks';
import EventSpace from '../../app/event/[id]/index';
import EventForm from '../../app/event/new';
import Index from '../../app/index';
import Paywall from '../../app/paywall';
import { brand } from '@/config/brand';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import type { EventInput } from '@/domain/types';
import { initI18n } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

// Writes re-plan reminders on a debounce timer; that service has its own tests (services.test.tsx).
jest.mock('@/services/notifications', () => ({ syncNotifications: jest.fn(async () => undefined) }));

// sql.js + router rendering can be slow on a busy CI machine: generous explicit waits.
jest.setTimeout(90_000);
const WAIT = { timeout: 20_000 };

/** Frozen "now" so countdowns, sorting and default dates never depend on the day the suite runs. */
const NOW = new Date('2027-03-01T10:00:00Z');

let i18n: I18n;
let r: Repositories;

beforeAll(async () => {
  i18n = await initI18n('en', ['en']);
  clock.set(() => NOW);
});

afterAll(() => {
  clock.set(null);
  jest.useRealTimers(); // renderRouter switches to fake timers
});

beforeEach(async () => {
  r = await initDatabase(await createTestDatabase(), { now: () => NOW });
  setRepositories(r);
  useSession.setState({ dbReady: true, dataVersion: 0, entitlement: FREE_STATE, plans: [], storeAvailable: false });
  usePreferences.getState().reset();
  usePreferences.setState({ onboardingCompleted: true, defaultCurrency: 'EUR' });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers(); // e.g. the debounced reminder sync queued by a write
});

function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider brand={brand} preference="light">
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}

const layout = () => (
  <Providers>
    <Stack />
  </Providers>
);

function stub(label: string) {
  const Stub = () => <Text>{label}</Text>;
  Stub.displayName = `Stub(${label})`;
  return Stub;
}

/** The real screens under test; everything they can navigate to is a labelled stub. */
const routes = {
  _layout: layout,
  index: Index,
  onboarding: stub('ONBOARDING'),
  templates: stub('TEMPLATES'),
  paywall: Paywall,
  '(tabs)/index': HomeTab,
  '(tabs)/events': EventsTab,
  '(tabs)/guests': GuestsTab,
  '(tabs)/tasks': TasksTab,
  '(tabs)/settings': SettingsTab,
  'event/new': EventForm,
  'event/[id]/index': EventSpace,
  'event/[id]/guests': stub('EVENT GUESTS'),
  'settings/data': stub('DATA'),
  'settings/privacy': stub('PRIVACY'),
};

const eventInput = (extra: Partial<EventInput> = {}): EventInput => ({
  name: 'Garden party', typeId: 'birthday', coverUri: null, description: '', startDate: '2027-04-10', startTime: '18:00', endDate: null, endTime: null,
  timezone: 'Europe/Paris', venue: 'Villa Rosa', address: '', expectedGuests: 40, budgetMinor: 0, currency: 'EUR', notes: '', status: 'planning', theme: 'birthday', templateId: null,
  ...extra,
});

describe('entry routing', () => {
  it('sends new users to onboarding', async () => {
    usePreferences.setState({ onboardingCompleted: false });
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING', {}, WAIT)).toBeTruthy();
  });

  it('sends onboarded users to the dashboard', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByText('Your events', {}, WAIT)).toBeTruthy();
    expect(screen).toHavePathname('/');
  });
});

describe('home tab', () => {
  it('shows the empty state and opens the event form from it', async () => {
    await renderRouter(routes, { initialUrl: '/(tabs)' });
    expect(await screen.findByText("Let's plan something", {}, WAIT)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('home-create'));
    expect(await screen.findByTestId('event-name', {}, WAIT)).toBeTruthy();
    expect(screen).toHavePathname('/event/new');
  });

  it('summarises the next event, guests and tasks of active events', async () => {
    const e = await r.events.create(eventInput());
    await r.events.create(eventInput({ name: 'Old gala', startDate: '2026-12-01', status: 'completed' }));
    await r.guests.add({ eventId: e.id, groupId: null, firstName: 'Ana', lastName: 'Silva', phone: '', email: '', category: 'family', plusOnes: 1, children: 0, isChild: false, dietary: '', notes: '', rsvpStatus: 'confirmed', rsvpRespondedAt: null, rsvpNote: '' });
    await renderRouter(routes, { initialUrl: '/(tabs)' });

    expect(await screen.findByTestId('home-next-event', {}, WAIT)).toBeTruthy();
    expect(screen.getByText('Next event')).toBeTruthy();
    expect(screen.getByText('Garden party')).toBeTruthy();
    expect(screen.getByText('In 40 days', { exact: false })).toBeTruthy();
    expect(screen.getByLabelText('Upcoming events: 1')).toBeTruthy();
    expect(screen.getByLabelText('Guests (active events): 1')).toBeTruthy();
    expect(screen.getByLabelText('Confirmed · people expected: 1 · 2')).toBeTruthy();
    expect(screen.getByText('Recently completed')).toBeTruthy();
    expect(screen.getByText('Old gala')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('home-next-event'));
    await waitFor(() => expect(screen).toHavePathname(`/event/${e.id}`), WAIT);
  });
});

describe('events tab', () => {
  it('shows an empty state when there is no event', async () => {
    await renderRouter(routes, { initialUrl: '/(tabs)/events' });
    expect(await screen.findByText('No events here', {}, WAIT)).toBeTruthy();
    expect(screen.getByText('My events')).toBeTruthy();
  });

  it('lists events with their guest line and filters them by status', async () => {
    const e = await r.events.create(eventInput());
    await r.events.create(eventInput({ name: 'Rained out', status: 'cancelled' }));
    await r.guests.add({ eventId: e.id, groupId: null, firstName: 'Ana', lastName: 'Silva', phone: '', email: '', category: 'family', plusOnes: 0, children: 0, isChild: false, dietary: '', notes: '', rsvpStatus: 'confirmed', rsvpRespondedAt: null, rsvpNote: '' });
    await renderRouter(routes, { initialUrl: '/(tabs)/events' });

    expect(await screen.findByText('Garden party', {}, WAIT)).toBeTruthy();
    expect(screen.getByText('1 guest · 1 confirmed')).toBeTruthy();
    expect(screen.queryByText('Rained out')).toBeNull(); // default filter: active

    await fireEvent.press(screen.getByText('Cancelled'));
    expect(await screen.findByText('Rained out', {}, WAIT)).toBeTruthy();
    expect(screen.queryByText('Garden party')).toBeNull();

    await fireEvent.press(screen.getByText('Past'));
    expect(await screen.findByText('No events here', {}, WAIT)).toBeTruthy();
  });

  it('blocks a third active event on the free plan with an upsell alert', async () => {
    await r.events.create(eventInput({ name: 'One' }));
    await r.events.create(eventInput({ name: 'Two' }));
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderRouter(routes, { initialUrl: '/(tabs)/events' });
    await screen.findByText('Two', {}, WAIT);

    await fireEvent.press(screen.getByTestId('events-new'));
    expect(alert).toHaveBeenCalledWith('Unlimited events', 'The free plan includes 2 active events. Complete or cancel one, or go Premium.', expect.any(Array));
    expect(screen).toHavePathname('/events');
  });
});

describe('event form', () => {
  it('shows a validation error and saves nothing without a name', async () => {
    await renderRouter(routes, { initialUrl: '/event/new' });
    await fireEvent.press(await screen.findByTestId('event-save', {}, WAIT));
    expect(await screen.findByText('Please enter a name.', {}, WAIT)).toBeTruthy();
    expect(await r.events.list()).toHaveLength(0);
    expect(screen).toHavePathname('/event/new');
  });

  it('rejects an invalid attendance and budget', async () => {
    await renderRouter(routes, { initialUrl: '/event/new' });
    await fireEvent.changeText(await screen.findByTestId('event-name', {}, WAIT), 'Bad numbers');
    await fireEvent.changeText(screen.getByLabelText('Expected attendance'), 'abc');
    await fireEvent.changeText(screen.getByLabelText('Initial budget'), 'abc');
    await fireEvent.press(screen.getByTestId('event-save'));
    expect(await screen.findByText('Enter a number of guests.', {}, WAIT)).toBeTruthy();
    expect(screen.getByText('Enter a valid amount.')).toBeTruthy();
    expect(await r.events.list()).toHaveLength(0);
  });

  it('creates an event, opens its space and lists it in My events', async () => {
    await renderRouter(routes, { initialUrl: '/(tabs)/events' });
    await screen.findByText('No events here', {}, WAIT);
    await fireEvent.press(screen.getByTestId('events-new'));

    await fireEvent.changeText(await screen.findByTestId('event-name', {}, WAIT), "Léa's 30th");
    await fireEvent.changeText(screen.getByLabelText('Venue'), 'Rooftop');
    await fireEvent.changeText(screen.getByLabelText('Initial budget'), '1500');
    await fireEvent.press(screen.getByTestId('event-save'));

    // Lands on the event space once the event is stored…
    expect(await screen.findByText('Preparation progress', {}, WAIT)).toBeTruthy();
    const [created] = await r.events.list();
    expect(created).toMatchObject({ name: "Léa's 30th", venue: 'Rooftop', typeId: 'birthday', status: 'planning', currency: 'EUR', budgetMinor: 150_000, startDate: '2027-04-30' });
    expect(screen).toHavePathname(`/event/${created!.id}`);
    expect(usePreferences.getState().lastEventId).toBe(created!.id);

    // …and the list picks it up.
    await act(async () => router.navigate('/(tabs)/events'));
    expect(await screen.findByLabelText(/^Léa's 30th, /, {}, WAIT)).toBeTruthy();
    expect(screen.queryByText('No events here')).toBeNull();
  });

  it('pre-fills an existing event and saves the changes', async () => {
    const e = await r.events.create(eventInput());
    await renderRouter(routes, { initialUrl: `/event/new?id=${e.id}` });
    const name = await screen.findByDisplayValue('Garden party', {}, WAIT);
    expect(screen.getByDisplayValue('Villa Rosa')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy(); // only when editing

    const back = jest.spyOn(router, 'back').mockImplementation(() => undefined);
    await fireEvent.changeText(name, 'Garden brunch');
    await fireEvent.press(screen.getByText('Confirmed'));
    await fireEvent.press(screen.getByTestId('event-save'));
    await waitFor(() => expect(back).toHaveBeenCalledTimes(1), WAIT); // closes the form once saved
    expect(await r.events.get(e.id)).toMatchObject({ name: 'Garden brunch', status: 'confirmed', venue: 'Villa Rosa' });
  });
});

describe('event space', () => {
  it('shows the countdown, status and module tiles, and opens a module', async () => {
    const e = await r.events.create(eventInput({ description: 'Bring a hat' }));
    await renderRouter(routes, { initialUrl: `/event/${e.id}` });

    expect(await screen.findByText('In 40 days', {}, WAIT)).toBeTruthy();
    expect(screen.getAllByText('Garden party').length).toBeGreaterThan(0);
    expect(screen.getByText('Planning')).toBeTruthy();
    expect(screen.getByText('Villa Rosa')).toBeTruthy();
    expect(screen.getByText('Bring a hat')).toBeTruthy();
    expect(screen.getByLabelText('Expected / planned: 0/40')).toBeTruthy();
    expect(screen.getByLabelText('Vendors, 0 vendors')).toBeTruthy();
    expect(usePreferences.getState().lastEventId).toBe(e.id);

    await fireEvent.press(screen.getByLabelText('Guests, 0 entries · 0 people'));
    expect(await screen.findByText('EVENT GUESTS', {}, WAIT)).toBeTruthy();
  });

  it('explains when the event no longer exists', async () => {
    await renderRouter(routes, { initialUrl: '/event/missing' });
    expect(await screen.findByText('This event no longer exists.', {}, WAIT)).toBeTruthy();
  });
});

describe('guests and tasks tabs', () => {
  it('invite to create an event first', async () => {
    await renderRouter(routes, { initialUrl: '/(tabs)/guests' });
    expect(await screen.findByText('Create an event to start your guest list.', {}, WAIT)).toBeTruthy();
    await act(async () => router.navigate('/(tabs)/tasks'));
    expect(await screen.findByText('Create an event to organise its tasks.', {}, WAIT)).toBeTruthy();
  });
});

describe('settings tab', () => {
  it('persists appearance choices and opens the paywall', async () => {
    await renderRouter(routes, { initialUrl: '/(tabs)/settings' });
    expect(await screen.findByText('Settings', {}, WAIT)).toBeTruthy();
    expect(screen.getByText('Go Premium')).toBeTruthy();
    expect(screen.getByTestId('settings-data')).toBeTruthy();

    await fireEvent.press(screen.getByText('Dark'));
    expect(usePreferences.getState().theme).toBe('dark');
    await fireEvent.press(screen.getByLabelText('Ocean'));
    expect(usePreferences.getState().accent).toBe('ocean');
    await waitFor(() => expect(screen.getByLabelText('Ocean').props.accessibilityState).toMatchObject({ selected: true }), WAIT);

    await fireEvent.press(screen.getByText('Go Premium'));
    expect(await screen.findByTestId('paywall', {}, WAIT)).toBeTruthy();
    expect(screen).toHavePathname('/paywall');
  });

  it('thanks Premium members instead of pitching the upgrade', async () => {
    useSession.setState({ entitlement: { ...FREE_STATE, isPremium: true } });
    await renderRouter(routes, { initialUrl: '/(tabs)/settings' });
    expect(await screen.findByText('Thank you for supporting Eventora.', {}, WAIT)).toBeTruthy();
    expect(screen.queryByText('Go Premium')).toBeNull();
  });
});

describe('paywall', () => {
  it('lists the benefits and never offers a purchase when the store is not configured', async () => {
    await renderRouter(routes, { initialUrl: '/paywall?source=test' });
    expect(await screen.findByText("Purchases aren't available in this build.", {}, WAIT)).toBeTruthy();
    expect(screen.getByText('Eventora Premium')).toBeTruthy();
    expect(screen.getByText('Unlimited events')).toBeTruthy();
    expect(screen.getByText('No ads')).toBeTruthy();
    expect(screen.getByTestId('subscribe')).toBeDisabled();
    expect(screen.queryByTestId('plan-annual')).toBeNull();
  });

  it('shows the active state to Premium members', async () => {
    useSession.setState({ entitlement: { ...FREE_STATE, isPremium: true } });
    await renderRouter(routes, { initialUrl: '/paywall' });
    expect(await screen.findByText('Premium is active', {}, WAIT)).toBeTruthy();
    expect(screen.getByText('Manage subscription')).toBeTruthy();
    expect(screen.queryByTestId('subscribe')).toBeNull();
  });
});
