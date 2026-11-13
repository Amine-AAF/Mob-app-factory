/** Injectable clock so time-dependent logic is testable. */
export const clock = {
  now: (): Date => new Date(),
};
