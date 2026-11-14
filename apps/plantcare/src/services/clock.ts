import { toDayKey } from '@factory/app-core';

/** Single source of "now" so tests can freeze time (copied from DevSpeak, see portfolio.md). */
let override: (() => Date) | null = null;

export const clock = {
  now: (): Date => (override ? override() : new Date()),
  today: (): string => toDayKey(clock.now()),
  minutesOfDay: (): number => {
    const d = clock.now();
    return d.getHours() * 60 + d.getMinutes();
  },
  set(fn: (() => Date) | null) {
    override = fn;
  },
};
