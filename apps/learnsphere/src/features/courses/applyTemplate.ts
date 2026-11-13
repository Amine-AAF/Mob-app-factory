import { addDays, type DayKey } from '@factory/app-core';

import type { LabelSpec, TemplateDef } from '@/content/templates';
import type { Repositories } from '@/database';

/**
 * Turns a template into real data: a subject, its courses and chapters, a recurring session
 * series, goals, and (for exam templates) an exam with its preparation checklist.
 * Everything is created in one transaction: either the whole plan exists or nothing does.
 */
export interface TemplateCustomization {
  subjectName: string;
  color: string;
  icon: string;
  startDay: DayKey;
  weeks: number;
  /** ISO weekdays 1..7 */
  days: number[];
  minutes: number;
  startMinute: number;
  createSessions: boolean;
  createGoals: boolean;
}

export function defaultCustomization(tpl: TemplateDef, name: string, today: DayKey): TemplateCustomization {
  return {
    subjectName: name,
    color: tpl.color,
    icon: tpl.icon,
    startDay: today,
    weeks: tpl.weeks,
    days: tpl.sessions.days,
    minutes: tpl.sessions.minutes,
    startMinute: tpl.sessions.startMinute,
    createSessions: true,
    createGoals: true,
  };
}

/** Sessions are materialised for at most 12 weeks ahead to keep the planner light. */
export const MAX_SESSION_WEEKS = 12;

export function targetDay(c: Pick<TemplateCustomization, 'startDay' | 'weeks'>): DayKey {
  return addDays(c.startDay, Math.max(1, Math.round(c.weeks)) * 7 - 1);
}

export async function applyTemplate(repos: Repositories, tpl: TemplateDef, c: TemplateCustomization, label: (spec: LabelSpec) => string): Promise<string> {
  const target = targetDay(c);
  let subjectId = '';
  await repos.db.withTransactionAsync(async () => {
    subjectId = await repos.subjects.create({
      name: c.subjectName,
      description: '',
      color: c.color,
      icon: c.icon,
      objective: '',
      startDay: c.startDay,
      targetDay: target,
    });
    for (const course of tpl.courses) {
      const courseId = await repos.subjects.createCourse(subjectId, label(course.label));
      for (const ch of course.chapters) await repos.subjects.createChapter(courseId, label(ch), ch.key === 'module' ? 'module' : 'chapter');
    }
    if (c.createSessions && c.days.length > 0) {
      const until = addDays(c.startDay, Math.min(Math.max(1, c.weeks), MAX_SESSION_WEEKS) * 7 - 1);
      await repos.planner.createRecurring(
        { subjectId, title: c.subjectName, goal: '', startMinute: c.startMinute, durationMin: c.minutes },
        { frequency: 'weekly', weekdays: c.days, interval: 1, startDay: c.startDay, untilDay: until < target ? until : target },
      );
    }
    if (c.createGoals) {
      for (const g of tpl.goals) {
        await repos.goals.create({ title: c.subjectName, period: g.period, metric: g.metric, target: g.target, subjectId, startDay: null, endDay: null });
      }
    }
    if (tpl.exam) {
      const { id } = await repos.agenda.create({ kind: tpl.exam.kind, title: c.subjectName, subjectId, day: target, minute: null, priority: 'high', notes: '' });
      for (const key of tpl.exam.checklist) await repos.agenda.addChecklistItem('exams', id, label({ key }));
    }
  });
  return subjectId;
}
