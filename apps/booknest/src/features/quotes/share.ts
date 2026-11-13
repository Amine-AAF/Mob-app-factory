import type { Quote } from '@/types';

/** Text used by "Copy" and "Share" (only on explicit user action). */
export function quoteShareText(q: Pick<Quote, 'text' | 'authorName' | 'bookTitle'>): string {
  const source = [q.authorName, q.bookTitle].filter(Boolean).join(', ');
  return `“${q.text}”${source ? `\n— ${source}` : ''}`;
}
