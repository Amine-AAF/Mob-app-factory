import { Card, Icon, Row, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { repos } from '@/database';
import { nextActivities } from '@/features/itinerary/selectors';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import type { Activity, Booking, LocalDate } from '@/types/models';

import { CATEGORY_ICON } from './ActivityCard';
import { BOOKING_ICON } from './BookingCard';

/** Overview blocks built from real data only: today's plan, next activities, upcoming bookings. */
export function TripHighlights({ tripId, today }: { tripId: string; today: LocalDate }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useAsync(async () => {
    const [days, bookings] = await Promise.all([repos().itinerary.listDays(tripId), repos().bookings.upcoming(tripId, today)]);
    return { days, bookings };
  }, [tripId, today]);
  if (!data) return null;
  const todayDay = data.days.find((d) => d.date === today);
  const upcoming = nextActivities(data.days, today);
  const go = (section: 'itinerary' | 'bookings') => router.replace({ pathname: `/trip/[id]/${section}`, params: { id: tripId } });

  const activityRow = (a: Activity & { date?: LocalDate }) => (
    <Row key={a.id} gap={2}>
      <Icon name={CATEGORY_ICON[a.category]} size={16} color={theme.colors.primary} />
      <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
        {[a.date && a.date !== today ? fmt.shortDate(a.date) : null, a.startTime, a.name].filter(Boolean).join(' · ')}
      </Text>
    </Row>
  );
  const bookingRow = (b: Booking) => (
    <Row key={b.id} gap={2}>
      <Icon name={BOOKING_ICON[b.type]} size={16} color={theme.colors.primary} />
      <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
        {[b.date ? fmt.shortDate(b.date) : null, b.time, b.provider || t(`enums.bookingType.${b.type}`)].filter(Boolean).join(' · ')}
      </Text>
    </Row>
  );

  return (
    <Stack gap={3}>
      {todayDay ? (
        <>
          <SectionHeader title={t('overview.today')} action={t('common.seeAll')} onAction={() => go('itinerary')} />
          <Card>
            {todayDay.title ? <Text variant="subheading">{todayDay.title}</Text> : null}
            {todayDay.activities.length ? todayDay.activities.map(activityRow) : <Text variant="bodySmall" tone="subtle">{t('itinerary.noActivities')}</Text>}
          </Card>
        </>
      ) : null}
      {upcoming.length && !todayDay ? (
        <>
          <SectionHeader title={t('overview.nextActivities')} action={t('common.seeAll')} onAction={() => go('itinerary')} />
          <Card>{upcoming.map(activityRow)}</Card>
        </>
      ) : null}
      {data.bookings.length ? (
        <>
          <SectionHeader title={t('overview.upcomingBookings')} action={t('common.seeAll')} onAction={() => go('bookings')} />
          <Card>{data.bookings.map(bookingRow)}</Card>
        </>
      ) : null}
    </Stack>
  );
}
