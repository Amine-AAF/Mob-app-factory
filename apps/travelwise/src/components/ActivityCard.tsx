import { Badge, Icon, IconButton, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { ActivityCategory } from '@/constants/domain';
import { fmt } from '@/i18n';
import type { Activity } from '@/types/models';

export const CATEGORY_ICON: Record<ActivityCategory, IconName> = {
  sightseeing: 'camera-outline',
  restaurant: 'restaurant-outline',
  shopping: 'bag-handle-outline',
  museum: 'business-outline',
  beach: 'sunny-outline',
  nature: 'leaf-outline',
  transport: 'bus-outline',
  accommodation: 'bed-outline',
  entertainment: 'musical-notes-outline',
  other: 'ellipse-outline',
};

/** One timeline row: time column, rail dot, card with quick actions. */
export function ActivityCard({
  activity,
  isLast,
  onPress,
  onToggleDone,
  onMoveUp,
  onMoveDown,
}: {
  activity: Activity;
  isLast: boolean;
  onPress: () => void;
  onToggleDone: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const done = activity.status === 'completed';
  const skipped = activity.status === 'skipped';
  const time = activity.startTime ? (activity.endTime ? `${activity.startTime}–${activity.endTime}` : activity.startTime) : t('itinerary.anytime');

  return (
    <Row gap={3} style={{ alignItems: 'stretch' }} testID={`activity-${activity.id}`}>
      <View style={{ width: 52, paddingTop: 14 }}>
        <Text variant="caption" tone={activity.startTime ? 'default' : 'subtle'} style={{ fontWeight: '700' }} numberOfLines={2}>
          {time}
        </Text>
      </View>
      <View style={{ alignItems: 'center', width: 14 }}>
        <View style={{ width: 2, height: 16, backgroundColor: theme.colors.border }} />
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: done ? theme.colors.success : skipped ? theme.colors.textSubtle : theme.colors.primary }} />
        {!isLast ? <View style={{ width: 2, flex: 1, backgroundColor: theme.colors.border }} /> : null}
      </View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${activity.name}, ${time}, ${t(`enums.activityStatus.${activity.status}`)}`}
        style={({ pressed }) => ({
          flex: 1,
          marginBottom: theme.spacing(3),
          padding: theme.spacing(3),
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.8 : skipped ? 0.6 : 1,
          gap: theme.spacing(1.5),
        })}
      >
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Icon name={CATEGORY_ICON[activity.category]} size={18} color={theme.colors.primary} />
          <Stack gap={0.5} style={{ flex: 1 }}>
            <Text variant="subheading" numberOfLines={2} style={done || skipped ? { textDecorationLine: 'line-through' } : undefined}>
              {activity.name}
            </Text>
            {activity.address ? (
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {activity.address}
              </Text>
            ) : null}
          </Stack>
          <IconButton icon={done ? 'checkmark-circle' : 'ellipse-outline'} tone={done ? 'primary' : 'default'} label={done ? t('itinerary.markPlanned') : t('itinerary.markDone')} onPress={onToggleDone} />
        </Row>
        <Row gap={2} wrap style={{ justifyContent: 'space-between' }}>
          <Row gap={2} wrap>
            <Badge label={t(`enums.activityCategory.${activity.category}`)} tone="neutral" />
            {activity.priceMinor !== null && activity.currency ? <Badge label={fmt.money(activity.priceMinor, activity.currency)} tone="accent" /> : null}
            {skipped ? <Badge label={t('enums.activityStatus.skipped')} tone="warning" /> : null}
          </Row>
          {onMoveUp || onMoveDown ? (
            <Row gap={0}>
              {onMoveUp ? <IconButton icon="chevron-up" label={t('itinerary.moveUp')} onPress={onMoveUp} size={18} /> : null}
              {onMoveDown ? <IconButton icon="chevron-down" label={t('itinerary.moveDown')} onPress={onMoveDown} size={18} /> : null}
            </Row>
          ) : null}
        </Row>
      </Pressable>
    </Row>
  );
}
