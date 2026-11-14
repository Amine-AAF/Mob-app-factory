import { addDays } from '@factory/app-core';

import type { Repositories } from '@/database';
import { canMove, type PlannedItem } from '@/features/planner/plan';
import type { DayKey, RoutineSlot } from '@/types';
import { useSession } from '@/store/session';

import { clock } from './clock';
import { startFromProgramDay } from './workoutService';

/**
 * Calendar actions. A routine occurrence is virtual until acted upon; acting on it
 * writes an explicit row flagged `from_routine`, which hides that day's routine slot.
 * Past entries are never rewritten: moving a routine day leaves a "moved" marker.
 */

export class PlannerError extends Error {
  constructor(public readonly code: 'invalid_target' | 'no_program') {
    super(code);
    this.name = 'PlannerError';
  }
}

/** Turns a virtual routine occurrence into an explicit entry (idempotent for explicit items). */
export async function materialize(r: Repositories, item: PlannedItem): Promise<string> {
  if (!item.virtual && item.entry) return item.entry.id;
  return r.planner.add({ day: item.day, kind: item.kind, programId: item.programId, programDayId: item.programDayId, time: item.time, note: null, fromRoutine: true, status: 'planned' });
}

export async function moveItem(r: Repositories, item: PlannedItem, to: DayKey): Promise<string> {
  if (!canMove(item.day, to, clock.today())) throw new PlannerError('invalid_target');
  let newId: string;
  await r.db.withTransactionAsync(async () => {
    if (item.fromRoutine) {
      const id = await materialize(r, item);
      await r.planner.update(id, { status: 'moved', movedTo: to });
    } else if (item.entry) {
      await r.planner.remove(item.entry.id);
    }
    newId = await r.planner.add({ day: to, kind: item.kind, programId: item.programId, programDayId: item.programDayId, time: item.time, note: item.entry?.note ?? null });
  });
  useSession.getState().bump();
  return newId!;
}

/** "Postpone": move to the next day (from today at the earliest). */
export async function postpone(r: Repositories, item: PlannedItem): Promise<string> {
  const today = clock.today();
  const to = addDays(item.day < today ? today : item.day, 1);
  return moveItem(r, item, to);
}

export async function skipItem(r: Repositories, item: PlannedItem): Promise<void> {
  const id = await materialize(r, item);
  await r.planner.update(id, { status: 'skipped' });
  useSession.getState().bump();
}

export async function restoreItem(r: Repositories, item: PlannedItem): Promise<void> {
  if (item.entry) {
    if (item.entry.fromRoutine) await r.planner.remove(item.entry.id);
    else await r.planner.update(item.entry.id, { status: 'planned', movedTo: null });
  }
  useSession.getState().bump();
}

export async function deleteItem(r: Repositories, item: PlannedItem): Promise<void> {
  if (item.virtual || item.fromRoutine) return skipItem(r, item);
  if (item.entry) await r.planner.remove(item.entry.id);
  useSession.getState().bump();
}

export async function startItem(r: Repositories, item: PlannedItem): Promise<string> {
  if (!item.programId) throw new PlannerError('no_program');
  const program = await r.programs.get(item.programId);
  const dayId = item.programDayId ?? program?.days[0]?.id;
  if (!program || !dayId) throw new PlannerError('no_program');
  const scheduleId = await materialize(r, item);
  return startFromProgramDay(r, program.id, dayId, scheduleId);
}

/** Saves the weekly routine; the routine applies from today on (earlier days keep their history). */
export async function saveRoutine(r: Repositories, slots: RoutineSlot[]): Promise<void> {
  await r.db.withTransactionAsync(async () => {
    await r.planner.clearRoutine();
    for (const s of slots) await r.planner.setRoutineSlot(s);
    await r.settings.set('routine_start', clock.today());
  });
  useSession.getState().bump();
}
