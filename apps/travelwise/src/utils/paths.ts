/**
 * True when `uri` is strictly inside `rootUri` (no ".." escape). The app only ever
 * deletes files it manages, even if a corrupted row points somewhere else.
 */
export function isManagedUri(uri: string, rootUri: string): boolean {
  const root = rootUri.endsWith('/') ? rootUri : `${rootUri}/`;
  return uri.startsWith(root) && !uri.slice(root.length).split('/').includes('..');
}
