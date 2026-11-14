import { Badge, Button, Card, EmptyState, IconButton, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { PickerSheet } from '@/components/forms';
import { PremiumLock } from '@/components/media';
import { DueBadge, IconTile, InfoLine, ItemRow, Notice, PriorityBadge, ScreenHeader } from '@/components/ui';
import { MAINTENANCE_ICONS } from '@/config/icons';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { addDays } from '@/domain/dates';
import { dueStatus } from '@/domain/recurrence';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

const POSTPONE_DAYS = ['1', '3', '7', '14', '30'] as const;

export default function MaintenanceDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const isPremium = useIsPremium();
  const since = isPremium ? null : addDays(today, -FREE_LIMITS.historyDays);
  const [postponeOpen, setPostponeOpen] = useState(false);
  const { data } = useData(async () => {
    const r = repos();
    const task = await r.maintenance.get(id);
    if (!task) return null;
    const [asset, room, history] = await Promise.all([task.assetId ? r.assets.get(task.assetId) : null, task.roomId ? r.homes.getRoom(task.roomId) : null, r.maintenance.history(task.homeId, { taskId: id, since })]);
    return { task, asset, room, history };
  }, [id, since]);

  if (data === null) {
    return (
      <Screen>
        <ScreenHeader title="" back />
        <EmptyState icon="alert-circle-outline" title={t('common.notFound')} />
      </Screen>
    );
  }
  if (!data) return <Screen>{null}</Screen>;
  const { task } = data;
  const status = dueStatus(task.nextDue, today);

  const postpone = () => setPostponeOpen(true);

  const interval = task.frequency === 'custom' && task.intervalValue && task.intervalUnit ? t('templates.every', { count: task.intervalValue, unit: t(`intervalUnits.${task.intervalUnit}`, { count: task.intervalValue }) }) : t(`frequencies.${task.frequency}`);

  return (
    <Screen testID="maintenance-detail">
      <ScreenHeader title={task.title} subtitle={t(`maintenanceCategories.${task.category}`)} back right={<IconButton icon="create-outline" label={t('maintenance.edit')} onPress={() => router.push({ pathname: '/maintenance/edit', params: { id } })} />} />
      <Card>
        <Row gap={3}>
          <IconTile icon={MAINTENANCE_ICONS[task.category]} size={52} />
          <Stack gap={1} style={{ flex: 1 }}>
            <DueBadge status={status} date={task.nextDue} today={today} />
            <PriorityBadge priority={task.priority} />
          </Stack>
        </Row>
        <InfoLine icon="repeat-outline" label={t('fields.frequency')} value={interval} />
        <InfoLine icon="calendar-outline" label={t('fields.nextDue')} value={task.nextDue ? fmt.day(task.nextDue, 'long') : t('maintenance.noDueDate')} />
        <InfoLine icon="checkmark-done-outline" label={t('fields.lastDone')} value={task.lastDone ? fmt.day(task.lastDone, 'long') : null} />
        <InfoLine icon="time-outline" label={t('fields.estimatedMinutes')} value={task.estimatedMinutes ? t('common.minutes', { count: task.estimatedMinutes }) : null} />
        <InfoLine icon="cash-outline" label={t('fields.estimatedCost')} value={task.estimatedCostMinor != null && task.currency ? fmt.money({ amountMinor: task.estimatedCostMinor, currency: task.currency }) : null} />
        <InfoLine icon="reader-outline" label={t('fields.description')} value={task.description} />
        <InfoLine icon="document-text-outline" label={t('fields.notes')} value={task.notes} />
      </Card>
      {task.templateId ? <Notice>{t('templates.disclaimer')}</Notice> : null}

      {data.asset ? <ItemRow icon="cube-outline" title={data.asset.name} subtitle={t('fields.asset')} onPress={() => router.push(`/assets/${data.asset!.id}`)} /> : null}
      {data.room ? <ItemRow icon="grid-outline" title={data.room.name} subtitle={t('fields.room')} onPress={() => router.push(`/rooms/${data.room!.id}`)} /> : null}

      {task.nextDue ? (
        <Stack gap={2}>
          <Button label={t('maintenance.markDone')} icon="checkmark-circle-outline" onPress={() => router.push({ pathname: '/maintenance/complete', params: { id } })} testID="mark-done" />
          <Button label={t('maintenance.postpone')} icon="time-outline" variant="secondary" onPress={postpone} />
        </Stack>
      ) : (
        <Button label={t('maintenance.planAgain')} icon="refresh" variant="secondary" onPress={() => void mutate(() => repos().maintenance.reschedule(id, today))} />
      )}

      <PickerSheet
        visible={postponeOpen}
        title={t('maintenance.postpone')}
        options={POSTPONE_DAYS}
        value={null}
        renderLabel={(d) => t('maintenance.byDays', { count: Number(d) })}
        onSelect={(d) => d && void mutate(() => repos().maintenance.postpone(id, Number(d), today))}
        onClose={() => setPostponeOpen(false)}
      />

      <SectionHeader title={t('maintenance.history')} />
      {!isPremium ? <PremiumLock feature="full_history" message={t('limits.history', { days: FREE_LIMITS.historyDays })} /> : null}
      {data.history.length === 0 ? <Text variant="bodySmall" tone="muted">{t('maintenance.noHistory')}</Text> : null}
      <Stack gap={2}>
        {data.history.map((h) => (
          <ItemRow
            key={h.id}
            icon={h.action === 'completed' ? 'checkmark-circle-outline' : 'time-outline'}
            title={`${t(`history.actions.${h.action}`)} · ${fmt.day(h.doneOn)}`}
            subtitle={[h.costMinor != null && h.currency ? fmt.money({ amountMinor: h.costMinor, currency: h.currency }) : null, h.action === 'postponed' && h.newDue ? t('history.movedTo', { date: fmt.day(h.newDue) }) : null, h.notes].filter(Boolean).join(' · ') || null}
            right={h.action === 'completed' ? <Badge label="✓" tone="success" /> : undefined}
          />
        ))}
      </Stack>
    </Screen>
  );
}
