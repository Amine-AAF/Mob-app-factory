/**
 * True when `uri` is strictly inside `rootUri` (no ".." escape). The app only ever
 * deletes files it manages, even if a corrupted row points somewhere else.
 */
export function isManagedUri(uri: string, rootUri: string): boolean {
  const root = rootUri.endsWith('/') ? rootUri : `${rootUri}/`;
  return uri.startsWith(root) && !uri.slice(root.length).split('/').includes('..');
}

/** File extension for a stored copy, from its MIME type (the original name is not kept). */
export function extensionFor(mimeType: string, fallbackName?: string): string {
  const byMime: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' };
  const fromName = fallbackName?.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase();
  return byMime[mimeType.toLowerCase()] ?? fromName ?? 'bin';
}
