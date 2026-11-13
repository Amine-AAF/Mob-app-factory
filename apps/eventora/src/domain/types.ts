/**
 * Eventora domain model. Pure types shared by the database layer, the domain
 * logic and the screens. Persisted shapes mirror the SQLite tables
 * (see src/database/migrations.ts), in camelCase.
 *
 * Conventions
 * - Ids are opaque strings generated on the device (see ./ids.ts).
 * - Money is stored as integer minor units + ISO 4217 currency (see ./money.ts).
 * - Event dates are wall-clock values (YYYY-MM-DD + HH:mm) in the event's IANA
 *   time zone; `startUtc` is derived from them (see ./time.ts).
 */

export const EVENT_TYPE_IDS = [
  'wedding',
  'birthday',
  'engagement',
  'anniversary',
  'baby_shower',
  'graduation',
  'dinner_party',
  'family_gathering',
  'corporate_event',
  'conference',
  'workshop',
  'business_meeting',
  'holiday_party',
  'custom',
] as const;
export type EventTypeId = (typeof EVENT_TYPE_IDS)[number];

export const EVENT_STATUSES = ['draft', 'planning', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_THEMES = ['wedding', 'birthday', 'corporate', 'family', 'celebration'] as const;
export type EventTheme = (typeof EVENT_THEMES)[number];

export interface EventRecord {
  id: string;
  name: string;
  typeId: EventTypeId;
  coverUri: string | null;
  description: string;
  startDate: string; // YYYY-MM-DD (event time zone)
  startTime: string | null; // HH:mm, null = all day
  endDate: string | null;
  endTime: string | null;
  timezone: string; // IANA, e.g. "Europe/Paris"
  startUtc: string; // ISO instant derived from the fields above
  venue: string;
  address: string;
  expectedGuests: number;
  budgetMinor: number;
  currency: string;
  notes: string;
  status: EventStatus;
  theme: EventTheme;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EventInput = Omit<EventRecord, 'id' | 'startUtc' | 'createdAt' | 'updatedAt'>;

/* ---------------------------------------------------------------- Guests */

export const RSVP_STATUSES = ['not_invited', 'invited', 'confirmed', 'declined', 'maybe', 'no_response'] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const GUEST_CATEGORIES = ['family', 'friend', 'colleague', 'partner', 'vip', 'other'] as const;
export type GuestCategory = (typeof GUEST_CATEGORIES)[number];

export const GROUP_KINDS = ['family', 'friends', 'colleagues', 'other'] as const;
export type GroupKind = (typeof GROUP_KINDS)[number];

export interface GuestGroup {
  id: string;
  eventId: string;
  name: string;
  kind: GroupKind;
  notes: string;
}

export interface Guest {
  id: string;
  eventId: string;
  groupId: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  category: GuestCategory;
  /** Adult companions (plus-ones) coming with this guest. */
  plusOnes: number;
  /** Children coming with this guest. */
  children: number;
  /** True when the guest is themself a child (counts as a child seat/headcount). */
  isChild: boolean;
  dietary: string;
  notes: string;
  rsvpStatus: RsvpStatus;
  rsvpRespondedAt: string | null; // YYYY-MM-DD
  rsvpNote: string;
  createdAt: string;
  updatedAt: string;
}

export type GuestInput = Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>;

/** Where an RSVP answer came from. `online` is reserved for a future opt-in web RSVP. */
export const RSVP_SOURCES = ['manual', 'phone', 'message', 'in_person', 'import', 'online'] as const;
export type RsvpSource = (typeof RSVP_SOURCES)[number];

export interface RsvpRecord {
  id: string;
  guestId: string;
  status: RsvpStatus;
  source: RsvpSource;
  recordedAt: string; // ISO
  note: string;
}

/* ----------------------------------------------------------- Invitations */

export type InvitationFont = 'serif' | 'sans' | 'script' | 'condensed' | 'mono';
export type InvitationLayout = 'centered' | 'framed' | 'banner' | 'minimal' | 'split';

export interface InvitationDesign {
  templateId: string;
  background: string;
  foreground: string;
  accent: string;
  font: InvitationFont;
  layout: InvitationLayout;
  backgroundUri: string | null;
}

export interface Invitation {
  id: string;
  eventId: string;
  design: InvitationDesign;
  title: string;
  hosts: string;
  message: string;
  showDate: boolean;
  showTime: boolean;
  showVenue: boolean;
  rsvpLine: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------------------------------------------------------------- Budget */

export const BUDGET_CATEGORIES = [
  'venue',
  'catering',
  'decoration',
  'photography',
  'music',
  'entertainment',
  'invitations',
  'transportation',
  'accommodation',
  'flowers',
  'clothing',
  'gifts',
  'other',
] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'deposit', 'paid'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface CategoryBudget {
  id: string;
  eventId: string;
  category: BudgetCategory;
  plannedMinor: number;
}

export interface Expense {
  id: string;
  eventId: string;
  category: BudgetCategory;
  title: string;
  vendorId: string | null;
  estimatedMinor: number;
  actualMinor: number;
  currency: string;
  /**
   * Explicit, user-entered rate converting this expense's currency into the
   * event currency (1 unit of `currency` = fxRate units of event currency).
   * Null = not converted: the amount is reported separately, never summed.
   */
  fxRate: number | null;
  dueDate: string | null;
  paymentDate: string | null;
  paymentStatus: PaymentStatus;
  receiptUri: string | null;
  notes: string;
  createdAt: string;
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;

/* ----------------------------------------------------------------- Tasks */

export const TASK_STATUSES = ['todo', 'in_progress', 'completed', 'cancelled'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_CATEGORIES = ['venue', 'guests', 'vendors', 'decoration', 'food', 'logistics', 'program', 'admin', 'other'] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string | null; // YYYY-MM-DD
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  notes: string;
  vendorId: string | null;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'sortOrder'> & { sortOrder?: number };

/* -------------------------------------------------------------- Timeline */

export interface TimelineItem {
  id: string;
  eventId: string;
  title: string;
  description: string;
  /** Minutes from 00:00 of the event start date (event time zone). ≥ 1440 = next day. */
  startMin: number;
  endMin: number;
  location: string;
  owner: string;
  notes: string;
  sortOrder: number;
}

export type TimelineInput = Omit<TimelineItem, 'id'>;

/* --------------------------------------------------------------- Seating */

export const TABLE_SHAPES = ['round', 'rect', 'head', 'custom'] as const;
export type TableShape = (typeof TABLE_SHAPES)[number];

export interface SeatingTable {
  id: string;
  eventId: string;
  name: string;
  shape: TableShape;
  seats: number;
  notes: string;
  sortOrder: number;
}

export interface SeatingAssignment {
  id: string;
  tableId: string;
  guestId: string;
}

/* --------------------------------------------------------------- Vendors */

export const VENDOR_CATEGORIES = [
  'caterer',
  'photographer',
  'venue',
  'florist',
  'decorator',
  'dj',
  'musician',
  'transport',
  'other',
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_STATUSES = ['to_contact', 'contacted', 'quoted', 'selected', 'contracted', 'cancelled'] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: VendorCategory;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  quote: string;
  amountMinor: number;
  currency: string;
  status: VendorStatus;
  meetingAt: string | null; // ISO instant of the next appointment
  notes: string;
  createdAt: string;
}

export type VendorInput = Omit<Vendor, 'id' | 'createdAt'>;

export interface VendorContract {
  id: string;
  vendorId: string;
  title: string;
  fileUri: string | null;
  signedDate: string | null;
  amountMinor: number;
  depositMinor: number;
  currency: string;
  notes: string;
}

/* ----------------------------------------------------------------- Gifts */

export type GiftKind = 'gift' | 'contribution';

export interface Gift {
  id: string;
  eventId: string;
  guestId: string | null;
  kind: GiftKind;
  contributor: string;
  description: string;
  amountMinor: number;
  currency: string;
  receivedDate: string | null;
  thanked: boolean;
  thankedAt: string | null;
  notes: string;
  createdAt: string;
}

export type GiftInput = Omit<Gift, 'id' | 'createdAt'>;

/* ------------------------------------------------------- Notifications */

export const NOTIFICATION_KINDS = ['task_due', 'deadline_soon', 'event_upcoming', 'rsvp_followup', 'payment_due', 'vendor_meeting'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface NotificationSetting {
  kind: NotificationKind;
  enabled: boolean;
  /** How long before the due moment the reminder fires. */
  leadDays: number;
  /** Local hour of day reminders fire at (date-based reminders). */
  hour: number;
}
