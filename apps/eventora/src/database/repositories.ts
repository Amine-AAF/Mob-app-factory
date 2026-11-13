import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { eventType } from '@/content/eventTypes';
import { findTemplate } from '@/content/templates';
import { newId } from '@/domain/ids';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/domain/reminders';
import { isCustomPayload, payloadFromEvent, planFromPayload, planFromTemplate, type CustomTemplatePayload, type TemplatePlan } from '@/domain/templateApply';
import { addDaysTo, daysBetween, eventStartUtc } from '@/domain/time';
import {
  NOTIFICATION_KINDS,
  type BudgetCategory,
  type CategoryBudget,
  type EventInput,
  type EventRecord,
  type Expense,
  type ExpenseInput,
  type Gift,
  type GiftInput,
  type Guest,
  type GuestGroup,
  type GuestInput,
  type Invitation,
  type NotificationKind,
  type NotificationSetting,
  type RsvpRecord,
  type RsvpSource,
  type RsvpStatus,
  type SeatingTable,
  type Task,
  type TaskInput,
  type TimelineInput,
  type TimelineItem,
  type Vendor,
  type VendorContract,
  type VendorInput,
} from '@/domain/types';

import { T } from './tables';

export interface Clock {
  now(): Date;
}

export interface CustomTemplate {
  id: string;
  name: string;
  baseType: string;
  payload: CustomTemplatePayload;
  createdAt: string;
}

export interface CreateEventOptions {
  templateId?: string | null;
  customTemplateId?: string | null;
  /** Translator for template texts (task / activity titles). */
  t?: (key: string) => string;
  today?: string;
}

export function createRepositories(db: SqlDatabase, clock: Clock) {
  const iso = () => clock.now().toISOString();
  const tx = (fn: () => Promise<void>) => db.withTransactionAsync(fn);

  async function applyPlan(eventId: string, plan: TemplatePlan) {
    for (const t of plan.tasks) {
      await T.tasks.insert(db, {
        id: newId(), eventId, title: t.title, description: '', assignee: '', dueDate: t.dueDate, priority: t.priority,
        category: t.category, status: 'todo', notes: '', vendorId: null, sortOrder: t.sortOrder, completedAt: null, createdAt: iso(),
      });
    }
    for (const x of plan.timeline) {
      await T.timeline.insert(db, { id: newId(), eventId, title: x.title, description: '', startMin: x.startMin, endMin: x.endMin, location: '', owner: '', notes: '', sortOrder: x.sortOrder });
    }
    for (const env of plan.envelopes) await setEnvelope(eventId, env.category, env.plannedMinor);
  }

  async function setEnvelope(eventId: string, category: BudgetCategory, plannedMinor: number) {
    await db.runAsync(
      'INSERT INTO event_budgets (id, event_id, category, planned_minor) VALUES (?, ?, ?, ?) ON CONFLICT(event_id, category) DO UPDATE SET planned_minor = excluded.planned_minor',
      [newId(), eventId, category, Math.max(0, Math.round(plannedMinor))],
    );
  }

  /* ---------------------------------------------------------------- Events */

  const events = {
    list: () => T.events.where(db, '', [], 'start_utc ASC'),
    get: (id: string) => T.events.get(db, id),

    async create(input: EventInput, opts: CreateEventOptions = {}): Promise<EventRecord> {
      const now = iso();
      const record: EventRecord = { ...input, id: newId(), startUtc: eventStartUtc(input).toISOString(), createdAt: now, updatedAt: now };
      const today = opts.today ?? now.slice(0, 10);
      let plan: TemplatePlan | null = null;
      const bundled = findTemplate(opts.templateId);
      if (bundled) plan = planFromTemplate(bundled, { eventDate: input.startDate, today, budgetMinor: input.budgetMinor, t: opts.t ?? ((k) => k) });
      else if (opts.customTemplateId) {
        const custom = await templates.get(opts.customTemplateId);
        if (custom) plan = planFromPayload(custom.payload, { eventDate: input.startDate, today, budgetMinor: input.budgetMinor });
      }
      await tx(async () => {
        await T.events.insert(db, { ...record, templateId: bundled?.id ?? opts.customTemplateId ?? input.templateId ?? null });
        if (plan) await applyPlan(record.id, plan);
        else for (const c of eventType(input.typeId).categories) await setEnvelope(record.id, c, 0);
      });
      return (await T.events.get(db, record.id)) as EventRecord;
    },

    async update(id: string, patch: Partial<EventInput>): Promise<void> {
      const current = await T.events.get(db, id);
      if (!current) return;
      const next = { ...current, ...patch };
      await T.events.update(db, id, { ...patch, startUtc: eventStartUtc(next).toISOString(), updatedAt: iso() });
    },

    async setStatus(id: string, status: EventRecord['status']) {
      await T.events.update(db, id, { status, updatedAt: iso() });
    },

    remove: (id: string) => T.events.remove(db, id),

    /**
     * Duplicates the configuration of an event: budget envelopes, tasks
     * (reset to "to do", due dates shifted with the new date), programme,
     * tables, vendors (reset to "to contact") and invitation design.
     * Guests, RSVPs, expenses and gifts are personal to the original event and
     * are copied only when `withGuests` is true (guests reset to "not invited").
     */
    async duplicate(id: string, opts: { name: string; startDate: string; withGuests?: boolean }): Promise<EventRecord | null> {
      const src = await T.events.get(db, id);
      if (!src) return null;
      const shift = daysBetween(src.startDate, opts.startDate);
      const now = iso();
      const copy: EventRecord = {
        ...src,
        id: newId(),
        name: opts.name,
        startDate: opts.startDate,
        endDate: src.endDate ? addDaysTo(src.endDate, shift) : null,
        status: 'planning',
        createdAt: now,
        updatedAt: now,
      };
      copy.startUtc = eventStartUtc(copy).toISOString();
      await tx(async () => {
        await T.events.insert(db, copy);
        for (const b of await T.budgets.where(db, 'event_id = ?', [id])) await T.budgets.insert(db, { ...b, id: newId(), eventId: copy.id });
        const vendorMap = new Map<string, string>();
        for (const v of await T.vendors.where(db, 'event_id = ?', [id])) {
          const nid = newId();
          vendorMap.set(v.id, nid);
          await T.vendors.insert(db, { ...v, id: nid, eventId: copy.id, status: v.status === 'cancelled' ? 'cancelled' : 'to_contact', meetingAt: null, createdAt: now });
        }
        for (const t of await T.tasks.where(db, 'event_id = ?', [id])) {
          if (t.status === 'cancelled') continue;
          await T.tasks.insert(db, { ...t, id: newId(), eventId: copy.id, status: 'todo', completedAt: null, dueDate: t.dueDate ? addDaysTo(t.dueDate, shift) : null, vendorId: t.vendorId ? (vendorMap.get(t.vendorId) ?? null) : null, createdAt: now });
        }
        for (const x of await T.timeline.where(db, 'event_id = ?', [id])) await T.timeline.insert(db, { ...x, id: newId(), eventId: copy.id });
        for (const tb of await T.tables.where(db, 'event_id = ?', [id])) await T.tables.insert(db, { ...tb, id: newId(), eventId: copy.id });
        for (const inv of await T.invitations.where(db, 'event_id = ?', [id])) await T.invitations.insert(db, { ...inv, id: newId(), eventId: copy.id, createdAt: now, updatedAt: now });
        if (opts.withGuests) {
          const groupMap = new Map<string, string>();
          for (const g of await T.groups.where(db, 'event_id = ?', [id])) {
            const nid = newId();
            groupMap.set(g.id, nid);
            await T.groups.insert(db, { ...g, id: nid, eventId: copy.id });
          }
          for (const g of await T.guests.where(db, 'event_id = ?', [id])) {
            await T.guests.insert(db, { ...g, id: newId(), eventId: copy.id, groupId: g.groupId ? (groupMap.get(g.groupId) ?? null) : null, rsvpStatus: 'not_invited', rsvpRespondedAt: null, rsvpNote: '', createdAt: now, updatedAt: now });
          }
        }
      });
      return T.events.get(db, copy.id);
    },
  };

  /* ---------------------------------------------------------------- Guests */

  const guests = {
    list: (eventId: string) => T.guests.where(db, 'event_id = ?', [eventId], 'last_name COLLATE NOCASE, first_name COLLATE NOCASE'),
    listAll: () => T.guests.where(db, '', []),
    get: (id: string) => T.guests.get(db, id),
    count: (eventId: string) => T.guests.count(db, 'event_id = ?', [eventId]),

    async add(input: GuestInput): Promise<Guest> {
      const now = iso();
      const guest: Guest = { ...input, id: newId(), createdAt: now, updatedAt: now };
      await tx(async () => {
        await T.guests.insert(db, guest);
        if (input.rsvpStatus !== 'not_invited') await recordRsvp(guest.id, input.rsvpStatus, 'manual', input.rsvpNote);
      });
      return guest;
    },

    async update(id: string, patch: Partial<GuestInput>): Promise<void> {
      const current = await T.guests.get(db, id);
      if (!current) return;
      await tx(async () => {
        await T.guests.update(db, id, { ...patch, updatedAt: iso() });
        if (patch.rsvpStatus && patch.rsvpStatus !== current.rsvpStatus) await recordRsvp(id, patch.rsvpStatus, 'manual', patch.rsvpNote ?? '');
      });
    },

    /** Updates the RSVP status, the response date and the history in one transaction. */
    async setRsvp(id: string, status: RsvpStatus, opts: { source?: RsvpSource; note?: string; respondedAt?: string | null } = {}): Promise<void> {
      const answered = status === 'confirmed' || status === 'declined' || status === 'maybe';
      await tx(async () => {
        await T.guests.update(db, id, {
          rsvpStatus: status,
          rsvpRespondedAt: answered ? (opts.respondedAt ?? clock.now().toISOString().slice(0, 10)) : null,
          ...(opts.note !== undefined ? { rsvpNote: opts.note } : {}),
          updatedAt: iso(),
        });
        await recordRsvp(id, status, opts.source ?? 'manual', opts.note ?? '');
      });
    },

    async bulkSetRsvp(ids: readonly string[], status: RsvpStatus): Promise<void> {
      for (const id of ids) await guests.setRsvp(id, status);
    },

    remove: (id: string) => T.guests.remove(db, id),

    history: (guestId: string) => T.rsvp.where(db, 'guest_id = ?', [guestId], 'recorded_at DESC'),

    /** Imports parsed CSV rows atomically, creating groups by name. */
    async importMany(eventId: string, rows: readonly { guest: Omit<GuestInput, 'eventId' | 'groupId'>; groupName: string }[]): Promise<number> {
      const now = iso();
      let n = 0;
      await tx(async () => {
        const existing = await T.groups.where(db, 'event_id = ?', [eventId]);
        const byName = new Map(existing.map((g) => [g.name.trim().toLowerCase(), g.id]));
        for (const r of rows) {
          let groupId: string | null = null;
          const gname = r.groupName.trim();
          if (gname) {
            groupId = byName.get(gname.toLowerCase()) ?? null;
            if (!groupId) {
              groupId = newId();
              await T.groups.insert(db, { id: groupId, eventId, name: gname, kind: 'family', notes: '' });
              byName.set(gname.toLowerCase(), groupId);
            }
          }
          const id = newId();
          await T.guests.insert(db, { ...r.guest, id, eventId, groupId, createdAt: now, updatedAt: now });
          if (r.guest.rsvpStatus !== 'not_invited') await recordRsvp(id, r.guest.rsvpStatus, 'import', '');
          n++;
        }
      });
      return n;
    },

    /** Merges `dropId` into `keepId`: keeps the richest data, moves seat, gifts. */
    async merge(keepId: string, dropId: string): Promise<void> {
      const keep = await T.guests.get(db, keepId);
      const drop = await T.guests.get(db, dropId);
      if (!keep || !drop || keep.eventId !== drop.eventId) return;
      const pick = (a: string, b: string) => (a.trim() ? a : b);
      await tx(async () => {
        await T.guests.update(db, keepId, {
          phone: pick(keep.phone, drop.phone),
          email: pick(keep.email, drop.email),
          dietary: pick(keep.dietary, drop.dietary),
          notes: [keep.notes, drop.notes].filter((x) => x.trim()).join('\n'),
          plusOnes: Math.max(keep.plusOnes, drop.plusOnes),
          children: Math.max(keep.children, drop.children),
          groupId: keep.groupId ?? drop.groupId,
          updatedAt: iso(),
        });
        await db.runAsync('UPDATE gifts SET guest_id = ? WHERE guest_id = ?', [keepId, dropId]);
        await db.runAsync('UPDATE rsvp_records SET guest_id = ? WHERE guest_id = ?', [keepId, dropId]);
        await T.guests.remove(db, dropId);
      });
    },
  };

  async function recordRsvp(guestId: string, status: RsvpStatus, source: RsvpSource, note: string) {
    const rec: RsvpRecord = { id: newId(), guestId, status, source, recordedAt: iso(), note };
    await T.rsvp.insert(db, rec);
  }

  const groups = {
    list: (eventId: string) => T.groups.where(db, 'event_id = ?', [eventId], 'name COLLATE NOCASE'),
    async add(input: Omit<GuestGroup, 'id'>): Promise<GuestGroup> {
      const g = { ...input, id: newId() };
      await T.groups.insert(db, g);
      return g;
    },
    update: (id: string, patch: Partial<Omit<GuestGroup, 'id' | 'eventId'>>) => T.groups.update(db, id, patch),
    remove: (id: string) => T.groups.remove(db, id),
  };

  /* ----------------------------------------------------------- Invitations */

  const invitations = {
    list: (eventId: string) => T.invitations.where(db, 'event_id = ?', [eventId], 'updated_at DESC'),
    get: (id: string) => T.invitations.get(db, id),
    async save(inv: Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
      const now = iso();
      if (inv.id && (await T.invitations.get(db, inv.id))) {
        const { id, ...rest } = inv;
        await T.invitations.update(db, id, { ...rest, updatedAt: now });
        return id;
      }
      const id = newId();
      await T.invitations.insert(db, { ...inv, id, createdAt: now, updatedAt: now });
      return id;
    },
    remove: (id: string) => T.invitations.remove(db, id),
  };

  /* ---------------------------------------------------------------- Budget */

  const budget = {
    envelopes: (eventId: string) => T.budgets.where(db, 'event_id = ?', [eventId]),
    setEnvelope,
    async removeEnvelope(eventId: string, category: BudgetCategory) {
      await db.runAsync('DELETE FROM event_budgets WHERE event_id = ? AND category = ?', [eventId, category]);
    },
    expenses: (eventId: string) => T.expenses.where(db, 'event_id = ?', [eventId], 'COALESCE(due_date, payment_date, created_at) ASC'),
    allExpenses: () => T.expenses.where(db, '', []),
    getExpense: (id: string) => T.expenses.get(db, id),
    async addExpense(input: ExpenseInput): Promise<Expense> {
      const e: Expense = { ...input, id: newId(), createdAt: iso() };
      await T.expenses.insert(db, e);
      return e;
    },
    updateExpense: (id: string, patch: Partial<ExpenseInput>) => T.expenses.update(db, id, patch),
    removeExpense: (id: string) => T.expenses.remove(db, id),
  };

  /* ----------------------------------------------------------------- Tasks */

  const tasks = {
    list: (eventId: string) => T.tasks.where(db, 'event_id = ?', [eventId], 'sort_order ASC'),
    listAll: () => T.tasks.where(db, '', []),
    get: (id: string) => T.tasks.get(db, id),
    async add(input: TaskInput): Promise<Task> {
      const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM tasks WHERE event_id = ?', [input.eventId]);
      const task: Task = { ...input, sortOrder: input.sortOrder ?? (max?.m ?? -1) + 1, id: newId(), createdAt: iso(), completedAt: input.status === 'completed' ? iso() : null };
      await T.tasks.insert(db, task);
      return task;
    },
    async update(id: string, patch: Partial<TaskInput>) {
      const extra = patch.status ? { completedAt: patch.status === 'completed' ? iso() : null } : {};
      await T.tasks.update(db, id, { ...patch, ...extra });
    },
    remove: (id: string) => T.tasks.remove(db, id),
  };

  /* -------------------------------------------------------------- Timeline */

  const timeline = {
    list: (eventId: string) => T.timeline.where(db, 'event_id = ?', [eventId], 'start_min ASC, sort_order ASC'),
    async add(input: TimelineInput): Promise<TimelineItem> {
      const item = { ...input, id: newId() };
      await T.timeline.insert(db, item);
      return item;
    },
    update: (id: string, patch: Partial<TimelineInput>) => T.timeline.update(db, id, patch),
    remove: (id: string) => T.timeline.remove(db, id),
    /** Persists a reordered/shifted programme in one transaction. */
    async saveAll(items: readonly TimelineItem[]) {
      await tx(async () => {
        for (const x of items) await T.timeline.update(db, x.id, { startMin: x.startMin, endMin: x.endMin, sortOrder: x.sortOrder });
      });
    },
  };

  /* --------------------------------------------------------------- Seating */

  const seating = {
    tables: (eventId: string) => T.tables.where(db, 'event_id = ?', [eventId], 'sort_order ASC'),
    async assignments(eventId: string) {
      return db
        .getAllAsync<Record<string, string>>('SELECT a.* FROM seating_assignments a JOIN seating_tables t ON t.id = a.table_id WHERE t.event_id = ?', [eventId])
        .then((rows) => rows.map((r) => T.assignments.fromRow(r)));
    },
    async addTable(input: Omit<SeatingTable, 'id' | 'sortOrder'>): Promise<SeatingTable> {
      const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM seating_tables WHERE event_id = ?', [input.eventId]);
      const table: SeatingTable = { ...input, id: newId(), sortOrder: (max?.m ?? -1) + 1 };
      await T.tables.insert(db, table);
      return table;
    },
    updateTable: (id: string, patch: Partial<Omit<SeatingTable, 'id' | 'eventId'>>) => T.tables.update(db, id, patch),
    removeTable: (id: string) => T.tables.remove(db, id),
    /** Seats (or moves) a guest at a table; a guest has at most one seat. */
    async assign(guestId: string, tableId: string) {
      await db.runAsync('INSERT INTO seating_assignments (id, table_id, guest_id) VALUES (?, ?, ?) ON CONFLICT(guest_id) DO UPDATE SET table_id = excluded.table_id', [newId(), tableId, guestId]);
    },
    async assignMany(pairs: readonly { guestId: string; tableId: string }[]) {
      await tx(async () => {
        for (const p of pairs) await seating.assign(p.guestId, p.tableId);
      });
    },
    async unassign(guestId: string) {
      await db.runAsync('DELETE FROM seating_assignments WHERE guest_id = ?', [guestId]);
    },
    async clear(eventId: string) {
      await db.runAsync('DELETE FROM seating_assignments WHERE table_id IN (SELECT id FROM seating_tables WHERE event_id = ?)', [eventId]);
    },
  };

  /* --------------------------------------------------------------- Vendors */

  const vendors = {
    list: (eventId: string) => T.vendors.where(db, 'event_id = ?', [eventId], 'name COLLATE NOCASE'),
    listAll: () => T.vendors.where(db, '', []),
    get: (id: string) => T.vendors.get(db, id),
    count: (eventId: string) => T.vendors.count(db, 'event_id = ?', [eventId]),
    async add(input: VendorInput): Promise<Vendor> {
      const v: Vendor = { ...input, id: newId(), createdAt: iso() };
      await T.vendors.insert(db, v);
      return v;
    },
    update: (id: string, patch: Partial<VendorInput>) => T.vendors.update(db, id, patch),
    remove: (id: string) => T.vendors.remove(db, id),
    contracts: (vendorId: string) => T.contracts.where(db, 'vendor_id = ?', [vendorId]),
    async addContract(input: Omit<VendorContract, 'id'>): Promise<VendorContract> {
      const c = { ...input, id: newId() };
      await T.contracts.insert(db, c);
      return c;
    },
    removeContract: (id: string) => T.contracts.remove(db, id),
    linkedExpenses: (vendorId: string) => T.expenses.where(db, 'vendor_id = ?', [vendorId]),
    linkedTasks: (vendorId: string) => T.tasks.where(db, 'vendor_id = ?', [vendorId]),
  };

  /* ----------------------------------------------------------------- Gifts */

  const gifts = {
    list: (eventId: string) => T.gifts.where(db, 'event_id = ?', [eventId], 'COALESCE(received_date, created_at) DESC'),
    get: (id: string) => T.gifts.get(db, id),
    async add(input: GiftInput): Promise<Gift> {
      const g: Gift = { ...input, id: newId(), createdAt: iso() };
      await T.gifts.insert(db, g);
      return g;
    },
    update: (id: string, patch: Partial<GiftInput>) => T.gifts.update(db, id, patch),
    async setThanked(id: string, thanked: boolean) {
      await T.gifts.update(db, id, { thanked, thankedAt: thanked ? clock.now().toISOString().slice(0, 10) : null });
    },
    remove: (id: string) => T.gifts.remove(db, id),
  };

  /* ------------------------------------------------------ Custom templates */

  const templates = {
    async list(): Promise<CustomTemplate[]> {
      const rows = await db.getAllAsync<{ id: string; name: string; base_type: string; payload: string; created_at: string }>('SELECT * FROM event_templates ORDER BY created_at DESC', []);
      return rows
        .map((r) => ({ id: r.id, name: r.name, baseType: r.base_type, payload: fromJson<unknown>(r.payload, null), createdAt: r.created_at }))
        .filter((r): r is CustomTemplate => isCustomPayload(r.payload));
    },
    async get(id: string): Promise<CustomTemplate | null> {
      return (await templates.list()).find((t) => t.id === id) ?? null;
    },
    async saveFromEvent(eventId: string, name: string): Promise<string | null> {
      const e = await T.events.get(db, eventId);
      if (!e) return null;
      const payload = payloadFromEvent({
        typeId: e.typeId,
        expectedGuests: e.expectedGuests,
        startTime: e.startTime,
        endTime: e.endTime,
        currency: e.currency,
        eventDate: e.startDate,
        budgetMinor: e.budgetMinor,
        envelopes: await T.budgets.where(db, 'event_id = ?', [eventId]),
        tasks: await T.tasks.where(db, 'event_id = ?', [eventId]),
        timeline: await T.timeline.where(db, 'event_id = ?', [eventId]),
      });
      const id = newId();
      await db.runAsync('INSERT INTO event_templates (id, name, base_type, payload, created_at) VALUES (?, ?, ?, ?, ?)', [id, name, e.typeId, toJson(payload), iso()]);
      return id;
    },
    async remove(id: string) {
      await db.runAsync('DELETE FROM event_templates WHERE id = ?', [id]);
    },
  };

  /* -------------------------------------------------------------- Settings */

  const settings = {
    async notifications(): Promise<Record<NotificationKind, NotificationSetting>> {
      const rows = await db.getAllAsync<{ kind: string; enabled: number; lead_days: number; hour: number }>('SELECT * FROM notification_settings', []);
      const out = { ...DEFAULT_NOTIFICATION_SETTINGS };
      for (const r of rows) {
        if ((NOTIFICATION_KINDS as readonly string[]).includes(r.kind)) {
          out[r.kind as NotificationKind] = { kind: r.kind as NotificationKind, enabled: r.enabled === 1, leadDays: r.lead_days, hour: r.hour };
        }
      }
      return out;
    },
    async setNotification(s: NotificationSetting) {
      await db.runAsync(
        'INSERT INTO notification_settings (kind, enabled, lead_days, hour) VALUES (?, ?, ?, ?) ON CONFLICT(kind) DO UPDATE SET enabled = excluded.enabled, lead_days = excluded.lead_days, hour = excluded.hour',
        [s.kind, s.enabled ? 1 : 0, Math.max(0, Math.min(365, Math.round(s.leadDays))), Math.max(0, Math.min(23, Math.round(s.hour)))],
      );
    },
    async get<V>(key: string, fallback: V): Promise<V> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
      return r ? fromJson<V>(r.value, fallback) : fallback;
    },
    async set<V>(key: string, value: V) {
      await db.runAsync('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, toJson(value)]);
    },
  };

  /** Everything about one event, for dashboards and reports. */
  async function snapshot(eventId: string) {
    const event = await T.events.get(db, eventId);
    if (!event) return null;
    const [guestList, groupList, envelopes, expenseList, taskList, timelineList, tableList, assignmentList, vendorList, giftList, invitationList] = await Promise.all([
      guests.list(eventId),
      groups.list(eventId),
      budget.envelopes(eventId),
      budget.expenses(eventId),
      tasks.list(eventId),
      timeline.list(eventId),
      seating.tables(eventId),
      seating.assignments(eventId),
      vendors.list(eventId),
      gifts.list(eventId),
      invitations.list(eventId),
    ]);
    return {
      event,
      guests: guestList,
      groups: groupList,
      envelopes: envelopes as CategoryBudget[],
      expenses: expenseList,
      tasks: taskList,
      timeline: timelineList,
      tables: tableList,
      assignments: assignmentList,
      vendors: vendorList,
      gifts: giftList,
      invitations: invitationList,
    };
  }

  return { db, events, guests, groups, invitations, budget, tasks, timeline, seating, vendors, gifts, templates, settings, snapshot };
}

export type Repositories = ReturnType<typeof createRepositories>;
export type EventSnapshot = NonNullable<Awaited<ReturnType<Repositories['snapshot']>>>;
