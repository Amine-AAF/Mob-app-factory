/**
 * Locale-aware formatting of file sizes and ratios.
 * Uses SI units (1 kB = 1000 B), matching what Android's Files app displays.
 */
const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

export function formatFileSize(bytes: number, locale: string): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit++;
  }
  const digits = unit === 0 ? 0 : value < 10 ? 2 : value < 100 ? 1 : 0;
  try {
    return new Intl.NumberFormat(locale, { style: 'unit', unit: UNITS[unit], unitDisplay: 'short', maximumFractionDigits: digits }).format(value);
  } catch {
    // Older Intl data without unit support.
    const label = ['B', 'kB', 'MB', 'GB'][unit];
    return `${value.toFixed(digits)} ${label}`;
  }
}

/**
 * Relative size change. Positive = smaller output (saved), negative = larger.
 * Returns null when it can't be computed.
 */
export function savedRatio(originalBytes: number, outputBytes: number): number | null {
  if (!Number.isFinite(originalBytes) || !Number.isFinite(outputBytes) || originalBytes <= 0 || outputBytes < 0) return null;
  return (originalBytes - outputBytes) / originalBytes;
}

export function formatDimensions(width: number, height: number, locale: string): string {
  const n = new Intl.NumberFormat(locale);
  return `${n.format(width)} × ${n.format(height)}`;
}

export function formatMegapixels(width: number, height: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format((width * height) / 1_000_000);
}
