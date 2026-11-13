import type { ExerciseSeed } from '../types';

import { ABS_EXERCISES } from './abs';
import { ARMS_EXERCISES } from './arms';
import { BACK_EXERCISES } from './back';
import { CARDIO_EXERCISES } from './cardio';
import { CHEST_EXERCISES } from './chest';
import { FULL_BODY_EXERCISES } from './full_body';
import { GLUTES_EXERCISES } from './glutes';
import { LEGS_EXERCISES } from './legs';
import { MOBILITY_EXERCISES } from './mobility';
import { SHOULDERS_EXERCISES } from './shoulders';
import { STRETCHING_EXERCISES } from './stretching';

/** Bump when the bundled library changes, so boot re-syncs the exercises table. */
export const LIBRARY_VERSION = 1;

export const LIBRARY: readonly ExerciseSeed[] = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDERS_EXERCISES,
  ...ARMS_EXERCISES,
  ...LEGS_EXERCISES,
  ...GLUTES_EXERCISES,
  ...ABS_EXERCISES,
  ...FULL_BODY_EXERCISES,
  ...CARDIO_EXERCISES,
  ...MOBILITY_EXERCISES,
  ...STRETCHING_EXERCISES,
];
