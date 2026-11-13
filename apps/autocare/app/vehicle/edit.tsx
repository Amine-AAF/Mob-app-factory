import { Button, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { CurrencyPicker } from '@/components/CurrencyPicker';
import { ChoiceChips, DateField, Field, FormScreen, NumberField, PremiumGate, readNumber, SectionCard, VehicleAvatar } from '@/components/ui';
import { VEHICLE_COLORS } from '@/config/brand';
import { repos } from '@/database';
import { toMinor } from '@/features/money/money';
import { canAddVehicle } from '@/features/premium/limits';
import { distanceToKm, kmToDistance } from '@/features/units/units';
import { useAsync } from '@/hooks';
import { useEditorParams } from '@/hooks/data';
import { recordError, track } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { deleteStoredFile, FileTooLargeError, pickAndStore } from '@/services/fileStore';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_TYPES, type FuelType, type Transmission, type VehicleType } from '@/types';
import { cleanText, looksLikeVin } from '@/utils';
import { isValidDay } from '@/utils/dates';

const fmtNum = (n: number | null | undefined, digits = 0) => (n === null || n === undefined ? '' : String(Math.round(n * 10 ** digits) / 10 ** digits));

export default function VehicleEdit() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useEditorParams();
  const premium = useIsPremium();
  const units = usePreferences((s) => s.units);
  const defaultCurrency = usePreferences((s) => s.currency);
  const { data } = useAsync(async () => ({ vehicle: id ? await repos().vehicles.get(id) : null, count: await repos().vehicles.countActive() }), [id]);

  const [loaded, setLoaded] = useState(!id);
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState<VehicleType>('car');
  const [engine, setEngine] = useState('');
  const [fuel, setFuel] = useState<FuelType>('gasoline');
  const [transmission, setTransmission] = useState<Transmission | null>(null);
  const [power, setPower] = useState('');
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseOdo, setPurchaseOdo] = useState('');
  const [odometer, setOdometer] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [photo, setPhoto] = useState<string | null>(null);
  const [color, setColor] = useState<string>(VEHICLE_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [archived, setArchived] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Hydrate the form once the vehicle is loaded (render-time state adjustment, no extra effect pass).
  const v = data?.vehicle;
  if (v && !loaded) {
    setName(v.name);
    setMake(v.make);
    setModel(v.model);
    setTrim(v.trim ?? '');
    setYear(v.year ? String(v.year) : '');
    setType(v.vehicleType);
    setEngine(v.engine ?? '');
    setFuel(v.fuelType);
    setTransmission(v.transmission);
    setPower(fmtNum(v.powerHp));
    setPlate(v.plate ?? '');
    setVin(v.vin ?? '');
    setPurchaseDate(v.purchaseDate ?? '');
    setPurchaseOdo(v.purchaseOdometerKm === null ? '' : fmtNum(kmToDistance(v.purchaseOdometerKm, units.distance)));
    setOdometer(fmtNum(kmToDistance(v.odometerKm, units.distance)));
    setPrice(v.purchasePriceMinor === null ? '' : String(v.purchasePriceMinor / 100));
    setCurrency(v.currency);
    setPhoto(v.photoFile);
    setColor(v.color);
    setNotes(v.notes ?? '');
    setArchived(v.archived);
    setLoaded(true);
  }

  if (!id && data && !canAddVehicle(premium, data.count)) {
    return (
      <View style={{ padding: 20, gap: 16 }}>
        <RouterStack.Screen options={{ title: t('vehicle.new') }} />
        <PremiumGate reason="vehicles" title={t('vehicles.limitTitle')} body={t('vehicles.limitBody')} />
      </View>
    );
  }

  const yearN = readNumber(year);
  const odoN = readNumber(odometer);
  const purchaseOdoN = readNumber(purchaseOdo);
  const powerN = readNumber(power);
  const priceN = readNumber(price);
  const errors = {
    make: !make.trim() && !name.trim() ? t('common.required') : null,
    year: yearN !== null && !(Number.isInteger(yearN) && yearN >= 1900 && yearN <= new Date().getFullYear() + 1) ? t('common.invalidNumber') : null,
    odometer: odoN === null ? t('common.required') : !(odoN >= 0) ? t('common.invalidNumber') : null,
    purchaseOdo: purchaseOdoN !== null && !(purchaseOdoN >= 0) ? t('common.invalidNumber') : null,
    power: powerN !== null && !(powerN > 0) ? t('common.invalidNumber') : null,
    price: priceN !== null && !(priceN >= 0) ? t('common.invalidNumber') : null,
    purchaseDate: purchaseDate && !isValidDay(purchaseDate) ? t('common.invalidDate') : null,
  };
  const show = (e: string | null) => (submitted ? e : null);

  const save = async () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) {
      feedback.warning();
      return;
    }
    setSaving(true);
    try {
      const existing = data?.vehicle;
      const savedId = await repos().vehicles.save(
        {
          id: existing?.id,
          name: name.trim() || [make.trim(), model.trim()].filter(Boolean).join(' '),
          make: make.trim(),
          model: model.trim(),
          trim: cleanText(trim, 80),
          year: yearN,
          vehicleType: type,
          engine: cleanText(engine, 80),
          fuelType: fuel,
          transmission,
          powerHp: powerN,
          plate: cleanText(plate, 20),
          vin: cleanText(vin.toUpperCase(), 20),
          purchaseDate: purchaseDate || null,
          purchaseOdometerKm: purchaseOdoN === null ? null : distanceToKm(purchaseOdoN, units.distance),
          // The stored odometer stays the highest reading; a typo is corrected in the mileage history.
          odometerKm: distanceToKm(odoN ?? 0, units.distance),
          purchasePriceMinor: priceN === null ? null : toMinor(priceN),
          currency,
          photoFile: photo,
          color,
          notes: cleanText(notes, 2000),
          archived,
        },
        clock.now(),
      );
      if (existing?.photoFile && existing.photoFile !== photo) deleteStoredFile(existing.photoFile);
      if (!existing) {
        usePreferences.getState().set({ activeVehicleId: savedId });
        track('vehicle_added', { fuel_type: fuel, count: (data?.count ?? 0) + 1 });
      }
      afterWrite();
      feedback.success();
      router.back();
    } catch (e) {
      recordError(e, 'vehicle_save');
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (!data?.vehicle) return;
    Alert.alert(t('vehicle.deleteTitle'), t('vehicle.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('vehicle.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          const files = await repos().vehicles.remove(data.vehicle!.id);
          files.forEach(deleteStoredFile);
          if (usePreferences.getState().activeVehicleId === data.vehicle!.id) usePreferences.getState().set({ activeVehicleId: null });
          afterWrite();
          router.dismissTo('/(tabs)/vehicles');
        },
      },
    ]);
  };

  const pickPhoto = async () => {
    setPhotoError(null);
    try {
      const picked = await pickAndStore('photo');
      if (picked) {
        if (photo && photo !== data?.vehicle?.photoFile) deleteStoredFile(photo);
        setPhoto(picked.fileName);
      }
    } catch (e) {
      setPhotoError(e instanceof FileTooLargeError ? t('documents.tooLarge') : t('common.error'));
    }
  };

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('vehicle.editTitle') : t('vehicle.new') }} />
      <FormScreen
        onSave={() => void save()}
        saving={saving}
        extra={
          data?.vehicle ? (
            <Row gap={2}>
              <View style={{ flex: 1 }}>
                <Button label={archived ? t('vehicle.unarchive') : t('vehicle.archive')} variant="secondary" size="md" icon="archive-outline" onPress={() => setArchived(!archived)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} />
              </View>
            </Row>
          ) : null
        }
      >
        <Row gap={3}>
          <VehicleAvatar vehicle={{ photoFile: photo, color, vehicleType: type, fuelType: fuel }} size={72} />
          <Stack gap={2} style={{ flex: 1 }}>
            <Button label={photo ? t('vehicle.changePhoto') : t('vehicle.addPhoto')} icon="image-outline" variant="secondary" size="md" onPress={() => void pickPhoto()} />
            {photo ? <Button label={t('vehicle.removePhoto')} variant="ghost" size="md" onPress={() => setPhoto(null)} /> : null}
            {photoError ? (
              <Text variant="caption" tone="danger">
                {photoError}
              </Text>
            ) : null}
          </Stack>
        </Row>
        <Row gap={2} wrap accessibilityLabel={t('vehicle.color')}>
          {VEHICLE_COLORS.map((c) => (
            <Pressable key={c} onPress={() => setColor(c)} accessibilityRole="radio" accessibilityState={{ selected: color === c }} accessibilityLabel={`${t('vehicle.color')} ${c}`} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c, borderWidth: 3, borderColor: color === c ? theme.colors.text : 'transparent' }} />
          ))}
        </Row>

        <SectionCard title={t('vehicle.identity')}>
          <Field label={t('vehicle.make')} value={make} onChangeText={setMake} autoCapitalize="words" error={show(errors.make)} testID="make" />
          <Field label={t('vehicle.model')} value={model} onChangeText={setModel} autoCapitalize="words" testID="model" />
          <Field label={`${t('vehicle.trim')} (${t('common.optional')})`} value={trim} onChangeText={setTrim} />
          <Field label={`${t('vehicle.name')} (${t('common.optional')})`} value={name} onChangeText={setName} placeholder={t('vehicle.namePlaceholder')} />
          <NumberField label={t('vehicle.year')} value={year} onChange={setYear} keyboardType="number-pad" maxLength={4} error={show(errors.year)} />
          <ChoiceChips label={t('vehicle.type')} value={type} options={VEHICLE_TYPES.map((v) => ({ value: v, label: t(`vehicleTypes.${v}`) }))} onChange={setType} />
          <Field label={t('vehicle.plate')} value={plate} onChangeText={setPlate} autoCapitalize="characters" />
          <Field label={`${t('vehicle.vin')} (${t('common.optional')})`} value={vin} onChangeText={setVin} autoCapitalize="characters" maxLength={20} hint={vin.trim() && !looksLikeVin(vin) ? t('vehicle.vinWarning') : null} />
        </SectionCard>

        <SectionCard title={t('vehicle.technical')}>
          <ChoiceChips label={t('vehicle.fuel')} value={fuel} options={FUEL_TYPES.map((v) => ({ value: v, label: t(`fuelTypes.${v}`) }))} onChange={setFuel} />
          <Field label={`${t('vehicle.engine')} (${t('common.optional')})`} value={engine} onChangeText={setEngine} placeholder={t('vehicle.enginePlaceholder')} />
          <ChoiceChips label={t('vehicle.transmission')} value={transmission} options={TRANSMISSIONS.map((v) => ({ value: v, label: t(`transmissions.${v}`) }))} onChange={setTransmission} />
          <NumberField label={`${t('vehicle.power')} (${t('common.optional')})`} value={power} onChange={setPower} error={show(errors.power)} />
          <NumberField label={t('vehicle.currentOdometer')} value={odometer} onChange={setOdometer} suffix={units.distance} error={show(errors.odometer)} testID="odometer" />
        </SectionCard>

        <SectionCard title={t('vehicle.purchase')}>
          <DateField label={`${t('vehicle.purchaseDate')} (${t('common.optional')})`} value={purchaseDate} onChange={setPurchaseDate} allowEmpty />
          <NumberField label={`${t('vehicle.purchaseOdometer')} (${t('common.optional')})`} value={purchaseOdo} onChange={setPurchaseOdo} suffix={units.distance} error={show(errors.purchaseOdo)} />
          <NumberField label={`${t('vehicle.purchasePrice')} (${t('common.optional')})`} value={price} onChange={setPrice} suffix={currency} error={show(errors.price)} />
          <CurrencyPicker value={currency} onChange={setCurrency} />
        </SectionCard>

        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
      </FormScreen>
    </>
  );
}
