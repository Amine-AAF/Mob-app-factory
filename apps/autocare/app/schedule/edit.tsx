import { Button, Row, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { ChoiceChips, DateField, Field, FormScreen, InfoNote, NumberField, PremiumGate, readNumber, ToggleRow, VehicleChooser } from '@/components/ui';
import { MAINTENANCE_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { scheduleErrors } from '@/features/maintenance/schedule';
import { canAddSchedule, FREE_LIMITS } from '@/features/premium/limits';
import { distanceToKm, kmToDistance } from '@/features/units/units';
import { useAsync, useFormat } from '@/hooks';
import { pickVehicleId, useEditorParams } from '@/hooks/data';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { MAINTENANCE_TYPES, type MaintenanceType } from '@/types';
import { cleanText } from '@/utils';
import { isValidDay } from '@/utils/dates';

/** User-defined interval: no default numbers are suggested (they depend on the vehicle). */
export default function ScheduleEdit() {
  const { t } = useTranslation();
  const f = useFormat();
  const premium = useIsPremium();
  const units = usePreferences((s) => s.units);
  const { id, vehicleId: vParam } = useEditorParams();
  const { data } = useAsync(async () => ({ vehicles: await repos().vehicles.list(), existing: id ? await repos().schedules.get(id) : null, count: await repos().schedules.countEnabled() }), [id]);

  const [loaded, setLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [type, setType] = useState<MaintenanceType>('oil_change');
  const [title, setTitle] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [intervalMonths, setIntervalMonths] = useState('');
  const [lastDay, setLastDay] = useState('');
  const [lastOdo, setLastOdo] = useState('');
  const [remindDays, setRemindDays] = useState('14');
  const [remindKm, setRemindKm] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Hydrate the form once the record is loaded (render-time state adjustment, no extra effect pass).
  if (data && !loaded) {
    const e = data.existing;
    setVehicleId(e?.vehicleId ?? pickVehicleId(data.vehicles, vParam));
    const d = (km: number | null) => (km === null ? '' : String(Math.round(kmToDistance(km, units.distance))));
    if (e) {
      setType(e.type);
      setTitle(e.title ?? '');
      setIntervalKm(d(e.intervalKm));
      setIntervalMonths(e.intervalMonths ? String(e.intervalMonths) : '');
      setLastDay(e.lastDay ?? '');
      setLastOdo(d(e.lastOdometerKm));
      setRemindDays(String(e.remindDaysBefore));
      setRemindKm(d(e.remindKmBefore));
      setEnabled(e.enabled);
      setNotes(e.notes ?? '');
    } else setRemindKm(units.distance === 'km' ? '500' : '300');
    setLoaded(true);
  }

  if (!id && data && !canAddSchedule(premium, data.count)) {
    return (
      <View style={{ padding: 20 }}>
        <RouterStack.Screen options={{ title: t('schedules.new') }} />
        <PremiumGate reason="schedules" title={t('schedules.limitTitle', { count: FREE_LIMITS.schedules })} />
      </View>
    );
  }

  const km = readNumber(intervalKm);
  const months = readNumber(intervalMonths);
  const lOdo = readNumber(lastOdo);
  const rDays = readNumber(remindDays);
  const rKm = readNumber(remindKm);
  const domain = scheduleErrors({ intervalKm: km, intervalMonths: months });
  const errors = {
    vehicle: !vehicleId ? t('common.chooseVehicle') : null,
    interval: domain[0] ? t(`schedules.errors.${domain[0]}`) : null,
    lastDay: lastDay && !isValidDay(lastDay) ? t('common.invalidDate') : null,
    lastOdo: lOdo !== null && !(lOdo >= 0) ? t('common.invalidNumber') : null,
    remindDays: rDays === null || !(Number.isInteger(rDays) && rDays >= 0 && rDays <= 365) ? t('common.invalidNumber') : null,
    remindKm: rKm !== null && !(rKm >= 0) ? t('common.invalidNumber') : null,
    title: type === 'other' && !title.trim() ? t('common.required') : null,
  };
  const show = (e: string | null) => (submitted ? e : null);

  const save = async () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !vehicleId) {
      feedback.warning();
      return;
    }
    setSaving(true);
    try {
      await repos().schedules.save(
        {
          id: id ?? undefined,
          vehicleId,
          type,
          title: cleanText(title, 80),
          intervalKm: km === null ? null : distanceToKm(km, units.distance),
          intervalMonths: months,
          lastDay: lastDay || null,
          lastOdometerKm: lOdo === null ? null : distanceToKm(lOdo, units.distance),
          remindDaysBefore: rDays ?? 14,
          remindKmBefore: rKm === null ? 0 : distanceToKm(rKm, units.distance),
          enabled,
          notes: cleanText(notes, 1000),
        },
        clock.now(),
      );
      afterWrite();
      feedback.success();
      router.back();
    } catch (e) {
      recordError(e, 'schedule_save');
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert(t('common.deleteConfirmTitle'), t('common.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().schedules.remove(id!);
          afterWrite();
          router.back();
        },
      },
    ]);

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('schedules.editTitle') : t('schedules.new') }} />
      <FormScreen
        onSave={() => void save()}
        saving={saving}
        extra={
          id ? (
            <Row gap={2}>
              <View style={{ flex: 1 }}>
                <Button label={t('schedules.markDone')} icon="checkmark-done" variant="secondary" size="md" onPress={() => router.push({ pathname: '/maintenance/edit', params: { scheduleId: id } })} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} />
              </View>
            </Row>
          ) : null
        }
      >
        <InfoNote text={t('schedules.intro')} />
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        <ChoiceChips label={t('maintenance.type')} value={type} options={MAINTENANCE_TYPES.filter((x) => x !== 'repair').map((x) => ({ value: x, label: t(`maintenanceTypes.${x}`), icon: MAINTENANCE_ICONS[x] }))} onChange={setType} />
        {type === 'other' || title ? <Field label={t('maintenance.customTitle')} value={title} onChangeText={setTitle} error={show(errors.title)} /> : null}
        <NumberField label={t('schedules.intervalKm')} value={intervalKm} onChange={setIntervalKm} suffix={f.distanceUnit} testID="interval-km" />
        <NumberField label={t('schedules.intervalMonths')} value={intervalMonths} onChange={setIntervalMonths} keyboardType="number-pad" error={show(errors.interval)} hint={t('schedules.intervalHint')} />
        <DateField label={t('schedules.lastDone')} value={lastDay} onChange={setLastDay} error={show(errors.lastDay)} allowEmpty />
        <NumberField label={t('schedules.lastDoneOdometer')} value={lastOdo} onChange={setLastOdo} suffix={f.distanceUnit} error={show(errors.lastOdo)} />
        <NumberField label={t('schedules.remindDays')} value={remindDays} onChange={setRemindDays} keyboardType="number-pad" error={show(errors.remindDays)} />
        <NumberField label={t('schedules.remindKm')} value={remindKm} onChange={setRemindKm} suffix={f.distanceUnit} error={show(errors.remindKm)} />
        <ToggleRow label={t('schedules.enabled')} value={enabled} onChange={setEnabled} />
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
        <Text variant="caption" tone="subtle">
          {t('common.verifyManual')}
        </Text>
      </FormScreen>
    </>
  );
}
