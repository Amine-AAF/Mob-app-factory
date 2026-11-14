import { ThemeProvider } from '@factory/design-system';
import { fireEvent, render, screen } from '@testing-library/react-native';
import fs from 'fs';
import type { i18n as I18n } from 'i18next';
import path from 'path';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { MonthCalendar } from '@/components/calendar';
import { HabitCard } from '@/components/HabitCard';
import { ProgressRing } from '@/components/ProgressRing';
import { PALETTES } from '@/config/brand';
import { initI18n } from '@/i18n';

import { habit, log } from '@/__fixtures__/habits';

// First render transforms the whole RN tree; generous timeout for slow CI machines.
jest.setTimeout(60_000);

let i18n: I18n;
beforeAll(async () => {
  i18n = await initI18n('en', []);
});

const wrap = (ui: ReactNode) => (
  <ThemeProvider brand={PALETTES.flow} preference="light">
    <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
  </ThemeProvider>
);

describe('HabitCard', () => {
  it('shows the habit and triggers the quick check-in', async () => {
    const onToggle = jest.fn();
    const h = habit('read', '2026-11-02', { type: 'daily' }, { name: 'Read 20 minutes' });
    await render(wrap(<HabitCard due={{ habit: h, log: undefined, tracking: h.schedules[0]!.tracking, period: null }} streak={{ current: 4, best: 6, unit: 'day' }} onToggle={onToggle} onOpen={jest.fn()} />));
    expect(screen.getByText('Read 20 minutes')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Mark Read 20 minutes as done'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('offers undo once done and shows quantity progress', async () => {
    const h = { ...habit('water', '2026-11-02'), name: 'Water', schedules: [{ habitId: 'water', effectiveFrom: '2026-11-02', frequency: { type: 'daily' as const }, tracking: { mode: 'quantity' as const, target: 2, unit: 'L' } }] };
    const { rerender } = await render(wrap(<HabitCard due={{ habit: h, log: log('water', '2026-11-02', 'partial', 1, 2), tracking: h.schedules[0]!.tracking, period: null }} onToggle={jest.fn()} onIncrement={jest.fn()} onOpen={jest.fn()} />));
    expect(screen.getByText('1 / 2 L')).toBeTruthy();
    await rerender(wrap(<HabitCard due={{ habit: h, log: log('water', '2026-11-02', 'done', 2, 2), tracking: h.schedules[0]!.tracking, period: null }} onToggle={jest.fn()} onOpen={jest.fn()} />));
    expect(screen.getByLabelText('Undo Water')).toBeTruthy();
  });
});

describe('ProgressRing & calendar', () => {
  it('exposes progress to accessibility', async () => {
    await render(wrap(<ProgressRing progress={0.65} accessibilityLabel="Daily progress" />));
    expect(screen.getByLabelText('Daily progress').props.accessibilityValue).toMatchObject({ now: 65 });
  });

  it('renders a month and disables future days', async () => {
    const onSelect = jest.fn();
    await render(wrap(<MonthCalendar month="2026-11-01" days={new Map([['2026-11-02', { day: '2026-11-02', state: 'complete', ratio: 1 }]])} today="2026-11-13" selected={null} onSelect={onSelect} />));
    await fireEvent.press(screen.getByTestId('cal-2026-11-02'));
    expect(onSelect).toHaveBeenCalledWith('2026-11-02');
    expect(screen.getByTestId('cal-2026-11-20').props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe('offline-first', () => {
  it('app code never calls the network directly', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const offenders: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__') walk(p);
        else if (/\.(tsx?)$/.test(e.name) && /\bfetch\(|XMLHttpRequest|axios/.test(fs.readFileSync(p, 'utf8'))) offenders.push(p);
      });
    roots.forEach(walk);
    expect(offenders).toEqual([]);
  });
});
