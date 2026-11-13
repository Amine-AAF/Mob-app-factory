import { Button, Card, IconButton, ListRow, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { ChoiceChips, DateField, SelectField, TextField, TimeField } from '@/components/forms';
import { confirmDelete, ScreenTitle } from '@/components/ui';
import { repos } from '@/database';
import { nextVendorStatus, validateVendor, websiteUrl } from '@/domain/gifts';
import { COMMON_CURRENCIES, minorToInput, parseAmount } from '@/domain/money';
import { zonedParts, zonedToUtc } from '@/domain/time';
import { VENDOR_CATEGORIES, VENDOR_STATUSES, type Expense, type Task, type VendorCategory, type VendorContract, type VendorInput, type VendorStatus } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { deleteOwnedFile } from '@/services/files';
import { pickDocument } from '@/services/sharing';

export default function VendorForm() {
  const { t } = useTranslation();
  const { id, vendorId } = useLocalSearchParams<{ id: string; vendorId?: string }>();
  const { data: snap } = useSnapshot(id);
  const tz = snap?.event.timezone ?? 'UTC';
  const [form, setForm] = useState<VendorInput>({ eventId: id, name: '', category: 'caterer', contactName: '', phone: '', email: '', address: '', website: '', quote: '', amountMinor: 0, currency: '', status: 'to_contact', meetingAt: null, notes: '' });
  const [amount, setAmount] = useState('');
  const [meetingDate, setMeetingDate] = useState<string | null>(null);
  const [meetingTime, setMeetingTime] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [linked, setLinked] = useState<{ expenses: Expense[]; tasks: Task[]; contracts: VendorContract[] }>({ expenses: [], tasks: [], contracts: [] });

  // Empty currency = not chosen yet: new records default to the event currency.
  const currency = form.currency || snap?.event.currency || 'USD';

  useEffect(() => {
    if (!vendorId || !snap) return;
    const r = repos();
    void r.vendors.get(vendorId).then((v) => {
      if (!v) return;
      const { id: _i, createdAt: _c, ...rest } = v;
      setForm(rest);
      setAmount(minorToInput(v.amountMinor, v.currency));
      if (v.meetingAt) {
        // Meetings are entered in the event's zone (where they happen).
        const p = zonedParts(new Date(v.meetingAt), snap.event.timezone);
        setMeetingDate(p.date);
        setMeetingTime(p.time);
      }
    });
    void Promise.all([r.vendors.linkedExpenses(vendorId), r.vendors.linkedTasks(vendorId), r.vendors.contracts(vendorId)]).then(([expenses, tasks, contracts]) => setLinked({ expenses, tasks, contracts }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per vendor
  }, [vendorId, snap?.event.id, snap?.event.timezone]);

  const patch = (p: Partial<VendorInput>) => setForm((f) => ({ ...f, ...p }));
  const err = (k: string) => (errors.includes(k) ? t(`errors.vendor.${k}`) : null);

  const save = async (andBack = true) => {
    const minor = amount.trim() ? parseAmount(amount, currency) : 0;
    const meetingAt = meetingDate ? zonedToUtc(meetingDate, meetingTime ?? '09:00', tz).toISOString() : null;
    const next = { ...form, currency, amountMinor: minor ?? -1, meetingAt };
    const errs = validateVendor(next);
    setErrors(errs);
    if (errs.length) return null;
    try {
      let savedId = vendorId;
      if (vendorId) await mutate((r) => r.vendors.update(vendorId, next));
      else savedId = (await mutate((r) => r.vendors.add(next))).id;
      if (andBack) router.back();
      return savedId ?? null;
    } catch {
      Alert.alert(t('errors.saveFailed'));
      return null;
    }
  };

  const addContract = async () => {
    if (!vendorId) return;
    const uri = await pickDocument('contracts');
    if (!uri) return;
    const c = await mutate((r) => r.vendors.addContract({ vendorId, title: t('vendor.contractTitle', { n: linked.contracts.length + 1 }), fileUri: uri, signedDate: null, amountMinor: form.amountMinor, depositMinor: 0, currency: currency, notes: '' }));
    setLinked((l) => ({ ...l, contracts: [...l.contracts, c] }));
  };

  const url = websiteUrl(form.website);
  const next = nextVendorStatus(form.status);

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="vendor-save" />}>
      <ScreenTitle title={vendorId ? form.name || t('vendors.edit') : t('vendors.add')} />
      <TextField label={t('vendor.name')} value={form.name} onChangeText={(name) => patch({ name })} error={err('name')} testID="vendor-name" />
      <SelectField<VendorCategory> label={t('vendor.category')} value={form.category} options={VENDOR_CATEGORIES.map((c) => ({ value: c, label: t(`vendorCategory.${c}`) }))} onChange={(c) => c && patch({ category: c })} />
      <ChoiceChips<VendorStatus> label={t('vendor.status')} value={form.status} onChange={(status) => patch({ status })} options={VENDOR_STATUSES.map((s) => ({ value: s, label: t(`vendorStatus.${s}`) }))} />
      {next ? <Button size="md" variant="secondary" icon="arrow-forward" label={t('vendors.advance', { status: t(`vendorStatus.${next}`) })} onPress={() => patch({ status: next })} /> : null}

      <SectionHeader title={t('vendor.contactSection')} />
      <TextField label={t('vendor.contact')} value={form.contactName} onChangeText={(contactName) => patch({ contactName })} />
      <TextField label={t('vendor.phone')} value={form.phone} onChangeText={(phone) => patch({ phone })} keyboardType="phone-pad" />
      <TextField label={t('vendor.email')} value={form.email} onChangeText={(email) => patch({ email })} keyboardType="email-address" autoCapitalize="none" error={err('email')} />
      <TextField label={t('vendor.website')} value={form.website} onChangeText={(website) => patch({ website })} autoCapitalize="none" error={err('website')} />
      <TextField label={t('vendor.address')} value={form.address} onChangeText={(address) => patch({ address })} multiline />
      <Row gap={2} wrap>
        {form.phone ? <Button size="md" variant="secondary" icon="call-outline" label={t('vendor.call')} onPress={() => void Linking.openURL(`tel:${form.phone.replace(/[^\d+]/g, '')}`)} /> : null}
        {form.email ? <Button size="md" variant="secondary" icon="mail-outline" label={t('vendor.emailAction')} onPress={() => void Linking.openURL(`mailto:${form.email.trim()}`)} /> : null}
        {url ? <Button size="md" variant="secondary" icon="globe-outline" label={t('vendor.openSite')} onPress={() => void Linking.openURL(url)} /> : null}
      </Row>

      <SectionHeader title={t('vendor.quoteSection')} />
      <TextField label={t('vendor.quote')} value={form.quote} onChangeText={(quote) => patch({ quote })} multiline placeholder={t('vendor.quotePlaceholder')} />
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <Stack style={{ flex: 2 }}>
          <TextField label={t('vendor.amount')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" error={err('amount')} />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <SelectField label={t('expense.currency')} value={currency} options={COMMON_CURRENCIES.map((c) => ({ value: c, label: c }))} onChange={(c) => c && patch({ currency: c })} searchable icon="cash-outline" />
        </Stack>
      </Row>

      <SectionHeader title={t('vendor.meeting')} />
      <DateField label={t('vendor.meetingDate')} value={meetingDate} onChange={setMeetingDate} optional />
      {meetingDate ? <TimeField label={t('vendor.meetingTime')} value={meetingTime} onChange={setMeetingTime} /> : null}
      <TextField label={t('vendor.notes')} value={form.notes} onChangeText={(notes) => patch({ notes })} multiline />

      {vendorId ? (
        <>
          <SectionHeader title={t('vendor.linked')} />
          <Card>
            {linked.expenses.map((x) => (
              <ListRow key={x.id} icon="receipt-outline" title={x.title} subtitle={`${fmt.money(Math.max(x.actualMinor, x.estimatedMinor), x.currency)} · ${t(`payment.${x.paymentStatus}`)}`} onPress={() => router.push({ pathname: '/event/[id]/expense', params: { id, expenseId: x.id } })} />
            ))}
            {linked.tasks.map((x) => (
              <ListRow key={x.id} icon="checkbox-outline" title={x.title} subtitle={t(`taskStatus.${x.status}`)} onPress={() => router.push({ pathname: '/event/[id]/task', params: { id, taskId: x.id } })} />
            ))}
            {linked.contracts.map((c) => (
              <Row key={c.id} gap={2}>
                <ListRow icon="document-attach-outline" title={c.title} subtitle={c.fileUri ? t('vendor.fileAttached') : undefined} onPress={c.fileUri ? () => void Linking.openURL(c.fileUri!).catch(() => Alert.alert(t('share.failed'))) : undefined} />
                <IconButton
                  icon="trash-outline"
                  tone="danger"
                  label={t('common.delete')}
                  onPress={() =>
                    confirmDelete(t, c.title, () => {
                      deleteOwnedFile(c.fileUri);
                      void mutate((r) => r.vendors.removeContract(c.id)).then(() => setLinked((l) => ({ ...l, contracts: l.contracts.filter((x) => x.id !== c.id) })));
                    })
                  }
                />
              </Row>
            ))}
            {!linked.expenses.length && !linked.tasks.length && !linked.contracts.length ? <Text tone="muted">{t('vendor.nothingLinked')}</Text> : null}
          </Card>
          <Row gap={2} wrap>
            <Button size="md" variant="secondary" icon="receipt-outline" label={t('vendor.addExpense')} onPress={() => router.push({ pathname: '/event/[id]/expense', params: { id, vendorId } })} />
            <Button size="md" variant="secondary" icon="checkbox-outline" label={t('vendor.addTask')} onPress={() => router.push({ pathname: '/event/[id]/task', params: { id, vendorId } })} />
            <Button size="md" variant="secondary" icon="attach" label={t('vendor.addContract')} onPress={() => void addContract()} />
          </Row>
          <Button variant="danger" label={t('vendors.delete')} onPress={() => confirmDelete(t, form.name, () => void mutate((r) => r.vendors.remove(vendorId)).then(() => router.back()), t('vendors.deleteBody'))} />
        </>
      ) : null}
    </Screen>
  );
}
