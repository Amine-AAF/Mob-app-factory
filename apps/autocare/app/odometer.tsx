import { Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { DateField, FormScreen, InfoNote, NumberField, readNumber, VehicleChooser } from '@/components/ui';
import { repos } from '@/database';
import { checkReading } from '@/features/odometer/mileage';
import { distanceToKm } from '@/features/units/units';
import { useAsync, useFormat, useToday } from '@/hooks';
import { pickVehicleId, useEditorParams } from '@/hooks/data';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { usePreferences } from '@/store/preferences';
import { isValidDay } from '@/utils/dates';

/** Quick mileage update (keeps mileage-based reminders accurate). */
export default function OdometerUpdate() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const units = usePreferences((s) => s.units);
  const { vehicleId: vParam } = useEditorParams();
  const { data: vehicles } = useAsync(() => repos().vehicles.list(), []);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const { data: readings } = useAsync(() => (vehicleId ? repos().odometer.list(vehicleId) : Promise.resolve([])), [vehicleId]);
  const [day, setDay] = useState(today);
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const initial = vehicles && !vehicleId ? pickVehicleId(vehicles, vParam) : null;
  if (initial) setVehicleId(initial);

  const vehicle = vehicles?.find((v) => v.id === vehicleId);
  const n = readNumber(value);
  const km = n === null || !Number.isFinite(n) ? null : distanceToKm(n, units.distance);
  const issue = km !== null ? checkReading({ day, odometerKm: km }, readings ?? []) : null;
  const error = n === null ? t('common.required') : !(n >= 0) ? t('common.invalidNumber') : !isValidDay(day) ? t('common.invalidDate') : null;

  const persist = async () => {
    if (!vehicleId || km === null) return;
    await repos().odometer.add(vehicleId, day, km, clock.now());
    afterWrite();
    feedback.success();
    router.back();
  };

  const save = () => {
    setSubmitted(true);
    if (error || !vehicleId) return;
    if (issue === 'lower_than_earlier' || issue === 'higher_than_later') {
      Alert.alert(t(issue === 'lower_than_earlier' ? 'odometer.lowerThanEarlier' : 'odometer.higherThanLater'), undefined, [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('odometer.saveAnyway'), onPress: () => void persist() },
      ]);
      return;
    }
    void persist();
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t('odometer.title') }} />
      <FormScreen onSave={save}>
        <VehicleChooser vehicles={vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        {vehicle ? (
          <Text variant="bodySmall" tone="muted">
            {t('home.lastReading', { date: f.distance(vehicle.odometerKm) })}
          </Text>
        ) : null}
        <NumberField label={t('odometer.value')} value={value} onChange={setValue} suffix={f.distanceUnit} autoFocus error={submitted ? error : issue && issue !== 'negative' ? t(issue === 'lower_than_earlier' ? 'odometer.lowerThanEarlier' : 'odometer.higherThanLater') : null} testID="odometer-value" />
        <DateField label={t('common.date')} value={day} onChange={setDay} />
        <InfoNote text={t('odometer.estimateNote')} />
      </FormScreen>
    </>
  );
}
