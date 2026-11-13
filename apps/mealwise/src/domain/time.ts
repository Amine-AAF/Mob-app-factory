/** Formats a countdown as mm:ss (or h:mm:ss). */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m % 60)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

/** Minutes after midnight -> { hour, minute }. */
export function splitMinutes(total: number): { hour: number; minute: number } {
  const t = ((Math.round(total) % 1440) + 1440) % 1440;
  return { hour: Math.floor(t / 60), minute: t % 60 };
}
