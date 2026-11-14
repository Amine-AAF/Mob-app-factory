import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, intOrNull, orNull } from '@/components/FormScreen';
import { AmountField, ChipSelect, DateField, PickerSheet, TextField } from '@/components/forms';
import { HOME_TYPE_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { amountInputValue, COMMON_CURRENCIES, parseAmount } from '@/domain/money';
import { HOME_TYPES, type HomeType } from '@/domain/types';
import { areaFromDisplay, areaToDisplay, areaUnitLabel } from '@/domain/units';
import { formatLocale } from '@/i18n';
import { recordError } from '@/services/analytics';
import { cleanOrphanFiles } from '@/services/boot';
import { mutate } from '@/services/mutations';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

export default function HomeEdit() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const prefs = usePreferences();
  const homesCount = useSession((s) => s.homes.length);
  const [name, setName] = useState('');
  const [type, setType] = useState<HomeType>('apartment');
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('');
  const [address, setAddress] = useState('');
  const [moveIn, setMoveIn] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState(prefs.currency);
  const [budget, setBudget] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void repos()
      .homes.get(id)
      .then((h) => {
        if (!h) return;
        setName(h.name);
        setType(h.type);
        setArea(h.areaM2 != null ? String(Math.round(areaToDisplay(h.areaM2, prefs.units) * 10) / 10) : '');
        setRooms(h.roomsCount != null ? String(h.roomsCount) : '');
        setAddress(h.address ?? '');
        setMoveIn(h.moveInDate);
        setDescription(h.description ?? '');
        setCurrency(h.currency);
        setBudget(amountInputValue(h.monthlyBudgetMinor, h.currency, formatLocale()));
      });
  }, [id, prefs.units]);

  const save = async () => {
    if (!name.trim()) {
      setError(t('validation.required'));
      return;
    }
    const areaValue = Number(area.replace(',', '.'));
    const input = {
      name: name.trim(),
      type,
      areaM2: area.trim() && Number.isFinite(areaValue) && areaValue > 0 ? areaFromDisplay(areaValue, prefs.units) : null,
      roomsCount: intOrNull(rooms),
      address: orNull(address),
      moveInDate: moveIn,
      description: orNull(description),
      currency,
      monthlyBudgetMinor: budget.trim() ? parseAmount(budget, currency) : null,
    };
    setSaving(true);
    try {
      if (id) await mutate(() => repos().homes.update(id, input), { homes: true });
      else {
        const home = await mutate(() => repos().homes.create(input), { homes: true });
        prefs.set({ activeHomeId: home.id });
      }
      router.back();
    } catch (e) {
      recordError(e, 'home_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    if (homesCount <= 1) {
      Alert.alert(t('homes.lastTitle'), t('homes.lastMessage'));
      return;
    }
    await mutate(() => repos().homes.remove(id), { homes: true });
    await cleanOrphanFiles(repos());
    router.replace('/(tabs)/myhome');
  };

  return (
    <FormScreen title={id ? t('homes.edit') : t('homes.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined} deleteMessage={t('homes.deleteMessage')}>
      <TextField label={t('fields.homeName')} value={name} onChangeText={(v) => (setName(v), setError(null))} error={error} testID="home-name" />
      <ChipSelect label={t('fields.homeType')} options={HOME_TYPES} value={type} onChange={(v) => v && setType(v)} renderLabel={(v) => t(`homeTypes.${v}`)} icon={(v) => HOME_TYPE_ICONS[v]} />
      <TextField label={`${t('fields.area')} (${areaUnitLabel(prefs.units)})`} value={area} onChangeText={setArea} keyboardType="decimal-pad" optional />
      <TextField label={t('fields.roomsCount')} value={rooms} onChangeText={setRooms} keyboardType="number-pad" optional maxLength={3} />
      <TextField label={t('fields.address')} value={address} onChangeText={setAddress} optional multiline />
      <DateField label={t('fields.moveInDate')} value={moveIn} onChange={setMoveIn} optional shortcuts="past" />
      <TextField label={t('fields.description')} value={description} onChangeText={setDescription} optional multiline />
      <AmountField label={t('fields.monthlyBudget')} value={budget} onChangeText={setBudget} currency={currency} onPressCurrency={() => setCurrencyOpen(true)} optional />
      <PickerSheet visible={currencyOpen} title={t('fields.currency')} options={COMMON_CURRENCIES} value={currency} renderLabel={(c) => c} onSelect={(c) => c && setCurrency(c)} onClose={() => setCurrencyOpen(false)} />
    </FormScreen>
  );
}
