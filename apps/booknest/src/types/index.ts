/** Domain types. Database rows are mapped to these in src/database/repositories. */

export const BOOK_FORMATS = ['paperback', 'hardcover', 'ebook', 'audiobook'] as const;
export type BookFormat = (typeof BOOK_FORMATS)[number];

export const READING_STATUSES = ['want_to_read', 'reading', 'completed', 'on_hold', 'abandoned'] as const;
export type ReadingStatus = (typeof READING_STATUSES)[number];

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  /** Original title, kept independently of the interface language. */
  originalTitle: string | null;
  authorId: string | null;
  authorName: string | null;
  genreId: string | null;
  genreName: string | null;
  coverUri: string | null;
  coverThumbUri: string | null;
  isbn: string | null;
  publisher: string | null;
  publishedYear: number | null;
  pageCount: number | null;
  /** BCP-47 language code of the book itself (not of the interface). */
  language: string | null;
  format: BookFormat;
  acquiredOn: string | null;
  purchasePriceCents: number | null;
  currency: string | null;
  description: string | null;
  notes: string | null;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookInput {
  title: string;
  subtitle?: string | null;
  originalTitle?: string | null;
  authorName?: string | null;
  genreName?: string | null;
  coverUri?: string | null;
  coverThumbUri?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  pageCount?: number | null;
  language?: string | null;
  format?: BookFormat;
  acquiredOn?: string | null;
  purchasePriceCents?: number | null;
  currency?: string | null;
  description?: string | null;
  notes?: string | null;
  isFavorite?: boolean;
}

/** Lightweight row for large library lists (thousands of books). */
export interface BookListItem {
  id: string;
  title: string;
  authorName: string | null;
  coverThumbUri: string | null;
  format: BookFormat;
  pageCount: number | null;
  status: ReadingStatus;
  currentPage: number;
  isFavorite: boolean;
  isArchived: boolean;
  rating: number | null;
  genreName: string | null;
  updatedAt: string;
  audioProgress: number | null;
}

export interface ReadingRecord {
  id: string;
  bookId: string;
  attempt: number;
  status: ReadingStatus;
  startedOn: string | null;
  finishedOn: string | null;
  currentPage: number;
  isCurrent: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  recordId: string | null;
  day: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  startPage: number | null;
  endPage: number | null;
  startPositionSec: number | null;
  endPositionSec: number | null;
  notes: string | null;
  source: 'timer' | 'manual';
  createdAt: string;
}

export interface SessionTimer {
  bookId: string;
  startedAt: string;
  pausedAt: string | null;
  pausedMs: number;
  startPage: number | null;
  startPositionSec: number | null;
}

export const GOAL_TYPES = ['books_per_year', 'pages_per_month', 'minutes_per_day', 'days_per_week', 'custom'] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export interface ReadingGoal {
  id: string;
  type: GoalType;
  title: string | null;
  target: number;
  unit: string | null;
  manualProgress: number;
  challengeId: string | null;
  periodStart: string;
  periodEnd: string | null;
  isActive: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  bookId: string | null;
  bookTitle: string | null;
  text: string;
  authorName: string | null;
  page: number | null;
  tags: string[];
  comment: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export const NOTE_KINDS = ['impression', 'summary', 'reflection', 'character', 'idea', 'opinion', 'note'] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export interface ReadingNote {
  id: string;
  bookId: string | null;
  bookTitle: string | null;
  kind: NoteKind;
  title: string | null;
  body: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Recommendation = 'yes' | 'maybe' | 'no';

export interface Review {
  bookId: string;
  rating: number | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  readOn: string | null;
  recommend: Recommendation | null;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  presetKey: string | null;
  icon: string;
  color: string | null;
  sortOrder: number;
  isPinned: boolean;
  createdAt: string;
  bookCount: number;
  coverThumbs: string[];
}

export const WISHLIST_STATUSES = ['want_to_buy', 'want_to_read', 'purchased', 'added_to_library'] as const;
export type WishlistStatus = (typeof WISHLIST_STATUSES)[number];

export interface WishlistItem {
  id: string;
  title: string;
  author: string | null;
  coverUri: string | null;
  estimatedPriceCents: number | null;
  currency: string | null;
  store: string | null;
  url: string | null;
  priority: 1 | 2 | 3;
  notes: string | null;
  status: WishlistStatus;
  bookId: string | null;
  acquiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudiobookProgress {
  bookId: string;
  totalSeconds: number | null;
  positionSeconds: number;
  playbackSpeed: number | null;
  startedOn: string | null;
  finishedOn: string | null;
  updatedAt: string;
}

export interface AudiobookUpdate {
  id: string;
  bookId: string;
  day: string;
  fromSeconds: number;
  toSeconds: number;
  createdAt: string;
}

export const NOTIFICATION_KINDS = ['daily', 'weekly_goal', 'monthly_goal', 'challenge', 'resume_book', 'yearly_goal'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface NotificationSetting {
  kind: NotificationKind;
  enabled: boolean;
  hour: number;
  minute: number;
  /** 0 = Sunday … 6 = Saturday (JS convention). */
  weekday: number | null;
}

export interface CalendarDay {
  day: string;
  seconds: number;
  pages: number;
  sessions: number;
  finished: number;
}
