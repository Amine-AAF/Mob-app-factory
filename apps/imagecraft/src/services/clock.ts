import { toDayKey } from '@factory/app-core';

/** Injectable clock (tests freeze time). Days are local calendar days. */
export const clock = {
  now: (): Date => new Date(),
  today(): string {
    return toDayKey(this.now());
  },
};
