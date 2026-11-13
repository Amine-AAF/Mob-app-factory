import { Button, Card, EmptyState, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BookingCard } from '@/components/BookingCard';
import { TripScaffold } from '@/components/TripScaffold';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import type { Booking } from '@/types/models';

/** Bookings in chronological order, grouped by date. All information is typed by the user. */
export default function TripBookingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: bookings } = useAsync(() => repos().bookings.list(id), [id]);
  const open = (bookingId?: string) => router.push({ pathname: '/trip/[id]/booking', params: bookingId ? { id, bookingId } : { id } });

  const groups: { date: string | null; items: Booking[] }[] = [];
  for (const b of bookings ?? []) {
    const last = groups[groups.length - 1];
    if (last && last.date === b.date) last.items.push(b);
    else groups.push({ date: b.date, items: [b] });
  }

  return (
    <TripScaffold tripId={id} section="bookings">
      {() => (
        <Stack gap={3}>
          <Card tone="alt">
            <Row gap={2} style={{ alignItems: 'flex-start' }}>
              <Icon name="information-circle-outline" size={18} color={theme.colors.textMuted} />
              <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                {t('bookings.disclaimer')}
              </Text>
            </Row>
          </Card>
          <Button label={t('bookings.add')} icon="add" onPress={() => open()} testID="bookings-add" />
          {bookings && bookings.length === 0 ? <EmptyState icon="ticket-outline" title={t('bookings.emptyTitle')} message={t('bookings.emptyMessage')} /> : null}
          {groups.map((g) => (
            <Stack key={g.date ?? 'undated'} gap={2}>
              <Text variant="label">{g.date ? fmt.date(g.date, { weekday: 'long', day: 'numeric', month: 'long' }) : t('bookings.undated')}</Text>
              {g.items.map((b) => (
                <BookingCard key={b.id} booking={b} onPress={() => open(b.id)} />
              ))}
            </Stack>
          ))}
        </Stack>
      )}
    </TripScaffold>
  );
}
