import type { Migration } from '@factory/storage';

/**
 * LearnSphere schema. Versioned with SQLite `user_version` (see @factory/storage `migrate`).
 * Never edit a shipped migration: append a new one and bump SCHEMA_VERSION.
 *
 * Conventions
 * - ids are TEXT (generated locally, see utils/id.ts) so rows can later be synced without collisions.
 * - every user table carries `created_at` / `updated_at` (ISO strings).
 * - calendar days are local "YYYY-MM-DD" keys (`day`, `due_day`), instants are ISO strings.
 * - booleans are INTEGER 0/1.
 * - bundled content (quiz banks, templates) lives in tables flagged `source = 'bundle'` and is re-seeded
 *   when CONTENT_VERSION changes; user rows (`source = 'user'`) are never touched by seeding.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS kv_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS subscription_cache (id INTEGER PRIMARY KEY NOT NULL, state TEXT NOT NULL, updated_at TEXT NOT NULL);

        -- Organisation -----------------------------------------------------------
        CREATE TABLE IF NOT EXISTS subjects (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          color TEXT NOT NULL,
          icon TEXT NOT NULL,
          objective TEXT NOT NULL DEFAULT '',
          start_day TEXT,
          target_day TEXT,
          favorite INTEGER NOT NULL DEFAULT 0,
          archived INTEGER NOT NULL DEFAULT 0,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_subjects_archived ON subjects(archived, position);

        CREATE TABLE IF NOT EXISTS courses (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          position INTEGER NOT NULL DEFAULT 0,
          archived INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject_id, position);

        -- A chapter can be a "chapter" or a "module" (same behaviour, different label).
        CREATE TABLE IF NOT EXISTS chapters (
          id TEXT PRIMARY KEY NOT NULL,
          course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          kind TEXT NOT NULL DEFAULT 'chapter' CHECK (kind IN ('chapter', 'module')),
          position INTEGER NOT NULL DEFAULT 0,
          completed_at TEXT,
          completed_day TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_chapters_course ON chapters(course_id, position);

        CREATE TABLE IF NOT EXISTS lessons (
          id TEXT PRIMARY KEY NOT NULL,
          chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          position INTEGER NOT NULL DEFAULT 0,
          completed_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_lessons_chapter ON lessons(chapter_id, position);

        -- Links and imported files (PDF) attached to a subject or a course.
        CREATE TABLE IF NOT EXISTS resources (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
          course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
          kind TEXT NOT NULL CHECK (kind IN ('link', 'pdf', 'book', 'video', 'other')),
          title TEXT NOT NULL,
          uri TEXT NOT NULL DEFAULT '',
          size_bytes INTEGER,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject_id);

        -- Notes ------------------------------------------------------------------
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
          chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL DEFAULT '',
          search_text TEXT NOT NULL DEFAULT '',
          tags TEXT NOT NULL DEFAULT '[]',
          favorite INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject_id, updated_at);
        CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at);

        -- Simple modification history: previous versions of a note (capped per note).
        CREATE TABLE IF NOT EXISTS note_revisions (
          id TEXT PRIMARY KEY NOT NULL,
          note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_note_revisions_note ON note_revisions(note_id, created_at);

        -- Flashcards -------------------------------------------------------------
        CREATE TABLE IF NOT EXISTS flashcards (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
          chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
          front TEXT NOT NULL,
          back TEXT NOT NULL,
          tags TEXT NOT NULL DEFAULT '[]',
          difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
          favorite INTEGER NOT NULL DEFAULT 0,
          -- Spaced-repetition state (see features/flashcards/scheduler.ts)
          repetitions INTEGER NOT NULL DEFAULT 0,
          interval_days INTEGER NOT NULL DEFAULT 0,
          ease REAL NOT NULL DEFAULT 2.5,
          due_day TEXT NOT NULL,
          lapses INTEGER NOT NULL DEFAULT 0,
          last_reviewed_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_flashcards_due ON flashcards(due_day);
        CREATE INDEX IF NOT EXISTS idx_flashcards_subject ON flashcards(subject_id);

        CREATE TABLE IF NOT EXISTS flashcard_reviews (
          id TEXT PRIMARY KEY NOT NULL,
          flashcard_id TEXT NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
          grade TEXT NOT NULL CHECK (grade IN ('again', 'hard', 'medium', 'easy')),
          day TEXT NOT NULL,
          reviewed_at TEXT NOT NULL,
          interval_before INTEGER NOT NULL,
          interval_after INTEGER NOT NULL,
          duration_ms INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_reviews_card ON flashcard_reviews(flashcard_id, reviewed_at);
        CREATE INDEX IF NOT EXISTS idx_reviews_day ON flashcard_reviews(day);

        -- Quizzes ----------------------------------------------------------------
        -- bank_id: a bundled bank id ('general', 'logic', ...) or a subject id for user questions.
        CREATE TABLE IF NOT EXISTS quiz_questions (
          id TEXT PRIMARY KEY NOT NULL,
          bank_id TEXT NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
          source TEXT NOT NULL CHECK (source IN ('bundle', 'user')),
          type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'true_false', 'short_answer', 'matching')),
          difficulty INTEGER NOT NULL DEFAULT 1,
          prompt TEXT NOT NULL,
          payload TEXT NOT NULL,
          explanation TEXT NOT NULL DEFAULT '',
          tags TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_quiz_questions_bank ON quiz_questions(bank_id);

        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id TEXT PRIMARY KEY NOT NULL,
          bank_id TEXT NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
          mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam')),
          started_at TEXT NOT NULL,
          finished_at TEXT NOT NULL,
          day TEXT NOT NULL,
          duration_ms INTEGER NOT NULL,
          time_limit_s INTEGER,
          total INTEGER NOT NULL,
          correct INTEGER NOT NULL,
          score INTEGER NOT NULL,
          answers TEXT NOT NULL DEFAULT '[]'
        );
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_day ON quiz_attempts(day);

        -- Planning ---------------------------------------------------------------
        CREATE TABLE IF NOT EXISTS session_series (
          id TEXT PRIMARY KEY NOT NULL,
          rule TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS study_sessions (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
          series_id TEXT REFERENCES session_series(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          goal TEXT NOT NULL DEFAULT '',
          day TEXT NOT NULL,
          start_minute INTEGER NOT NULL,
          duration_min INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'done', 'skipped')),
          completed_at TEXT,
          actual_minutes INTEGER,
          rescheduled_from TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_day ON study_sessions(day, start_minute);
        CREATE INDEX IF NOT EXISTS idx_sessions_subject ON study_sessions(subject_id);

        -- Every minute studied (focus timer, completed sessions, manual entries). Source of time stats.
        CREATE TABLE IF NOT EXISTS study_log (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
          day TEXT NOT NULL,
          minutes INTEGER NOT NULL CHECK (minutes >= 0),
          source TEXT NOT NULL CHECK (source IN ('focus', 'session', 'manual')),
          ref_id TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_study_log_day ON study_log(day);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_study_log_ref ON study_log(source, ref_id) WHERE ref_id IS NOT NULL;

        CREATE TABLE IF NOT EXISTS focus_sessions (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
          preset TEXT NOT NULL,
          started_at TEXT NOT NULL,
          ended_at TEXT NOT NULL,
          day TEXT NOT NULL,
          focus_minutes INTEGER NOT NULL,
          cycles INTEGER NOT NULL,
          completed INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_focus_day ON focus_sessions(day);

        -- Goals, exams, deadlines --------------------------------------------------
        CREATE TABLE IF NOT EXISTS study_goals (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'challenge')),
          metric TEXT NOT NULL CHECK (metric IN ('minutes', 'sessions', 'chapters', 'flashcards', 'quizzes')),
          target INTEGER NOT NULL CHECK (target > 0),
          subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
          start_day TEXT,
          end_day TEXT,
          active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS exams (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
          kind TEXT NOT NULL CHECK (kind IN ('exam', 'test', 'certification')),
          title TEXT NOT NULL,
          day TEXT NOT NULL,
          minute INTEGER,
          location TEXT NOT NULL DEFAULT '',
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          notes TEXT NOT NULL DEFAULT '',
          result TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_exams_day ON exams(day);

        CREATE TABLE IF NOT EXISTS deadlines (
          id TEXT PRIMARY KEY NOT NULL,
          subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
          kind TEXT NOT NULL CHECK (kind IN ('assignment', 'project', 'other')),
          title TEXT NOT NULL,
          day TEXT NOT NULL,
          minute INTEGER,
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          notes TEXT NOT NULL DEFAULT '',
          done_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_deadlines_day ON deadlines(day);

        -- Preparation checklist of an exam or a deadline.
        CREATE TABLE IF NOT EXISTS checklist_items (
          id TEXT PRIMARY KEY NOT NULL,
          owner_type TEXT NOT NULL CHECK (owner_type IN ('exam', 'deadline')),
          owner_id TEXT NOT NULL,
          label TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_checklist_owner ON checklist_items(owner_type, owner_id, position);

        -- Templates, achievements, notifications -----------------------------------
        CREATE TABLE IF NOT EXISTS templates (
          id TEXT PRIMARY KEY NOT NULL,
          source TEXT NOT NULL CHECK (source IN ('bundle', 'user')),
          category TEXT NOT NULL,
          premium INTEGER NOT NULL DEFAULT 0,
          payload TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS achievements (
          id TEXT PRIMARY KEY NOT NULL,
          unlocked_at TEXT NOT NULL,
          seen INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS notification_settings (
          kind TEXT PRIMARY KEY NOT NULL CHECK (kind IN ('session', 'review', 'exam', 'deadline', 'daily_goal', 'flashcards')),
          enabled INTEGER NOT NULL DEFAULT 0,
          hour INTEGER NOT NULL DEFAULT 19,
          minute INTEGER NOT NULL DEFAULT 0,
          lead_minutes INTEGER NOT NULL DEFAULT 15,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/**
 * User-owned tables, in foreign-key order (parents first). Used by backup/restore and "delete all my data".
 * Bundled quiz questions/templates are part of these tables but restored rows with source='bundle'
 * are simply re-seeded afterwards.
 */
export const USER_TABLES = [
  'kv_settings',
  'subjects',
  'courses',
  'chapters',
  'lessons',
  'resources',
  'notes',
  'note_revisions',
  'flashcards',
  'flashcard_reviews',
  'quiz_attempts',
  'session_series',
  'study_sessions',
  'study_log',
  'focus_sessions',
  'study_goals',
  'exams',
  'deadlines',
  'checklist_items',
  'achievements',
  'notification_settings',
] as const;

/** Tables containing both bundled and user rows: only `source = 'user'` rows are backed up / wiped. */
export const MIXED_TABLES = ['quiz_questions', 'templates'] as const;
