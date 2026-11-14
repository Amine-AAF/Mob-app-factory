import { createTestDatabase } from '@factory/testing';

import { initDatabase } from '@/database';
import { FOCUS_PRESETS, startRun } from '@/features/focus/pomodoro';
import { initI18n } from '@/i18n';
import { clock } from '@/services/clock';
import { settleFinishedFocus } from '@/services/focusSettle';
import { rescheduleAll } from '@/services/notifications';
import { afterLearningWrite } from '@/services/progress';
import { useFocus } from '@/store/focus';
import { useSession } from '@/store/session';

const scheduled: { identifier: string; content: { title: string; body: string }; trigger: unknown }[] = [];

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getAllScheduledNotificationsAsync: jest.fn(async () => scheduled.map((s) => ({ identifier: s.identifier }))),
  cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
    const i = scheduled.findIndex((s) => s.identifier === id);
    if (i >= 0) scheduled.splice(i, 1);
  }),
  scheduleNotificationAsync: jest.fn(async (req: { identifier?: string; content: { title: string; body: string }; trigger: unknown }) => {
    const identifier = req.identifier ?? `os-${scheduled.length}`;
    scheduled.push({ identifier, content: req.content, trigger: req.trigger });
    return identifier;
  }),
  AndroidImportance: { DEFAULT: 3, HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily', WEEKLY: 'weekly', TIME_INTERVAL: 'timeInterval' },
}));

const NOW = new Date(2026, 10, 13, 12, 0);

beforeEach(() => {
  scheduled.length = 0;
  clock.set(() => new Date(NOW));
});
afterEach(() => clock.set(null));

describe('focus settlement after the app was closed', () => {
  it('records a run that finished in the background and completes the linked session', async () => {
    const r = await initDatabase(await createTestDatabase());
    const sessionId = await r.planner.createSession({ subjectId: null, title: 'S', goal: '', day: '2026-11-13', startMinute: 600, durationMin: 60 });
    const t0 = NOW.getTime() - 3 * 3_600_000;
    useFocus.setState({ run: startRun(FOCUS_PRESETS['25_5'], null, t0), linkedSessionId: sessionId });
    expect(await settleFinishedFocus(r, NOW.getTime())).toBe(true);
    expect(useFocus.getState().run).toBeNull();
    expect((await r.planner.focusTotals()).minutes).toBe(100);
    expect((await r.planner.getSession(sessionId))?.status).toBe('done');
  });

  it('leaves a run in progress untouched', async () => {
    const r = await initDatabase(await createTestDatabase());
    useFocus.setState({ run: startRun(FOCUS_PRESETS['25_5'], null, NOW.getTime() - 10 * 60_000), linkedSessionId: null });
    expect(await settleFinishedFocus(r, NOW.getTime())).toBe(false);
    expect(useFocus.getState().run).not.toBeNull();
    useFocus.getState().clear();
  });
});

describe('notifications service', () => {
  it('schedules only enabled reminders, in the interface language, and replaces previous ones', async () => {
    const r = await initDatabase(await createTestDatabase());
    const i18n = await initI18n('fr', []);
    await r.agenda.create({ kind: 'exam', title: 'Physique', subjectId: null, day: '2026-11-20', minute: null, priority: 'high', notes: '' });
    expect(await rescheduleAll(r, i18n.t)).toBe(0);
    await r.settings.setNotificationSetting('exam', { enabled: true, hour: 9, minute: 0, leadMinutes: 0 });
    await r.settings.setNotificationSetting('daily_goal', { enabled: true, hour: 19, minute: 0, leadMinutes: 0 });
    // A focus alert must survive a reminders refresh.
    scheduled.push({ identifier: 'ls-focus-0', content: { title: 'f', body: 'f' }, trigger: {} });
    const count = await rescheduleAll(r, i18n.t);
    expect(count).toBe(3);
    await rescheduleAll(r, i18n.t);
    expect(scheduled.filter((s) => s.identifier.startsWith('ls-exam'))).toHaveLength(2);
    expect(scheduled.find((s) => s.identifier.startsWith('ls-exam') && s.identifier.endsWith('-0'))?.content.title).toMatch(/xamen/);
    expect(scheduled.some((s) => s.identifier === 'ls-focus-0')).toBe(true);
    expect(scheduled.find((s) => s.identifier === 'ls-daily-goal')?.content.body).not.toBe('notifications.dailyGoalBody');
  });
});

describe('progress hooks', () => {
  it('unlocks badges once after learning writes', async () => {
    const r = await initDatabase(await createTestDatabase());
    useSession.setState({ celebrate: [] });
    await r.subjects.create({ name: 'A', description: '', color: '#000000', icon: 'book', objective: '', startDay: null, targetDay: null });
    expect(await afterLearningWrite(r)).toEqual(['first_subject']);
    expect(await afterLearningWrite(r)).toEqual([]);
    expect(useSession.getState().celebrate).toEqual(['first_subject']);
  });
});
