import type { Repositories } from '@/database';
import { addDays, endOfMonth, startOfMonth, type DayKey } from '@/domain/dates';
import type { Money } from '@/domain/money';
import { dueStatus, type DueStatus } from '@/domain/recurrence';
import type { Asset, HomeDocument, HouseholdTask, MaintenanceTask, Repair } from '@/domain/types';
import { EXPIRING_WINDOW_DAYS } from '@/domain/warranty';

export type AlertKind = 'maintenance_overdue' | 'household_overdue' | 'warranty_expiring' | 'document_expiring' | 'budget_exceeded' | 'asset_out_of_service';

export interface DashboardAlert {
  kind: AlertKind;
  count: number;
  route: string;
}

export interface AgendaItem {
  key: string;
  type: 'maintenance' | 'household' | 'repair';
  id: string;
  title: string;
  date: DayKey;
  status: DueStatus;
  priority?: string;
  route: string;
}

export interface Dashboard {
  counts: { rooms: number; assets: number; documents: number; inventory: number; openRepairs: number };
  agenda: { overdue: AgendaItem[]; today: AgendaItem[]; upcoming: AgendaItem[] };
  completedThisMonth: number;
  warranties: Asset[];
  expiringDocuments: HomeDocument[];
  upcomingRepairs: Repair[];
  monthSpend: Money[];
  budget: { limitMinor: number; spentMinor: number; currency: string } | null;
  alerts: DashboardAlert[];
}

/** How far ahead the dashboard agenda looks. */
export const AGENDA_DAYS = 14;

const maintItem = (t: MaintenanceTask, today: DayKey): AgendaItem => ({
  key: `m-${t.id}`,
  type: 'maintenance',
  id: t.id,
  title: t.title,
  date: t.nextDue as DayKey,
  status: dueStatus(t.nextDue, today),
  priority: t.priority,
  route: `/maintenance/${t.id}`,
});

const choreItem = (t: HouseholdTask, today: DayKey): AgendaItem => ({
  key: `h-${t.id}`,
  type: 'household',
  id: t.id,
  title: t.title,
  date: t.dueDate as DayKey,
  status: dueStatus(t.dueDate, today),
  priority: t.priority,
  route: `/household/${t.id}`,
});

const priorityRank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export async function loadDashboard(r: Repositories, homeId: string, today: DayKey): Promise<Dashboard> {
  const home = await r.homes.get(homeId);
  const until = addDays(today, AGENDA_DAYS);
  const monthStart = startOfMonth(today);
  const [rooms, assets, documents, inventory, openRepairs, maint, chores, repairsSoon, warranties, docs, monthSpend, doneM, doneH, statusCounts] = await Promise.all([
    r.homes.listRooms(homeId),
    r.assets.count(homeId),
    r.documents.count(homeId),
    r.inventory.count(homeId),
    r.repairs.countOpen(homeId),
    r.maintenance.dueUntil(homeId, until),
    r.household.openDueUntil(homeId, until),
    r.repairs.upcoming(homeId, today, until),
    r.assets.warrantiesEnding(homeId, today, EXPIRING_WINDOW_DAYS),
    r.documents.expiringBetween(homeId, today, EXPIRING_WINDOW_DAYS),
    r.expenses.totals(homeId, { from: monthStart, to: endOfMonth(today) }),
    r.maintenance.completedSince(homeId, monthStart),
    r.household.completedSince(homeId, monthStart),
    r.assets.countByStatus(homeId),
  ]);

  const items = [
    ...maint.map((t) => maintItem(t, today)),
    ...chores.map((t) => choreItem(t, today)),
    ...repairsSoon.filter((x) => x.scheduledOn).map(
      (x): AgendaItem => ({ key: `r-${x.id}`, type: 'repair', id: x.id, title: x.title, date: x.scheduledOn as DayKey, status: dueStatus(x.scheduledOn, today), route: `/repairs/${x.id}` }),
    ),
  ].sort((a, b) => (a.date === b.date ? (priorityRank[a.priority ?? 'medium'] ?? 2) - (priorityRank[b.priority ?? 'medium'] ?? 2) : a.date < b.date ? -1 : 1));

  const agenda = {
    overdue: items.filter((i) => i.status === 'overdue'),
    today: items.filter((i) => i.status === 'today'),
    upcoming: items.filter((i) => i.status === 'soon' || i.status === 'upcoming'),
  };

  const budget =
    home?.monthlyBudgetMinor != null
      ? { limitMinor: home.monthlyBudgetMinor, currency: home.currency, spentMinor: monthSpend.find((m) => m.currency === home.currency)?.amountMinor ?? 0 }
      : null;

  const alerts: DashboardAlert[] = [];
  const overdueMaint = agenda.overdue.filter((i) => i.type === 'maintenance').length;
  const overdueChores = agenda.overdue.filter((i) => i.type === 'household').length;
  if (overdueMaint) alerts.push({ kind: 'maintenance_overdue', count: overdueMaint, route: '/(tabs)/maintenance' });
  if (overdueChores) alerts.push({ kind: 'household_overdue', count: overdueChores, route: '/(tabs)/maintenance?tab=household' });
  if (warranties.length) alerts.push({ kind: 'warranty_expiring', count: warranties.length, route: '/assets?warranty=1' });
  if (docs.length) alerts.push({ kind: 'document_expiring', count: docs.length, route: '/(tabs)/documents?expiring=1' });
  if (budget && budget.spentMinor > budget.limitMinor) alerts.push({ kind: 'budget_exceeded', count: 1, route: '/expenses' });
  if (statusCounts.out_of_service) alerts.push({ kind: 'asset_out_of_service', count: statusCounts.out_of_service, route: '/assets?status=out_of_service' });

  return {
    counts: { rooms: rooms.length, assets, documents, inventory, openRepairs },
    agenda,
    completedThisMonth: doneM + doneH,
    warranties,
    expiringDocuments: docs,
    upcomingRepairs: repairsSoon,
    monthSpend,
    budget,
    alerts,
  };
}
