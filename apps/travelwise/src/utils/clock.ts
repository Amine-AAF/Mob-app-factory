import { toDayKey } from '@factory/app-core';

/** Single source of "now" so tests can freeze time. */
let override: (() => Date) | null = null;

export const clock = {
  now: (): Date => (override ? override() : new Date()),
  /** Today's calendar date on this device ("YYYY-MM-DD"). */
  today: (): string => toDayKey(clock.now()),
  /** Current instant, ISO-8601 UTC. */
  instant: (): string => clock.now().toISOString(),
  set(fn: (() => Date) | null) {
    override = fn;
  },
};
