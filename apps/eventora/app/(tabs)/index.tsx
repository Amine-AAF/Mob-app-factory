import { Button, Card, EmptyState, FadeIn, Icon, ListRow, ProgressBar, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { AdBanner, EventCard, Kpi, KpiGrid } from '@/components/ui';
import { summarizeBudget } from '@/domain/budget';
import { eventPhase, isActive, sortEvents } from '@/domain/events';
import { rsvpStats } from '@/domain/guests';
import { isOpen, isOverdue, sortTasks, taskProgress } from '@/domain/tasks';
import { localToday } from '@/domain/time';
import { useRepo } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

/** Dashboard: everything that needs attention across events. */
async function loadDashboard(r: import('@/database').Repositories) {
  const [events, tasks, guests, expenses, envelopes] = await Promise.all([
    r.events.list(),
    r.tasks.listAll(),
    r.guests.listAll(),
    r.budget.allExpenses(),
    r.db.getAllAsync<{ event_id: string; planned_minor: number }>('SELECT event_id, planned_minor FROM event_budgets', []),
  ]);
  const now = clock.now();
  const today = localToday(now);
  const sorted = sortEvents(events, now);
  const active = sorted.filter((e) => isActive(e.status));
  const activeIds = new Set(active.map((e) => e.id));
  const activeTasks = tasks.filter((t) => activeIds.has(t.eventId));
  const activeGuests = guests.filter((g) => activeIds.has(g.eventId));
  const stats = rsvpStats(activeGuests);
  const budgets = active.map((e) => ({
    event: e,
    summary: summarizeBudget({
      currency: e.currency,
      initialMinor: e.budgetMinor,
      envelopes: envelopes.filter((x) => x.event_id === e.id).map((x) => ({ id: '', eventId: e.id, category: 'other' as const, plannedMinor: x.planned_minor })),
      expenses: expenses.filter((x) => x.eventId === e.id),
    }),
  }));
  const upcoming = active.filter((e) => eventPhase(e, now) !== 'past');
  const urgent = sortTasks(activeTasks.filter((t) => isOpen(t) && t.dueDate && t.dueDate <= today)).slice(0, 5);
  const nextDeadlines = sortTasks(activeTasks.filter((t) => isOpen(t) && t.dueDate && t.dueDate > today)).slice(0, 5);
  const finished = sorted.filter((e) => e.status === 'completed').slice(0, 3);
  return {
    events,
    upcoming,
    preparing: active.filter((e) => e.status === 'draft' || e.status === 'planning'),
    stats,
    openTasks: activeTasks.filter(isOpen).length,
    overdue: activeTasks.filter((t) => isOverdue(t, today)).length,
    progress: taskProgress(activeTasks),
    budgets,
    urgent,
    nextDeadlines,
    finished,
    names: new Map(events.map((e) => [e.id, e.name])),
  };
}

export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useRepo(loadDashboard, []);

  if (!data) return <Screen>{null}</Screen>;

  if (data.events.length === 0) {
    return (
      <Screen>
        <Text variant="title">{t('home.greeting')}</Text>
        <EmptyState
          icon="sparkles"
          title={t('home.emptyTitle')}
          message={t('home.emptyBody')}
          action={
            <Stack gap={2} style={{ alignSelf: 'stretch' }}>
              <Button label={t('events.create')} icon="add" onPress={() => router.push('/event/new')} testID="home-create" />
              <Button label={t('templates.browse')} variant="secondary" icon="albums-outline" onPress={() => router.push('/templates')} />
            </Stack>
          }
        />
        <AdBanner />
      </Screen>
    );
  }

  const next = data.upcoming[0];
  const budgetSpent = data.budgets.filter((b) => b.event.budgetMinor > 0);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title">{t('home.greeting')}</Text>
        <Button size="md" label={t('events.new')} icon="add" onPress={() => router.push('/event/new')} />
      </Row>

      {next ? (
        <FadeIn>
          <EventCard event={next} subtitle={t('home.nextEvent')} onPress={() => router.push(`/event/${next.id}`)} testID="home-next-event" />
        </FadeIn>
      ) : null}

      <KpiGrid>
        <Kpi icon="calendar" value={fmt.number(data.upcoming.length)} label={t('home.kpi.upcoming')} onPress={() => router.push('/(tabs)/events')} />
        <Kpi icon="construct" tone="accent" value={fmt.number(data.preparing.length)} label={t('home.kpi.preparing')} />
        <Kpi icon="people" value={fmt.number(data.stats.entries)} label={t('home.kpi.guests')} onPress={() => router.push('/(tabs)/guests')} />
        <Kpi icon="checkmark-done" tone="success" value={`${fmt.number(data.stats.confirmed)} · ${fmt.number(data.stats.expected.total)}`} label={t('home.kpi.confirmed')} />
        <Kpi icon="list" tone={data.overdue ? 'danger' : 'primary'} value={fmt.number(data.openTasks)} label={data.overdue ? t('home.kpi.tasksOverdue', { count: data.overdue }) : t('home.kpi.tasks')} onPress={() => router.push('/(tabs)/tasks')} />
        <Kpi icon="pie-chart" tone="warning" value={fmt.percent(data.progress.ratio)} label={t('home.kpi.progress')} />
      </KpiGrid>

      {budgetSpent.length ? (
        <>
          <SectionHeader title={t('home.budgetUsed')} />
          <Card>
            {budgetSpent.slice(0, 3).map(({ event, summary }) => (
              <Stack key={event.id} gap={1}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="bodySmall" numberOfLines={1} style={{ flex: 1 }}>
                    {event.name}
                  </Text>
                  <Text variant="bodySmall" tone={summary.overBudget ? 'danger' : 'muted'}>
                    {`${fmt.money(summary.committedMinor, event.currency)} / ${fmt.money(event.budgetMinor, event.currency)}`}
                  </Text>
                </Row>
                <ProgressBar progress={summary.committedMinor / event.budgetMinor} tone={summary.overBudget ? 'accent' : 'primary'} label={event.name} />
              </Stack>
            ))}
          </Card>
        </>
      ) : null}

      {data.urgent.length ? (
        <>
          <SectionHeader title={t('home.urgent')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/tasks')} />
          <Card>
            {data.urgent.map((task) => (
              <ListRow
                key={task.id}
                icon={task.dueDate && task.dueDate < localToday(clock.now()) ? 'alert-circle' : 'today'}
                title={task.title}
                subtitle={`${data.names.get(task.eventId) ?? ''} · ${task.dueDate ? fmt.dayShort(task.dueDate) : ''}`}
                onPress={() => router.push({ pathname: '/event/[id]/task', params: { id: task.eventId, taskId: task.id } })}
              />
            ))}
          </Card>
        </>
      ) : null}

      {data.nextDeadlines.length ? (
        <>
          <SectionHeader title={t('home.deadlines')} />
          <Card>
            {data.nextDeadlines.map((task) => (
              <ListRow key={task.id} icon="time-outline" title={task.title} subtitle={`${data.names.get(task.eventId) ?? ''} · ${task.dueDate ? fmt.day(task.dueDate) : ''}`} onPress={() => router.push({ pathname: '/event/[id]/task', params: { id: task.eventId, taskId: task.id } })} />
            ))}
          </Card>
        </>
      ) : null}

      {data.upcoming.length > 1 ? (
        <>
          <SectionHeader title={t('home.otherEvents')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/events')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {data.upcoming.slice(1, 6).map((e) => (
              <View key={e.id} style={{ width: 240 }}>
                <EventCard event={e} onPress={() => router.push(`/event/${e.id}`)} />
              </View>
            ))}
          </ScrollView>
        </>
      ) : null}

      {data.finished.length ? (
        <>
          <SectionHeader title={t('home.finished')} />
          <Card>
            {data.finished.map((e) => (
              <ListRow key={e.id} icon="checkmark-circle-outline" title={e.name} subtitle={fmt.day(e.startDate)} onPress={() => router.push(`/event/${e.id}`)} />
            ))}
          </Card>
        </>
      ) : null}

      <Row gap={2} style={{ justifyContent: 'center' }}>
        <Icon name="lock-closed" size={14} color={theme.colors.textSubtle} />
        <Text variant="caption" tone="subtle">
          {t('home.privacyFooter')}
        </Text>
      </Row>
      <AdBanner />
    </Screen>
  );
}
