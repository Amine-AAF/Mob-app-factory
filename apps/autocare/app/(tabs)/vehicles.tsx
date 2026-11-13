import { Button, Card, EmptyState, Row, Screen, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner, PremiumGate, ToggleRow, VehicleAvatar } from '@/components/ui';
import { canAddVehicle } from '@/features/premium/limits';
import { useFormat } from '@/hooks';
import { useVehicles } from '@/hooks/data';
import { useIsPremium } from '@/store/session';

export default function Vehicles() {
  const { t } = useTranslation();
  const f = useFormat();
  const premium = useIsPremium();
  const [showArchived, setShowArchived] = useState(false);
  const { data: vehicles } = useVehicles(true);
  const active = vehicles?.filter((v) => !v.archived) ?? [];
  const shown = showArchived ? (vehicles ?? []) : active;
  const allowed = canAddVehicle(premium, active.length);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title">{t('vehicles.title')}</Text>
        {allowed ? <Button label={t('vehicles.add')} icon="add" size="md" onPress={() => router.push('/vehicle/edit')} testID="add-vehicle" /> : null}
      </Row>
      {vehicles && shown.length === 0 ? <EmptyState icon="car-sport-outline" title={t('vehicles.empty')} action={<Button label={t('home.addVehicle')} icon="add" onPress={() => router.push('/vehicle/edit')} />} /> : null}
      {shown.map((v) => (
        <Card key={v.id} onPress={() => router.push(`/vehicle/${v.id}`)} accessibilityLabel={v.name}>
          <Row gap={3}>
            <VehicleAvatar vehicle={v} size={56} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="heading" numberOfLines={1}>
                {v.name}
              </Text>
              <Text variant="bodySmall" tone="muted" numberOfLines={1}>
                {[v.make, v.model, v.trim, v.year].filter(Boolean).join(' · ')}
              </Text>
              <Text variant="caption" tone="subtle">
                {[t(`fuelTypes.${v.fuelType}`), f.distance(v.odometerKm), v.plate].filter(Boolean).join(' · ')}
              </Text>
            </View>
            {v.archived ? (
              <Text variant="caption" tone="subtle">
                {t('vehicles.archived')}
              </Text>
            ) : null}
          </Row>
        </Card>
      ))}
      {!allowed ? <PremiumGate reason="vehicles" title={t('vehicles.limitTitle')} body={t('vehicles.limitBody')} /> : null}
      {vehicles?.some((v) => v.archived) ? <ToggleRow label={t('vehicles.showArchived')} value={showArchived} onChange={setShowArchived} /> : null}
      <AdBanner screen="vehicles" />
    </Screen>
  );
}
