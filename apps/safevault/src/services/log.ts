/**
 * The ONLY logging entry point of SafeVault.
 *
 * Accepts an event code and an optional error, and logs the error's *code/name* only —
 * never messages built from user data, never values. Silent in production builds:
 * no crash reporter or analytics SDK is bundled, so nothing leaves the device.
 * A test (security.test.ts) fails if any other file calls console.*.
 */
export function logEvent(code: string, error?: unknown): void {
  if (!__DEV__) return;
  const e = error as { code?: unknown; name?: unknown } | undefined;
  const detail = e ? String(e.code ?? e.name ?? 'error') : '';
  console.warn(`[safevault] ${code}${detail ? ` (${detail})` : ''}`);
}
