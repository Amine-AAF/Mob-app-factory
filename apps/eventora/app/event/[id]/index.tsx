import { Button, Card, Icon, IconButton, ProgressBar, Row, Screen, SectionHeader, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { confirmDelete, EventCover, Kpi, KpiGrid, limitAlert, Notice, ScreenTitle, StatusBadge } from '@/components/ui';
import { canCreateEvent } from '@/config/limits';
import { eventType, THEME_COLORS } from '@/content/eventTypes';
import { repos } from '@/database';
import { summarizeBudget } from '@/domain/budget';
import { copyName, countActive, daysUntil, suggestedStatus } from '@/domain/events';
import { giftSummary } from '@/domain/gifts';
import { rsvpStats } from '@/domain/guests';
import { seatingSummary } from '@/domain/seating';
import { isOverdue, taskProgress } from '@/domain/tasks';
import { overlappingIds } from '@/domain/timeline';
import { crossesMidnight, localToday } from '@/domain/time';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { deleteOwnedFile } from '@/services/files';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

function ModuleTile({ icon, title, value, onPress, alert }: { icon: IconName; title: string; value: string; onPress: () => void; alert?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}, ${value}`} style={{ flexBasis: '30%', flexGrow: 1 }}>
      <View style={{ padding: 12, borderRadius: theme.radius.md, borderWidth: 1, borderColor: alert ? theme.colors.warning : theme.colors.border, backgroundColor: theme.colors.surface, gap: 6, minHeight: 96 }}>
        <Icon name={icon} size={22} color={alert ? theme.colors.warning : theme.colors.primary} />
        <Text variant="subheading" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={2}>
          {value}
        </Text>
      </View>
    </Pressable>
  );
}

export default function EventSpace() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap, loading } = useSnapshot(id);

  useEffect(() => {
    if (id) usePreferences.getState().set({ lastEventId: id });
  }, [id]);

  if (!snap) {
    return <Screen edges={[]}>{!loading ? <Text tone="muted">{t('events.notFound')}</Text> : null}</Screen>;
  }

  const e = snap.event;
  const now = clock.now();
  const today = localToday(now);
  const stats = rsvpStats(snap.guests);
  const budget = summarizeBudget({ currency: e.currency, initialMinor: e.budgetMinor, envelopes: snap.envelopes, expenses: snap.expenses });
  const progress = taskProgress(snap.tasks);
  const overdue = snap.tasks.filter((x) => isOverdue(x, today)).length;
  const seating = seatingSummary(snap.tables, snap.assignments, snap.guests);
  const gifts = giftSummary(snap.gifts);
  const overlaps = overlappingIds(snap.timeline).size;
  const d = daysUntil(e, now);
  const suggestion = suggestedStatus(e, now);
  const palette = THEME_COLORS[e.theme];
  const showGifts = eventType(e.typeId).gifts || snap.gifts.length > 0;

  const go = (path: string) => router.push({ pathname: `/event/[id]/${path}` as '/event/[id]/guests', params: { id: e.id } });

  const duplicate = async () => {
    const all = await repos().events.list();
    const check = canCreateEvent(isPremium, countActive(all));
    if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'duplicate');
    const run = async (withGuests: boolean) => {
      const copy = await mutate((r) => r.events.duplicate(e.id, { name: copyName(e.name, all.map((x) => x.name), t('events.copyWord')), startDate: e.startDate, withGuests }));
      track('event_duplicated', { type: e.typeId });
      if (copy) router.replace({ pathname: '/event/new', params: { id: copy.id } });
    };
    Alert.alert(t('events.duplicate'), t('events.duplicateBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('events.duplicateWithGuests'), onPress: () => void run(true) },
      { text: t('events.duplicateConfig'), onPress: () => void run(false) },
    ]);
  };

  const saveTemplate = () => {
    if (!isPremium) return limitAlert(t, 'customTemplates', 0, 'save_template');
    void mutate((r) => r.templates.saveFromEvent(e.id, e.name)).then(() => Alert.alert(t('templates.saved')));
  };

  const more = () =>
    Alert.alert(e.name, undefined, [
      { text: t('events.duplicate'), onPress: () => void duplicate() },
      { text: t('templates.saveAs'), onPress: saveTemplate },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          confirmDelete(t, e.name, () => {
            deleteOwnedFile(e.coverUri);
            void mutate((r) => r.events.remove(e.id)).then(() => router.back());
          }, t('events.deleteBody')),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Screen edges={[]}>
      <ScreenTitle
        title={e.name}
        right={
          <>
            <IconButton icon="create-outline" label={t('events.edit')} onPress={() => router.push({ pathname: '/event/new', params: { id: e.id } })} />
            <IconButton icon="ellipsis-vertical" label={t('common.more')} onPress={more} />
          </>
        }
      />
      <View>
        <EventCover event={e} height={150} />
        <View style={{ position: 'absolute', left: 12, bottom: 12, right: 12, gap: 4 }}>
          <StatusBadge kind="event" status={e.status} />
        </View>
      </View>
      <Stack gap={1}>
        <Text variant="title">{e.name}</Text>
        <Row gap={2}>
          <Icon name="calendar-outline" size={16} color={palette.primary} />
          <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
            {fmt.eventStart(e)}
            {e.endTime ? ` → ${fmt.time(e.endTime)}${crossesMidnight(e) ? ` (${t('timeline.nextDay')})` : ''}` : ''}
          </Text>
        </Row>
        <Text variant="caption" tone="subtle">
          {`${e.timezone.replace(/_/g, ' ')} · ${fmt.zoneLabel(e.timezone, new Date(e.startUtc))}`}
        </Text>
        {e.venue || e.address ? (
          <Row gap={2}>
            <Icon name="location-outline" size={16} color={palette.primary} />
            <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
              {[e.venue, e.address].filter(Boolean).join(', ')}
            </Text>
          </Row>
        ) : null}
        <Text variant="subheading" tone="primary">
          {d > 0 ? t('event.inDays', { count: d }) : d === 0 ? t('event.today') : t('event.daysAgo', { count: -d })}
        </Text>
      </Stack>

      {suggestion ? (
        <Pressable onPress={() => void mutate((r) => r.events.setStatus(e.id, suggestion))} accessibilityRole="button">
          <Notice icon="sync-outline" title={t('events.suggestStatus', { status: t(`eventStatus.${suggestion}`) })}>
            {t('events.suggestStatusTap')}
          </Notice>
        </Pressable>
      ) : null}

      <KpiGrid>
        <Kpi icon="people" value={`${stats.expected.total}/${e.expectedGuests || '—'}`} label={t('event.kpi.attendance')} onPress={() => go('rsvp')} />
        <Kpi icon="checkmark-done" tone="success" value={`${stats.confirmed} · ${stats.pending}`} label={t('event.kpi.confirmedPending')} onPress={() => go('rsvp')} />
        <Kpi icon="wallet" tone={budget.overBudget ? 'danger' : 'accent'} value={e.budgetMinor ? fmt.money(budget.remainingMinor, e.currency) : fmt.money(budget.committedMinor, e.currency)} label={e.budgetMinor ? t('budget.remaining') : t('budget.committed')} onPress={() => go('budget')} />
        <Kpi icon="list" tone={overdue ? 'danger' : 'primary'} value={`${progress.done}/${progress.total}`} label={overdue ? t('home.kpi.tasksOverdue', { count: overdue }) : t('event.kpi.tasksDone')} onPress={() => go('tasks')} />
      </KpiGrid>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{t('event.preparation')}</Text>
          <Text tone="primary" style={{ fontWeight: '700' }}>
            {fmt.percent(progress.ratio)}
          </Text>
        </Row>
        <ProgressBar progress={progress.ratio} tone="success" label={t('event.preparation')} />
      </Card>

      <SectionHeader title={t('event.manage')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <ModuleTile icon="people" title={t('modules.guests')} value={t('modules.guestsValue', { count: snap.guests.length, people: stats.expected.total })} onPress={() => go('guests')} />
        <ModuleTile icon="checkmark-done" title={t('modules.rsvp')} value={t('modules.rsvpValue', { count: stats.pending })} onPress={() => go('rsvp')} alert={stats.pending > 0 && d >= 0 && d <= 21} />
        <ModuleTile icon="mail-open" title={t('modules.invitations')} value={snap.invitations.length ? t('modules.invitationsValue', { count: snap.invitations.length }) : t('modules.create')} onPress={() => go('invitation')} />
        <ModuleTile icon="wallet" title={t('modules.budget')} value={fmt.money(budget.spentMinor, e.currency)} onPress={() => go('budget')} alert={budget.overBudget} />
        <ModuleTile icon="checkbox" title={t('modules.tasks')} value={t('modules.tasksValue', { count: progress.total - progress.done })} onPress={() => go('tasks')} alert={overdue > 0} />
        <ModuleTile icon="time" title={t('modules.timeline')} value={overlaps ? t('modules.timelineOverlaps', { count: overlaps }) : t('modules.timelineValue', { count: snap.timeline.length })} onPress={() => go('timeline')} alert={overlaps > 0} />
        <ModuleTile icon="grid" title={t('modules.seating')} value={t('modules.seatingValue', { seated: seating.seated, unseated: seating.unseated })} onPress={() => go('seating')} alert={seating.overloadedTables > 0} />
        <ModuleTile icon="storefront" title={t('modules.vendors')} value={t('modules.vendorsValue', { count: snap.vendors.length })} onPress={() => go('vendors')} />
        {showGifts ? <ModuleTile icon="gift" title={t('modules.gifts')} value={t('modules.giftsValue', { count: gifts.toThank })} onPress={() => go('gifts')} /> : null}
        <ModuleTile icon="document-text" title={t('modules.reports')} value={t('modules.reportsValue')} onPress={() => go('reports')} />
      </View>

      {e.description ? (
        <Card>
          <Text variant="label" tone="muted">
            {t('event.description')}
          </Text>
          <Text>{e.description}</Text>
        </Card>
      ) : null}
      {e.notes ? (
        <Card>
          <Text variant="label" tone="muted">
            {t('event.notes')}
          </Text>
          <Text>{e.notes}</Text>
        </Card>
      ) : null}
      <Button variant="ghost" icon="copy-outline" label={t('events.duplicate')} onPress={() => void duplicate()} />
      <View style={{ height: 8, backgroundColor: theme.colors.background }} />
    </Screen>
  );
}
