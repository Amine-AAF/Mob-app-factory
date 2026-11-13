import type { Migration } from '@factory/storage';

/**
 * Schema history. NEVER edit a shipped migration: add a new one with the next
 * version. `migrate` (from @factory/storage) applies them through `user_version`,
 * each in its own transaction, so an app update keeps existing data.
 *
 * Conventions
 * - Units are always metric in storage (kg, cm, meters, seconds); conversion is display-only.
 * - Instants are epoch milliseconds (INTEGER); local calendar days are "YYYY-MM-DD" (TEXT).
 *   Timers are computed from stored instants, never from a ticking counter, so a
 *   killed / backgrounded app resumes with the right elapsed time.
 * - Library exercises are upserted from the bundled content (source = 'library');
 *   their localized text never lives in SQLite. Custom exercises (source = 'custom') do.
 * - Progress photos are files in the app's document directory; only their URI is stored.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE muscle_groups (
          id TEXT PRIMARY KEY NOT NULL,
          sort_order INTEGER NOT NULL
        );

        CREATE TABLE equipment (
          id TEXT PRIMARY KEY NOT NULL,
          sort_order INTEGER NOT NULL
        );

        CREATE TABLE exercises (
          id TEXT PRIMARY KEY NOT NULL,
          source TEXT NOT NULL CHECK (source IN ('library', 'custom')),
          category TEXT NOT NULL,
          level TEXT NOT NULL,
          tracking TEXT NOT NULL CHECK (tracking IN ('weight_reps', 'reps', 'time', 'distance_time')),
          name TEXT,
          description TEXT,
          archived INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX idx_exercises_category ON exercises (category);

        CREATE TABLE exercise_muscles (
          exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
          muscle_id TEXT NOT NULL REFERENCES muscle_groups(id),
          role TEXT NOT NULL CHECK (role IN ('primary', 'secondary')),
          PRIMARY KEY (exercise_id, muscle_id)
        );
        CREATE INDEX idx_exercise_muscles_muscle ON exercise_muscles (muscle_id, role);

        CREATE TABLE exercise_equipment (
          exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
          equipment_id TEXT NOT NULL REFERENCES equipment(id),
          PRIMARY KEY (exercise_id, equipment_id)
        );
        CREATE INDEX idx_exercise_equipment_equipment ON exercise_equipment (equipment_id);

        CREATE TABLE exercise_favorites (
          exercise_id TEXT PRIMARY KEY NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE workout_programs (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          goal TEXT NOT NULL,
          level TEXT NOT NULL,
          origin TEXT NOT NULL CHECK (origin IN ('custom', 'template', 'duplicate')),
          template_id TEXT,
          notes TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          archived_at INTEGER,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE program_days (
          id TEXT PRIMARY KEY NOT NULL,
          program_id TEXT NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          position INTEGER NOT NULL,
          notes TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX idx_program_days_program ON program_days (program_id, position);

        CREATE TABLE program_exercises (
          id TEXT PRIMARY KEY NOT NULL,
          day_id TEXT NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
          exercise_id TEXT NOT NULL REFERENCES exercises(id),
          position INTEGER NOT NULL,
          sets INTEGER NOT NULL CHECK (sets BETWEEN 1 AND 20),
          reps_min INTEGER,
          reps_max INTEGER,
          weight_kg REAL,
          duration_sec INTEGER,
          distance_m REAL,
          rest_sec INTEGER NOT NULL DEFAULT 60,
          notes TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX idx_program_exercises_day ON program_exercises (day_id, position);
        CREATE INDEX idx_program_exercises_exercise ON program_exercises (exercise_id);

        -- Weekly routine: one optional slot per weekday (0 = Monday … 6 = Sunday).
        CREATE TABLE routine_slots (
          weekday INTEGER PRIMARY KEY NOT NULL CHECK (weekday BETWEEN 0 AND 6),
          kind TEXT NOT NULL CHECK (kind IN ('workout', 'rest')),
          program_id TEXT REFERENCES workout_programs(id) ON DELETE CASCADE,
          program_day_id TEXT REFERENCES program_days(id) ON DELETE CASCADE,
          time TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        -- Explicit calendar entries. A row on a routine day overrides that day's routine slot
        -- (status 'moved' / 'skipped' hides it, 'planned' replaces it).
        CREATE TABLE workout_schedules (
          id TEXT PRIMARY KEY NOT NULL,
          day TEXT NOT NULL,
          kind TEXT NOT NULL CHECK (kind IN ('workout', 'rest')),
          status TEXT NOT NULL CHECK (status IN ('planned', 'done', 'skipped', 'moved')),
          program_id TEXT REFERENCES workout_programs(id) ON DELETE SET NULL,
          program_day_id TEXT REFERENCES program_days(id) ON DELETE SET NULL,
          from_routine INTEGER NOT NULL DEFAULT 0,
          moved_to TEXT,
          time TEXT,
          session_id TEXT,
          note TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX idx_workout_schedules_day ON workout_schedules (day);

        CREATE TABLE workout_sessions (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          program_id TEXT REFERENCES workout_programs(id) ON DELETE SET NULL,
          program_day_id TEXT REFERENCES program_days(id) ON DELETE SET NULL,
          schedule_id TEXT REFERENCES workout_schedules(id) ON DELETE SET NULL,
          status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'discarded')),
          day TEXT NOT NULL,
          started_at INTEGER NOT NULL,
          ended_at INTEGER,
          paused_at INTEGER,
          paused_total_ms INTEGER NOT NULL DEFAULT 0,
          current_index INTEGER NOT NULL DEFAULT 0,
          rest_started_at INTEGER,
          rest_ends_at INTEGER,
          duration_sec INTEGER,
          notes TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX idx_workout_sessions_day ON workout_sessions (day);
        CREATE INDEX idx_workout_sessions_status ON workout_sessions (status);

        CREATE TABLE session_exercises (
          id TEXT PRIMARY KEY NOT NULL,
          session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
          exercise_id TEXT NOT NULL REFERENCES exercises(id),
          position INTEGER NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('pending', 'done', 'skipped')),
          target_sets INTEGER NOT NULL,
          reps_min INTEGER,
          reps_max INTEGER,
          weight_kg REAL,
          duration_sec INTEGER,
          distance_m REAL,
          rest_sec INTEGER NOT NULL DEFAULT 60,
          notes TEXT
        );
        CREATE INDEX idx_session_exercises_session ON session_exercises (session_id, position);
        CREATE INDEX idx_session_exercises_exercise ON session_exercises (exercise_id);

        CREATE TABLE exercise_sets (
          id TEXT PRIMARY KEY NOT NULL,
          session_exercise_id TEXT NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
          set_index INTEGER NOT NULL,
          reps INTEGER,
          weight_kg REAL,
          duration_sec INTEGER,
          distance_m REAL,
          completed_at INTEGER NOT NULL,
          UNIQUE (session_exercise_id, set_index)
        );

        -- Personal-record events (one row each time a record is beaten). Estimated values
        -- (kind 'est_1rm') are stored apart and always labelled as estimates in the UI.
        CREATE TABLE performance_records (
          id TEXT PRIMARY KEY NOT NULL,
          exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
          session_id TEXT REFERENCES workout_sessions(id) ON DELETE CASCADE,
          set_id TEXT REFERENCES exercise_sets(id) ON DELETE CASCADE,
          kind TEXT NOT NULL CHECK (kind IN ('max_weight', 'max_reps', 'max_volume', 'est_1rm', 'max_duration', 'max_distance', 'best_pace')),
          value REAL NOT NULL,
          day TEXT NOT NULL,
          achieved_at INTEGER NOT NULL
        );
        CREATE INDEX idx_performance_records_exercise ON performance_records (exercise_id, kind);

        CREATE TABLE body_measurements (
          id TEXT PRIMARY KEY NOT NULL,
          day TEXT NOT NULL,
          kind TEXT NOT NULL,
          custom_name TEXT,
          value REAL NOT NULL,
          note TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX idx_body_measurements_kind_day ON body_measurements (kind, day);

        CREATE TABLE progress_photos (
          id TEXT PRIMARY KEY NOT NULL,
          day TEXT NOT NULL,
          file_uri TEXT NOT NULL,
          pose TEXT NOT NULL CHECK (pose IN ('front', 'side', 'back', 'other')),
          note TEXT,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX idx_progress_photos_day ON progress_photos (day);

        CREATE TABLE cardio_activities (
          id TEXT PRIMARY KEY NOT NULL,
          day TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('running', 'walking', 'cycling', 'treadmill', 'elliptical', 'swimming', 'rowing', 'other')),
          duration_sec INTEGER NOT NULL CHECK (duration_sec > 0),
          distance_m REAL,
          calories REAL,
          calories_source TEXT CHECK (calories_source IN ('manual', 'met_estimate')),
          note TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX idx_cardio_activities_day ON cardio_activities (day);

        CREATE TABLE fitness_goals (
          id TEXT PRIMARY KEY NOT NULL,
          kind TEXT NOT NULL,
          target REAL NOT NULL CHECK (target > 0),
          exercise_id TEXT REFERENCES exercises(id) ON DELETE CASCADE,
          start_day TEXT NOT NULL,
          end_day TEXT,
          active INTEGER NOT NULL DEFAULT 1,
          achieved_at INTEGER,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE challenges (
          id TEXT PRIMARY KEY NOT NULL,
          challenge_id TEXT NOT NULL,
          started_day TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')),
          completed_at INTEGER,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX idx_challenges_status ON challenges (status);

        CREATE TABLE achievements (
          id TEXT PRIMARY KEY NOT NULL,
          unlocked_at INTEGER NOT NULL
        );

        CREATE TABLE notification_settings (
          kind TEXT PRIMARY KEY NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 0,
          hour INTEGER NOT NULL DEFAULT 18,
          minute INTEGER NOT NULL DEFAULT 0,
          weekdays TEXT NOT NULL DEFAULT '[]',
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE user_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE subscription_cache (
          key TEXT PRIMARY KEY NOT NULL,
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/**
 * User-owned tables, parents first (restore order). Reference tables (muscle_groups,
 * equipment) and library exercises are re-seeded from the bundled content; custom
 * exercises are exported. The subscription cache is never exported.
 */
export const USER_TABLES = [
  'exercises',
  'exercise_muscles',
  'exercise_equipment',
  'exercise_favorites',
  'workout_programs',
  'program_days',
  'program_exercises',
  'routine_slots',
  'workout_schedules',
  'workout_sessions',
  'session_exercises',
  'exercise_sets',
  'performance_records',
  'body_measurements',
  'progress_photos',
  'cardio_activities',
  'fitness_goals',
  'challenges',
  'achievements',
  'notification_settings',
  'user_settings',
] as const;
