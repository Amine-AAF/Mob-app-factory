/**
 * Locally generated, collision-resistant ids (time-ordered prefix + randomness).
 * No dependency on crypto APIs that may be missing in Hermes.
 */
let counter = 0;
export function newId(prefix = ''): string {
  counter = (counter + 1) % 1_679_616;
  const time = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 2_176_782_336).toString(36).padStart(6, '0');
  return `${prefix}${time}${counter.toString(36).padStart(4, '0')}${rand}`;
}
