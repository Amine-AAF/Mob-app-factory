import { fromJson, placeholders, toJson, type SqlDatabase } from '@factory/storage';

import { EQUIPMENT, MUSCLE_GROUPS, type ExerciseSeed, type TemplateSeed } from '@/content/types';
import type { ContentLanguage } from '@/features/library/library';
import type {
  BodyMeasurement,
  CardioActivity,
  ChallengeRun,
  DayKey,
  Equipment,
  ExerciseCategory,
  ExerciseSet,
  ExerciseTargets,
  FitnessGoal,
  Level,
  MeasurementKind,
  MuscleGroup,
  NotificationKind,
  NotificationSetting,
  PerformanceRecord,
  PhotoPose,
  Program,
  ProgramDay,
  ProgramExercise,
  ProgramWithDays,
  ProgressPhoto,
  RoutineSlot,
  ScheduleEntry,
  SessionExercise,
  SessionWithExercises,
  TrackingType,
  Weekday,
  WorkoutSession,
} from '@/types';
import { newId } from '@/utils';

type Now = () => number;

/* =================================================================== rows */

interface ProgramRow {
  id: string; name: string; description: string | null; type: string; goal: string; level: string; origin: string; template_id: string | null;
  notes: string | null; sort_order: number; archived_at: number | null; created_at: number; updated_at: number;
}
interface DayRow { id: string; program_id: string; name: string; position: number; notes: string | null }
interface ProgramExerciseRow {
  id: string; day_id: string; exercise_id: string; position: number; sets: number; reps_min: number | null; reps_max: number | null;
  weight_kg: number | null; duration_sec: number | null; distance_m: number | null; rest_sec: number; notes: string | null;
}
interface ScheduleRow {
  id: string; day: string; kind: string; status: string; program_id: string | null; program_day_id: string | null; from_routine: number;
  moved_to: string | null; time: string | null; session_id: string | null; note: string | null;
}
interface SessionRow {
  id: string; name: string; program_id: string | null; program_day_id: string | null; schedule_id: string | null; status: string; day: string;
  started_at: number; ended_at: number | null; paused_at: number | null; paused_total_ms: number; current_index: number;
  rest_started_at: number | null; rest_ends_at: number | null; duration_sec: number | null; notes: string | null;
}
interface SessionExerciseRow {
  id: string; session_id: string; exercise_id: string; position: number; status: string; target_sets: number; reps_min: number | null;
  reps_max: number | null; weight_kg: number | null; duration_sec: number | null; distance_m: number | null; rest_sec: number; notes: string | null;
}
interface SetRow {
  id: string; session_exercise_id: string; set_index: number; reps: number | null; weight_kg: number | null; duration_sec: number | null;
  distance_m: number | null; completed_at: number;
}

const toProgram = (r: ProgramRow): Program => ({
  id: r.id, name: r.name, description: r.description, type: r.type as Program['type'], goal: r.goal as Program['goal'], level: r.level as Level,
  origin: r.origin as Program['origin'], templateId: r.template_id, notes: r.notes, sortOrder: r.sort_order, archivedAt: r.archived_at,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const toProgramExercise = (r: ProgramExerciseRow): ProgramExercise => ({
  id: r.id, dayId: r.day_id, exerciseId: r.exercise_id, position: r.position, sets: r.sets, repsMin: r.reps_min, repsMax: r.reps_max,
  weightKg: r.weight_kg, durationSec: r.duration_sec, distanceM: r.distance_m, restSec: r.rest_sec, notes: r.notes,
});
const toSchedule = (r: ScheduleRow): ScheduleEntry => ({
  id: r.id, day: r.day, kind: r.kind as ScheduleEntry['kind'], status: r.status as ScheduleEntry['status'], programId: r.program_id,
  programDayId: r.program_day_id, fromRoutine: r.from_routine === 1, movedTo: r.moved_to, time: r.time, sessionId: r.session_id, note: r.note,
});
const toSession = (r: SessionRow): WorkoutSession => ({
  id: r.id, name: r.name, programId: r.program_id, programDayId: r.program_day_id, scheduleId: r.schedule_id, status: r.status as WorkoutSession['status'],
  day: r.day, startedAt: r.started_at, endedAt: r.ended_at, pausedAt: r.paused_at, pausedTotalMs: r.paused_total_ms, currentIndex: r.current_index,
  restStartedAt: r.rest_started_at, restEndsAt: r.rest_ends_at, durationSec: r.duration_sec, notes: r.notes,
});
const toSet = (r: SetRow): ExerciseSet => ({
  id: r.id, sessionExerciseId: r.session_exercise_id, setIndex: r.set_index, reps: r.reps, weightKg: r.weight_kg, durationSec: r.duration_sec,
  distanceM: r.distance_m, completedAt: r.completed_at,
});

/* =================================================================== library & exercises */

export interface CustomExerciseInput {
  name: string;
  description: string | null;
  category: ExerciseCategory;
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  equipment: Equipment[];
  tracking: TrackingType;
  level: Level;
}

export interface CustomExerciseRow {
  id: string; name: string; description: string | null; category: ExerciseCategory; level: Level; tracking: TrackingType;
  primary: MuscleGroup; secondary: MuscleGroup[]; equipment: Equipment[];
}

export function createExercisesRepository(db: SqlDatabase, now: Now) {
  return {
    /** Upserts reference tables and library exercises. Idempotent; never touches custom exercises. */
    async syncLibrary(seeds: readonly ExerciseSeed[], version: number): Promise<boolean> {
      const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM user_settings WHERE key = 'library_version'", []);
      if (row && Number(row.value) >= version) return false;
      const t = now();
      await db.withTransactionAsync(async () => {
        for (const [i, m] of MUSCLE_GROUPS.entries()) await db.runAsync('INSERT INTO muscle_groups (id, sort_order) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order', [m, i]);
        for (const [i, e] of EQUIPMENT.entries()) await db.runAsync('INSERT INTO equipment (id, sort_order) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order', [e, i]);
        for (const s of seeds) {
          await db.runAsync(
            `INSERT INTO exercises (id, source, category, level, tracking, name, description, archived, created_at, updated_at)
             VALUES (?, 'library', ?, ?, ?, NULL, NULL, 0, ?, ?)
             ON CONFLICT(id) DO UPDATE SET category = excluded.category, level = excluded.level, tracking = excluded.tracking, archived = 0, updated_at = excluded.updated_at`,
            [s.id, s.category, s.level, s.tracking, t, t],
          );
          await db.runAsync('DELETE FROM exercise_muscles WHERE exercise_id = ?', [s.id]);
          await db.runAsync("INSERT INTO exercise_muscles (exercise_id, muscle_id, role) VALUES (?, ?, 'primary')", [s.id, s.primary]);
          for (const m of s.secondary) await db.runAsync("INSERT OR IGNORE INTO exercise_muscles (exercise_id, muscle_id, role) VALUES (?, ?, 'secondary')", [s.id, m]);
          await db.runAsync('DELETE FROM exercise_equipment WHERE exercise_id = ?', [s.id]);
          for (const e of s.equipment) await db.runAsync('INSERT OR IGNORE INTO exercise_equipment (exercise_id, equipment_id) VALUES (?, ?)', [s.id, e]);
        }
        // Library exercises removed from the bundle are archived (history keeps referencing them).
        const ids = seeds.map((s) => s.id);
        if (ids.length) await db.runAsync(`UPDATE exercises SET archived = 1 WHERE source = 'library' AND id NOT IN ${placeholders(ids.length)}`, ids);
        await db.runAsync("INSERT INTO user_settings (key, value, updated_at) VALUES ('library_version', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at", [String(version), t]);
      });
      return true;
    },

    async listCustom(): Promise<CustomExerciseRow[]> {
      const rows = await db.getAllAsync<{ id: string; name: string; description: string | null; category: string; level: string; tracking: string }>(
        "SELECT id, name, description, category, level, tracking FROM exercises WHERE source = 'custom' AND archived = 0 ORDER BY name",
        [],
      );
      if (!rows.length) return [];
      const ids = rows.map((r) => r.id);
      const muscles = await db.getAllAsync<{ exercise_id: string; muscle_id: string; role: string }>(`SELECT * FROM exercise_muscles WHERE exercise_id IN ${placeholders(ids.length)}`, ids);
      const equipment = await db.getAllAsync<{ exercise_id: string; equipment_id: string }>(`SELECT * FROM exercise_equipment WHERE exercise_id IN ${placeholders(ids.length)}`, ids);
      return rows.map((r) => ({
        id: r.id, name: r.name, description: r.description, category: r.category as ExerciseCategory, level: r.level as Level, tracking: r.tracking as TrackingType,
        primary: (muscles.find((m) => m.exercise_id === r.id && m.role === 'primary')?.muscle_id ?? 'full_body') as MuscleGroup,
        secondary: muscles.filter((m) => m.exercise_id === r.id && m.role === 'secondary').map((m) => m.muscle_id as MuscleGroup),
        equipment: equipment.filter((e) => e.exercise_id === r.id).map((e) => e.equipment_id as Equipment),
      }));
    },

    async createCustom(input: CustomExerciseInput): Promise<string> {
      const id = newId('cx_');
      const t = now();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT INTO exercises (id, source, category, level, tracking, name, description, archived, created_at, updated_at) VALUES (?, 'custom', ?, ?, ?, ?, ?, 0, ?, ?)",
          [id, input.category, input.level, input.tracking, input.name, input.description, t, t],
        );
        await db.runAsync("INSERT INTO exercise_muscles (exercise_id, muscle_id, role) VALUES (?, ?, 'primary')", [id, input.primary]);
        for (const m of input.secondary.filter((x) => x !== input.primary)) await db.runAsync("INSERT OR IGNORE INTO exercise_muscles (exercise_id, muscle_id, role) VALUES (?, ?, 'secondary')", [id, m]);
        for (const e of input.equipment) await db.runAsync('INSERT OR IGNORE INTO exercise_equipment (exercise_id, equipment_id) VALUES (?, ?)', [id, e]);
      });
      return id;
    },

    /** Custom exercises used in history are archived rather than deleted. */
    async deleteCustom(id: string): Promise<'deleted' | 'archived'> {
      const used = await db.getFirstAsync<{ n: number }>(
        'SELECT (SELECT COUNT(*) FROM session_exercises WHERE exercise_id = ?) + (SELECT COUNT(*) FROM program_exercises WHERE exercise_id = ?) AS n',
        [id, id],
      );
      if ((used?.n ?? 0) > 0) {
        await db.runAsync("UPDATE exercises SET archived = 1, updated_at = ? WHERE id = ? AND source = 'custom'", [now(), id]);
        return 'archived';
      }
      await db.runAsync("DELETE FROM exercises WHERE id = ? AND source = 'custom'", [id]);
      return 'deleted';
    },

    async countCustom(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM exercises WHERE source = 'custom' AND archived = 0", []))?.n ?? 0;
    },

    async favorites(): Promise<string[]> {
      return (await db.getAllAsync<{ exercise_id: string }>('SELECT exercise_id FROM exercise_favorites ORDER BY created_at DESC', [])).map((r) => r.exercise_id);
    },

    async toggleFavorite(id: string): Promise<boolean> {
      const exists = await db.getFirstAsync('SELECT 1 FROM exercise_favorites WHERE exercise_id = ?', [id]);
      if (exists) await db.runAsync('DELETE FROM exercise_favorites WHERE exercise_id = ?', [id]);
      else await db.runAsync('INSERT INTO exercise_favorites (exercise_id, created_at) VALUES (?, ?)', [id, now()]);
      return !exists;
    },

    /** Exercises with a validated set, most recent first. */
    async recentIds(limit = 12): Promise<string[]> {
      const rows = await db.getAllAsync<{ exercise_id: string }>(
        `SELECT se.exercise_id, MAX(es.completed_at) AS last FROM exercise_sets es
         JOIN session_exercises se ON se.id = es.session_exercise_id
         GROUP BY se.exercise_id ORDER BY last DESC LIMIT ?`,
        [limit],
      );
      return rows.map((r) => r.exercise_id);
    },
  };
}

/* =================================================================== programs */

export interface ProgramInput {
  name: string;
  description: string | null;
  type: Program['type'];
  goal: Program['goal'];
  level: Level;
  notes: string | null;
}

export type TargetInput = Partial<ExerciseTargets> & { notes?: string | null };

const DEFAULT_TARGETS: ExerciseTargets = { sets: 3, repsMin: 8, repsMax: 12, weightKg: null, durationSec: null, distanceM: null, restSec: 90 };

/** Sensible starting targets for a newly added exercise, by tracking type. */
export function defaultTargets(tracking: TrackingType): ExerciseTargets {
  switch (tracking) {
    case 'weight_reps':
      return DEFAULT_TARGETS;
    case 'reps':
      return { ...DEFAULT_TARGETS, repsMin: 10, repsMax: 15, restSec: 60 };
    case 'time':
      return { ...DEFAULT_TARGETS, repsMin: null, repsMax: null, durationSec: 30, restSec: 45 };
    case 'distance_time':
      return { ...DEFAULT_TARGETS, sets: 1, repsMin: null, repsMax: null, durationSec: 20 * 60, restSec: 0 };
  }
}

export function createProgramsRepository(db: SqlDatabase, now: Now) {
  async function loadDays(programIds: string[]): Promise<Map<string, ProgramDay[]>> {
    const out = new Map<string, ProgramDay[]>();
    if (!programIds.length) return out;
    const days = await db.getAllAsync<DayRow>(`SELECT * FROM program_days WHERE program_id IN ${placeholders(programIds.length)} ORDER BY position`, programIds);
    const dayIds = days.map((d) => d.id);
    const exs = dayIds.length
      ? await db.getAllAsync<ProgramExerciseRow>(`SELECT * FROM program_exercises WHERE day_id IN ${placeholders(dayIds.length)} ORDER BY position`, dayIds)
      : [];
    for (const d of days) {
      const list = out.get(d.program_id) ?? [];
      list.push({ id: d.id, programId: d.program_id, name: d.name, position: d.position, notes: d.notes, exercises: exs.filter((e) => e.day_id === d.id).map(toProgramExercise) });
      out.set(d.program_id, list);
    }
    return out;
  }

  async function renumber(table: 'program_days' | 'program_exercises', parentCol: 'program_id' | 'day_id', parentId: string, orderedIds: string[]) {
    for (const [i, id] of orderedIds.entries()) await db.runAsync(`UPDATE ${table} SET position = ?, updated_at = ? WHERE id = ? AND ${parentCol} = ?`, [i, now(), id, parentId]);
  }

  async function touch(programId: string) {
    await db.runAsync('UPDATE workout_programs SET updated_at = ? WHERE id = ?', [now(), programId]);
  }

  async function programOfDay(dayId: string): Promise<string | null> {
    return (await db.getFirstAsync<{ program_id: string }>('SELECT program_id FROM program_days WHERE id = ?', [dayId]))?.program_id ?? null;
  }

  const repo = {
    async list(opts: { includeArchived?: boolean } = {}): Promise<ProgramWithDays[]> {
      const rows = await db.getAllAsync<ProgramRow>(
        `SELECT * FROM workout_programs ${opts.includeArchived ? '' : 'WHERE archived_at IS NULL'} ORDER BY sort_order, updated_at DESC`,
        [],
      );
      const days = await loadDays(rows.map((r) => r.id));
      return rows.map((r) => ({ ...toProgram(r), days: days.get(r.id) ?? [] }));
    },

    async get(id: string): Promise<ProgramWithDays | null> {
      const row = await db.getFirstAsync<ProgramRow>('SELECT * FROM workout_programs WHERE id = ?', [id]);
      if (!row) return null;
      return { ...toProgram(row), days: (await loadDays([id])).get(id) ?? [] };
    },

    async getDay(dayId: string): Promise<ProgramDay | null> {
      const pid = await programOfDay(dayId);
      if (!pid) return null;
      return (await loadDays([pid])).get(pid)?.find((d) => d.id === dayId) ?? null;
    },

    /** Programs counted against the free limit (built from scratch or duplicated; template copies are free). */
    async countOwn(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM workout_programs WHERE archived_at IS NULL AND origin != 'template'", []))?.n ?? 0;
    },

    async create(input: ProgramInput, firstDayName: string): Promise<{ programId: string; dayId: string }> {
      const programId = newId('pg_');
      const dayId = newId('pd_');
      const t = now();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT INTO workout_programs (id, name, description, type, goal, level, origin, template_id, notes, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'custom', NULL, ?, 0, ?, ?)",
          [programId, input.name, input.description, input.type, input.goal, input.level, input.notes, t, t],
        );
        await db.runAsync('INSERT INTO program_days (id, program_id, name, position, notes, created_at, updated_at) VALUES (?, ?, ?, 0, NULL, ?, ?)', [dayId, programId, firstDayName, t, t]);
      });
      return { programId, dayId };
    },

    async update(id: string, input: ProgramInput): Promise<void> {
      await db.runAsync('UPDATE workout_programs SET name = ?, description = ?, type = ?, goal = ?, level = ?, notes = ?, updated_at = ? WHERE id = ?', [
        input.name, input.description, input.type, input.goal, input.level, input.notes, now(), id,
      ]);
    },

    async archive(id: string, archived: boolean): Promise<void> {
      await db.runAsync('UPDATE workout_programs SET archived_at = ?, updated_at = ? WHERE id = ?', [archived ? now() : null, now(), id]);
    },

    /** Deletes a program. Past sessions keep their data (program reference set to NULL). */
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM workout_programs WHERE id = ?', [id]);
    },

    async addDay(programId: string, name: string): Promise<string> {
      const id = newId('pd_');
      const t = now();
      const pos = (await db.getFirstAsync<{ n: number }>('SELECT COALESCE(MAX(position) + 1, 0) AS n FROM program_days WHERE program_id = ?', [programId]))?.n ?? 0;
      await db.runAsync('INSERT INTO program_days (id, program_id, name, position, notes, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?)', [id, programId, name, pos, t, t]);
      await touch(programId);
      return id;
    },

    async updateDay(dayId: string, patch: { name?: string; notes?: string | null }): Promise<void> {
      const day = await db.getFirstAsync<DayRow>('SELECT * FROM program_days WHERE id = ?', [dayId]);
      if (!day) return;
      await db.runAsync('UPDATE program_days SET name = ?, notes = ?, updated_at = ? WHERE id = ?', [patch.name ?? day.name, patch.notes !== undefined ? patch.notes : day.notes, now(), dayId]);
      await touch(day.program_id);
    },

    /** A program always keeps at least one day. */
    async removeDay(dayId: string): Promise<boolean> {
      const pid = await programOfDay(dayId);
      if (!pid) return false;
      const n = (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM program_days WHERE program_id = ?', [pid]))?.n ?? 0;
      if (n <= 1) return false;
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM program_days WHERE id = ?', [dayId]);
        const rest = await db.getAllAsync<{ id: string }>('SELECT id FROM program_days WHERE program_id = ? ORDER BY position', [pid]);
        await renumber('program_days', 'program_id', pid, rest.map((r) => r.id));
      });
      await touch(pid);
      return true;
    },

    async addExercise(dayId: string, exerciseId: string, targets: ExerciseTargets, notes: string | null = null): Promise<string> {
      const id = newId('pe_');
      const t = now();
      const pos = (await db.getFirstAsync<{ n: number }>('SELECT COALESCE(MAX(position) + 1, 0) AS n FROM program_exercises WHERE day_id = ?', [dayId]))?.n ?? 0;
      await db.runAsync(
        `INSERT INTO program_exercises (id, day_id, exercise_id, position, sets, reps_min, reps_max, weight_kg, duration_sec, distance_m, rest_sec, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, dayId, exerciseId, pos, targets.sets, targets.repsMin, targets.repsMax, targets.weightKg, targets.durationSec, targets.distanceM, targets.restSec, notes, t, t],
      );
      const pid = await programOfDay(dayId);
      if (pid) await touch(pid);
      return id;
    },

    async updateExercise(id: string, patch: TargetInput): Promise<void> {
      const cur = await db.getFirstAsync<ProgramExerciseRow>('SELECT * FROM program_exercises WHERE id = ?', [id]);
      if (!cur) return;
      const v = { ...toProgramExercise(cur), ...patch };
      const sets = Math.min(20, Math.max(1, Math.round(v.sets)));
      let repsMin = v.repsMin;
      let repsMax = v.repsMax;
      if (repsMin !== null && repsMax !== null && repsMin > repsMax) [repsMin, repsMax] = [repsMax, repsMin];
      await db.runAsync(
        'UPDATE program_exercises SET sets = ?, reps_min = ?, reps_max = ?, weight_kg = ?, duration_sec = ?, distance_m = ?, rest_sec = ?, notes = ?, updated_at = ? WHERE id = ?',
        [sets, repsMin, repsMax, v.weightKg, v.durationSec, v.distanceM, Math.max(0, Math.round(v.restSec)), v.notes, now(), id],
      );
    },

    async removeExercise(id: string): Promise<void> {
      const cur = await db.getFirstAsync<ProgramExerciseRow>('SELECT * FROM program_exercises WHERE id = ?', [id]);
      if (!cur) return;
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM program_exercises WHERE id = ?', [id]);
        const rest = await db.getAllAsync<{ id: string }>('SELECT id FROM program_exercises WHERE day_id = ? ORDER BY position', [cur.day_id]);
        await renumber('program_exercises', 'day_id', cur.day_id, rest.map((r) => r.id));
      });
    },

    /** Applies a full order (ids of the day's exercises). Unknown/missing ids are rejected. */
    async reorderExercises(dayId: string, orderedIds: string[]): Promise<void> {
      const current = await db.getAllAsync<{ id: string }>('SELECT id FROM program_exercises WHERE day_id = ?', [dayId]);
      const set = new Set(current.map((r) => r.id));
      if (orderedIds.length !== set.size || !orderedIds.every((id) => set.has(id))) throw new Error('reorder: id mismatch');
      await db.withTransactionAsync(() => renumber('program_exercises', 'day_id', dayId, orderedIds));
    },

    /** Moves one exercise up (-1) or down (+1). */
    async moveExercise(id: string, delta: -1 | 1): Promise<void> {
      const cur = await db.getFirstAsync<ProgramExerciseRow>('SELECT * FROM program_exercises WHERE id = ?', [id]);
      if (!cur) return;
      const ids = (await db.getAllAsync<{ id: string }>('SELECT id FROM program_exercises WHERE day_id = ? ORDER BY position', [cur.day_id])).map((r) => r.id);
      const i = ids.indexOf(id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= ids.length) return;
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
      await db.withTransactionAsync(() => renumber('program_exercises', 'day_id', cur.day_id, ids));
    },

    async duplicate(id: string, copyName: string): Promise<string | null> {
      const src = await repo.get(id);
      if (!src) return null;
      const newPid = newId('pg_');
      const t = now();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT INTO workout_programs (id, name, description, type, goal, level, origin, template_id, notes, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'duplicate', ?, ?, 0, ?, ?)",
          [newPid, copyName, src.description, src.type, src.goal, src.level, src.templateId, src.notes, t, t],
        );
        for (const d of src.days) {
          const dayId = newId('pd_');
          await db.runAsync('INSERT INTO program_days (id, program_id, name, position, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [dayId, newPid, d.name, d.position, d.notes, t, t]);
          for (const e of d.exercises) {
            await db.runAsync(
              `INSERT INTO program_exercises (id, day_id, exercise_id, position, sets, reps_min, reps_max, weight_kg, duration_sec, distance_m, rest_sec, notes, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [newId('pe_'), dayId, e.exerciseId, e.position, e.sets, e.repsMin, e.repsMax, e.weightKg, e.durationSec, e.distanceM, e.restSec, e.notes, t, t],
            );
          }
        }
      });
      return newPid;
    },

    /** Copies a bundled template into an editable program, in the interface language. */
    async createFromTemplate(seed: TemplateSeed, lng: ContentLanguage): Promise<string> {
      const pid = newId('pg_');
      const t = now();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT INTO workout_programs (id, name, description, type, goal, level, origin, template_id, notes, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'template', ?, NULL, 0, ?, ?)",
          [pid, seed.i18n[lng].name, seed.i18n[lng].description, seed.type, seed.goal, seed.level, seed.id, t, t],
        );
        for (const [di, d] of seed.days.entries()) {
          const dayId = newId('pd_');
          await db.runAsync('INSERT INTO program_days (id, program_id, name, position, notes, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?)', [dayId, pid, d.name[lng], di, t, t]);
          for (const [ei, e] of d.exercises.entries()) {
            await db.runAsync(
              `INSERT INTO program_exercises (id, day_id, exercise_id, position, sets, reps_min, reps_max, weight_kg, duration_sec, distance_m, rest_sec, notes, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, NULL, ?, ?)`,
              [newId('pe_'), dayId, e.exerciseId, ei, e.sets, e.repsMin ?? null, e.repsMax ?? null, e.durationSec ?? null, e.distanceM ?? null, e.restSec, t, t],
            );
          }
        }
      });
      return pid;
    },
  };
  return repo;
}

/* =================================================================== planner */

export interface ScheduleInput {
  day: DayKey;
  kind: 'workout' | 'rest';
  programId: string | null;
  programDayId: string | null;
  time: string | null;
  note: string | null;
  fromRoutine?: boolean;
  status?: ScheduleEntry['status'];
}

export function createPlannerRepository(db: SqlDatabase, now: Now) {
  const repo = {
    async entries(from: DayKey, to: DayKey): Promise<ScheduleEntry[]> {
      return (await db.getAllAsync<ScheduleRow>('SELECT * FROM workout_schedules WHERE day >= ? AND day <= ? ORDER BY day, time', [from, to])).map(toSchedule);
    },

    async get(id: string): Promise<ScheduleEntry | null> {
      const r = await db.getFirstAsync<ScheduleRow>('SELECT * FROM workout_schedules WHERE id = ?', [id]);
      return r ? toSchedule(r) : null;
    },

    async add(input: ScheduleInput): Promise<string> {
      const id = newId('ws_');
      const t = now();
      await db.runAsync(
        `INSERT INTO workout_schedules (id, day, kind, status, program_id, program_day_id, from_routine, moved_to, time, session_id, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?, ?)`,
        [id, input.day, input.kind, input.status ?? 'planned', input.programId, input.programDayId, input.fromRoutine ? 1 : 0, input.time, input.note, t, t],
      );
      return id;
    },

    async update(id: string, patch: Partial<Pick<ScheduleEntry, 'status' | 'time' | 'note' | 'programId' | 'programDayId' | 'sessionId' | 'movedTo'>>): Promise<void> {
      const cur = await repo.get(id);
      if (!cur) return;
      const v = { ...cur, ...patch };
      await db.runAsync('UPDATE workout_schedules SET status = ?, time = ?, note = ?, program_id = ?, program_day_id = ?, session_id = ?, moved_to = ?, updated_at = ? WHERE id = ?', [
        v.status, v.time, v.note, v.programId, v.programDayId, v.sessionId, v.movedTo, now(), id,
      ]);
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM workout_schedules WHERE id = ?', [id]);
    },

    async routine(): Promise<RoutineSlot[]> {
      const rows = await db.getAllAsync<{ weekday: number; kind: string; program_id: string | null; program_day_id: string | null; time: string | null }>(
        'SELECT * FROM routine_slots ORDER BY weekday',
        [],
      );
      return rows.map((r) => ({ weekday: r.weekday as Weekday, kind: r.kind as RoutineSlot['kind'], programId: r.program_id, programDayId: r.program_day_id, time: r.time }));
    },

    async setRoutineSlot(slot: RoutineSlot): Promise<void> {
      const t = now();
      await db.runAsync(
        `INSERT INTO routine_slots (weekday, kind, program_id, program_day_id, time, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(weekday) DO UPDATE SET kind = excluded.kind, program_id = excluded.program_id, program_day_id = excluded.program_day_id, time = excluded.time, updated_at = excluded.updated_at`,
        [slot.weekday, slot.kind, slot.programId, slot.programDayId, slot.time, t, t],
      );
    },

    async clearRoutineSlot(weekday: Weekday): Promise<void> {
      await db.runAsync('DELETE FROM routine_slots WHERE weekday = ?', [weekday]);
    },

    async clearRoutine(): Promise<void> {
      await db.runAsync('DELETE FROM routine_slots', []);
    },
  };
  return repo;
}

/* =================================================================== sessions */

export interface SessionPlanItem extends Omit<ExerciseTargets, 'sets'> {
  exerciseId: string;
  targetSets: number;
  notes: string | null;
}

export interface SetInput {
  reps: number | null;
  weightKg: number | null;
  durationSec: number | null;
  distanceM: number | null;
}

export function createSessionsRepository(db: SqlDatabase, now: Now) {
  async function exercisesOf(sessionIds: string[]): Promise<Map<string, SessionExercise[]>> {
    const out = new Map<string, SessionExercise[]>();
    if (!sessionIds.length) return out;
    const exs = await db.getAllAsync<SessionExerciseRow>(`SELECT * FROM session_exercises WHERE session_id IN ${placeholders(sessionIds.length)} ORDER BY position`, sessionIds);
    const exIds = exs.map((e) => e.id);
    const sets = exIds.length ? await db.getAllAsync<SetRow>(`SELECT * FROM exercise_sets WHERE session_exercise_id IN ${placeholders(exIds.length)} ORDER BY set_index`, exIds) : [];
    for (const e of exs) {
      const list = out.get(e.session_id) ?? [];
      list.push({
        id: e.id, sessionId: e.session_id, exerciseId: e.exercise_id, position: e.position, status: e.status as SessionExercise['status'],
        targetSets: e.target_sets, repsMin: e.reps_min, repsMax: e.reps_max, weightKg: e.weight_kg, durationSec: e.duration_sec, distanceM: e.distance_m,
        restSec: e.rest_sec, notes: e.notes, sets: sets.filter((s) => s.session_exercise_id === e.id).map(toSet),
      });
      out.set(e.session_id, list);
    }
    return out;
  }

  async function insertExercise(sessionId: string, position: number, p: SessionPlanItem): Promise<string> {
    const id = newId('se_');
    await db.runAsync(
      `INSERT INTO session_exercises (id, session_id, exercise_id, position, status, target_sets, reps_min, reps_max, weight_kg, duration_sec, distance_m, rest_sec, notes)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, sessionId, p.exerciseId, position, Math.max(1, p.targetSets), p.repsMin, p.repsMax, p.weightKg, p.durationSec, p.distanceM, p.restSec, p.notes],
    );
    return id;
  }

  const repo = {
    /** The unfinished session, if any (at most one at a time). */
    async active(): Promise<WorkoutSession | null> {
      const r = await db.getFirstAsync<SessionRow>("SELECT * FROM workout_sessions WHERE status IN ('active', 'paused') ORDER BY started_at DESC LIMIT 1", []);
      return r ? toSession(r) : null;
    },

    async get(id: string): Promise<SessionWithExercises | null> {
      const r = await db.getFirstAsync<SessionRow>('SELECT * FROM workout_sessions WHERE id = ?', [id]);
      if (!r) return null;
      return { ...toSession(r), exercises: (await exercisesOf([id])).get(id) ?? [] };
    },

    async start(input: { name: string; day: DayKey; programId: string | null; programDayId: string | null; scheduleId: string | null; plan: SessionPlanItem[] }): Promise<string> {
      const id = newId('ss_');
      const t = now();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO workout_sessions (id, name, program_id, program_day_id, schedule_id, status, day, started_at, paused_total_ms, current_index, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'active', ?, ?, 0, 0, ?, ?)`,
          [id, input.name, input.programId, input.programDayId, input.scheduleId, input.day, t, t, t],
        );
        for (const [i, p] of input.plan.entries()) await insertExercise(id, i, p);
      });
      return id;
    },

    async patch(id: string, patch: Partial<WorkoutSession>): Promise<void> {
      const map: Record<string, string> = {
        status: 'status', pausedAt: 'paused_at', pausedTotalMs: 'paused_total_ms', currentIndex: 'current_index', restStartedAt: 'rest_started_at',
        restEndsAt: 'rest_ends_at', endedAt: 'ended_at', durationSec: 'duration_sec', notes: 'notes', name: 'name',
      };
      const keys = Object.keys(patch).filter((k) => map[k]);
      if (!keys.length) return;
      await db.runAsync(`UPDATE workout_sessions SET ${keys.map((k) => `${map[k]} = ?`).join(', ')}, updated_at = ? WHERE id = ?`, [
        ...keys.map((k) => (patch as Record<string, string | number | null>)[k] ?? null),
        now(),
        id,
      ]);
    },

    async addExercise(sessionId: string, p: SessionPlanItem): Promise<string> {
      const pos = (await db.getFirstAsync<{ n: number }>('SELECT COALESCE(MAX(position) + 1, 0) AS n FROM session_exercises WHERE session_id = ?', [sessionId]))?.n ?? 0;
      return insertExercise(sessionId, pos, p);
    },

    async setExerciseStatus(sessionExerciseId: string, status: SessionExercise['status']): Promise<void> {
      await db.runAsync('UPDATE session_exercises SET status = ? WHERE id = ?', [status, sessionExerciseId]);
    },

    async setTargetSets(sessionExerciseId: string, n: number): Promise<void> {
      await db.runAsync('UPDATE session_exercises SET target_sets = ? WHERE id = ?', [Math.min(20, Math.max(1, Math.round(n))), sessionExerciseId]);
    },

    /** Validates a set. Written immediately: a crash right after loses nothing. */
    async addSet(sessionExerciseId: string, input: SetInput): Promise<ExerciseSet> {
      const idx = (await db.getFirstAsync<{ n: number }>('SELECT COALESCE(MAX(set_index) + 1, 0) AS n FROM exercise_sets WHERE session_exercise_id = ?', [sessionExerciseId]))?.n ?? 0;
      const set: ExerciseSet = { id: newId('es_'), sessionExerciseId, setIndex: idx, ...input, completedAt: now() };
      await db.runAsync(
        'INSERT INTO exercise_sets (id, session_exercise_id, set_index, reps, weight_kg, duration_sec, distance_m, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [set.id, sessionExerciseId, idx, set.reps, set.weightKg, set.durationSec, set.distanceM, set.completedAt],
      );
      return set;
    },

    async updateSet(setId: string, input: SetInput): Promise<void> {
      await db.runAsync('UPDATE exercise_sets SET reps = ?, weight_kg = ?, duration_sec = ?, distance_m = ? WHERE id = ?', [input.reps, input.weightKg, input.durationSec, input.distanceM, setId]);
    },

    async deleteSet(setId: string): Promise<void> {
      await db.runAsync('DELETE FROM exercise_sets WHERE id = ?', [setId]);
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM workout_sessions WHERE id = ?', [id]);
    },

    async completed(opts: { since?: DayKey } = {}): Promise<WorkoutSession[]> {
      const rows = await db.getAllAsync<SessionRow>(
        `SELECT * FROM workout_sessions WHERE status = 'completed' ${opts.since ? 'AND day >= ?' : ''} ORDER BY started_at DESC`,
        opts.since ? [opts.since] : [],
      );
      return rows.map(toSession);
    },

    async completedWithExercises(opts: { since?: DayKey; limit?: number } = {}): Promise<SessionWithExercises[]> {
      const rows = await db.getAllAsync<SessionRow>(
        `SELECT * FROM workout_sessions WHERE status = 'completed' ${opts.since ? 'AND day >= ?' : ''} ORDER BY started_at DESC ${opts.limit ? `LIMIT ${Math.floor(opts.limit)}` : ''}`,
        opts.since ? [opts.since] : [],
      );
      const ex = await exercisesOf(rows.map((r) => r.id));
      return rows.map((r) => ({ ...toSession(r), exercises: ex.get(r.id) ?? [] }));
    },

    /** One row per validated set of completed sessions (for stats and progression). */
    async setFacts(opts: { since?: DayKey; exerciseId?: string } = {}) {
      const where = ["ws.status = 'completed'"];
      const params: string[] = [];
      if (opts.since) {
        where.push('ws.day >= ?');
        params.push(opts.since);
      }
      if (opts.exerciseId) {
        where.push('se.exercise_id = ?');
        params.push(opts.exerciseId);
      }
      return db.getAllAsync<{ sessionId: string; day: string; startedAt: number; exerciseId: string; category: ExerciseCategory; reps: number | null; weightKg: number | null; durationSec: number | null; distanceM: number | null; setId: string }>(
        `SELECT ws.id AS sessionId, ws.day AS day, ws.started_at AS startedAt, se.exercise_id AS exerciseId, ex.category AS category,
                es.reps AS reps, es.weight_kg AS weightKg, es.duration_sec AS durationSec, es.distance_m AS distanceM, es.id AS setId
         FROM exercise_sets es
         JOIN session_exercises se ON se.id = es.session_exercise_id
         JOIN workout_sessions ws ON ws.id = se.session_id
         JOIN exercises ex ON ex.id = se.exercise_id
         WHERE ${where.join(' AND ')}
         ORDER BY ws.started_at, es.set_index`,
        params,
      );
    },

    /** Last validated set for an exercise outside the given session (pre-fills the next workout). */
    async lastSet(exerciseId: string, excludeSessionId?: string): Promise<SetInput | null> {
      const r = await db.getFirstAsync<SetRow>(
        `SELECT es.* FROM exercise_sets es JOIN session_exercises se ON se.id = es.session_exercise_id JOIN workout_sessions ws ON ws.id = se.session_id
         WHERE se.exercise_id = ? AND ws.status = 'completed' ${excludeSessionId ? 'AND ws.id != ?' : ''}
         ORDER BY es.completed_at DESC LIMIT 1`,
        excludeSessionId ? [exerciseId, excludeSessionId] : [exerciseId],
      );
      return r ? { reps: r.reps, weightKg: r.weight_kg, durationSec: r.duration_sec, distanceM: r.distance_m } : null;
    },
  };
  return repo;
}

/* =================================================================== records */

export function createRecordsRepository(db: SqlDatabase) {
  const map = (r: { id: string; exercise_id: string; session_id: string | null; set_id: string | null; kind: string; value: number; day: string; achieved_at: number }): PerformanceRecord => ({
    id: r.id, exerciseId: r.exercise_id, sessionId: r.session_id, setId: r.set_id, kind: r.kind as PerformanceRecord['kind'], value: r.value, day: r.day, achievedAt: r.achieved_at,
  });
  return {
    async forExercise(exerciseId: string): Promise<PerformanceRecord[]> {
      return (await db.getAllAsync<Parameters<typeof map>[0]>('SELECT * FROM performance_records WHERE exercise_id = ? ORDER BY achieved_at', [exerciseId])).map(map);
    },
    async all(): Promise<PerformanceRecord[]> {
      return (await db.getAllAsync<Parameters<typeof map>[0]>('SELECT * FROM performance_records ORDER BY achieved_at DESC', [])).map(map);
    },
    async insert(rec: Omit<PerformanceRecord, 'id'>): Promise<void> {
      await db.runAsync('INSERT INTO performance_records (id, exercise_id, session_id, set_id, kind, value, day, achieved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        newId('pr_'), rec.exerciseId, rec.sessionId, rec.setId, rec.kind, rec.value, rec.day, rec.achievedAt,
      ]);
    },
    async deleteForSet(setId: string): Promise<void> {
      await db.runAsync('DELETE FROM performance_records WHERE set_id = ?', [setId]);
    },
    async deleteForExercise(exerciseId: string): Promise<void> {
      await db.runAsync('DELETE FROM performance_records WHERE exercise_id = ?', [exerciseId]);
    },
  };
}

/* =================================================================== body & photos */

export function createBodyRepository(db: SqlDatabase, now: Now) {
  type Row = { id: string; day: string; kind: string; custom_name: string | null; value: number; note: string | null };
  const map = (r: Row): BodyMeasurement => ({ id: r.id, day: r.day, kind: r.kind as MeasurementKind, customName: r.custom_name, value: r.value, note: r.note });
  type PhotoRow = { id: string; day: string; file_uri: string; pose: string; note: string | null; created_at: number };
  const mapPhoto = (r: PhotoRow): ProgressPhoto => ({ id: r.id, day: r.day, fileUri: r.file_uri, pose: r.pose as PhotoPose, note: r.note, createdAt: r.created_at });
  return {
    async list(kind?: MeasurementKind): Promise<BodyMeasurement[]> {
      return (await db.getAllAsync<Row>(`SELECT * FROM body_measurements ${kind ? 'WHERE kind = ?' : ''} ORDER BY day, created_at`, kind ? [kind] : [])).map(map);
    },
    async add(m: Omit<BodyMeasurement, 'id'>): Promise<string> {
      const id = newId('bm_');
      const t = now();
      await db.runAsync('INSERT INTO body_measurements (id, day, kind, custom_name, value, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        id, m.day, m.kind, m.customName, m.value, m.note, t, t,
      ]);
      return id;
    },
    async update(id: string, m: Omit<BodyMeasurement, 'id'>): Promise<void> {
      await db.runAsync('UPDATE body_measurements SET day = ?, kind = ?, custom_name = ?, value = ?, note = ?, updated_at = ? WHERE id = ?', [m.day, m.kind, m.customName, m.value, m.note, now(), id]);
    },
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM body_measurements WHERE id = ?', [id]);
    },
    async latest(kind: MeasurementKind): Promise<BodyMeasurement | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM body_measurements WHERE kind = ? ORDER BY day DESC, created_at DESC LIMIT 1', [kind]);
      return r ? map(r) : null;
    },
    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM body_measurements', []))?.n ?? 0;
    },
    async photos(): Promise<ProgressPhoto[]> {
      return (await db.getAllAsync<PhotoRow>('SELECT * FROM progress_photos ORDER BY day DESC, created_at DESC', [])).map(mapPhoto);
    },
    async addPhoto(p: Omit<ProgressPhoto, 'id' | 'createdAt'>): Promise<string> {
      const id = newId('ph_');
      await db.runAsync('INSERT INTO progress_photos (id, day, file_uri, pose, note, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, p.day, p.fileUri, p.pose, p.note, now()]);
      return id;
    },
    async removePhoto(id: string): Promise<ProgressPhoto | null> {
      const r = await db.getFirstAsync<PhotoRow>('SELECT * FROM progress_photos WHERE id = ?', [id]);
      await db.runAsync('DELETE FROM progress_photos WHERE id = ?', [id]);
      return r ? mapPhoto(r) : null;
    },
  };
}

/* =================================================================== cardio */

export function createCardioRepository(db: SqlDatabase, now: Now) {
  type Row = { id: string; day: string; type: string; duration_sec: number; distance_m: number | null; calories: number | null; calories_source: string | null; note: string | null; created_at: number };
  const map = (r: Row): CardioActivity => ({
    id: r.id, day: r.day, type: r.type as CardioActivity['type'], durationSec: r.duration_sec, distanceM: r.distance_m, calories: r.calories,
    caloriesSource: r.calories_source as CardioActivity['caloriesSource'], note: r.note, createdAt: r.created_at,
  });
  return {
    async list(opts: { since?: DayKey; type?: CardioActivity['type'] } = {}): Promise<CardioActivity[]> {
      const where: string[] = [];
      const params: string[] = [];
      if (opts.since) {
        where.push('day >= ?');
        params.push(opts.since);
      }
      if (opts.type) {
        where.push('type = ?');
        params.push(opts.type);
      }
      return (await db.getAllAsync<Row>(`SELECT * FROM cardio_activities ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY day DESC, created_at DESC`, params)).map(map);
    },
    async get(id: string): Promise<CardioActivity | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM cardio_activities WHERE id = ?', [id]);
      return r ? map(r) : null;
    },
    async add(a: Omit<CardioActivity, 'id' | 'createdAt'>): Promise<string> {
      const id = newId('ca_');
      const t = now();
      await db.runAsync(
        'INSERT INTO cardio_activities (id, day, type, duration_sec, distance_m, calories, calories_source, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, a.day, a.type, a.durationSec, a.distanceM, a.calories, a.caloriesSource, a.note, t, t],
      );
      return id;
    },
    async update(id: string, a: Omit<CardioActivity, 'id' | 'createdAt'>): Promise<void> {
      await db.runAsync('UPDATE cardio_activities SET day = ?, type = ?, duration_sec = ?, distance_m = ?, calories = ?, calories_source = ?, note = ?, updated_at = ? WHERE id = ?', [
        a.day, a.type, a.durationSec, a.distanceM, a.calories, a.caloriesSource, a.note, now(), id,
      ]);
    },
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM cardio_activities WHERE id = ?', [id]);
    },
  };
}

/* =================================================================== goals, challenges, achievements */

export function createGoalsRepository(db: SqlDatabase, now: Now) {
  type GoalRow = { id: string; kind: string; target: number; exercise_id: string | null; start_day: string; end_day: string | null; active: number; achieved_at: number | null };
  const map = (r: GoalRow): FitnessGoal => ({
    id: r.id, kind: r.kind as FitnessGoal['kind'], target: r.target, exerciseId: r.exercise_id, startDay: r.start_day, endDay: r.end_day, active: r.active === 1, achievedAt: r.achieved_at,
  });
  type RunRow = { id: string; challenge_id: string; started_day: string; status: string; completed_at: number | null };
  const mapRun = (r: RunRow): ChallengeRun => ({ id: r.id, challengeId: r.challenge_id, startedDay: r.started_day, status: r.status as ChallengeRun['status'], completedAt: r.completed_at });
  return {
    async list(): Promise<FitnessGoal[]> {
      return (await db.getAllAsync<GoalRow>('SELECT * FROM fitness_goals ORDER BY active DESC, created_at DESC', [])).map(map);
    },
    async add(g: Omit<FitnessGoal, 'id' | 'achievedAt' | 'active'>): Promise<string> {
      const id = newId('fg_');
      const t = now();
      await db.runAsync('INSERT INTO fitness_goals (id, kind, target, exercise_id, start_day, end_day, active, achieved_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, NULL, ?, ?)', [
        id, g.kind, g.target, g.exerciseId, g.startDay, g.endDay, t, t,
      ]);
      return id;
    },
    async update(id: string, patch: Partial<Pick<FitnessGoal, 'target' | 'active' | 'achievedAt' | 'endDay'>>): Promise<void> {
      const cur = await db.getFirstAsync<GoalRow>('SELECT * FROM fitness_goals WHERE id = ?', [id]);
      if (!cur) return;
      const v = { ...map(cur), ...patch };
      await db.runAsync('UPDATE fitness_goals SET target = ?, active = ?, achieved_at = ?, end_day = ?, updated_at = ? WHERE id = ?', [v.target, v.active ? 1 : 0, v.achievedAt, v.endDay, now(), id]);
    },
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM fitness_goals WHERE id = ?', [id]);
    },
    async challenges(): Promise<ChallengeRun[]> {
      return (await db.getAllAsync<RunRow>('SELECT * FROM challenges ORDER BY created_at DESC', [])).map(mapRun);
    },
    async startChallenge(challengeId: string, day: DayKey): Promise<string> {
      const id = newId('ch_');
      const t = now();
      await db.withTransactionAsync(async () => {
        // Only one active run per challenge.
        await db.runAsync("UPDATE challenges SET status = 'abandoned', updated_at = ? WHERE challenge_id = ? AND status = 'active'", [t, challengeId]);
        await db.runAsync("INSERT INTO challenges (id, challenge_id, started_day, status, completed_at, created_at, updated_at) VALUES (?, ?, ?, 'active', NULL, ?, ?)", [id, challengeId, day, t, t]);
      });
      return id;
    },
    async setChallengeStatus(id: string, status: ChallengeRun['status']): Promise<void> {
      await db.runAsync('UPDATE challenges SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?', [status, status === 'completed' ? now() : null, now(), id]);
    },
    async achievements(): Promise<Map<string, number>> {
      return new Map((await db.getAllAsync<{ id: string; unlocked_at: number }>('SELECT * FROM achievements', [])).map((r) => [r.id, r.unlocked_at]));
    },
    async unlock(ids: string[]): Promise<void> {
      for (const id of ids) await db.runAsync('INSERT OR IGNORE INTO achievements (id, unlocked_at) VALUES (?, ?)', [id, now()]);
    },
  };
}

/* =================================================================== settings */

export const DEFAULT_NOTIFICATIONS: Record<NotificationKind, Omit<NotificationSetting, 'kind'>> = {
  workout_reminder: { enabled: false, hour: 18, minute: 0, weekdays: [] },
  weekly_goal: { enabled: false, hour: 10, minute: 0, weekdays: [4] }, // Friday check-in
  challenge: { enabled: false, hour: 19, minute: 0, weekdays: [] },
  routine: { enabled: false, hour: 8, minute: 0, weekdays: [] },
  progress_summary: { enabled: false, hour: 18, minute: 0, weekdays: [6] }, // Sunday
};

export function createSettingsRepository(db: SqlDatabase, now: Now) {
  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', [key]);
      return r ? fromJson<T>(r.value, fallback) : fallback;
    },
    async set(key: string, value: unknown): Promise<void> {
      await db.runAsync('INSERT INTO user_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at', [key, toJson(value), now()]);
    },
    async notifications(): Promise<NotificationSetting[]> {
      const rows = await db.getAllAsync<{ kind: string; enabled: number; hour: number; minute: number; weekdays: string }>('SELECT * FROM notification_settings', []);
      return (Object.keys(DEFAULT_NOTIFICATIONS) as NotificationKind[]).map((kind) => {
        const r = rows.find((x) => x.kind === kind);
        return r ? { kind, enabled: r.enabled === 1, hour: r.hour, minute: r.minute, weekdays: fromJson<Weekday[]>(r.weekdays, []) } : { kind, ...DEFAULT_NOTIFICATIONS[kind] };
      });
    },
    async setNotification(s: NotificationSetting): Promise<void> {
      await db.runAsync(
        `INSERT INTO notification_settings (kind, enabled, hour, minute, weekdays, updated_at) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(kind) DO UPDATE SET enabled = excluded.enabled, hour = excluded.hour, minute = excluded.minute, weekdays = excluded.weekdays, updated_at = excluded.updated_at`,
        [s.kind, s.enabled ? 1 : 0, s.hour, s.minute, toJson(s.weekdays), now()],
      );
    },
  };
}
