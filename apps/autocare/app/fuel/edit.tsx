import { Button, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { CurrencyPicker } from '@/components/CurrencyPicker';
import { ChoiceChips, DateField, Field, FormScreen, InfoNote, NumberField, readNumber, Segmented, ToggleRow, VehicleChooser } from '@/components/ui';
import { repos } from '@/database';
import { validateFill } from '@/features/fuel/consumption';
import { toMinor } from '@/features/money/money';
import { distanceToKm, kmToDistance, litresToVolume, pricePerLitreToUnit, pricePerUnitToLitre, volumeToLitres } from '@/features/units/units';
import { useAsync, useFormat, useToday } from '@/hooks';
import { currencyFor, defaultQuantityUnit, pickVehicleId, useEditorParams } from '@/hooks/data';
import { recordError, track } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { usePreferences } from '@/store/preferences';
import { FUEL_TYPES, type FuelRecord, type FuelType, type QuantityUnit } from '@/types';
import { cleanText } from '@/utils';
import { isValidDay } from '@/utils/dates';

const round = (n: number, d: number) => String(Math.round(n * 10 ** d) / 10 ** d);

/** Fast entry: a fill-up takes a few seconds (date prefilled, last fuel type and station remembered). */
export default function FuelEdit() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const units = usePreferences((s) => s.units);
  const { id, vehicleId: vParam } = useEditorParams();
  const { data } = useAsync(async () => {
    const r = repos();
    const vehicles = await r.vehicles.list();
    const existing = id ? await r.fuel.get(id) : null;
    return { vehicles, existing };
  }, [id]);

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const vehicle = data?.vehicles.find((v) => v.id === vehicleId) ?? null;
  const { data: history } = useAsync(() => (vehicleId ? repos().fuel.list(vehicleId) : Promise.resolve([] as FuelRecord[])), [vehicleId]);

  const [loaded, setLoaded] = useState(false);
  const [day, setDay] = useState(today);
  const [odometer, setOdometer] = useState('');
  const [noOdometer, setNoOdometer] = useState(false);
  const [unit, setUnit] = useState<QuantityUnit>('L');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [total, setTotal] = useState('');
  const [currency, setCurrency] = useState(usePreferences.getState().currency);
  const [fuelType, setFuelType] = useState<FuelType>('gasoline');
  const [station, setStation] = useState('');
  const [isFull, setIsFull] = useState(true);
  const [missed, setMissed] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initial values: the edited record, or smart defaults from the vehicle and its last fill.
  // Hydrate the form once the record is loaded (render-time state adjustment, no extra effect pass).
  if (data && !loaded) {
    const e = data.existing;
    const vId = e?.vehicleId ?? pickVehicleId(data.vehicles, vParam);
    setVehicleId(vId);
    const v = data.vehicles.find((x) => x.id === vId);
    if (e) {
      setDay(e.day);
      setNoOdometer(e.odometerKm === null);
      setOdometer(e.odometerKm === null ? '' : round(kmToDistance(e.odometerKm, units.distance), 0));
      setUnit(e.quantityUnit);
      setQuantity(round(e.quantityUnit === 'kWh' ? e.quantity : litresToVolume(e.quantity, units.volume), 2));
      setPrice(e.unitPrice === null ? '' : round(e.quantityUnit === 'kWh' ? e.unitPrice : pricePerLitreToUnit(e.unitPrice, units.volume), 3));
      setTotal(String(e.totalMinor / 100));
      setCurrency(e.currency);
      setFuelType(e.fuelType);
      setStation(e.station ?? '');
      setIsFull(e.isFull);
      setMissed(e.missedPrevious);
      setNotes(e.notes ?? '');
    } else if (v) {
      setUnit(defaultQuantityUnit(v.fuelType));
      setFuelType(v.fuelType === 'hybrid' || v.fuelType === 'plugin_hybrid' ? 'gasoline' : v.fuelType);
      setCurrency(currencyFor(v));
    }
    setLoaded(true);
  }

  // Remember the last station / fuel type of the selected vehicle for new entries.
  const last = history?.[0];
  const [defaultsFrom, setDefaultsFrom] = useState<string | null>(null);
  if (loaded && !id && last && defaultsFrom !== last.id) {
    setDefaultsFrom(last.id);
    setFuelType(last.fuelType);
    setUnit(last.quantityUnit);
    if (!station) setStation(last.station ?? '');
  }

  const q = readNumber(quantity);
  const p = readNumber(price);
  const tot = readNumber(total);
  // Fill two of three: compute the third.
  const computed = useMemo(() => {
    if (q && p && tot === null) return { total: q * p };
    if (q && tot && p === null) return { price: tot / q };
    if (p && tot && q === null) return { quantity: tot / p };
    return {};
  }, [q, p, tot]);
  const finalQ = q ?? computed.quantity ?? null;
  const finalP = p ?? computed.price ?? null;
  const finalT = tot ?? computed.total ?? null;
  const odo = noOdometer ? null : readNumber(odometer);

  const quantityLitresOrKwh = finalQ === null ? null : unit === 'kWh' ? finalQ : volumeToLitres(finalQ, units.volume);
  const issues =
    vehicleId && quantityLitresOrKwh !== null && finalT !== null && Number.isFinite(finalT)
      ? validateFill({ id: id ?? '', day, odometerKm: odo === null || !Number.isFinite(odo) ? null : distanceToKm(odo, units.distance), quantity: quantityLitresOrKwh, totalMinor: toMinor(finalT) }, history ?? [])
      : [];
  const errors = {
    vehicle: !vehicleId ? t('common.chooseVehicle') : null,
    day: !isValidDay(day) ? t('common.invalidDate') : null,
    odometer: !noOdometer && (odo === null ? t('common.required') : !(odo >= 0) ? t('common.invalidNumber') : null),
    quantity: finalQ === null ? t('common.required') : !(finalQ > 0) ? t('fuel.issues.quantity_invalid') : null,
    total: finalT === null ? t('common.required') : !(finalT >= 0) ? t('fuel.issues.total_invalid') : null,
  };
  const warnings = issues.filter((i) => i === 'odometer_lower_than_previous' || i === 'odometer_higher_than_next');
  const show = (e: string | null | false) => (submitted && e ? e : null);

  const persist = async () => {
    if (!vehicleId || quantityLitresOrKwh === null || finalT === null) return;
    setSaving(true);
    try {
      await repos().fuel.save(
        {
          id: id ?? undefined,
          vehicleId,
          day,
          odometerKm: odo === null ? null : distanceToKm(odo, units.distance),
          quantity: quantityLitresOrKwh,
          quantityUnit: unit,
          unitPrice: finalP === null ? null : unit === 'kWh' ? finalP : pricePerUnitToLitre(finalP, units.volume),
          totalMinor: toMinor(finalT),
          currency,
          fuelType: unit === 'kWh' ? 'electric' : fuelType,
          station: cleanText(station, 80),
          isFull,
          missedPrevious: missed,
          notes: cleanText(notes, 1000),
        },
        clock.now(),
      );
      usePreferences.getState().set({ activeVehicleId: vehicleId });
      if (!id) track('fuel_added', { full: isFull });
      afterWrite();
      feedback.success();
      router.back();
    } catch (e) {
      recordError(e, 'fuel_save');
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) {
      feedback.warning();
      return;
    }
    if (warnings.length) {
      Alert.alert(t(`fuel.issues.${warnings[0]}`), undefined, [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('odometer.saveAnyway'), onPress: () => void persist() },
      ]);
      return;
    }
    void persist();
  };

  const remove = () =>
    Alert.alert(t('common.deleteConfirmTitle'), t('common.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().fuel.remove(id!, clock.now());
          afterWrite();
          router.back();
        },
      },
    ]);

  const canCharge = vehicle?.fuelType === 'electric' || vehicle?.fuelType === 'plugin_hybrid';
  const volumeLabel = unit === 'kWh' ? 'kWh' : f.volumeUnit;

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('fuel.editTitle') : unit === 'kWh' ? t('fuel.newCharge') : t('fuel.new') }} />
      <FormScreen onSave={save} saving={saving} extra={id ? <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} /> : null}>
        {data && data.vehicles.length === 0 ? <InfoNote text={t('home.noVehicleBody')} /> : null}
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        {show(errors.vehicle) ? (
          <Text variant="caption" tone="danger">
            {errors.vehicle}
          </Text>
        ) : null}
        {canCharge ? <Segmented<QuantityUnit> value={unit} options={[{ value: 'L', label: t('fuelTypes.gasoline') + ' / ' + t('fuelTypes.diesel') }, { value: 'kWh', label: 'kWh' }]} onChange={setUnit} /> : null}
        <DateField label={t('common.date')} value={day} onChange={setDay} error={show(errors.day)} />
        <Stack gap={1}>
          <NumberField
            label={t('common.odometer')}
            value={odometer}
            onChange={setOdometer}
            suffix={f.distanceUnit}
            editable={!noOdometer}
            error={show(errors.odometer) ?? (warnings[0] ? t(`fuel.issues.${warnings[0]}`) : null)}
            hint={last?.odometerKm !== null && last?.odometerKm !== undefined ? t('fuel.lastFill', { date: f.day(last.day), quantity: f.distance(last.odometerKm) }) : null}
            testID="fuel-odometer"
          />
          <ToggleRow label={t('fuel.noOdometer')} value={noOdometer} onChange={setNoOdometer} />
        </Stack>
        <NumberField label={unit === 'kWh' ? t('fuel.energy') : t('fuel.quantity')} value={quantity} onChange={setQuantity} suffix={volumeLabel} error={show(errors.quantity)} hint={computed.quantity ? `= ${round(computed.quantity, 2)} ${volumeLabel}` : null} testID="fuel-quantity" />
        <NumberField label={t('fuel.unitPrice')} value={price} onChange={setPrice} suffix={`${currency}/${volumeLabel}`} hint={computed.price ? `= ${round(computed.price, 3)}` : null} />
        <NumberField label={t('fuel.total')} value={total} onChange={setTotal} suffix={currency} error={show(errors.total)} hint={computed.total ? `= ${f.money(toMinor(computed.total), currency)}` : t('fuel.autoCalc')} testID="fuel-total" />
        <ToggleRow label={t('fuel.full')} hint={t('fuel.fullHint')} value={isFull} onChange={setIsFull} />
        <ToggleRow label={t('fuel.missedPrevious')} hint={t('fuel.missedHint')} value={missed} onChange={setMissed} />
        {unit === 'L' ? <ChoiceChips label={t('fuel.fuelType')} value={fuelType} options={FUEL_TYPES.filter((x) => x !== 'electric' && x !== 'hybrid' && x !== 'plugin_hybrid').map((x) => ({ value: x, label: t(`fuelTypes.${x}`) }))} onChange={setFuelType} /> : null}
        <Field label={`${t('fuel.station')} (${t('common.optional')})`} value={station} onChangeText={setStation} />
        <CurrencyPicker value={currency} onChange={setCurrency} extra={vehicle ? [vehicle.currency] : []} />
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
      </FormScreen>
    </>
  );
}
