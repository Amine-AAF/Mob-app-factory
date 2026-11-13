import { Badge, Button, Card, IconButton, Row, Stack, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import type { DayWithActivities } from '@/database/repositories/itinerary';
import { fmt } from '@/i18n';
import type { TripDestination } from '@/types/models';

import { ActivityCard } from './ActivityCard';

/** A day of the itinerary: header (day number, date, city), activities timeline, add button. */
export function DayTimeline({
  day,
  dayNumber,
  destination,
  isToday,
  onEditDay,
  onAddActivity,
  onOpenActivity,
  onToggleDone,
  onShift,
}: {
  day: DayWithActivities;
  dayNumber: number | null;
  destination: TripDestination | null;
  isToday: boolean;
  onEditDay: () => void;
  onAddActivity: () => void;
  onOpenActivity: (id: string) => void;
  onToggleDone: (id: string, done: boolean) => void;
  onShift: (id: string, direction: -1 | 1) => void;
}) {
  const { t } = useTranslation();
  const heading = dayNumber ? t('itinerary.dayNumber', { number: dayNumber }) : fmt.weekday(day.date);
  const subtitle = [fmt.date(day.date, { weekday: 'short', day: 'numeric', month: 'short' }), destination?.city].filter(Boolean).join(' · ');
  const timeZone = destination?.timeZone;

  return (
    <Card testID={`day-${day.date}`}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack gap={0.5} style={{ flex: 1 }}>
          <Row gap={2} wrap>
            <Text variant="heading" accessibilityRole="header">
              {day.title ? `${heading} — ${day.title}` : heading}
            </Text>
            {isToday ? <Badge label={t('itinerary.today')} tone="success" /> : null}
            {day.outsideTrip ? <Badge label={t('itinerary.outsideTrip')} tone="warning" /> : null}
          </Row>
          <Text variant="bodySmall" tone="muted">
            {subtitle}
          </Text>
          {timeZone ? (
            <Text variant="caption" tone="subtle">
              {t('itinerary.localTimes', { zone: timeZone })}
            </Text>
          ) : null}
        </Stack>
        <IconButton icon="create-outline" label={t('itinerary.editDay')} onPress={onEditDay} />
      </Row>
      {day.description ? <Text variant="bodySmall">{day.description}</Text> : null}
      {day.activities.length === 0 ? (
        <Text variant="bodySmall" tone="subtle">
          {t('itinerary.noActivities')}
        </Text>
      ) : (
        <Stack gap={0}>
          {day.activities.map((a, i) => (
            <ActivityCard
              key={a.id}
              activity={a}
              isLast={i === day.activities.length - 1}
              onPress={() => onOpenActivity(a.id)}
              onToggleDone={() => onToggleDone(a.id, a.status !== 'completed')}
              onMoveUp={i > 0 ? () => onShift(a.id, -1) : undefined}
              onMoveDown={i < day.activities.length - 1 ? () => onShift(a.id, 1) : undefined}
            />
          ))}
        </Stack>
      )}
      {day.notes ? (
        <Text variant="caption" tone="muted">
          {day.notes}
        </Text>
      ) : null}
      <Button label={t('itinerary.addActivity')} variant="ghost" icon="add" onPress={onAddActivity} testID={`day-${day.date}-add`} />
    </Card>
  );
}
