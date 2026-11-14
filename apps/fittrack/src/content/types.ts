/**
 * Static content shipped with FitTrack (exercise library + workout templates).
 * Content is original, written for the app, and localized in every interface
 * language (en, fr, es). It is reference information, not medical advice.
 */

export const EXERCISE_CATEGORIES = ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'abs', 'full_body', 'cardio', 'mobility', 'stretching'] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const MUSCLE_GROUPS = [
  'chest', 'upper_back', 'lats', 'lower_back', 'traps', 'front_delts', 'side_delts', 'rear_delts', 'rotator_cuff',
  'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'quads', 'hamstrings', 'glutes', 'adductors', 'abductors',
  'calves', 'hip_flexors', 'neck', 'full_body',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT = ['bodyweight', 'dumbbells', 'barbell', 'resistance_bands', 'kettlebell', 'machine', 'cable', 'bench', 'other'] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type Level = (typeof LEVELS)[number];

/**
 * How a set of this exercise is recorded:
 * - weight_reps:   load (optional, 0 = bodyweight) x repetitions
 * - reps:          repetitions only (bodyweight / bands)
 * - time:          hold or work duration in seconds
 * - distance_time: distance + duration (cardio machines, running, swimming)
 */
export const TRACKING_TYPES = ['weight_reps', 'reps', 'time', 'distance_time'] as const;
export type TrackingType = (typeof TRACKING_TYPES)[number];

export interface ExerciseText {
  name: string;
  /** 1-2 sentences: what the movement is and what it trains. */
  description: string;
  /** Ordered, imperative steps (3-6). */
  steps: string[];
  /** Execution cues (2-4). */
  tips: string[];
  /** Frequent mistakes (2-4). */
  mistakes: string[];
  /** Short name/description of an easier variation. */
  easier: string;
  /** Short name/description of a harder variation. */
  harder: string;
}

export type Localized<T> = { en: T; fr: T; es: T };

export interface ExerciseSeed {
  /** Stable kebab-case id. NEVER rename a shipped id: user history references it. */
  id: string;
  category: ExerciseCategory;
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  equipment: Equipment[];
  level: Level;
  tracking: TrackingType;
  /** Optional link to the library id of the easier / harder variation. */
  easierId?: string;
  harderId?: string;
  i18n: Localized<ExerciseText>;
}

export const PROGRAM_TYPES = ['full_body', 'upper_lower', 'push_pull_legs', 'strength', 'hypertrophy', 'bodyweight', 'home', 'cardio', 'mobility', 'core', 'custom'] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];

export const PROGRAM_GOALS = ['general_fitness', 'strength', 'muscle', 'endurance', 'mobility', 'consistency'] as const;
export type ProgramGoal = (typeof PROGRAM_GOALS)[number];

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  /** Rep target for reps / weight_reps exercises (min = max for a fixed target). */
  repsMin?: number;
  repsMax?: number;
  /** Work duration for time / distance_time exercises. */
  durationSec?: number;
  /** Optional distance target in meters for distance_time exercises. */
  distanceM?: number;
  restSec: number;
}

export interface TemplateDay {
  name: Localized<string>;
  exercises: TemplateExercise[];
}

export interface TemplateSeed {
  id: string;
  type: ProgramType;
  goal: ProgramGoal;
  level: Level;
  daysPerWeek: number;
  /** Estimated minutes per session. */
  estMinutes: number;
  premium: boolean;
  i18n: Localized<{ name: string; description: string }>;
  days: TemplateDay[];
}
