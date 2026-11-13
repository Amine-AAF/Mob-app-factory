import type { DayKey } from '@factory/app-core';

import type { Equipment, ExerciseCategory, Level, MuscleGroup, ProgramGoal, ProgramType, TrackingType } from '@/content/types';

export type { DayKey };
export type { Equipment, ExerciseCategory, Level, MuscleGroup, ProgramGoal, ProgramType, TrackingType };

/** Exercise as the app uses it, whatever its source (library content or user-created). */
export interface Exercise {
  id: string;
  source: 'library' | 'custom';
  category: ExerciseCategory;
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  equipment: Equipment[];
  level: Level;
  tracking: TrackingType;
  name: string;
  description: string;
  steps: string[];
  tips: string[];
  mistakes: string[];
  easier: string | null;
  harder: string | null;
  easierId: string | null;
  harderId: string | null;
}

/** Targets shared by program exercises and session exercises. */
export interface ExerciseTargets {
  sets: number;
  repsMin: number | null;
  repsMax: number | null;
  weightKg: number | null;
  durationSec: number | null;
  distanceM: number | null;
  restSec: number;
}

export interface ProgramExercise extends ExerciseTargets {
  id: string;
  dayId: string;
  exerciseId: string;
  position: number;
  notes: string | null;
}

export interface ProgramDay {
  id: string;
  programId: string;
  name: string;
  position: number;
  notes: string | null;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  name: string;
  description: string | null;
  type: ProgramType;
  goal: ProgramGoal;
  level: Level;
  origin: 'custom' | 'template' | 'duplicate';
  templateId: string | null;
  notes: string | null;
  sortOrder: number;
  archivedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface ProgramWithDays extends Program {
  days: ProgramDay[];
}

/** 0 = Monday … 6 = Sunday (ISO order, independent from the locale's first day). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface RoutineSlot {
  weekday: Weekday;
  kind: 'workout' | 'rest';
  programId: string | null;
  programDayId: string | null;
  time: string | null;
}

export type ScheduleStatus = 'planned' | 'done' | 'skipped' | 'moved';

export interface ScheduleEntry {
  id: string;
  day: DayKey;
  kind: 'workout' | 'rest';
  status: ScheduleStatus;
  programId: string | null;
  programDayId: string | null;
  fromRoutine: boolean;
  movedTo: DayKey | null;
  time: string | null;
  sessionId: string | null;
  note: string | null;
}

export type SessionStatus = 'active' | 'paused' | 'completed' | 'discarded';

export interface WorkoutSession {
  id: string;
  name: string;
  programId: string | null;
  programDayId: string | null;
  scheduleId: string | null;
  status: SessionStatus;
  day: DayKey;
  startedAt: number;
  endedAt: number | null;
  pausedAt: number | null;
  pausedTotalMs: number;
  currentIndex: number;
  restStartedAt: number | null;
  restEndsAt: number | null;
  durationSec: number | null;
  notes: string | null;
}

export interface ExerciseSet {
  id: string;
  sessionExerciseId: string;
  setIndex: number;
  reps: number | null;
  weightKg: number | null;
  durationSec: number | null;
  distanceM: number | null;
  completedAt: number;
}

export interface SessionExercise extends Omit<ExerciseTargets, 'sets'> {
  id: string;
  sessionId: string;
  exerciseId: string;
  position: number;
  status: 'pending' | 'done' | 'skipped';
  targetSets: number;
  notes: string | null;
  sets: ExerciseSet[];
}

export interface SessionWithExercises extends WorkoutSession {
  exercises: SessionExercise[];
}

export type RecordKind = 'max_weight' | 'max_reps' | 'max_volume' | 'est_1rm' | 'max_duration' | 'max_distance' | 'best_pace';

export interface PerformanceRecord {
  id: string;
  exerciseId: string;
  sessionId: string | null;
  setId: string | null;
  kind: RecordKind;
  value: number;
  day: DayKey;
  achievedAt: number;
}

export const MEASUREMENT_KINDS = ['weight', 'height', 'chest', 'waist', 'hips', 'arm', 'thigh', 'custom'] as const;
export type MeasurementKind = (typeof MEASUREMENT_KINDS)[number];

export interface BodyMeasurement {
  id: string;
  day: DayKey;
  kind: MeasurementKind;
  customName: string | null;
  /** kg for weight, cm for every length. */
  value: number;
  note: string | null;
}

export type PhotoPose = 'front' | 'side' | 'back' | 'other';

export interface ProgressPhoto {
  id: string;
  day: DayKey;
  fileUri: string;
  pose: PhotoPose;
  note: string | null;
  createdAt: number;
}

export const CARDIO_TYPES = ['running', 'walking', 'cycling', 'treadmill', 'elliptical', 'swimming', 'rowing', 'other'] as const;
export type CardioType = (typeof CARDIO_TYPES)[number];

export interface CardioActivity {
  id: string;
  day: DayKey;
  type: CardioType;
  durationSec: number;
  distanceM: number | null;
  calories: number | null;
  caloriesSource: 'manual' | 'met_estimate' | null;
  note: string | null;
  createdAt: number;
}

export const GOAL_KINDS = ['weekly_sessions', 'weekly_minutes', 'exercise_reps', 'exercise_weight', 'consistency_weeks', 'weekly_cardio_km', 'weekly_cardio_minutes'] as const;
export type GoalKind = (typeof GOAL_KINDS)[number];

export interface FitnessGoal {
  id: string;
  kind: GoalKind;
  /** Metric target (kg, meters → km for weekly_cardio_km is stored in km for readability). */
  target: number;
  exerciseId: string | null;
  startDay: DayKey;
  endDay: DayKey | null;
  active: boolean;
  achievedAt: number | null;
}

export interface ChallengeRun {
  id: string;
  challengeId: string;
  startedDay: DayKey;
  status: 'active' | 'completed' | 'abandoned';
  completedAt: number | null;
}

export const NOTIFICATION_KINDS = ['workout_reminder', 'weekly_goal', 'challenge', 'routine', 'progress_summary'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface NotificationSetting {
  kind: NotificationKind;
  enabled: boolean;
  hour: number;
  minute: number;
  /** Used by 'routine' (days to remind) and 'progress_summary' / 'weekly_goal' (first entry = weekday). */
  weekdays: Weekday[];
}
