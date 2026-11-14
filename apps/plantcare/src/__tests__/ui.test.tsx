import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';

import Home from '../../app/(tabs)/index';
import Index from '../../app/index';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { basePlant, setupUi, slow, type UiContext } from '@/test-utils/ui';

jest.setTimeout(120_000);

let ctx: UiContext;
beforeEach(async () => {
  ctx = await setupUi();
});
afterAll(() => clock.set(null));

describe('entry routing', () => {
  it('sends new users to onboarding', async () => {
    usePreferences.setState({ onboardingCompleted: false });
    await renderRouter({ _layout: ctx.layout, index: Index, onboarding: () => <Text>ONBOARDING</Text>, '(tabs)/index': () => <Text>HOME</Text> }, { initialUrl: '/' });
    expect(await screen.findByText('ONBOARDING', undefined, slow)).toBeTruthy();
  });
});

describe('dashboard', () => {
  it('shows the empty state without plants', async () => {
    await renderRouter({ _layout: ctx.layout, index: Home }, { initialUrl: '/' });
    expect(await screen.findByText('Your green space starts here', undefined, slow)).toBeTruthy();
  });

  it('lists today and overdue care and lets the user confirm a watering', async () => {
    const { repos } = ctx;
    const p = await repos.plants.create({ ...basePlant, nickname: 'Monty' });
    const late = await repos.plants.create({ ...basePlant, nickname: 'Fern' });
    const task = await repos.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-10', intervalDays: 7, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    await repos.tasks.create({ plantId: late.id, type: 'pest_check', nextDue: '2026-05-05', intervalDays: 30, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    await renderRouter({ _layout: ctx.layout, index: Home }, { initialUrl: '/' });
    expect(await screen.findByText('Monty', undefined, slow)).toBeTruthy();
    expect(screen.getByText('5 days late')).toBeTruthy();
    expect(screen.getByText('2 care tasks for today.')).toBeTruthy();
    fireEvent.press(screen.getByTestId(`done-${task.id}`));
    await waitFor(async () => expect((await repos.tasks.get(task.id))?.nextDue).toBe('2026-05-17'), slow);
    expect(await repos.watering.last(p.id)).not.toBeNull();
  });
});
