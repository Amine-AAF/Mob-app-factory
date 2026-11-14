/** Locale-aware file sizes ("1.2 MB", "850 KB"), base 1000 like Android's file managers. */
export function formatFileSize(bytes: number, locale: string): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  const digits = unit === 0 ? 0 : value < 10 ? 1 : 0;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(value)} ${units[unit]}`;
}

export function formatDimensions(width: number, height: number, locale: string): string {
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return `${nf.format(width)} × ${nf.format(height)}`;
}

export function megapixels(width: number, height: number): number {
  return Math.round((width * height) / 100_000) / 10;
}

let counter = 0;
/** Collision-resistant id usable in file names (no crypto needed: not a secret). */
export function newId(prefix = ''): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}
