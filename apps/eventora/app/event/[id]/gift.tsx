import { Button, Row, Screen, Stack } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips, DateField, SelectField, TextField, ToggleRow } from '@/components/forms';
import { confirmDelete, ScreenTitle } from '@/components/ui';
import { repos } from '@/database';
import { validateGift } from '@/domain/gifts';
import { fullName } from '@/domain/guests';
import { COMMON_CURRENCIES, minorToInput, parseAmount } from '@/domain/money';
import type { GiftInput, GiftKind } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';

export default function GiftForm() {
  const { t } = useTranslation();
  const { id, giftId } = useLocalSearchParams<{ id: string; giftId?: string }>();
  const { data: snap } = useSnapshot(id);
  const [form, setForm] = useState<GiftInput>({ eventId: id, guestId: null, kind: 'gift', contributor: '', description: '', amountMinor: 0, currency: '', receivedDate: null, thanked: false, thankedAt: null, notes: '' });
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Empty currency = not chosen yet: new records default to the event currency.
  const currency = form.currency || snap?.event.currency || 'USD';

  useEffect(() => {
    if (!giftId) return;
    void repos()
      .gifts.get(giftId)
      .then((g) => {
        if (!g) return;
        const { id: _i, createdAt: _c, ...rest } = g;
        setForm(rest);
        setAmount(minorToInput(g.amountMinor, g.currency));
      });
  }, [giftId]);

  const patch = (p: Partial<GiftInput>) => setForm((f) => ({ ...f, ...p }));
  const err = (k: string) => (errors.includes(k) ? t(`errors.gift.${k}`) : null);

  const save = async () => {
    const minor = form.kind === 'contribution' ? (amount.trim() ? parseAmount(amount, currency) : 0) : 0;
    const next = { ...form, currency, amountMinor: minor ?? -1, thankedAt: form.thanked ? (form.thankedAt ?? new Date().toISOString().slice(0, 10)) : null };
    const errs = validateGift(next);
    setErrors(errs);
    if (errs.length) return;
    try {
      if (giftId) await mutate((r) => r.gifts.update(giftId, next));
      else await mutate((r) => r.gifts.add(next));
      router.back();
    } catch {
      Alert.alert(t('errors.saveFailed'));
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="gift-save" />}>
      <ScreenTitle title={giftId ? t('gifts.edit') : t('gifts.add')} />
      <ChoiceChips<GiftKind> label={t('gift.kind')} value={form.kind} onChange={(kind) => patch({ kind })} options={[{ value: 'gift', label: t('gift.kinds.gift') }, { value: 'contribution', label: t('gift.kinds.contribution') }]} />
      <SelectField label={t('gift.fromGuest')} value={form.guestId} optional placeholder={t('gift.noGuest')} options={(snap?.guests ?? []).map((g) => ({ value: g.id, label: fullName(g) }))} onChange={(guestId) => patch({ guestId })} searchable icon="person-outline" />
      {!form.guestId ? <TextField label={t('gift.contributor')} value={form.contributor} onChangeText={(contributor) => patch({ contributor })} error={err('contributor')} /> : null}
      <TextField label={t('gift.description')} value={form.description} onChangeText={(description) => patch({ description })} error={err('description')} multiline />
      {form.kind === 'contribution' ? (
        <Row gap={3} style={{ alignItems: 'flex-start' }}>
          <Stack style={{ flex: 2 }}>
            <TextField label={t('gift.amount')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" error={err('amount')} />
          </Stack>
          <Stack style={{ flex: 1 }}>
            <SelectField label={t('expense.currency')} value={currency} options={COMMON_CURRENCIES.map((c) => ({ value: c, label: c }))} onChange={(c) => c && patch({ currency: c })} searchable icon="cash-outline" />
          </Stack>
        </Row>
      ) : null}
      <DateField label={t('gift.received')} value={form.receivedDate} onChange={(receivedDate) => patch({ receivedDate })} optional />
      <ToggleRow label={t('gift.thanked')} value={form.thanked} onChange={(thanked) => patch({ thanked })} />
      <TextField label={t('gift.notes')} value={form.notes} onChangeText={(notes) => patch({ notes })} multiline />
      {giftId ? <Button variant="danger" label={t('gifts.delete')} onPress={() => confirmDelete(t, form.description || form.contributor, () => void mutate((r) => r.gifts.remove(giftId)).then(() => router.back()))} /> : null}
    </Screen>
  );
}
