/**
 * Random, URL-safe ids (time-prefixed so rows created together sort together).
 * Not security tokens: only used as primary keys.
 */
let counter = 0;

export function newId(prefix = ''): string {
  counter = (counter + 1) % 1296;
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  return `${prefix}${time}${counter.toString(36).padStart(2, '0')}${rand}`;
}
