/**
 * Output file naming. Outputs never overwrite an existing file and never reuse
 * the original's location: originals are left untouched.
 */
const MAX_BASE_LENGTH = 60;

/** Removes the extension and characters that are unsafe in file names on Android/FAT/SAF providers. */
export function baseNameOf(fileName: string): string {
  const withoutPath = fileName.split(/[\/]/).pop() ?? '';
  const dot = withoutPath.lastIndexOf('.');
  const raw = dot > 0 ? withoutPath.slice(0, dot) : withoutPath;
  const cleaned = raw
    .normalize('NFC')
    // eslint-disable-next-line no-control-regex -- control characters are exactly what we strip
    .replace(/[\u0000-\u001f\u007f<>:"/\|?*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '');
  const limited = Array.from(cleaned).slice(0, MAX_BASE_LENGTH).join('').trim();
  return limited.length > 0 ? limited : 'file';
}

export function outputFileName(originalName: string, suffix: string, extension: string): string {
  const base = baseNameOf(originalName);
  return `${base}${suffix ? `-${suffix}` : ''}.${extension.replace(/^\./, '')}`;
}

/** "name.jpg" -> "name (2).jpg" when taken (case-insensitive, like Android providers). */
export function uniqueFileName(desired: string, taken: Iterable<string>): string {
  const used = new Set(Array.from(taken, (n) => n.toLowerCase()));
  if (!used.has(desired.toLowerCase())) return desired;
  const dot = desired.lastIndexOf('.');
  const stem = dot > 0 ? desired.slice(0, dot) : desired;
  const ext = dot > 0 ? desired.slice(dot) : '';
  for (let i = 2; i < 10_000; i++) {
    const candidate = `${stem} (${i})${ext}`;
    if (!used.has(candidate.toLowerCase())) return candidate;
  }
  return `${stem}-${Date.now()}${ext}`;
}

/** Zero-padded page labels so split outputs sort correctly: page-007.pdf */
export function pageLabel(pageNumber: number, pageCount: number): string {
  return String(pageNumber).padStart(String(pageCount).length, '0');
}
