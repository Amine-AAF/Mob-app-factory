/**
 * Collision-resistant local ids (no network, no uuid dependency).
 * Format: <prefix>_<time base36><random base36>, safe for file names.
 */
let counter = 0;

export function newId(prefix: string): string {
  counter = (counter + 1) % 1296;
  const time = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 36 ** 6)
    .toString(36)
    .padStart(6, '0');
  return `${prefix}_${time}${counter.toString(36).padStart(2, '0')}${rand}`;
}
