import { TASK_LIBRARY, type EventTemplate } from '@/content/templates';

import { addDaysTo, daysBetween } from './time';
import type { BudgetCategory, Task, TaskCategory, TaskPriority, TimelineItem } from './types';

/**
 * Turns a template (bundled or user-made) into editable records for an event.
 * Translation is injected so this stays pure and testable.
 */

export interface TemplatePlan {
  tasks: { title: string; category: TaskCategory; priority: TaskPriority; dueDate: string | null; sortOrder: number }[];
  timeline: { title: string; startMin: number; endMin: number; sortOrder: number }[];
  envelopes: { category: BudgetCategory; plannedMinor: number }[];
}

/** "HH:mm" where HH may exceed 23 (next day), e.g. "25:40" → 1540. */
export function parseClock(value: string): number {
  const m = /^(\d{1,2}):([0-5]\d)$/.exec(value);
  if (!m) throw new Error(`Invalid clock value: ${value}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Splits a budget by percentages; the rounding remainder goes to the largest share. */
export function splitBudget(totalMinor: number, split: Partial<Record<BudgetCategory, number>>): { category: BudgetCategory; plannedMinor: number }[] {
  const entries = Object.entries(split).filter(([, p]) => (p ?? 0) > 0) as [BudgetCategory, number][];
  const pct = entries.reduce((n, [, p]) => n + p, 0);
  if (totalMinor <= 0 || pct <= 0) return entries.map(([category]) => ({ category, plannedMinor: 0 }));
  const lines = entries.map(([category, p]) => ({ category, plannedMinor: Math.floor((totalMinor * p) / pct) }));
  const rest = totalMinor - lines.reduce((n, l) => n + l.plannedMinor, 0);
  const biggest = lines.reduce((a, b) => (b.plannedMinor > a.plannedMinor ? b : a), lines[0]!);
  biggest.plannedMinor += rest;
  return lines;
}

/**
 * Due date for a task `daysBefore` the event. Tasks whose ideal date is
 * already past are due today (so a late start isn't a wall of overdue tasks).
 */
export function dueDateFor(eventDate: string, daysBefore: number, today: string): string {
  const ideal = addDaysTo(eventDate, -daysBefore);
  if (daysBefore > 0 && ideal < today) return daysBetween(today, eventDate) >= 0 ? today : ideal;
  return ideal;
}

export function planFromTemplate(
  template: EventTemplate,
  input: { eventDate: string; today: string; budgetMinor: number; t: (key: string) => string },
): TemplatePlan {
  return {
    tasks: template.tasks.map((key, i) => {
      const seed = TASK_LIBRARY[key];
      return { title: input.t(`taskLibrary.${key}`), category: seed.category, priority: seed.priority, dueDate: dueDateFor(input.eventDate, seed.daysBefore, input.today), sortOrder: i };
    }),
    timeline: template.timeline.map(([key, start, duration], i) => {
      const startMin = parseClock(start);
      return { title: input.t(`timelineLibrary.${key}`), startMin, endMin: startMin + duration, sortOrder: i };
    }),
    envelopes: splitBudget(input.budgetMinor, template.budgetSplit),
  };
}

/* ------------------------------------------------------ User templates */

/** Payload stored in `event_templates.payload` when the user saves an event as a template. */
export interface CustomTemplatePayload {
  version: 1;
  typeId: string;
  expectedGuests: number;
  startTime: string | null;
  endTime: string | null;
  currency: string;
  budgetSplit: Partial<Record<BudgetCategory, number>>;
  tasks: { title: string; category: TaskCategory; priority: TaskPriority; daysBefore: number | null }[];
  timeline: { title: string; startMin: number; endMin: number }[];
}

export function payloadFromEvent(input: {
  typeId: string;
  expectedGuests: number;
  startTime: string | null;
  endTime: string | null;
  currency: string;
  eventDate: string;
  budgetMinor: number;
  envelopes: readonly { category: BudgetCategory; plannedMinor: number }[];
  tasks: readonly Pick<Task, 'title' | 'category' | 'priority' | 'dueDate' | 'status'>[];
  timeline: readonly Pick<TimelineItem, 'title' | 'startMin' | 'endMin'>[];
}): CustomTemplatePayload {
  const plannedTotal = input.envelopes.reduce((n, e) => n + e.plannedMinor, 0);
  const budgetSplit: Partial<Record<BudgetCategory, number>> = {};
  for (const e of input.envelopes) if (plannedTotal > 0 && e.plannedMinor > 0) budgetSplit[e.category] = Math.round((e.plannedMinor * 1000) / plannedTotal) / 10;
  return {
    version: 1,
    typeId: input.typeId,
    expectedGuests: input.expectedGuests,
    startTime: input.startTime,
    endTime: input.endTime,
    currency: input.currency,
    budgetSplit,
    tasks: input.tasks
      .filter((t) => t.status !== 'cancelled')
      .map((t) => ({ title: t.title, category: t.category, priority: t.priority, daysBefore: t.dueDate ? daysBetween(t.dueDate, input.eventDate) : null })),
    timeline: input.timeline.map((x) => ({ title: x.title, startMin: x.startMin, endMin: x.endMin })),
  };
}

export function planFromPayload(payload: CustomTemplatePayload, input: { eventDate: string; today: string; budgetMinor: number }): TemplatePlan {
  return {
    tasks: payload.tasks.map((t, i) => ({
      title: t.title,
      category: t.category,
      priority: t.priority,
      dueDate: t.daysBefore == null ? null : dueDateFor(input.eventDate, t.daysBefore, input.today),
      sortOrder: i,
    })),
    timeline: payload.timeline.map((x, i) => ({ ...x, sortOrder: i })),
    envelopes: splitBudget(input.budgetMinor, payload.budgetSplit),
  };
}

export function isCustomPayload(value: unknown): value is CustomTemplatePayload {
  const v = value as Partial<CustomTemplatePayload> | null;
  return !!v && v.version === 1 && Array.isArray(v.tasks) && Array.isArray(v.timeline) && typeof v.budgetSplit === 'object';
}
