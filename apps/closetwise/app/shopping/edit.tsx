import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { ItemPhoto } from '@/components/ItemPhoto';
import { ItemPickerSheet } from '@/components/ItemPickerSheet';
import { confirmDelete, DateField, MoneyField, PhotoField, todayKey } from '@/components/forms';
import { repos } from '@/database';
import { parseAmount } from '@/domain/budget';
import { monthKeyOf } from '@/domain/planner';
import type { DayKey, ShoppingRecord } from '@/domain/types';
import { purchaseCrossing } from '@/features/shopping/logic';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { afterWrite, updateSettings } from '@/services/data';
import { clock } from '@/services/clock';
import { deletePhotoFiles } from '@/services/photos';
import { recordError } from '@/services/analytics';
import { sendBudgetAlert } from '@/services/reminders';
import { useSettings } from '@/store/session';
import { Button, Card, ChoiceChips, EmptyState, Field, FieldLabel, IconButton, Loading, Row, Screen, Stack, Text } from '@/ui/components';

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default function ShoppingEditScreen() {
  const { t } = useTranslation();
  const labels = useLabels();
  const settings = useSettings();
  const params = useLocalSearchParams<{ id?: string; fromWishlist?: string }>();
  const id = one(params.id);
  const fromWishlist = one(params.fromWishlist);

  const { data } = useAsync(async () => {
    const r = repos();
    const [record, wish, items] = await Promise.all([id ? r.shopping.get(id) : Promise.resolve(null), fromWishlist ? r.wishlist.get(fromWishlist) : Promise.resolve(null), r.wardrobe.list()]);
    return { record, wish, items };
  }, [id, fromWishlist]);

  const [ready, setReady] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemId, setItemId] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [purchasedOn, setPurchasedOn] = useState<DayKey | null>(todayKey());
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(settings.currency);
  const [store, setStore] = useState('');
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string; date?: string }>({});
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // A receipt picked during this edit and not saved yet: removed if the user leaves without saving.
  const pendingReceipt = useRef<string | null>(null);
  // Set once the record is saved or deleted, so the "not found" state never flashes while leaving.
  const [finished, setFinished] = useState(false);
  useEffect(
    () => () => {
      if (pendingReceipt.current) deletePhotoFiles(pendingReceipt.current);
    },
    [],
  );

  // Prefill once, from the record being edited or from a wishlist entry.
  if (data && !ready) {
    setReady(true);
    const r = data.record;
    const w = data.wish;
    if (r) {
      setItemName(r.itemName);
      setItemId(r.itemId);
      setBrand(r.brand ?? '');
      setCategoryId(r.categoryId);
      setPurchasedOn(r.purchasedOn);
      setAmount(String(r.price));
      setCurrency(r.currency);
      setStore(r.store ?? '');
      setSize(r.size ?? '');
      setNotes(r.notes ?? '');
      setReceipt(r.receiptPath);
    } else if (w) {
      setItemName(w.name);
      setBrand(w.brand ?? '');
      setCategoryId(w.categoryId);
      if (w.estimatedPrice != null) setAmount(String(w.estimatedPrice));
      setCurrency(w.currency ?? settings.currency);
      setStore(w.store ?? '');
    }
  }

  if (!data || !ready) return <Loading />;
  if (id && !data.record && !finished) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('shopping.edit.titleEdit') }} />
        <EmptyState icon="alert-circle-outline" title={t('shopping.edit.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }

  const linked = itemId ? data.items.find((i) => i.id === itemId) : undefined;

  const setNewReceipt = (path: string | null) => {
    // Discard a previously picked, unsaved receipt (never the saved one: it is removed after saving).
    if (pendingReceipt.current && pendingReceipt.current !== path) deletePhotoFiles(pendingReceipt.current);
    pendingReceipt.current = path && path !== data.record?.receiptPath ? path : null;
    setReceipt(path);
  };

  const finish = (level: 'warning' | 'over' | null, record: Pick<ShoppingRecord, 'itemId' | 'categoryId' | 'itemName' | 'brand' | 'size' | 'price' | 'currency' | 'purchasedOn'>, created: boolean) => {
    const offerWardrobe = () => {
      if (created && !record.itemId) {
        Alert.alert(t('shopping.edit.addToWardrobeTitle'), t('shopping.edit.addToWardrobeMessage'), [
          { text: t('shopping.edit.notNow'), style: 'cancel', onPress: () => router.back() },
          {
            text: t('shopping.edit.addToWardrobe'),
            onPress: () => router.replace({ pathname: '/item/edit', params: {
                ...(record.categoryId ? { categoryKey: labels.categoryKey(record.categoryId) } : {}),
                // Prefill the new wardrobe item with the purchase details.
                name: record.itemName,
                brand: record.brand ?? '',
                size: record.size ?? '',
                price: String(record.price),
                currency: record.currency,
                purchaseDate: record.purchasedOn,
              },
            }),
          },
        ]);
      } else router.back();
    };
    if (level) {
      Alert.alert(t('shopping.edit.budgetNoticeTitle'), level === 'over' ? t('shopping.edit.budgetNoticeOver') : t('shopping.edit.budgetNoticeWarning'), [{ text: t('common.done'), onPress: offerWardrobe }]);
    } else offerWardrobe();
  };

  const save = async () => {
    const price = parseAmount(amount);
    const next: typeof errors = {};
    if (!itemName.trim()) next.name = t('shopping.edit.nameRequired');
    if (price == null) next.price = t('common.money.invalid');
    if (!purchasedOn) next.date = t('shopping.edit.dateRequired');
    setErrors(next);
    if (Object.keys(next).length > 0 || price == null || !purchasedOn) return;
    setBusy(true);
    try {
      const r = repos();
      const [records, notifications] = await Promise.all([r.shopping.list(), r.settings.notifications()]);
      const budgetSetting = notifications.find((n) => n.kind === 'budget');
      const warnPercent = budgetSetting?.param || 80;
      const monthKey = monthKeyOf(clock.today());
      const level = purchaseCrossing({
        records,
        previous: data.record,
        next: { price, currency, purchasedOn },
        monthKey,
        budget: settings.monthlyBudget,
        budgetCurrency: settings.currency,
        warnPercent,
      });
      const input = {
        itemName,
        itemId,
        brand: brand || null,
        categoryId,
        purchasedOn,
        price,
        currency,
        store: store || null,
        size: size || null,
        notes: notes || null,
        receiptPath: receipt,
      };
      await r.shopping.save(input, id);
      // The new receipt is now referenced; the replaced one can go.
      pendingReceipt.current = null;
      if (data.record?.receiptPath && data.record.receiptPath !== receipt) deletePhotoFiles(data.record.receiptPath);
      if (data.wish && !id) await r.wishlist.setStatus(data.wish.id, 'purchased');
      if (level && budgetSetting?.enabled) {
        const tag = `${monthKey}:${level}`;
        if (settings.lastBudgetAlert !== tag) {
          await sendBudgetAlert(level, t);
          await updateSettings({ lastBudgetAlert: tag });
        }
      }
      setFinished(true);
      afterWrite();
      finish(level, input, !id);
    } catch (e) {
      recordError(e, 'shopping_save');
      Alert.alert(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const remove = () =>
    confirmDelete(t, async () => {
      if (!id) return;
      try {
        setFinished(true);
        const path = await repos().shopping.remove(id);
        deletePhotoFiles(path, pendingReceipt.current);
        pendingReceipt.current = null;
        afterWrite();
        router.back();
      } catch (e) {
        recordError(e, 'shopping_delete');
        Alert.alert(t('common.error'));
      }
    });

  return (
    <Screen
      edges={[]}
      footer={
        <Row gap={2}>
          {id ? <Button variant="danger" label={t('common.delete')} icon="trash-outline" onPress={remove} disabled={busy} /> : null}
          <Button label={t('common.save')} onPress={save} loading={busy} style={{ flex: 1 }} testID="shopping-save" />
        </Row>
      }
    >
      <RouterStack.Screen options={{ title: id ? t('shopping.edit.titleEdit') : t('shopping.edit.titleNew') }} />
      {data.wish && !id ? (
        <Card tone="alt">
          <Text variant="bodySmall" tone="muted">
            {t('shopping.edit.fromWishlist', { name: data.wish.name })}
          </Text>
        </Card>
      ) : null}
      <Field
        label={t('shopping.edit.name')}
        value={itemName}
        onChangeText={(s) => {
          setItemName(s);
          if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
        }}
        placeholder={t('shopping.edit.namePlaceholder')}
        error={errors.name}
        maxLength={120}
        testID="shopping-name"
      />
      <MoneyField
        label={t('shopping.edit.price')}
        amount={amount}
        currency={currency}
        onAmount={(s) => {
          setAmount(s);
          if (errors.price) setErrors((e) => ({ ...e, price: undefined }));
        }}
        onCurrency={setCurrency}
        error={errors.price}
        testID="shopping-price"
      />
      {currency !== settings.currency ? (
        <Text variant="caption" tone="subtle">
          {t('shopping.edit.otherCurrencyNote', { currency, budgetCurrency: settings.currency })}
        </Text>
      ) : null}
      <DateField label={t('shopping.edit.date')} value={purchasedOn} onChange={setPurchasedOn} testID="shopping-date" />
      {errors.date ? (
        <Text variant="caption" tone="danger">
          {errors.date}
        </Text>
      ) : null}

      <Stack gap={1.5}>
        <FieldLabel>{t('shopping.edit.linkedItem')}</FieldLabel>
        {linked ? (
          <Card>
            <Row gap={3}>
              <View style={{ width: 44 }}>
                <ItemPhoto photoPath={linked.photoPath} thumbPath={linked.thumbPath} categoryKey={labels.categoryKey(linked.categoryId)} color={linked.primaryColor} />
              </View>
              <Text style={{ flex: 1 }} numberOfLines={2}>
                {linked.name}
              </Text>
              <IconButton icon="close" label={t('shopping.edit.unlink')} onPress={() => setItemId(null)} />
            </Row>
          </Card>
        ) : (
          <Text variant="bodySmall" tone="subtle">
            {itemId ? t('shopping.edit.linkedMissing') : t('shopping.edit.linkHint')}
          </Text>
        )}
        <Button small variant="secondary" icon="shirt-outline" label={linked ? t('shopping.edit.changeLink') : t('shopping.edit.link')} onPress={() => setPickerOpen(true)} style={{ alignSelf: 'flex-start' }} disabled={data.items.length === 0} />
      </Stack>

      <Field label={`${t('shopping.edit.brand')} · ${t('common.optional')}`} value={brand} onChangeText={setBrand} maxLength={80} />
      <ChoiceChips label={t('shopping.edit.category')} options={labels.categoryOptions} value={categoryId} onChange={setCategoryId} allowNone wrap={false} />
      <Field label={`${t('shopping.edit.store')} · ${t('common.optional')}`} value={store} onChangeText={setStore} maxLength={80} />
      <Field label={`${t('shopping.edit.size')} · ${t('common.optional')}`} value={size} onChangeText={setSize} maxLength={30} />
      <Field label={`${t('shopping.edit.notes')} · ${t('common.optional')}`} value={notes} onChangeText={setNotes} multiline maxLength={1000} />

      <Stack gap={1.5}>
        <FieldLabel>{`${t('shopping.edit.receipt')} · ${t('common.optional')}`}</FieldLabel>
        <PhotoField
          photo={{ photoPath: receipt, thumbPath: null }}
          idPrefix="rcp"
          onChange={(p) => {
            if (p) {
              // Receipts are only shown full size: the generated thumbnail is not needed.
              deletePhotoFiles(p.thumbPath);
              setNewReceipt(p.photoPath);
            } else setNewReceipt(null);
          }}
        />
      </Stack>

      <ItemPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        items={data.items}
        title={t('shopping.edit.pickItem')}
        selected={itemId ? [itemId] : []}
        onConfirm={(ids) => {
          const picked = data.items.find((i) => i.id === ids[0]);
          if (!picked) return;
          setItemId(picked.id);
          if (!itemName.trim()) setItemName(picked.name);
          if (!categoryId) setCategoryId(picked.categoryId);
          if (!brand && picked.brandName) setBrand(picked.brandName);
        }}
      />
    </Screen>
  );
}
