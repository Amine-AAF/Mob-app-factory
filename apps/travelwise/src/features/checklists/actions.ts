import type { TaskStatus } from '@/constants/domain';
import { repos } from '@/database';
import type { TaskInput } from '@/database/repositories/checklists';
import { track } from '@/services/analytics';
import { cancelReminder, scheduleTaskReminder } from '@/services/reminders';
import { notifyDataChanged } from '@/store/session';
import type { Id, LocalDate } from '@/types/models';

/** Pre-departure tasks with optional local reminders. */
async function refreshReminder(id: Id, heading: string) {
  const item = await repos().checklists.get(id);
  if (item) await scheduleTaskReminder(item, heading);
}

async function emitIfComplete(tripId: Id) {
  const items = await repos().checklists.items(tripId);
  if (items.length && items.every((i) => i.status === 'done')) track('checklist_completed', { kind: 'tasks' });
}

export async function addTask(tripId: Id, checklistName: string, input: TaskInput, reminderHeading: string) {
  const list = await repos().checklists.ensureChecklist(tripId, checklistName);
  const item = await repos().checklists.add(list.id, input);
  await refreshReminder(item.id, reminderHeading);
  notifyDataChanged();
  return item;
}

export async function updateTask(id: Id, input: TaskInput, reminderHeading: string) {
  const item = await repos().checklists.update(id, input);
  await refreshReminder(item.id, reminderHeading);
  notifyDataChanged();
  return item;
}

export async function setTaskStatus(tripId: Id, id: Id, status: TaskStatus, reminderHeading: string) {
  await repos().checklists.setStatus(id, status);
  // A done task has no reminder; reopening it reschedules a future one.
  await refreshReminder(id, reminderHeading);
  if (status === 'done') await emitIfComplete(tripId);
  notifyDataChanged();
}

export async function deleteTask(id: Id) {
  const notificationId = await repos().checklists.remove(id);
  await cancelReminder(notificationId);
  notifyDataChanged();
}

export async function addSuggestedTasks(tripId: Id, checklistName: string, lang: string, opts: { international: boolean; startDate: LocalDate | null; today: LocalDate }) {
  const n = await repos().checklists.addSuggested(tripId, checklistName, lang, opts);
  notifyDataChanged();
  return n;
}
