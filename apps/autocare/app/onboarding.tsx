import { Button, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChoiceChips, Field, NumberField, readNumber, Segmented } from '@/components/ui';
import { VEHICLE_COLORS } from '@/config/brand';
import { repos } from '@/database';
import { COMMON_CURRENCIES, isCurrencyCode } from '@/features/money/money';
import { distanceToKm, unitsForRegion } from '@/features/units/units';
import { currentLanguage } from '@/i18n';
import { track } from '@/services/analytics';
import { afterWrite, startPostOnboardingServices } from '@/services/boot';
import { clock } from '@/services/clock';
import { ensurePermission } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';
import { FUEL_TYPES, type DistanceUnit, type FuelType, type VolumeUnit } from '@/types';

type Step = 'welcome' | 'units' | 'notifications' | 'vehicle';

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = getLocales()[0];
  const [step, setStep] = useState<Step>('welcome');
  const [units, setUnits] = useState(() => unitsForRegion(locale?.regionCode));
  const [currency, setCurrency] = useState(() => (locale?.currencyCode && isCurrencyCode(locale.currencyCode) ? locale.currencyCode : 'USD'));
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [fuel, setFuel] = useState<FuelType>('gasoline');
  const [odometer, setOdometer] = useState('');
  const [saving, setSaving] = useState(false);
  const odoValue = readNumber(odometer);

  const finish = async (withVehicle: boolean) => {
    setSaving(true);
    try {
      const prefs = usePreferences.getState();
      prefs.set({ units, currency });
      if (withVehicle && (make.trim() || model.trim() || name.trim())) {
        const id = await repos().vehicles.save(
          {
            name: name.trim() || [make.trim(), model.trim()].filter(Boolean).join(' ') || t('vehicleTypes.car'),
            make: make.trim(),
            model: model.trim(),
            trim: null,
            year: null,
            vehicleType: 'car',
            engine: null,
            fuelType: fuel,
            transmission: null,
            powerHp: null,
            plate: null,
            vin: null,
            purchaseDate: null,
            purchaseOdometerKm: null,
            odometerKm: odoValue && odoValue > 0 ? distanceToKm(odoValue, units.distance) : 0,
            purchasePriceMinor: null,
            currency,
            photoFile: null,
            color: VEHICLE_COLORS[0],
            notes: null,
            archived: false,
          },
          clock.now(),
        );
        prefs.set({ activeVehicleId: id });
        track('vehicle_added', { fuel_type: fuel, count: 1 });
      }
      prefs.set({ onboardingCompleted: true });
      track('onboarding_completed', { ui_language: currentLanguage(), distance_unit: units.distance });
      startPostOnboardingServices(repos(), i18n);
      afterWrite();
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  if (step === 'welcome') {
    return (
      <Screen edges={['top', 'bottom']} footer={<Button label={t('onboarding.start')} icon="arrow-forward" onPress={() => setStep('units')} testID="start" />}>
        <View style={{ alignItems: 'center', paddingTop: 32, gap: 16 }}>
          <View style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="car-sport" size={52} color={theme.colors.onPrimary} />
          </View>
          <Text variant="display" center>
            {t('onboarding.welcomeTitle')}
          </Text>
          <Text tone="muted" center>
            {t('onboarding.welcomeBody')}
          </Text>
        </View>
        <Stack gap={3} style={{ marginTop: 24 }}>
          {(['point1', 'point2', 'point3'] as const).map((k, i) => (
            <Row key={k} gap={3}>
              <Icon name={(['calendar', 'speedometer', 'lock-closed'] as const)[i]!} size={22} color={theme.colors.accent} />
              <Text style={{ flex: 1 }}>{t(`onboarding.${k}`)}</Text>
            </Row>
          ))}
        </Stack>
      </Screen>
    );
  }

  if (step === 'units') {
    return (
      <Screen edges={['top', 'bottom']} footer={<Button label={t('common.next')} icon="arrow-forward" onPress={() => setStep('notifications')} />}>
        <Text variant="title">{t('onboarding.unitsTitle')}</Text>
        <Text tone="muted">{t('onboarding.unitsBody')}</Text>
        <Text variant="label" tone="muted">
          {t('settings.distance')}
        </Text>
        <Segmented<DistanceUnit> value={units.distance} options={[{ value: 'km', label: 'km' }, { value: 'mi', label: 'mi' }]} onChange={(distance) => setUnits({ ...units, distance })} />
        <Text variant="label" tone="muted">
          {t('settings.volume')}
        </Text>
        <Segmented<VolumeUnit> value={units.volume} options={[{ value: 'L', label: 'L' }, { value: 'gal_us', label: 'gal (US)' }, { value: 'gal_uk', label: 'gal (UK)' }]} onChange={(volume) => setUnits({ ...units, volume })} />
        <Text variant="label" tone="muted">
          {t('settings.consumption')}
        </Text>
        <Segmented value={units.consumption} options={[{ value: 'l_per_100km', label: 'L/100 km' }, { value: 'km_per_l', label: 'km/L' }, { value: 'mpg_us', label: 'mpg US' }, { value: 'mpg_uk', label: 'mpg UK' }]} onChange={(consumption) => setUnits({ ...units, consumption })} />
        <ChoiceChips label={t('onboarding.currencyTitle')} value={currency} options={[...new Set([currency, ...COMMON_CURRENCIES.slice(0, 11)])].map((c) => ({ value: c, label: c }))} onChange={setCurrency} />
      </Screen>
    );
  }

  if (step === 'notifications') {
    return (
      <Screen
        edges={['top', 'bottom']}
        footer={
          <Stack gap={2}>
            <Button
              label={t('onboarding.enableNotifications')}
              icon="notifications"
              onPress={async () => {
                await ensurePermission(t).catch(() => undefined);
                usePreferences.getState().set({ notificationsEnabled: true });
                setStep('vehicle');
              }}
            />
            <Button
              label={t('onboarding.notNow')}
              variant="ghost"
              onPress={() => {
                usePreferences.getState().set({ notificationsEnabled: false });
                setStep('vehicle');
              }}
            />
          </Stack>
        }
      >
        <View style={{ alignItems: 'center', paddingTop: 32, gap: 16 }}>
          <Icon name="notifications-circle" size={88} color={theme.colors.primary} />
          <Text variant="title" center>
            {t('onboarding.notificationsTitle')}
          </Text>
          <Text tone="muted" center>
            {t('onboarding.notificationsBody')}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <Stack gap={2}>
          <Button label={t('onboarding.finish')} icon="checkmark" onPress={() => void finish(true)} loading={saving} testID="finish" />
          <Button label={t('common.skip')} variant="ghost" onPress={() => void finish(false)} disabled={saving} />
        </Stack>
      }
    >
      <Text variant="title">{t('onboarding.vehicleTitle')}</Text>
      <Text tone="muted">{t('onboarding.vehicleBody')}</Text>
      <Field label={t('vehicle.make')} value={make} onChangeText={setMake} autoCapitalize="words" />
      <Field label={t('vehicle.model')} value={model} onChangeText={setModel} autoCapitalize="words" />
      <Field label={`${t('vehicle.name')} (${t('common.optional')})`} value={name} onChangeText={setName} placeholder={t('vehicle.namePlaceholder')} />
      <ChoiceChips label={t('vehicle.fuel')} value={fuel} options={FUEL_TYPES.map((f) => ({ value: f, label: t(`fuelTypes.${f}`) }))} onChange={setFuel} />
      <NumberField label={t('vehicle.currentOdometer')} value={odometer} onChange={setOdometer} suffix={units.distance} error={odoValue !== null && !(odoValue >= 0) ? t('common.invalidNumber') : null} />
    </Screen>
  );
}
