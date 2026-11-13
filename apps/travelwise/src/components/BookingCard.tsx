import { Badge, Card, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import type { BookingType } from '@/constants/domain';
import { missingBookingFields } from '@/database/repositories/bookings';
import { fmt } from '@/i18n';
import type { Booking } from '@/types/models';

export const BOOKING_ICON: Record<BookingType, IconName> = {
  flight: 'airplane-outline',
  hotel: 'bed-outline',
  train: 'train-outline',
  bus: 'bus-outline',
  car_rental: 'car-outline',
  restaurant: 'restaurant-outline',
  activity: 'ticket-outline',
  ferry: 'boat-outline',
  other: 'document-text-outline',
};

const STATUS_TONE = { confirmed: 'success', pending: 'warning', cancelled: 'danger' } as const;

export function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const when = [booking.date ? fmt.date(booking.date, { weekday: 'short', day: 'numeric', month: 'short' }) : null, booking.time].filter(Boolean).join(' · ');
  const until = [booking.endDate && booking.endDate !== booking.date ? fmt.shortDate(booking.endDate) : null, booking.endTime].filter(Boolean).join(' · ');
  const missing = missingBookingFields(booking);
  const title = booking.provider || t(`enums.bookingType.${booking.type}`);

  return (
    <Card onPress={onPress} accessibilityLabel={`${t(`enums.bookingType.${booking.type}`)}: ${title}`} testID={`booking-${booking.id}`} style={booking.status === 'cancelled' ? { opacity: 0.6 } : undefined}>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <Icon name={BOOKING_ICON[booking.type]} size={22} color={theme.colors.primary} />
        <Stack gap={1} style={{ flex: 1 }}>
          <Row style={{ justifyContent: 'space-between' }} gap={2}>
            <Text variant="subheading" numberOfLines={1} style={{ flex: 1 }}>
              {title}
            </Text>
            <Badge label={t(`enums.bookingStatus.${booking.status}`)} tone={STATUS_TONE[booking.status]} />
          </Row>
          {when ? <Text variant="bodySmall">{until ? `${when} → ${until}` : when}</Text> : null}
          {booking.departureInfo || booking.arrivalInfo ? (
            <Text variant="bodySmall" tone="muted" numberOfLines={2}>
              {[booking.departureInfo, booking.arrivalInfo].filter(Boolean).join(' → ')}
            </Text>
          ) : null}
          {booking.reference ? (
            <Text variant="mono" tone="muted" selectable>
              {t('bookings.referenceShort', { reference: booking.reference })}
            </Text>
          ) : null}
          <Row gap={2} wrap>
            {booking.priceMinor !== null && booking.currency ? <Badge label={fmt.money(booking.priceMinor, booking.currency)} tone="accent" /> : null}
            {missing.length ? <Badge label={t('bookings.incomplete')} tone="neutral" icon="alert-circle-outline" /> : null}
          </Row>
        </Stack>
      </Row>
    </Card>
  );
}
