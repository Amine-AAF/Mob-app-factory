/**
 * One-shot, in-memory hand-off of a generated password from the Generator tab to the item
 * editor. Never passed through route params (those can end up in navigation state/history).
 */
let pending: string | null = null;

export function offerGeneratedPassword(value: string): void {
  pending = value;
}

export function takeGeneratedPassword(): string | null {
  const v = pending;
  pending = null;
  return v;
}

export function clearGeneratedPassword(): void {
  pending = null;
}
