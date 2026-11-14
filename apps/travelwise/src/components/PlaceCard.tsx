import { Badge, Card, Icon, IconButton, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';

import type { PlaceCategory } from '@/constants/domain';
import type { Place } from '@/types/models';

export const PLACE_ICON: Record<PlaceCategory, IconName> = {
  restaurant: 'restaurant-outline',
  hotel: 'bed-outline',
  attraction: 'star-outline',
  museum: 'business-outline',
  beach: 'sunny-outline',
  poi: 'flag-outline',
  personal: 'home-outline',
  other: 'location-outline',
};

export function PlaceCard({ place, tripName, onPress, onToggleFavorite, onOpenMap }: { place: Place; tripName?: string; onPress: () => void; onToggleFavorite: () => void; onOpenMap?: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const where = [place.address, place.city, place.countryCode].filter(Boolean).join(', ');
  return (
    <Card onPress={onPress} accessibilityLabel={place.name} testID={`place-${place.id}`}>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        {place.photoUri ? (
          <Image source={{ uri: place.photoUri }} style={{ width: 56, height: 56, borderRadius: theme.radius.md }} accessibilityIgnoresInvertColors />
        ) : (
          <Icon name={PLACE_ICON[place.category]} size={24} color={theme.colors.primary} />
        )}
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="subheading" numberOfLines={1}>
            {place.name}
          </Text>
          {where ? (
            <Text variant="caption" tone="muted" numberOfLines={2}>
              {where}
            </Text>
          ) : null}
          <Row gap={2} wrap>
            <Badge label={t(`enums.placeCategory.${place.category}`)} tone="neutral" />
            {tripName ? <Badge label={tripName} tone="primary" icon="airplane-outline" /> : null}
          </Row>
        </Stack>
        <Stack gap={0}>
          <IconButton icon={place.isFavorite ? 'heart' : 'heart-outline'} tone={place.isFavorite ? 'danger' : 'default'} label={place.isFavorite ? t('places.unfavorite') : t('places.favorite')} onPress={onToggleFavorite} />
          {onOpenMap ? <IconButton icon="navigate-outline" label={t('places.openMap')} onPress={onOpenMap} /> : null}
        </Stack>
      </Row>
    </Card>
  );
}
