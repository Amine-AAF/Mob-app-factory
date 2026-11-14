import { ThemeProvider } from '@factory/design-system';
import { FREE_STATE } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';
import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import type { i18n as I18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Text } from 'react-native';

import Dashboard from '../../app/(tabs)/index';
import MaintenanceTab from '../../app/(tabs)/maintenance';
import SettingsTab from '../../app/(tabs)/settings';
import AssetsList from '../../app/assets/index';
import Index from '../../app/index';
import MaintenanceDetail from '../../app/maintenance/[id]';
import CompleteMaintenance from '../../app/maintenance/complete';
import MaintenanceEdit from '../../app/maintenance/edit';
import Paywall from '../../app/paywall';
import { brand } from '@/config/brand';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import type { HouseholdInput } from '@/database/repositories/household';
import type { MaintenanceInput } from '@/database/repositories/maintenance';
import type { Home } from '@/domain/types';
import { initI18n, type InterfaceLanguage } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

jest.setTimeout(120_000);

/** sql.js + router rendering can be slow on a busy CI machine: generous explicit waits. */
const slow = { timeout: 30_000 };
/** Frozen "today" (a Friday) so due badges and groups are deterministic. */
const TODAY = '2026-11-13';

const taskInput: MaintenanceInput = {
  assetId: null,
  roomId: null,
  templateId: null,
  title: 'Clean gutters',
  description: null,
  category: 'other',
  frequency: 'monthly',
  intervalValue: null,
  intervalUnit: null,
  lastDone: null,
  nextDue: TODAY,
  estimatedMinutes: null,
  priority: 'medium',
  estimatedCostMinor: null,
  currency: null,
  notes: null,
  reminderEnabled: true,
  reminderDaysBefore: null,
};

const choreInput: HouseholdInput = {
  roomId: null,
  assigneeId: null,
  title: 'Take out the trash',
  description: null,
  category: 'other',
  priority: 'medium',
  dueDate: TODAY,
  recurrence: 'once',
  intervalValue: null,
  intervalUnit: null,
  reminderEnabled: false,
};

let repos: Repositories;
let home: Home;
let layout: () => React.JSX.Element;

/** Fresh in-memory database with one home, English UI, free plan. */
async function setup(lng: InterfaceLanguage = 'en', withHome = true): Promise<void> {
  clock.set(() => new Date(`${TODAY}T10:00:00`));
  const i18n: I18n = await initI18n(lng, []);
  repos = await initDatabase(await createTestDatabase(), clock.now);
  setRepositories(repos);
  usePreferences.setState({ onboardingCompleted: true, interfaceLanguage: null, theme: 'light', units: 'metric', dateFormat: 'auto', activeHomeId: null, sessionCount: 1 });
  useSession.setState({ dbReady: true, homes: [], entitlement: FREE_STATE, plans: [], storeAvailable: false, dataVersion: 0 });
  if (withHome) {
    home = await repos.homes.create({ name: 'Main flat', type: 'apartment', currency: 'EUR', areaM2: 72 }, [{ name: 'Kitchen', kind: 'kitchen' }]);
    useSession.setState({ homes: [home] });
    usePreferences.setState({ activeHomeId: home.id });
  }
  layout = () => (
    <ThemeProvider brand={brand} preference="light">
      <I18nextProvider i18n={i18n}>
        <Slot />
      </I18nextProvider>
    </ThemeProvider>
  );
}

beforeEach(() => setup());
afterAll(() => {
  clock.set(null);
  setRepositories(null);
});

describe('entry routing', () => {
  const routes = () => ({ _layout: layout, index: Index, onboarding: () => <Text>ONBOARDING</Text>, '(tabs)/index': () => <Text>HOME</Text> });

  it('sends new users to onboarding', async () => {
    usePreferences.setState({ onboardingCompleted: false });
    await renderRouter(routes(), { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING', undefined, slow)).toBeTruthy();
  });

  it('sends onboarded users with a home to the dashboard', async () => {
    await renderRouter(routes(), { initialUrl: '/' });
    expect(await screen.findByText('HOME', undefined, slow)).toBeTruthy();
  });

  it('re-runs onboarding when every home was deleted', async () => {
    useSession.setState({ homes: [] });
    await renderRouter(routes(), { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING', undefined, slow)).toBeTruthy();
  });
});

describe('dashboard', () => {
  it('shows an empty state when there is no home', async () => {
    await setup('en', false);
    await renderRouter({ _layout: layout, index: Dashboard }, { initialUrl: '/' });
    expect(await screen.findByText('No home yet', undefined, slow)).toBeTruthy();
    expect(screen.queryByTestId('dashboard')).toBeNull();
  });

  it('reassures the user when nothing is due', async () => {
    await renderRouter({ _layout: layout, index: Dashboard }, { initialUrl: '/' });
    expect(await screen.findByText('All clear — nothing urgent at home.', undefined, slow)).toBeTruthy();
    expect(screen.getByText('Main flat')).toBeTruthy();
    expect(screen.getByText('Nothing planned for the next 14 days.')).toBeTruthy();
    expect(screen.getByText('Quick actions')).toBeTruthy();
    expect(screen.getByText('€0.00')).toBeTruthy();
  });

  it('raises overdue alerts and lists the agenda with due badges', async () => {
    await repos.maintenance.create(home.id, { ...taskInput, title: 'Boiler service', nextDue: '2026-11-10' });
    await repos.maintenance.create(home.id, taskInput);
    await repos.household.create(home.id, { ...choreInput, dueDate: '2026-11-14' });
    await renderRouter({ _layout: layout, index: Dashboard }, { initialUrl: '/' });
    expect(await screen.findByText('1 maintenance task is overdue', undefined, slow)).toBeTruthy();
    expect(screen.queryByText('All clear — nothing urgent at home.')).toBeNull();
    expect(screen.getByText('Boiler service')).toBeTruthy();
    expect(screen.getByText('3 days late')).toBeTruthy();
    expect(screen.getByText('Clean gutters')).toBeTruthy();
    expect(screen.getByText('Take out the trash')).toBeTruthy();
    expect(screen.getByText('Tomorrow')).toBeTruthy();
    expect(screen.getByText('Urgent')).toBeTruthy();
  });

  it('is translated (French)', async () => {
    await setup('fr');
    await renderRouter({ _layout: layout, index: Dashboard }, { initialUrl: '/' });
    expect(await screen.findByText('Actions rapides', undefined, slow)).toBeTruthy();
    expect(screen.queryByText('Quick actions')).toBeNull();
  });
});

describe('maintenance tab', () => {
  it('shows the empty states for tasks and chores', async () => {
    await renderRouter({ _layout: layout, index: MaintenanceTab }, { initialUrl: '/' });
    expect(await screen.findByText('Plan your first maintenance', undefined, slow)).toBeTruthy();
    expect(screen.getByText('Browse templates')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('segment-household'));
    expect(await screen.findByText('No chores yet', undefined, slow)).toBeTruthy();
    expect(screen.queryByText('Plan your first maintenance')).toBeNull();
  });

  it('groups tasks by due date', async () => {
    await repos.maintenance.create(home.id, { ...taskInput, title: 'Boiler service', nextDue: '2026-11-10', priority: 'urgent', estimatedMinutes: 45, frequency: 'annual' });
    await repos.maintenance.create(home.id, { ...taskInput, title: 'Test smoke detectors', nextDue: '2026-12-25' });
    await renderRouter({ _layout: layout, index: MaintenanceTab }, { initialUrl: '/' });
    expect(await screen.findByText('Boiler service', undefined, slow)).toBeTruthy();
    expect(screen.getByText('Overdue')).toBeTruthy();
    expect(screen.getByText('3 days late')).toBeTruthy();
    expect(screen.getByText('Yearly · 45 min')).toBeTruthy();
    expect(screen.getByText('Later')).toBeTruthy();
    expect(screen.getByText('Test smoke detectors')).toBeTruthy();
    expect(screen.queryByText('Plan your first maintenance')).toBeNull();
  });

  it('lets the user tick off a chore from the list', async () => {
    const chore = await repos.household.create(home.id, choreInput);
    await renderRouter({ _layout: layout, index: MaintenanceTab }, { initialUrl: '/?tab=household' });
    expect(await screen.findByText('Take out the trash', undefined, slow)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Done'));
    await waitFor(async () => expect((await repos.household.get(chore.id))?.completedAt).not.toBeNull(), slow);
    expect(await screen.findByText('No chores yet', undefined, slow)).toBeTruthy();
    expect(screen.queryByText('Take out the trash')).toBeNull();
  });
});

describe('maintenance task form', () => {
  const routes = () => ({ _layout: layout, '(tabs)/maintenance': MaintenanceTab, 'maintenance/edit': MaintenanceEdit, 'maintenance/[id]': MaintenanceDetail });

  it('requires a title and saves nothing without one', async () => {
    await renderRouter(routes(), { initialUrl: '/maintenance/edit' });
    await fireEvent.press(await screen.findByTestId('form-save', undefined, slow));
    expect(await screen.findByText('Required', undefined, slow)).toBeTruthy();
    expect(await repos.maintenance.list(home.id)).toHaveLength(0);
    await fireEvent.changeText(screen.getByTestId('task-title'), 'Clean gutters');
    await waitFor(() => expect(screen.queryByText('Required')).toBeNull(), slow);
  });

  it('creates a task from the list and shows it in the detail screen and back in the list', async () => {
    await renderRouter(routes(), { initialUrl: '/(tabs)/maintenance' });
    expect(await screen.findByText('Plan your first maintenance', undefined, slow)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('add-task'));
    await fireEvent.changeText(await screen.findByTestId('task-title', undefined, slow), '  Clean gutters ');
    await fireEvent.press(screen.getByTestId('freq-quarterly'));
    await fireEvent.press(screen.getByTestId('form-save'));

    expect(await screen.findByTestId('maintenance-detail', undefined, slow)).toBeTruthy();
    const [task] = await repos.maintenance.list(home.id);
    expect(task).toMatchObject({ title: 'Clean gutters', frequency: 'quarterly', nextDue: TODAY, priority: 'medium', reminderEnabled: true });
    expect(screen.getByText('Clean gutters')).toBeTruthy();
    expect(screen.getByText('Quarterly')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Back'));
    expect(await screen.findByTestId('maintenance-tab', undefined, slow)).toBeTruthy();
    expect(await screen.findByText('Clean gutters', undefined, slow)).toBeTruthy();
    expect(screen.queryByText('Plan your first maintenance')).toBeNull();
  });

  it('pre-fills the form when editing and saves the changes', async () => {
    const task = await repos.maintenance.create(home.id, taskInput);
    await renderRouter(routes(), { initialUrl: `/maintenance/${task.id}` });
    await fireEvent.press(await screen.findByLabelText('Edit task', undefined, slow));
    expect(await screen.findByTestId('form-delete', undefined, slow)).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('task-title').props.value).toBe('Clean gutters'), slow);
    await fireEvent.changeText(screen.getByTestId('task-title'), 'Clean the gutters');
    await fireEvent.press(screen.getByTestId('form-save'));
    await waitFor(async () => expect((await repos.maintenance.get(task.id))?.title).toBe('Clean the gutters'), slow);
    expect(await screen.findByTestId('maintenance-detail', undefined, slow)).toBeTruthy();
    expect(await screen.findByText('Clean the gutters', undefined, slow)).toBeTruthy();
  });
});

describe('maintenance task detail', () => {
  const routes = () => ({ _layout: layout, 'maintenance/[id]': MaintenanceDetail, 'maintenance/complete': CompleteMaintenance });

  it('shows the task, its schedule and the free-plan history limit', async () => {
    const task = await repos.maintenance.create(home.id, { ...taskInput, nextDue: '2026-11-10', priority: 'high', estimatedMinutes: 30, estimatedCostMinor: 2500, currency: 'EUR', notes: 'Ladder is in the garage' });
    await renderRouter(routes(), { initialUrl: `/maintenance/${task.id}` });
    expect(await screen.findByTestId('maintenance-detail', undefined, slow)).toBeTruthy();
    expect(screen.getByText('Clean gutters')).toBeTruthy();
    expect(screen.getByText('3 days late')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
    expect(screen.getByText('Monthly')).toBeTruthy();
    expect(screen.getByText('30 min')).toBeTruthy();
    expect(screen.getByText('€25.00')).toBeTruthy();
    expect(screen.getByText('Ladder is in the garage')).toBeTruthy();
    expect(screen.getByText('Nothing recorded yet.')).toBeTruthy();
    expect(screen.getByText('Free plan: last 90 days of history')).toBeTruthy();
    expect(screen.getByTestId('mark-done')).toBeTruthy();
  });

  it('explains that a deleted task no longer exists', async () => {
    await renderRouter(routes(), { initialUrl: '/maintenance/unknown-id' });
    expect(await screen.findByText('This item no longer exists', undefined, slow)).toBeTruthy();
    expect(screen.queryByTestId('maintenance-detail')).toBeNull();
  });

  it('postpones a task by the chosen number of days', async () => {
    const task = await repos.maintenance.create(home.id, taskInput);
    await renderRouter(routes(), { initialUrl: `/maintenance/${task.id}` });
    await fireEvent.press(await screen.findByText('Postpone', undefined, slow));
    await fireEvent.press(await screen.findByText('Postpone 7 days', undefined, slow));
    await waitFor(async () => expect((await repos.maintenance.get(task.id))?.nextDue).toBe('2026-11-20'), slow);
    expect(await screen.findByText('In 7 days', undefined, slow)).toBeTruthy();
    expect(await screen.findByText(/^Postponed · /, undefined, slow)).toBeTruthy();
  });

  it('marks a task as done, schedules the next occurrence and records history', async () => {
    const task = await repos.maintenance.create(home.id, taskInput);
    await renderRouter(routes(), { initialUrl: `/maintenance/${task.id}` });
    await fireEvent.press(await screen.findByTestId('mark-done', undefined, slow));
    expect(await screen.findByText(/^Next due date: /, undefined, slow)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('form-save'));
    await waitFor(async () => expect(await repos.maintenance.get(task.id)).toMatchObject({ lastDone: TODAY, nextDue: '2026-12-13' }), slow);
    expect(await screen.findByText(/^Done · /, undefined, slow)).toBeTruthy();
    expect(screen.queryByText('Nothing recorded yet.')).toBeNull();
    expect(await repos.maintenance.history(home.id, { taskId: task.id })).toHaveLength(1);
  });
});

describe('equipment list', () => {
  it('shows the empty state and the free-plan usage', async () => {
    await renderRouter({ _layout: layout, index: AssetsList }, { initialUrl: '/' });
    expect(await screen.findByText('Add your first equipment', undefined, slow)).toBeTruthy();
    expect(screen.getByText('0 of 15 equipment on the free plan')).toBeTruthy();
    expect(screen.getByTestId('add-asset')).toBeTruthy();
  });
});

describe('settings', () => {
  it('shows the free plan, the general rows and the app version', async () => {
    await renderRouter({ _layout: layout, index: SettingsTab }, { initialUrl: '/' });
    expect(await screen.findByTestId('settings-tab', undefined, slow)).toBeTruthy();
    expect(screen.getByText('Free plan')).toBeTruthy();
    expect(screen.getByText('Unlock HomeCare Premium')).toBeTruthy();
    expect(screen.getByText('Device language (English)')).toBeTruthy();
    expect(screen.getByTestId('settings-notifications')).toBeTruthy();
    expect(screen.getByTestId('settings-data')).toBeTruthy();
    expect(screen.getByText(/^HomeCare \d+\.\d+\.\d+$/)).toBeTruthy();
  });

  it('thanks Premium subscribers and opens the paywall from the plan card', async () => {
    useSession.setState({ entitlement: { ...FREE_STATE, isPremium: true } });
    await renderRouter({ _layout: layout, index: SettingsTab, paywall: Paywall }, { initialUrl: '/' });
    expect(await screen.findByText('Thank you for supporting HomeCare', undefined, slow)).toBeTruthy();
    expect(screen.queryByText('Free plan')).toBeNull();
    await fireEvent.press(screen.getByLabelText('HomeCare Premium'));
    expect(await screen.findByTestId('paywall', undefined, slow)).toBeTruthy();
    expect(await screen.findByText('Premium is active', undefined, slow)).toBeTruthy();
    expect(screen.queryByTestId('subscribe')).toBeNull();
  });
});

describe('paywall', () => {
  it('lists the benefits and never offers a purchase when the store is not configured', async () => {
    await renderRouter({ _layout: layout, index: Paywall }, { initialUrl: '/' });
    expect(await screen.findByText('Purchases are not available in this build.', undefined, slow)).toBeTruthy();
    expect(screen.getByText('Take care of every home')).toBeTruthy();
    expect(screen.getByText('Unlimited equipment (free plan: 15)')).toBeTruthy();
    expect(screen.getByText('No ads')).toBeTruthy();
    expect(screen.getByTestId('subscribe').props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.queryByTestId('plan-annual')).toBeNull();
  });
});
