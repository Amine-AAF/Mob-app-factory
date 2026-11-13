import { Badge, Button, Card, Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { PlantPhoto } from '@/components/PlantPhoto';
import { WISHLIST_STATUSES, type WishlistStatus } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';

export default function Wishlist() {
  const { t } = useTranslation();
  const router = useRouter();
  const [status, setStatus] = useState<WishlistStatus>('wishlist');
  const { data } = useData((r) => r.wishlist.list());
  const items = (data ?? []).filter((w) => w.status === status);

  return (
    <Screen edges={[]} footer={<Button label={t('wishlist.add')} icon="add" onPress={() => router.push('/wishlist/edit')} testID="add-wish" />}>
      <RouterStack.Screen options={{ title: t('wishlist.title') }} />
      <Row wrap gap={2}>
        {WISHLIST_STATUSES.map((s) => (
          <Chip key={s} label={`${t(`wishlistStatus.${s}`)} (${(data ?? []).filter((w) => w.status === s).length})`} selected={status === s} onPress={() => setStatus(s)} />
        ))}
      </Row>
      {items.length === 0 ? (
        <EmptyState icon="heart-outline" title={t('wishlist.empty')} message={status === 'wishlist' ? t('wishlist.emptyBody') : undefined} />
      ) : (
        <Stack gap={2}>
          {items.map((w) => (
            <Card key={w.id} onPress={() => router.push({ pathname: '/wishlist/edit', params: { id: w.id } })} accessibilityLabel={w.name}>
              <Row gap={3}>
                <PlantPhoto path={w.photoPath} size={56} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="subheading">{w.name}</Text>
                  {w.store ? <Text variant="caption" tone="muted">{w.store}</Text> : null}
                  <Row gap={1} wrap>
                    <Badge tone={w.priority === 'high' ? 'accent' : 'neutral'} label={t(`priority.${w.priority}`)} />
                    {w.estimatedPrice !== null ? <Badge tone="neutral" label={t('wishlist.priceShort', { price: fmt.price(w.estimatedPrice) })} /> : null}
                  </Row>
                </View>
              </Row>
            </Card>
          ))}
        </Stack>
      )}
      <AdBanner />
    </Screen>
  );
}
