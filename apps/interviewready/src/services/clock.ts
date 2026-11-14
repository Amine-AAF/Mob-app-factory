import { toDayKey } from '@factory/app-core';

/** Single source of "now" so tests can freeze time. */
let override: (() => Date) | null = null;

export const clock = {
  now: (): Date => (override ? override() : new Date()),
  today: (): string => toDayKey(clock.now()),
  /** Local day of a stored ISO timestamp. */
  dayOf: (iso: string): string => toDayKey(new Date(iso)),
  set(fn: (() => Date) | null) {
    override = fn;
  },
};
