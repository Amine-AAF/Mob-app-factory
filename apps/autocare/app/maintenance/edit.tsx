import { Button, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { AttachmentList, useAttachments } from '@/components/Attachments';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { ChoiceChips, DateField, Field, FormScreen, InfoNote, NumberField, readNumber, VehicleChooser } from '@/components/ui';
import { MAINTENANCE_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { toMinor } from '@/features/money/money';
import { distanceToKm, kmToDistance } from '@/features/units/units';
import { useAsync, useFormat, useToday } from '@/hooks';
import { currencyFor, pickVehicleId, useEditorParams } from '@/hooks/data';
import { recordError, track } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { usePreferences } from '@/store/preferences';
import { MAINTENANCE_TYPES, type MaintenanceType } from '@/types';
import { cleanText } from '@/utils';
import { isValidDay } from '@/utils/dates';

export default function MaintenanceEdit() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const units = usePreferences((s) => s.units);
  const { id, vehicleId: vParam, scheduleId, type: typeParam } = useEditorParams() as { id?: string; vehicleId?: string; scheduleId?: string; type?: MaintenanceType };
  const { data } = useAsync(async () => ({ vehicles: await repos().vehicles.list(), existing: id ? await repos().maintenance.get(id) : null, schedule: scheduleId ? await repos().schedules.get(scheduleId) : null }), [id, scheduleId]);

  const [loaded, setLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [type, setType] = useState<MaintenanceType>(typeParam ?? 'oil_change');
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(today);
  const [odometer, setOdometer] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState(usePreferences.getState().currency);
  const [parts, setParts] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const attachments = useAttachments('maintenance_id', id, 'invoice');

  // Hydrate the form once the record is loaded (render-time state adjustment, no extra effect pass).
  if (data && !loaded) {
    const e = data.existing;
    const vId = e?.vehicleId ?? data.schedule?.vehicleId ?? pickVehicleId(data.vehicles, vParam);
    setVehicleId(vId);
    const v = data.vehicles.find((x) => x.id === vId);
    if (e) {
      setType(e.type);
      setTitle(e.title ?? '');
      setDay(e.day);
      setOdometer(e.odometerKm === null ? '' : String(Math.round(kmToDistance(e.odometerKm, units.distance))));
      setDescription(e.description ?? '');
      setProvider(e.provider ?? '');
      setCost(e.costMinor === null ? '' : String(e.costMinor / 100));
      setCurrency(e.currency);
      setParts(e.parts ?? '');
      setNotes(e.notes ?? '');
    } else {
      if (data.schedule) {
        setType(data.schedule.type);
        setTitle(data.schedule.title ?? '');
      }
      if (v) {
        setCurrency(currencyFor(v));
        setOdometer(String(Math.round(kmToDistance(v.odometerKm, units.distance))));
      }
    }
    setLoaded(true);
  }

  // Discard picked-but-unsaved files when leaving without saving.
  const { discard } = attachments;
  // Picked-but-unsaved files are removed when the form closes (committed ones were already taken).
  useEffect(() => discard, [discard]);

  const odo = readNumber(odometer);
  const costN = readNumber(cost);
  const errors = {
    vehicle: !vehicleId ? t('common.chooseVehicle') : null,
    day: !isValidDay(day) ? t('common.invalidDate') : null,
    odometer: odo !== null && !(odo >= 0) ? t('common.invalidNumber') : null,
    cost: costN !== null && !(costN >= 0) ? t('common.invalidNumber') : null,
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
      const savedId = await repos().maintenance.save(
        {
          id: id ?? undefined,
          vehicleId,
          type,
          title: cleanText(title, 80),
          day,
          odometerKm: odo === null ? null : distanceToKm(odo, units.distance),
          description: cleanText(description, 2000),
          provider: cleanText(provider, 120),
          costMinor: costN === null ? null : toMinor(costN),
          currency,
          parts: cleanText(parts, 1000),
          notes: cleanText(notes, 2000),
          scheduleId: scheduleId ?? data?.existing?.scheduleId ?? null,
        },
        clock.now(),
      );
      await attachments.commit(savedId, vehicleId, title.trim() || t(`maintenanceTypes.${type}`));
      if (!id) track('maintenance_added', { type });
      afterWrite();
      feedback.success();
      router.back();
    } catch (e) {
      recordError(e, 'maintenance_save');
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
          await repos().maintenance.remove(id!, clock.now());
          afterWrite();
          router.back();
        },
      },
    ]);

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('maintenance.editTitle') : t('maintenance.new') }} />
      <FormScreen onSave={() => void save()} saving={saving} extra={id ? <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} /> : null}>
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        {show(errors.vehicle) ? (
          <Text variant="caption" tone="danger">
            {errors.vehicle}
          </Text>
        ) : null}
        <ChoiceChips label={t('maintenance.type')} value={type} options={MAINTENANCE_TYPES.map((x) => ({ value: x, label: t(`maintenanceTypes.${x}`), icon: MAINTENANCE_ICONS[x] }))} onChange={setType} />
        {type === 'other' || type === 'repair' || title ? <Field label={t('maintenance.customTitle')} value={title} onChangeText={setTitle} placeholder={t('maintenance.customTitlePlaceholder')} error={show(errors.title)} /> : null}
        <DateField label={t('common.date')} value={day} onChange={setDay} error={show(errors.day)} />
        <NumberField label={t('common.odometer')} value={odometer} onChange={setOdometer} suffix={f.distanceUnit} error={show(errors.odometer)} />
        <NumberField label={t('maintenance.cost')} value={cost} onChange={setCost} suffix={currency} error={show(errors.cost)} testID="maintenance-cost" />
        <Field label={t('maintenance.provider')} value={provider} onChangeText={setProvider} />
        <Field label={t('maintenance.description')} value={description} onChangeText={setDescription} multiline />
        <Field label={t('maintenance.parts')} value={parts} onChangeText={setParts} placeholder={t('maintenance.partsPlaceholder')} multiline />
        <AttachmentList state={attachments} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
        {data?.schedule ? <InfoNote icon="sync-outline" text={t('maintenance.linkedSchedule', { label: data.schedule.title ?? t(`maintenanceTypes.${data.schedule.type}`) })} /> : null}
      </FormScreen>
    </>
  );
}
