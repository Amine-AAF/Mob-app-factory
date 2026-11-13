import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, orNull } from '@/components/FormScreen';
import { AmountField, ChipSelect, DateField, PickerSheet, SelectField, TextField } from '@/components/forms';
import { ASSET_ICONS } from '@/config/icons';
import { canCreate } from '@/config/limits';
import { repos } from '@/database';
import { addYears } from '@/domain/dates';
import { amountInputValue, COMMON_CURRENCIES, parseAmount } from '@/domain/money';
import { ASSET_CATEGORIES, ASSET_STATUSES, type AssetCategory, type AssetStatus, type Room } from '@/domain/types';
import { useActiveHome } from '@/hooks/useHome';
import { formatLocale } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { cleanOrphanFiles } from '@/services/boot';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

export default function AssetEdit() {
  const { t } = useTranslation();
  const { id, roomId: presetRoom } = useLocalSearchParams<{ id?: string; roomId?: string }>();
  const home = useActiveHome();
  const isPremium = useIsPremium();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('other');
  const [roomId, setRoomId] = useState<string | null>(presetRoom ?? null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(home?.currency ?? 'USD');
  const [vendor, setVendor] = useState('');
  const [warrantyEnd, setWarrantyEnd] = useState<string | null>(null);
  const [status, setStatus] = useState<AssetStatus>('active');
  const [notes, setNotes] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!home) return;
    void repos().homes.listRooms(home.id).then(setRooms);
    if (!id) return;
    void repos()
      .assets.get(id)
      .then((a) => {
        if (!a) return;
        setName(a.name);
        setCategory(a.category);
        setRoomId(a.roomId);
        setBrand(a.brand ?? '');
        setModel(a.model ?? '');
        setSerial(a.serialNumber ?? '');
        setPurchaseDate(a.purchaseDate);
        setCurrency(a.currency ?? home.currency);
        setPrice(amountInputValue(a.purchasePriceMinor, a.currency ?? home.currency, formatLocale()));
        setVendor(a.vendor ?? '');
        setWarrantyEnd(a.warrantyEnd);
        setStatus(a.status);
        setNotes(a.notes ?? '');
      });
  }, [id, home]);

  const save = async () => {
    if (!home) return;
    if (!name.trim()) {
      setError(t('validation.required'));
      return;
    }
    const priceMinor = price.trim() ? parseAmount(price, currency) : null;
    if (price.trim() && priceMinor === null) {
      Alert.alert(t('common.error'), t('validation.amount'));
      return;
    }
    if (purchaseDate && warrantyEnd && warrantyEnd < purchaseDate) {
      Alert.alert(t('common.error'), t('validation.warrantyBeforePurchase'));
      return;
    }
    const input = {
      name: name.trim(),
      category,
      roomId,
      brand: orNull(brand),
      model: orNull(model),
      serialNumber: orNull(serial),
      purchaseDate,
      purchasePriceMinor: priceMinor,
      currency: priceMinor != null ? currency : null,
      vendor: orNull(vendor),
      warrantyEnd,
      status,
      notes: orNull(notes),
    };
    setSaving(true);
    try {
      if (id) {
        await mutate(() => repos().assets.update(id, input));
        router.back();
      } else {
        if (!canCreate('assets', await repos().assets.count(home.id), isPremium)) {
          router.replace({ pathname: '/paywall', params: { source: 'assets_limit' } });
          return;
        }
        const asset = await mutate(() => repos().assets.create(home.id, input));
        track('asset_created', { category });
        router.replace(`/assets/${asset.id}`);
      }
    } catch (e) {
      recordError(e, 'asset_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    await mutate(async () => {
      await repos().photos.removeForOwner('asset', id);
      await repos().assets.remove(id);
    });
    await cleanOrphanFiles(repos());
    router.replace('/assets');
  };

  return (
    <FormScreen title={id ? t('assets.edit') : t('assets.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined} deleteMessage={t('assets.deleteMessage')}>
      <TextField
        label={t('fields.name')}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(null);
        }}
        placeholder={t('assets.namePlaceholder')}
        error={error}
        testID="asset-name"
      />
      <ChipSelect label={t('fields.category')} options={ASSET_CATEGORIES} value={category} onChange={(v) => v && setCategory(v)} renderLabel={(v) => t(`assetCategories.${v}`)} icon={(v) => ASSET_ICONS[v]} />
      <SelectField label={t('fields.room')} options={rooms.map((r) => r.id)} value={roomId} renderLabel={(v) => rooms.find((r) => r.id === v)?.name ?? ''} onChange={setRoomId} allowNone noneLabel={t('common.noRoom')} icon="grid-outline" optional />
      <TextField label={t('fields.brand')} value={brand} onChangeText={setBrand} optional />
      <TextField label={t('fields.model')} value={model} onChangeText={setModel} optional />
      <TextField label={t('fields.serialNumber')} value={serial} onChangeText={setSerial} optional />
      <DateField label={t('fields.purchaseDate')} value={purchaseDate} onChange={setPurchaseDate} optional shortcuts="past" />
      <AmountField label={t('fields.purchasePrice')} value={price} onChangeText={setPrice} currency={currency} onPressCurrency={() => setCurrencyOpen(true)} optional />
      <TextField label={t('fields.vendor')} value={vendor} onChangeText={setVendor} optional />
      <DateField label={t('fields.warrantyEnd')} value={warrantyEnd} onChange={setWarrantyEnd} optional shortcuts="none" />
      {purchaseDate && !warrantyEnd ? (
        <ChipSelect options={['1', '2', '3', '5'] as const} value={null} onChange={(v) => v && setWarrantyEnd(addYears(purchaseDate, Number(v)))} renderLabel={(v) => t('assets.warrantyYears', { count: Number(v) })} />
      ) : null}
      <ChipSelect label={t('fields.status')} options={ASSET_STATUSES} value={status} onChange={(v) => v && setStatus(v)} renderLabel={(v) => t(`assetStatus.${v}`)} />
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
      <PickerSheet visible={currencyOpen} title={t('fields.currency')} options={COMMON_CURRENCIES} value={currency} renderLabel={(c) => c} onSelect={(c) => c && setCurrency(c)} onClose={() => setCurrencyOpen(false)} />
    </FormScreen>
  );
}
