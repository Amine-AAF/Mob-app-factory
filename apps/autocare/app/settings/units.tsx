import { Card, Screen, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CurrencyPicker } from '@/components/CurrencyPicker';
import { InfoNote, Segmented } from '@/components/ui';
import { usePreferences } from '@/store/preferences';
import type { ConsumptionFormat, DistanceUnit, EnergyConsumptionFormat, VolumeUnit } from '@/types';

/** Units are independent from the language. Stored data is metric, so switching never alters it. */
export default function UnitsSettings() {
  const { t } = useTranslation();
  const units = usePreferences((s) => s.units);
  const currency = usePreferences((s) => s.currency);
  const set = usePreferences((s) => s.set);
  const patch = (p: Partial<typeof units>) => set({ units: { ...units, ...p } });

  return (
    <>
      <RouterStack.Screen options={{ title: t('settings.units') }} />
      <Screen edges={[]}>
        <InfoNote text={t('onboarding.unitsBody')} />
        <Card>
          <Text variant="label" tone="muted">
            {t('settings.distance')}
          </Text>
          <Segmented<DistanceUnit> value={units.distance} options={[{ value: 'km', label: 'km' }, { value: 'mi', label: 'mi' }]} onChange={(distance) => patch({ distance })} testID="unit-distance" />
          <Text variant="label" tone="muted">
            {t('settings.volume')}
          </Text>
          <Segmented<VolumeUnit> value={units.volume} options={[{ value: 'L', label: 'L' }, { value: 'gal_us', label: 'gal US' }, { value: 'gal_uk', label: 'gal UK' }]} onChange={(volume) => patch({ volume })} />
          <Text variant="label" tone="muted">
            {t('settings.consumption')}
          </Text>
          <Segmented<ConsumptionFormat> value={units.consumption} options={[{ value: 'l_per_100km', label: 'L/100km' }, { value: 'km_per_l', label: 'km/L' }, { value: 'mpg_us', label: 'mpg US' }, { value: 'mpg_uk', label: 'mpg UK' }]} onChange={(consumption) => patch({ consumption })} />
          <Text variant="label" tone="muted">
            {t('settings.energyConsumption')}
          </Text>
          <Segmented<EnergyConsumptionFormat>
            value={units.energyConsumption}
            options={[{ value: 'kwh_per_100km', label: 'kWh/100km' }, { value: 'kwh_per_100mi', label: 'kWh/100mi' }, { value: 'km_per_kwh', label: 'km/kWh' }, { value: 'mi_per_kwh', label: 'mi/kWh' }]}
            onChange={(energyConsumption) => patch({ energyConsumption })}
          />
        </Card>
        <Card>
          <Text variant="subheading">{t('settings.currency')}</Text>
          <Text variant="caption" tone="subtle">
            {t('settings.currencyHint')}
          </Text>
          <CurrencyPicker value={currency} onChange={(c) => set({ currency: c })} />
        </Card>
      </Screen>
    </>
  );
}
