import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, orNull } from '@/components/FormScreen';
import { AmountField, ChipSelect, DateField, PickerSheet, SelectField, Stepper, TextField } from '@/components/forms';
import { INVENTORY_ICONS } from '@/config/icons';
import { canCreate } from '@/config/limits';
import { repos } from '@/database';
import { amountInputValue, COMMON_CURRENCIES, parseAmount } from '@/domain/money';
import { INVENTORY_CATEGORIES, type HomeDocument, type InventoryCategory, type Room } from '@/domain/types';
import { useActiveHome } from '@/hooks/useHome';
import { formatLocale } from '@/i18n';
import { recordError } from '@/services/analytics';
import { cleanOrphanFiles } from '@/services/boot';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

export default function InventoryEdit() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; roomId?: string }>();
  const id = params.id;
  const home = useActiveHome();
  const isPremium = useIsPremium();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [docs, setDocs] = useState<HomeDocument[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('other');
  const [quantity, setQuantity] = useState(1);
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState(home?.currency ?? 'USD');
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(params.roomId ?? null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!home) return;
    void repos().homes.listRooms(home.id).then(setRooms);
    void repos().documents.list(home.id).then(setDocs);
    if (!id) return;
    void repos()
      .inventory.get(id)
      .then((i) => {
        if (!i) return;
        setName(i.name);
        setCategory(i.category);
        setQuantity(i.quantity);
        setCurrency(i.currency ?? home.currency);
        setValue(amountInputValue(i.estimatedValueMinor, i.currency ?? home.currency, formatLocale()));
        setPurchaseDate(i.purchaseDate);
        setRoomId(i.roomId);
        setDocumentId(i.documentId);
        setNotes(i.notes ?? '');
      });
  }, [id, home]);

  const save = async () => {
    if (!home) return;
    if (!name.trim()) {
      setError(t('validation.required'));
      return;
    }
    const valueMinor = value.trim() ? parseAmount(value, currency) : null;
    const input = { name: name.trim(), category, quantity, estimatedValueMinor: valueMinor, currency: valueMinor != null ? currency : null, purchaseDate, roomId, documentId, notes: orNull(notes) };
    setSaving(true);
    try {
      if (id) {
        await mutate(() => repos().inventory.update(id, input));
        router.back();
      } else {
        if (!canCreate('inventoryItems', await repos().inventory.count(home.id), isPremium)) {
          router.replace({ pathname: '/paywall', params: { source: 'inventory_limit' } });
          return;
        }
        const item = await mutate(() => repos().inventory.create(home.id, input));
        router.replace(`/inventory/${item.id}`);
      }
    } catch (e) {
      recordError(e, 'inventory_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    await mutate(async () => {
      await repos().photos.removeForOwner('inventory', id);
      await repos().inventory.remove(id);
    });
    await cleanOrphanFiles(repos());
    router.replace('/inventory');
  };

  return (
    <FormScreen title={id ? t('inventory.edit') : t('inventory.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined}>
      <TextField
        label={t('fields.name')}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(null);
        }}
        error={error}
      />
      <ChipSelect label={t('fields.category')} options={INVENTORY_CATEGORIES} value={category} onChange={(v) => v && setCategory(v)} renderLabel={(v) => t(`inventoryCategories.${v}`)} icon={(v) => INVENTORY_ICONS[v]} />
      <Stepper label={t('fields.quantity')} value={quantity} onChange={setQuantity} min={1} max={9999} />
      <AmountField label={t('fields.unitValue')} value={value} onChangeText={setValue} currency={currency} onPressCurrency={() => setCurrencyOpen(true)} optional />
      <DateField label={t('fields.purchaseDate')} value={purchaseDate} onChange={setPurchaseDate} optional shortcuts="past" />
      <SelectField label={t('fields.room')} options={rooms.map((r) => r.id)} value={roomId} renderLabel={(v) => rooms.find((r) => r.id === v)?.name ?? ''} onChange={setRoomId} allowNone noneLabel={t('common.noRoom')} icon="grid-outline" optional />
      <SelectField label={t('fields.document')} options={docs.map((d) => d.id)} value={documentId} renderLabel={(v) => docs.find((d) => d.id === v)?.title ?? ''} onChange={setDocumentId} allowNone noneLabel={t('common.none')} icon="document-outline" optional />
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
      <PickerSheet visible={currencyOpen} title={t('fields.currency')} options={COMMON_CURRENCIES} value={currency} renderLabel={(c) => c} onSelect={(c) => c && setCurrency(c)} onClose={() => setCurrencyOpen(false)} />
    </FormScreen>
  );
}
