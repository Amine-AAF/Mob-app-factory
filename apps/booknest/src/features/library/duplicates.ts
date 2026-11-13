import { isbnTo13, normalizeIsbn, normalizeKey } from '@/utils';

/**
 * Duplicate detection. Two books are duplicates when:
 * - they share a valid ISBN (ISBN-10 and ISBN-13 forms compare equal), or
 * - they have the same normalized title and the same normalized author
 *   (a missing author on either side still matches by title only, flagged as "possible").
 */
export interface DuplicateCandidate {
  id: string;
  title: string;
  authorName: string | null;
  isbn: string | null;
}

export type DuplicateMatch = { id: string; reason: 'isbn' | 'title_author' | 'title' };

export function duplicateKey(title: string, author: string | null | undefined): string {
  return `${normalizeKey(title)}|${author ? normalizeKey(author) : ''}`;
}

export function findDuplicate(
  input: { title: string; authorName?: string | null; isbn?: string | null },
  existing: readonly DuplicateCandidate[],
): DuplicateMatch | null {
  const isbn = normalizeIsbn(input.isbn);
  const isbn13 = isbn ? isbnTo13(isbn) : null;
  const title = normalizeKey(input.title);
  const author = input.authorName ? normalizeKey(input.authorName) : '';
  let titleOnly: DuplicateMatch | null = null;
  for (const b of existing) {
    const other = normalizeIsbn(b.isbn);
    if (isbn13 && other && isbnTo13(other) === isbn13) return { id: b.id, reason: 'isbn' };
    if (normalizeKey(b.title) !== title) continue;
    const otherAuthor = b.authorName ? normalizeKey(b.authorName) : '';
    // Both ISBNs known and different → different editions, not duplicates.
    if (isbn13 && other && isbnTo13(other) !== isbn13) continue;
    if (author && otherAuthor && author === otherAuthor) return { id: b.id, reason: 'title_author' };
    if (!author || !otherAuthor) titleOnly ??= { id: b.id, reason: 'title' };
  }
  return titleOnly;
}
