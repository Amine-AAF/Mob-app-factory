/**
 * Unique, sortable-ish identifiers (time prefix + random suffix). Not security tokens.
 * Uses crypto.getRandomValues when available (Hermes / Node), Math.random otherwise.
 */
function randomChunk(): string {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (c?.getRandomValues) {
    const arr = c.getRandomValues(new Uint32Array(2));
    return Array.from(arr, (n) => n.toString(36).padStart(7, '0')).join('');
  }
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8);
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomChunk()}`;
}
