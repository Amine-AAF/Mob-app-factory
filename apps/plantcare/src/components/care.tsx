import { Badge, Button, Card, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { daysUntil, dueStatus } from '@/domain/schedule';
import type { CareTask, Plant } from '@/domain/types';
import { volumeFromMl, volumeUnit } from '@/domain/units';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { track } from '@/services/analytics';
import { useMutation } from '@/hooks/useData';
import { usePreferences } from '@/store/preferences';

import { CATEGORY_ICON, TASK_ICON } from './icons';
import { useLeaf } from './leaf';
import { PlantPhoto } from './PlantPhoto';

/** "Today", "In 3 days", "2 days late"… */
export function useDueLabel() {
  const { t } = useTranslation();
  return (task: Pick<CareTask, 'nextDue' | 'active'>) => {
    const d = daysUntil(task, clock.today());
    if (d === null) return t('tasks.notPlanned');
    if (d === 0) return t('dates.today');
    if (d === 1) return t('dates.tomorrow');
    if (d < 0) return t('tasks.daysLate', { count: -d });
    return t('tasks.inDays', { count: d });
  };
}

export function DueBadge({ task }: { task: Pick<CareTask, 'nextDue' | 'active'> }) {
  const label = useDueLabel()(task);
  const s = dueStatus(task, clock.today());
  return <Badge label={label} tone={s === 'overdue' ? 'danger' : s === 'today' ? 'accent' : 'neutral'} icon={s === 'overdue' ? 'alert-circle' : undefined} />;
}

/**
 * One care task with explicit confirmation ("Done") — nothing is ever marked done
 * automatically. Long press / "More" offers postpone and skip.
 */
export function TaskRow({ task, plant, showPlant = true, onEdit }: { task: CareTask; plant?: Pick<Plant, 'id' | 'nickname' | 'photoPath' | 'category'>; showPlant?: boolean; onEdit?: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const router = useRouter();
  const mutate = useMutation();
  const units = usePreferences((s) => s.units) ?? 'metric';
  const today = clock.today();
  const status = dueStatus(task, today);

  const complete = () =>
    void mutate((r) => r.tasks.complete(task.id, today)).then(() => track('task_completed', { type: task.type }));

  const more = () =>
    Alert.alert(t(`taskTypes.${task.type}`), plant?.nickname, [
      { text: t('tasks.postpone1'), onPress: () => void mutate((r) => r.tasks.postpone(task.id, 1, today)) },
      { text: t('tasks.postpone3'), onPress: () => void mutate((r) => r.tasks.postpone(task.id, 3, today)) },
      { text: t('tasks.skip'), onPress: () => void mutate((r) => r.tasks.skip(task.id, today)) },
      ...(onEdit ? [{ text: t('tasks.edit'), onPress: onEdit }] : []),
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  const typeLabel = t(`taskTypes.${task.type}`);
  const amount = task.type === 'watering' && task.amountMl ? ` · ${fmt.number(volumeFromMl(task.amountMl, units))} ${volumeUnit(units)}` : '';
  const isWater = task.type === 'watering';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: status === 'overdue' ? theme.colors.danger : theme.colors.border,
      }}
      testID={`task-${task.id}`}
    >
      <Pressable
        onPress={() => router.push(`/plant/${task.plantId}`)}
        onLongPress={more}
        accessibilityRole="button"
        accessibilityLabel={`${typeLabel}${plant ? `, ${plant.nickname}` : ''}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}
      >
        {showPlant && plant ? (
          <View>
            <PlantPhoto path={plant.photoPath} size={48} icon={CATEGORY_ICON[plant.category]} radius={14} />
            <View style={{ position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: isWater ? tokens.waterSoft : theme.colors.accentSoft }}>
              <Icon name={TASK_ICON[task.type]} size={12} color={isWater ? tokens.water : theme.colors.accent} />
            </View>
          </View>
        ) : (
          <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: isWater ? tokens.waterSoft : theme.colors.accentSoft }}>
            <Icon name={TASK_ICON[task.type]} size={18} color={isWater ? tokens.water : theme.colors.accent} />
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="subheading" numberOfLines={1}>
            {showPlant && plant ? plant.nickname : typeLabel}
          </Text>
          <Text variant="bodySmall" tone="muted" numberOfLines={1}>
            {showPlant ? typeLabel : task.intervalDays ? t('tasks.everyDays', { count: task.intervalDays }) : t('tasks.oneOff')}
            {amount}
          </Text>
          <DueBadge task={task} />
        </View>
      </Pressable>
      {task.active && task.nextDue ? (
        <Stack gap={1} style={{ alignItems: 'center' }}>
          <Pressable
            onPress={complete}
            accessibilityRole="button"
            accessibilityLabel={t('tasks.markDoneA11y', { task: typeLabel, plant: plant?.nickname ?? '' })}
            testID={`done-${task.id}`}
            style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.primary })}
          >
            <Icon name="checkmark" size={24} color={theme.colors.onPrimary} />
          </Pressable>
          <Pressable onPress={more} accessibilityRole="button" accessibilityLabel={t('tasks.more')} hitSlop={8}>
            <Text variant="caption" tone="primary">
              {t('tasks.more')}
            </Text>
          </Pressable>
        </Stack>
      ) : null}
    </View>
  );
}

/** Premium upsell card. Never blocks reading existing data. */
export function PremiumCard({ title, message, source }: { title: string; message: string; source: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Card tone="accent">
      <Row gap={2}>
        <Icon name="sparkles" size={18} color={useTheme().colors.accent} />
        <Text variant="subheading">{title}</Text>
      </Row>
      <Text variant="bodySmall" tone="muted">
        {message}
      </Text>
      <Button size="md" variant="accent" label={t('premium.discover')} onPress={() => router.push({ pathname: '/paywall', params: { source } })} />
    </Card>
  );
}
