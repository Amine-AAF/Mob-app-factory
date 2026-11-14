import type { DayKey } from '@factory/app-core';

/**
 * Core HabitFlow domain types. Every date is a *local calendar day* ("YYYY-MM-DD"),
 * captured when the user acts, so a later time-zone or DST change never moves
 * an existing log to another day.
 */
export type { DayKey };

export const CATEGORIES = ['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'growth', 'finance', 'lifestyle', 'custom'] as const;
export type HabitCategory = (typeof CATEGORIES)[number];

/** 0 = Sunday … 6 = Saturday (JavaScript `Date#getDay`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Frequency =
  | { type: 'daily' }
  | { type: 'weekdays'; days: Weekday[] }
  | { type: 'timesPerWeek'; count: number }
  | { type: 'timesPerMonth'; count: number }
  /** Custom: every N days counted from the schedule's start. */
  | { type: 'interval'; everyDays: number };

export type TrackingMode = 'check' | 'quantity' | 'duration';

export interface Tracking {
  mode: TrackingMode;
  /** Value to reach for the day to count as completed (1 for `check`). */
  target: number;
  /** Free unit label for quantities ("pages", "L"); minutes for `duration`. */
  unit: string | null;
}

/**
 * The part of a habit that decides *what counts as done*. It is versioned:
 * changing it creates a new schedule effective from that day, so past days keep
 * the rules that applied when they happened.
 */
export interface Schedule {
  habitId: string;
  effectiveFrom: DayKey;
  frequency: Frequency;
  tracking: Tracking;
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  category: HabitCategory;
  startDate: DayKey;
  durationMin: number | null;
  notes: string | null;
  templateId: string | null;
  sortOrder: number;
  /** Day from which the habit is archived (excluded). Past days keep counting. */
  archivedOn: DayKey | null;
  createdAt: string;
  updatedAt: string;
}

/** A habit with its full schedule history, oldest first. */
export interface HabitWithSchedules extends Habit {
  schedules: Schedule[];
}

export type LogStatus = 'done' | 'partial' | 'skipped';

/** One row per (habit, day): uniqueness is enforced by the database primary key. */
export interface HabitLog {
  habitId: string;
  day: DayKey;
  value: number;
  /** Target in force for that day when the log was written (snapshot, never recomputed). */
  target: number;
  status: LogStatus;
  note: string | null;
  /** ISO timestamp of the first time the day reached `done`. */
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface PlannerTask {
  id: string;
  title: string;
  notes: string | null;
  priority: Priority;
  dueDay: DayKey;
  /** "HH:MM" local time, optional. */
  time: string | null;
  done: boolean;
  doneAt: string | null;
  habitId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  /** null = general daily check-in reminder. */
  habitId: string | null;
  hour: number;
  minute: number;
  /** Empty = every day. */
  days: Weekday[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Everything the pure statistics layer needs, loaded once from SQLite. */
export interface Snapshot {
  habits: HabitWithSchedules[];
  logs: HabitLog[];
}
