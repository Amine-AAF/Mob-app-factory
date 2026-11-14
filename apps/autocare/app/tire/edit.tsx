import { Button } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { CurrencyPicker } from '@/components/CurrencyPicker';
import { ChoiceChips, DateField, Field, FormScreen, InfoNote, NumberField, readNumber, VehicleChooser } from '@/components/ui';
import { repos } from '@/database';
import { toMinor } from '@/features/money/money';
import { distanceToKm, kmToDistance } from '@/features/units/units';
import { useAsync, useFormat, useToday } from '@/hooks';
import { currencyFor, pickVehicleId, useEditorParams } from '@/hooks/data';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { usePreferences } from '@/store/preferences';
import { TIRE_POSITIONS, TIRE_SEASONS, TIRE_STATUSES, type TirePosition, type TireSeason, type TireStatus } from '@/types';
import { cleanText } from '@/utils';
import { isValidDay } from '@/utils/dates';

export default function TireEdit() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const units = usePreferences((s) => s.units);
  const { id, vehicleId: vParam } = useEditorParams();
  const { data } = useAsync(async () => ({ vehicles: await repos().vehicles.list(), existing: id ? await repos().tires.get(id) : null }), [id]);

  const [loaded, setLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [size, setSize] = useState('');
  const [season, setSeason] = useState<TireSeason>('all_season');
  const [position, setPosition] = useState<TirePosition>('all');
  const [installed, setInstalled] = useState(today);
  const [installedOdo, setInstalledOdo] = useState('');
  const [removed, setRemoved] = useState('');
  const [removedOdo, setRemovedOdo] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState<TireStatus>('mounted');
  const [reminderDay, setReminderDay] = useState('');
  const [reminderKm, setReminderKm] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Hydrate the form once the record is loaded (render-time state adjustment, no extra effect pass).
  if (data && !loaded) {
    const e = data.existing;
    const vId = e?.vehicleId ?? pickVehicleId(data.vehicles, vParam);
    setVehicleId(vId);
    const d = (km: number | null) => (km === null ? '' : String(Math.round(kmToDistance(km, units.distance))));
    if (e) {
      setBrand(e.brand);
      setModel(e.model ?? '');
      setSize(e.size ?? '');
      setSeason(e.season);
      setPosition(e.position);
      setInstalled(e.installedDay);
      setInstalledOdo(d(e.installedOdometerKm));
      setRemoved(e.removedDay ?? '');
      setRemovedOdo(d(e.removedOdometerKm));
      setPrice(e.priceMinor === null ? '' : String(e.priceMinor / 100));
      setCurrency(e.currency);
      setStatus(e.status);
      setReminderDay(e.reminderDay ?? '');
      setReminderKm(d(e.reminderKm));
      setNotes(e.notes ?? '');
    } else {
      const v = data.vehicles.find((x) => x.id === vId);
      setCurrency(currencyFor(v));
      if (v) setInstalledOdo(d(v.odometerKm));
    }
    setLoaded(true);
  }

  const iOdo = readNumber(installedOdo);
  const rOdo = readNumber(removedOdo);
  const priceN = readNumber(price);
  const remKm = readNumber(reminderKm);
  const errors = {
    vehicle: !vehicleId ? t('common.chooseVehicle') : null,
    brand: !brand.trim() ? t('common.required') : null,
    installed: !isValidDay(installed) ? t('common.invalidDate') : null,
    removed: removed && (!isValidDay(removed) || removed < installed) ? t('common.invalidDate') : null,
    iOdo: iOdo !== null && !(iOdo >= 0) ? t('common.invalidNumber') : null,
    rOdo: rOdo !== null && (!(rOdo >= 0) || (iOdo !== null && rOdo < iOdo)) ? t('common.invalidNumber') : null,
    price: priceN !== null && !(priceN >= 0) ? t('common.invalidNumber') : null,
    reminderDay: reminderDay && !isValidDay(reminderDay) ? t('common.invalidDate') : null,
    reminderKm: remKm !== null && !(remKm > 0) ? t('common.invalidNumber') : null,
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
      const k = (v: number | null) => (v === null ? null : distanceToKm(v, units.distance));
      await repos().tires.save(
        {
          id: id ?? undefined,
          vehicleId,
          brand: brand.trim().slice(0, 60),
          model: cleanText(model, 60),
          size: cleanText(size, 40),
          season,
          position,
          installedDay: installed,
          installedOdometerKm: k(iOdo),
          removedDay: removed || null,
          removedOdometerKm: k(rOdo),
          priceMinor: priceN === null ? null : toMinor(priceN),
          currency,
          status: removed && status === 'mounted' ? 'stored' : status,
          reminderDay: reminderDay || null,
          reminderKm: k(remKm),
          notes: cleanText(notes, 1000),
        },
        clock.now(),
      );
      afterWrite();
      feedback.success();
      router.back();
    } catch (e) {
      recordError(e, 'tire_save');
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
          await repos().tires.remove(id!);
          afterWrite();
          router.back();
        },
      },
    ]);

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('tires.editTitle') : t('tires.new') }} />
      <FormScreen onSave={() => void save()} saving={saving} extra={id ? <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} /> : null}>
        <InfoNote text={t('tires.noWear')} />
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        <Field label={t('tires.brand')} value={brand} onChangeText={setBrand} error={show(errors.brand)} />
        <Field label={`${t('tires.model')} (${t('common.optional')})`} value={model} onChangeText={setModel} />
        <Field label={`${t('tires.size')} (${t('common.optional')})`} value={size} onChangeText={setSize} placeholder={t('tires.sizePlaceholder')} autoCapitalize="characters" />
        <ChoiceChips label={t('tires.season')} value={season} options={TIRE_SEASONS.map((x) => ({ value: x, label: t(`tireSeasons.${x}`) }))} onChange={setSeason} />
        <ChoiceChips label={t('tires.position')} value={position} options={TIRE_POSITIONS.map((x) => ({ value: x, label: t(`tirePositions.${x}`) }))} onChange={setPosition} />
        <ChoiceChips label={t('tires.status')} value={status} options={TIRE_STATUSES.map((x) => ({ value: x, label: t(`tireStatuses.${x}`) }))} onChange={setStatus} />
        <DateField label={t('tires.installed')} value={installed} onChange={setInstalled} error={show(errors.installed)} />
        <NumberField label={t('tires.installedOdometer')} value={installedOdo} onChange={setInstalledOdo} suffix={f.distanceUnit} error={show(errors.iOdo)} />
        <DateField label={`${t('tires.removed')} (${t('common.optional')})`} value={removed} onChange={setRemoved} error={show(errors.removed)} allowEmpty />
        <NumberField label={`${t('tires.removedOdometer')} (${t('common.optional')})`} value={removedOdo} onChange={setRemovedOdo} suffix={f.distanceUnit} error={show(errors.rOdo)} />
        <NumberField label={`${t('tires.price')} (${t('common.optional')})`} value={price} onChange={setPrice} suffix={currency} error={show(errors.price)} />
        <DateField label={`${t('tires.reminderDay')} (${t('common.optional')})`} value={reminderDay} onChange={setReminderDay} error={show(errors.reminderDay)} allowEmpty />
        <NumberField label={`${t('tires.reminderKm')} (${t('common.optional')})`} value={reminderKm} onChange={setReminderKm} suffix={f.distanceUnit} error={show(errors.reminderKm)} hint={t('common.estimatedLong')} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
      </FormScreen>
    </>
  );
}
