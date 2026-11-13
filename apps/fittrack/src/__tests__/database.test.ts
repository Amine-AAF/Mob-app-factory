import { createTestDatabase } from '@factory/testing';

import { LIBRARY } from '@/content/exercises';
import { TEMPLATES } from '@/content/templates';
import { defaultTargets, initDatabase, setRepositories, type Repositories } from '@/database';
import { migrations, SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { itemsForDay } from '@/features/planner/plan';
import { deleteAllUserData, describeBackup, exportCsv, exportUserData, importUserData, toCsv } from '@/services/backupService';
import { clock } from '@/services/clock';
import { moveItem, postpone, PlannerError, saveRoutine, skipItem, startItem } from '@/services/plannerService';
import { evaluateAchievements } from '@/services/progressService';
import { discard, editSet, finish, logSet, pause, restoreActiveSession, resume, skipExercise, startEmpty, startFromProgramDay, WorkoutError } from '@/services/workoutService';
import { useSession } from '@/store/session';

jest.mock('@/services/restAlerts', () => ({ scheduleRestAlert: jest.fn(async () => undefined), cancelRestAlert: jest.fn(async () => undefined) }));

jest.setTimeout(30_000);

const at = (iso: string) => clock.set(() => new Date(iso));
const opts = { autoRest: true, restAlerts: { enabled: false, title: '', body: '' } };

let db: Awaited<ReturnType<typeof createTestDatabase>>;
let r: Repositories;

beforeEach(async () => {
  at('2026-11-02T09:00:00');
  db = await createTestDatabase();
  r = await initDatabase(db);
  setRepositories(r);
  useSession.setState({ activeSessionId: null, pendingAchievements: [] });
});
afterEach(() => {
  clock.set(null);
  db.close();
});

async function program(dayExercises: string[] = ['barbell-bench-press', 'push-up', 'plank']) {
  const { programId, dayId } = await r.programs.create({ name: 'Push', description: null, type: 'custom', goal: 'strength', level: 'beginner', notes: null }, 'Day 1');
  for (const id of dayExercises) await r.programs.addExercise(dayId, id, { ...defaultTargets(LIBRARY.find((e) => e.id === id)!.tracking), sets: 2 });
  return { programId, dayId };
}

describe('schema, migrations & library seed', () => {
  it('creates every table at the latest version, with foreign keys on', async () => {
    expect((await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []))?.user_version).toBe(SCHEMA_VERSION);
    for (const table of USER_TABLES) expect(await db.getFirstAsync('SELECT name FROM sqlite_master WHERE name = ?', [table])).not.toBeNull();
    expect((await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys', []))?.foreign_keys).toBe(1);
    expect(migrations.map((m) => m.version)).toEqual(migrations.map((_, i) => i + 1));
  });

  it('seeds the library with muscles and equipment relations, idempotently', async () => {
    expect((await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM exercises WHERE source = 'library'", []))?.n).toBe(LIBRARY.length);
    expect((await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM exercise_muscles WHERE role = 'primary'", []))?.n).toBe(LIBRARY.length);
    expect(await r.exercises.syncLibrary(LIBRARY, 1)).toBe(false);
    const again = await initDatabase(db);
    expect((await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM exercises', []))?.n).toBe(LIBRARY.length);
    expect(again).toBeTruthy();
  });

  it('re-opening an existing database keeps user data (app update)', async () => {
    const { programId } = await program();
    const again = await initDatabase(db);
    expect((await again.programs.get(programId))?.days[0]?.exercises).toHaveLength(3);
  });
});

describe('Workout Builder', () => {
  it('creates, edits targets, reorders and removes exercises', async () => {
    const { programId, dayId } = await program();
    let p = (await r.programs.get(programId))!;
    const [a, b, c] = p.days[0]!.exercises;
    await r.programs.updateExercise(a!.id, { sets: 5, repsMin: 10, repsMax: 5, restSec: 150, weightKg: 60 });
    await r.programs.moveExercise(c!.id, -1);
    p = (await r.programs.get(programId))!;
    const day = p.days[0]!;
    expect(day.exercises.map((e) => e.id)).toEqual([a!.id, c!.id, b!.id]);
    expect(day.exercises[0]).toMatchObject({ sets: 5, repsMin: 5, repsMax: 10, restSec: 150, weightKg: 60 }); // min/max swapped back
    await r.programs.reorderExercises(dayId, [b!.id, a!.id, c!.id]);
    expect((await r.programs.getDay(dayId))!.exercises.map((e) => e.position)).toEqual([0, 1, 2]);
    await expect(r.programs.reorderExercises(dayId, [a!.id])).rejects.toThrow('reorder');
    await r.programs.removeExercise(a!.id);
    expect((await r.programs.getDay(dayId))!.exercises.map((e) => e.position)).toEqual([0, 1]);
  });

  it('clamps sets to 1–20 and keeps at least one day', async () => {
    const { programId, dayId } = await program(['push-up']);
    const pe = (await r.programs.getDay(dayId))!.exercises[0]!;
    await r.programs.updateExercise(pe.id, { sets: 99 });
    expect((await r.programs.getDay(dayId))!.exercises[0]!.sets).toBe(20);
    expect(await r.programs.removeDay(dayId)).toBe(false);
    const second = await r.programs.addDay(programId, 'Day 2');
    expect(await r.programs.removeDay(second)).toBe(true);
  });

  it('duplicates a program deeply and copies templates in the chosen language', async () => {
    const { programId } = await program();
    const copy = await r.programs.duplicate(programId, 'Push (copy)');
    const c = (await r.programs.get(copy!))!;
    expect(c.origin).toBe('duplicate');
    expect(c.days[0]!.exercises.map((e) => e.exerciseId)).toEqual(['barbell-bench-press', 'push-up', 'plank']);
    const tpl = TEMPLATES.find((t) => t.days.length > 1)!;
    const pid = await r.programs.createFromTemplate(tpl, 'fr');
    const fromTpl = (await r.programs.get(pid))!;
    expect(fromTpl.name).toBe(tpl.i18n.fr.name);
    expect(fromTpl.days.map((d) => d.name)).toEqual(tpl.days.map((d) => d.name.fr));
    expect(await r.programs.countOwn()).toBe(2); // template copies don't count toward the free limit
  });

  it('every bundled template can be adopted (all exercise ids exist in the database)', async () => {
    for (const t of TEMPLATES) await expect(r.programs.createFromTemplate(t, 'en')).resolves.toBeTruthy();
  });

  it('deleting a program keeps past sessions', async () => {
    const { programId, dayId } = await program(['push-up']);
    const sid = await startFromProgramDay(r, programId, dayId);
    const ex = (await r.sessions.get(sid))!.exercises[0]!;
    await logSet(r, sid, ex.id, { reps: 10, weightKg: null, durationSec: null, distanceM: null }, 'reps', opts);
    await finish(r, sid);
    await r.programs.remove(programId);
    expect((await r.sessions.get(sid))?.programId).toBeNull();
  });
});

describe('active workout', () => {
  it('logs sets, starts rest, detects records and completes the session', async () => {
    const { programId, dayId } = await program(['barbell-bench-press']);
    const sid = await startFromProgramDay(r, programId, dayId);
    expect(useSession.getState().activeSessionId).toBe(sid);
    await expect(startEmpty(r, 'Other')).rejects.toBeInstanceOf(WorkoutError);
    const ex = (await r.sessions.get(sid))!.exercises[0]!;

    at('2026-11-02T09:02:00');
    const first = await logSet(r, sid, ex.id, { reps: 8, weightKg: 60, durationSec: null, distanceM: null }, 'weight_reps', opts);
    expect(first.records).toEqual([]); // baseline, not celebrated
    expect(first.restSec).toBe(90);
    expect((await r.sessions.get(sid))!.restEndsAt).toBe(new Date('2026-11-02T09:03:30').getTime());

    at('2026-11-02T09:05:00');
    const second = await logSet(r, sid, ex.id, { reps: 8, weightKg: 65, durationSec: null, distanceM: null }, 'weight_reps', opts);
    expect(second.records.map((x) => x.kind)).toEqual(expect.arrayContaining(['max_weight', 'max_volume', 'est_1rm']));
    expect(second.workoutFinished).toBe(true);
    expect(second.restSec).toBe(0);

    at('2026-11-02T09:40:00');
    const summary = await finish(r, sid);
    expect(summary).toMatchObject({ sets: 2, exercises: 1, durationSec: 40 * 60 });
    expect(summary!.achievements).toContain('first_workout');
    expect(await r.sessions.active()).toBeNull();
    expect(useSession.getState().activeSessionId).toBeNull();
  });

  it('rejects invalid sets', async () => {
    const sid = await startEmpty(r, 'Quick', [{ exerciseId: 'plank', targetSets: 1, repsMin: null, repsMax: null, weightKg: null, durationSec: 30, distanceM: null, restSec: 30, notes: null }]);
    const ex = (await r.sessions.get(sid))!.exercises[0]!;
    await expect(logSet(r, sid, ex.id, { reps: null, weightKg: null, durationSec: 0, distanceM: null }, 'time', opts)).rejects.toMatchObject({ code: 'invalid_set' });
    await expect(logSet(r, sid, ex.id, { reps: 5, weightKg: -1, durationSec: 30, distanceM: null }, 'time', opts)).rejects.toMatchObject({ code: 'invalid_set' });
  });

  it('survives an unexpected close: the session, its sets and its timers are restored', async () => {
    const { programId, dayId } = await program(['push-up', 'plank']);
    const sid = await startFromProgramDay(r, programId, dayId);
    const ex = (await r.sessions.get(sid))!.exercises[0]!;
    at('2026-11-02T09:03:00');
    await logSet(r, sid, ex.id, { reps: 12, weightKg: null, durationSec: null, distanceM: null }, 'reps', opts);
    await pause(r, sid);

    // "Kill" the app: drop the in-memory state and re-open the same database.
    useSession.setState({ activeSessionId: null });
    at('2026-11-02T11:00:00');
    const reopened = await initDatabase(db);
    expect(await restoreActiveSession(reopened)).toBe(sid);
    const s = (await reopened.sessions.get(sid))!;
    expect(s.status).toBe('paused');
    expect(s.exercises[0]!.sets).toHaveLength(1);

    at('2026-11-02T11:01:00');
    await resume(reopened, sid);
    const resumed = (await reopened.sessions.get(sid))!;
    // Paused span (09:03 → 11:01) excluded; the rest end moved by the same span.
    expect(resumed.pausedTotalMs).toBe((2 * 60 - 2) * 60_000);
    expect(resumed.restEndsAt).toBe(new Date('2026-11-02T09:04:00').getTime() + resumed.pausedTotalMs);
    at('2026-11-02T11:10:00');
    expect((await finish(reopened, sid))!.durationSec).toBe(3 * 60 + 9 * 60);
  });

  it('skips exercises, edits sets and recomputes records', async () => {
    const { programId, dayId } = await program(['barbell-bench-press', 'push-up']);
    const sid = await startFromProgramDay(r, programId, dayId);
    const [bench, push] = (await r.sessions.get(sid))!.exercises;
    await logSet(r, sid, bench!.id, { reps: 5, weightKg: 100, durationSec: null, distanceM: null }, 'weight_reps', opts);
    const setId = (await r.sessions.get(sid))!.exercises[0]!.sets[0]!.id;
    await editSet(r, setId, 'barbell-bench-press', 'weight_reps', { reps: 5, weightKg: 80, durationSec: null, distanceM: null });
    const recs = await r.records.forExercise('barbell-bench-press');
    expect(Math.max(...recs.filter((x) => x.kind === 'max_weight').map((x) => x.value))).toBe(80);
    await skipExercise(r, sid, push!.id);
    expect((await r.sessions.get(sid))!.exercises[1]!.status).toBe('skipped');
  });

  it('finishing or discarding a session without sets keeps nothing', async () => {
    const sid = await startEmpty(r, 'Quick');
    expect(await finish(r, sid)).toBeNull();
    expect(await r.sessions.get(sid)).toBeNull();
    const s2 = await startEmpty(r, 'Quick');
    await discard(r, s2);
    expect(await r.sessions.active()).toBeNull();
  });
});

describe('planner', () => {
  it('routine occurrences can be started, moved, postponed and skipped', async () => {
    const { programId, dayId } = await program(['push-up']);
    await saveRoutine(r, [{ weekday: 0, kind: 'workout', programId, programDayId: dayId, time: null }, { weekday: 2, kind: 'workout', programId, programDayId: dayId, time: null }]);
    const routine = await r.planner.routine();
    const start = await r.settings.get<string | null>('routine_start', null);
    const items = async (day: string) => itemsForDay(day, await r.planner.entries(day, day), routine, start);

    const monday = (await items('2026-11-02'))[0]!;
    expect(monday.virtual).toBe(true);
    await moveItem(r, monday, '2026-11-03');
    expect((await items('2026-11-02')).map((i) => i.status)).toEqual(['moved']);
    expect((await items('2026-11-03'))[0]).toMatchObject({ status: 'planned', virtual: false });
    await expect(moveItem(r, (await items('2026-11-03'))[0]!, '2026-11-01')).rejects.toBeInstanceOf(PlannerError);

    const wed = (await items('2026-11-04'))[0]!;
    await postpone(r, wed);
    expect((await items('2026-11-05'))[0]?.status).toBe('planned');

    const nextMonday = (await items('2026-11-09'))[0]!;
    await skipItem(r, nextMonday);
    expect((await items('2026-11-09'))[0]?.status).toBe('skipped');

    // Starting a planned item links the session; finishing marks the entry done.
    const tue = (await items('2026-11-03'))[0]!;
    const sid = await startItem(r, tue);
    const ex = (await r.sessions.get(sid))!.exercises[0]!;
    await logSet(r, sid, ex.id, { reps: 10, weightKg: null, durationSec: null, distanceM: null }, 'reps', opts);
    await finish(r, sid);
    expect((await items('2026-11-03'))[0]?.status).toBe('done');
  });
});

describe('body, cardio, goals', () => {
  it('stores measurements in metric units and unlocks the tracker badge', async () => {
    await r.body.add({ day: '2026-11-02', kind: 'weight', customName: null, value: 80.5, note: null });
    expect((await r.body.latest('weight'))?.value).toBe(80.5);
    expect(await evaluateAchievements(r)).toContain('tracker');
    expect(await evaluateAchievements(r)).toEqual([]); // only once
  });

  it('logs cardio and enforces CHECK constraints', async () => {
    await r.cardio.add({ day: '2026-11-02', type: 'running', durationSec: 1800, distanceM: 5000, calories: null, caloriesSource: null, note: null });
    expect(await r.cardio.list({ type: 'running' })).toHaveLength(1);
    await expect(r.cardio.add({ day: '2026-11-02', type: 'running', durationSec: 0, distanceM: null, calories: null, caloriesSource: null, note: null })).rejects.toThrow();
  });

  it('completes challenges automatically', async () => {
    await r.goals.startChallenge('seven_day', '2026-11-02');
    for (const d of ['02', '03', '05', '06']) await r.cardio.add({ day: `2026-11-${d}`, type: 'walking', durationSec: 1800, distanceM: null, calories: null, caloriesSource: null, note: null });
    at('2026-11-06T20:00:00');
    expect(await evaluateAchievements(r)).toContain('challenger');
    expect((await r.goals.challenges())[0]?.status).toBe('completed');
  });
});

describe('backup, restore & deletion', () => {
  it('exports and restores everything atomically, including custom exercises', async () => {
    const { programId, dayId } = await program();
    const custom = await r.exercises.createCustom({ name: 'Sled drag', description: null, category: 'full_body', primary: 'quads', secondary: [], equipment: ['other'], tracking: 'time', level: 'beginner' });
    await r.programs.addExercise(dayId, custom, defaultTargets('time'));
    const sid = await startFromProgramDay(r, programId, dayId);
    const ex = (await r.sessions.get(sid))!.exercises[0]!;
    await logSet(r, sid, ex.id, { reps: 5, weightKg: 70, durationSec: null, distanceM: null }, 'weight_reps', opts);
    await finish(r, sid);
    await r.body.add({ day: '2026-11-02', kind: 'waist', customName: null, value: 85, note: 'private' });
    await r.exercises.toggleFavorite('push-up');

    const { json } = await exportUserData(db, new Date('2026-11-02T12:00:00Z'));
    expect(describeBackup(json)).toMatchObject({ sessions: 1, programs: 1, measurements: 1 });
    expect(json).not.toContain('subscription_cache');

    await deleteAllUserData(db);
    expect(await r.programs.list()).toEqual([]);
    expect((await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM exercises WHERE source = 'library'", []))?.n).toBe(LIBRARY.length);

    const res = await importUserData(db, json);
    expect(res.restoredRows).toBeGreaterThan(LIBRARY.length);
    const p = (await r.programs.get(programId))!;
    expect(p.days[0]!.exercises.map((e) => e.exerciseId)).toContain(custom);
    expect((await r.sessions.completed())).toHaveLength(1);
    expect(await r.exercises.favorites()).toEqual(['push-up']);
    expect((await r.records.forExercise('barbell-bench-press')).length).toBeGreaterThan(0);
  });

  it('rejects other apps, invalid JSON and newer schemas without touching data', async () => {
    await program();
    await expect(importUserData(db, '{nope')).rejects.toMatchObject({ code: 'invalid_json' });
    const other = JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'habitflow', schemaVersion: 1, createdAt: '', tables: {} });
    await expect(importUserData(db, other)).rejects.toMatchObject({ code: 'wrong_app' });
    const newer = JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'fittrack', schemaVersion: 99, createdAt: '', tables: {} });
    await expect(importUserData(db, newer)).rejects.toMatchObject({ code: 'newer_schema' });
    expect(await r.programs.list()).toHaveLength(1);
  });

  it('a corrupt backup rolls back completely', async () => {
    await program();
    const { backup } = await exportUserData(db);
    backup.tables.program_exercises = [{ id: 'x', day_id: 'missing-day', exercise_id: 'push-up', position: 0, sets: 3, rest_sec: 60, created_at: 0, updated_at: 0 }];
    await expect(importUserData(db, JSON.stringify(backup))).rejects.toThrow();
    expect(await r.programs.list()).toHaveLength(1);
  });

  it('exports CSV safely (quotes and formula injection)', async () => {
    expect(toCsv([{ a: '=SUM(A1)', b: 'x, "y"' }], ['a', 'b'])).toBe(`a,b\n'=SUM(A1),"x, ""y"""`);
    const files = await exportCsv(db, (id) => id);
    expect(files.map((f) => f.fileName)).toEqual(['fittrack-workouts.csv', 'fittrack-cardio.csv', 'fittrack-body.csv']);
  });
});
