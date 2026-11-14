import { toDayKey } from '@factory/app-core';
import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { expandRecurrence, type RecurrenceRule } from '@/features/planner/planner';
import { clock } from '@/services/clock';
import { newId } from '@/utils/id';

export interface StudySession {
  id: string;
  subjectId: string | null;
  seriesId: string | null;
  title: string;
  goal: string;
  day: string;
  startMinute: number;
  durationMin: number;
  status: 'planned' | 'done' | 'skipped';
  completedAt: string | null;
  actualMinutes: number | null;
  rescheduledFrom: string | null;
}

export type SessionInput = Pick<StudySession, 'subjectId' | 'title' | 'goal' | 'day' | 'startMinute' | 'durationMin'>;

interface SessionRow {
  id: string;
  subject_id: string | null;
  series_id: string | null;
  title: string;
  goal: string;
  day: string;
  start_minute: number;
  duration_min: number;
  status: StudySession['status'];
  completed_at: string | null;
  actual_minutes: number | null;
  rescheduled_from: string | null;
}

const toSession = (r: SessionRow): StudySession => ({
  id: r.id,
  subjectId: r.subject_id,
  seriesId: r.series_id,
  title: r.title,
  goal: r.goal,
  day: r.day,
  startMinute: r.start_minute,
  durationMin: r.duration_min,
  status: r.status,
  completedAt: r.completed_at,
  actualMinutes: r.actual_minutes,
  rescheduledFrom: r.rescheduled_from,
});

export interface FocusRecord {
  id: string;
  subjectId: string | null;
  preset: string;
  startedAt: string;
  endedAt: string;
  day: string;
  focusMinutes: number;
  cycles: number;
  completed: boolean;
}

export function createPlannerRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  async function insertSession(input: SessionInput, seriesId: string | null): Promise<string> {
    const id = newId('ss');
    const t = now();
    await db.runAsync(
      'INSERT INTO study_sessions (id, subject_id, series_id, title, goal, day, start_minute, duration_min, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, input.subjectId, seriesId, input.title.trim(), input.goal.trim(), input.day, Math.round(input.startMinute), Math.max(5, Math.round(input.durationMin)), t, t],
    );
    return id;
  }

  async function logMinutes(subjectId: string | null, day: string, minutes: number, source: 'focus' | 'session' | 'manual', refId: string | null): Promise<void> {
    if (minutes <= 0) return;
    await db.runAsync('INSERT OR IGNORE INTO study_log (id, subject_id, day, minutes, source, ref_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      newId('lg'),
      subjectId,
      day,
      Math.round(minutes),
      source,
      refId,
      now(),
    ]);
  }

  return {
    async sessionsBetween(from: string, to: string): Promise<StudySession[]> {
      return (await db.getAllAsync<SessionRow>('SELECT * FROM study_sessions WHERE day >= ? AND day <= ? ORDER BY day, start_minute', [from, to])).map(toSession);
    },

    async getSession(id: string): Promise<StudySession | null> {
      const r = await db.getFirstAsync<SessionRow>('SELECT * FROM study_sessions WHERE id = ?', [id]);
      return r ? toSession(r) : null;
    },

    async history(limit = 100): Promise<StudySession[]> {
      return (await db.getAllAsync<SessionRow>("SELECT * FROM study_sessions WHERE status != 'planned' OR day < ? ORDER BY day DESC, start_minute DESC LIMIT ?", [clock.today(), limit])).map(toSession);
    },

    async createSession(input: SessionInput): Promise<string> {
      return insertSession(input, null);
    },

    /** Creates a series and one session per occurrence of the rule, in one transaction. */
    async createRecurring(input: Omit<SessionInput, 'day'>, rule: RecurrenceRule): Promise<{ seriesId: string; count: number }> {
      const days = expandRecurrence(rule);
      const seriesId = newId('se');
      await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO session_series (id, rule, created_at) VALUES (?, ?, ?)', [seriesId, toJson(rule), now()]);
        for (const day of days) await insertSession({ ...input, day }, seriesId);
      });
      return { seriesId, count: days.length };
    },

    async seriesRule(seriesId: string): Promise<RecurrenceRule | null> {
      const r = await db.getFirstAsync<{ rule: string }>('SELECT rule FROM session_series WHERE id = ?', [seriesId]);
      return r ? fromJson<RecurrenceRule | null>(r.rule, null) : null;
    },

    async updateSession(id: string, input: SessionInput): Promise<void> {
      await db.runAsync('UPDATE study_sessions SET subject_id = ?, title = ?, goal = ?, day = ?, start_minute = ?, duration_min = ?, updated_at = ? WHERE id = ?', [
        input.subjectId,
        input.title.trim(),
        input.goal.trim(),
        input.day,
        Math.round(input.startMinute),
        Math.max(5, Math.round(input.durationMin)),
        now(),
        id,
      ]);
    },

    /** Marks a session done and logs its minutes once (idempotent thanks to the unique (source, ref_id) index). */
    async completeSession(id: string, actualMinutes?: number): Promise<void> {
      await db.withTransactionAsync(async () => {
        const s = await db.getFirstAsync<SessionRow>('SELECT * FROM study_sessions WHERE id = ?', [id]);
        if (!s) return;
        const minutes = Math.max(0, Math.round(actualMinutes ?? s.duration_min));
        await db.runAsync("UPDATE study_sessions SET status = 'done', completed_at = ?, actual_minutes = ?, updated_at = ? WHERE id = ?", [now(), minutes, now(), id]);
        await logMinutes(s.subject_id, s.day <= clock.today() ? s.day : clock.today(), minutes, 'session', id);
      });
    },

    async reopenSession(id: string): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync("UPDATE study_sessions SET status = 'planned', completed_at = NULL, actual_minutes = NULL, updated_at = ? WHERE id = ?", [now(), id]);
        await db.runAsync("DELETE FROM study_log WHERE source = 'session' AND ref_id = ?", [id]);
      });
    },

    async skipSession(id: string): Promise<void> {
      await db.runAsync("UPDATE study_sessions SET status = 'skipped', updated_at = ? WHERE id = ?", [now(), id]);
    },

    /** Moves a session to another day/time, remembering where it came from. */
    async reschedule(id: string, day: string, startMinute: number): Promise<void> {
      await db.runAsync("UPDATE study_sessions SET rescheduled_from = COALESCE(rescheduled_from, day), day = ?, start_minute = ?, status = 'planned', updated_at = ? WHERE id = ?", [day, Math.round(startMinute), now(), id]);
    },

    async removeSession(id: string, wholeSeries = false): Promise<void> {
      const s = await db.getFirstAsync<SessionRow>('SELECT * FROM study_sessions WHERE id = ?', [id]);
      if (!s) return;
      if (wholeSeries && s.series_id) {
        // Keep the history: only future planned occurrences are removed.
        await db.runAsync("DELETE FROM study_sessions WHERE series_id = ? AND status = 'planned' AND day >= ?", [s.series_id, s.day]);
      } else {
        await db.runAsync('DELETE FROM study_sessions WHERE id = ?', [id]);
      }
    },

    /* ----------------------------------------------------------- study log */

    async logManual(subjectId: string | null, minutes: number, day = clock.today()): Promise<void> {
      await logMinutes(subjectId, day, minutes, 'manual', null);
    },

    async logSince(day: string): Promise<{ day: string; minutes: number; subjectId: string | null; source: string }[]> {
      return db.getAllAsync('SELECT day, minutes, subject_id AS subjectId, source FROM study_log WHERE day >= ? ORDER BY day', [day]);
    },

    async lastStudyDayBySubject(): Promise<Record<string, string>> {
      const rows = await db.getAllAsync<{ subject_id: string; day: string }>('SELECT subject_id, MAX(day) AS day FROM study_log WHERE subject_id IS NOT NULL GROUP BY subject_id', []);
      return Object.fromEntries(rows.map((r) => [r.subject_id, r.day]));
    },

    /* ----------------------------------------------------------- focus */

    /** Saves a finished/stopped focus run and logs its focused minutes. */
    async saveFocus(input: Omit<FocusRecord, 'id' | 'day'> & { linkedSessionId?: string | null }): Promise<string> {
      const id = newId('fo');
      const day = toDayKey(new Date(input.startedAt));
      await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO focus_sessions (id, subject_id, preset, started_at, ended_at, day, focus_minutes, cycles, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          id,
          input.subjectId,
          input.preset,
          input.startedAt,
          input.endedAt,
          day,
          input.focusMinutes,
          input.cycles,
          input.completed ? 1 : 0,
        ]);
        await logMinutes(input.subjectId, day, input.focusMinutes, 'focus', id);
      });
      return id;
    },

    async focusHistory(limit = 50): Promise<FocusRecord[]> {
      const rows = await db.getAllAsync<{ id: string; subject_id: string | null; preset: string; started_at: string; ended_at: string; day: string; focus_minutes: number; cycles: number; completed: number }>(
        'SELECT * FROM focus_sessions ORDER BY started_at DESC LIMIT ?',
        [limit],
      );
      return rows.map((r) => ({ id: r.id, subjectId: r.subject_id, preset: r.preset, startedAt: r.started_at, endedAt: r.ended_at, day: r.day, focusMinutes: r.focus_minutes, cycles: r.cycles, completed: r.completed === 1 }));
    },

    async focusTotals(): Promise<{ sessions: number; minutes: number; bySubject: { subjectId: string | null; minutes: number }[] }> {
      const total = await db.getFirstAsync<{ n: number; m: number | null }>('SELECT COUNT(*) AS n, SUM(focus_minutes) AS m FROM focus_sessions', []);
      const bySubject = await db.getAllAsync<{ subjectId: string | null; minutes: number }>('SELECT subject_id AS subjectId, SUM(focus_minutes) AS minutes FROM focus_sessions GROUP BY subject_id ORDER BY minutes DESC', []);
      return { sessions: total?.n ?? 0, minutes: total?.m ?? 0, bySubject };
    },
  };
}

export type PlannerRepository = ReturnType<typeof createPlannerRepository>;
