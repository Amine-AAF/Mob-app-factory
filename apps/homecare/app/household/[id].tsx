import { Button, Card, EmptyState, Icon, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { DueBadge, IconTile, InfoLine, ItemRow, PriorityBadge, ScreenHeader } from '@/components/ui';
import { HOUSEHOLD_ICONS } from '@/config/icons';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { addDays } from '@/domain/dates';
import { dueStatus } from '@/domain/recurrence';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

export default function HouseholdDetail() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const isPremium = useIsPremium();
  const { data } = useData(async () => {
    const r = repos();
    const task = await r.household.get(id);
    if (!task) return null;
    const [members, room, history] = await Promise.all([r.household.listMembers(task.homeId), task.roomId ? r.homes.getRoom(task.roomId) : null, r.household.history(task.homeId, { taskId: id, since: isPremium ? null : addDays(today, -FREE_LIMITS.historyDays) })]);
    return { task, member: members.find((m) => m.id === task.assigneeId) ?? null, room, history };
  }, [id, isPremium]);

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
  const done = !!task.completedAt;

  return (
    <Screen>
      <ScreenHeader title={task.title} subtitle={t(`householdCategories.${task.category}`)} back right={<IconButton icon="create-outline" label={t('household.edit')} onPress={() => router.push({ pathname: '/household/edit', params: { id } })} />} />
      <Card>
        <Row gap={3}>
          <IconTile icon={HOUSEHOLD_ICONS[task.category]} tint={theme.colors.accent} size={52} />
          <Stack gap={1} style={{ flex: 1 }}>
            {done ? <Text tone="success">{t('household.completed')}</Text> : <DueBadge status={dueStatus(task.dueDate, today)} date={task.dueDate} today={today} />}
            <PriorityBadge priority={task.priority} />
          </Stack>
        </Row>
        <InfoLine icon="repeat-outline" label={t('fields.recurrence')} value={t(`recurrences.${task.recurrence}`)} />
        <InfoLine icon="person-outline" label={t('fields.assignee')} value={data.member?.name} />
        <InfoLine icon="grid-outline" label={t('fields.room')} value={data.room?.name} />
        <InfoLine icon="reader-outline" label={t('fields.description')} value={task.description} />
      </Card>

      {task.checklist?.length ? (
        <>
          <SectionHeader title={t('fields.checklist')} />
          <Card>
            {task.checklist.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => void mutate(() => repos().household.toggleItem(c.id, !c.done))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: c.done }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}
              >
                <Icon name={c.done ? 'checkbox' : 'square-outline'} size={22} color={c.done ? theme.colors.success : theme.colors.textMuted} />
                <Text style={{ flex: 1, textDecorationLine: c.done ? 'line-through' : 'none' }} tone={c.done ? 'muted' : 'default'}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </Card>
        </>
      ) : null}

      {done ? (
        <Button label={t('household.reopen')} variant="secondary" icon="refresh" onPress={() => void mutate(() => repos().household.reopen(id))} />
      ) : (
        <Stack gap={2}>
          <Button label={t('household.markDone')} icon="checkmark-circle-outline" onPress={() => void mutate(() => repos().household.complete(id, today)).then(() => task.recurrence === 'once' && router.back())} testID="chore-done" />
          <Button label={t('maintenance.byDays', { count: 1 })} variant="secondary" icon="time-outline" onPress={() => void mutate(() => repos().household.postpone(id, 1, today))} />
        </Stack>
      )}

      <SectionHeader title={t('maintenance.history')} />
      {data.history.length === 0 ? <Text variant="bodySmall" tone="muted">{t('maintenance.noHistory')}</Text> : null}
      <Stack gap={2}>
        {data.history.map((h) => (
          <ItemRow key={h.id} icon="checkmark-circle-outline" title={fmt.day(h.completed_on, 'long')} subtitle={h.member_name} />
        ))}
      </Stack>
    </Screen>
  );
}
