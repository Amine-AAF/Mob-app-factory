import { Button, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { AttachmentList, useAttachments } from '@/components/Attachments';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { ChoiceChips, DateField, Field, FormScreen, InfoNote, NumberField, readNumber, VehicleChooser } from '@/components/ui';
import { repos } from '@/database';
import { toMinor } from '@/features/money/money';
import { useAsync, useToday } from '@/hooks';
import { currencyFor, pickVehicleId } from '@/hooks/data';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { PAYMENT_FREQUENCIES, type PaymentFrequency } from '@/types';
import { cleanText } from '@/utils';
import { addDays, addMonths, isValidDay } from '@/utils/dates';

export default function InsuranceEdit() {
  const { t } = useTranslation();
  const today = useToday();
  const { id, vehicleId: vParam, renewFrom } = useLocalSearchParams<{ id?: string; vehicleId?: string; renewFrom?: string }>();
  const { data } = useAsync(async () => ({ vehicles: await repos().vehicles.list(), existing: id ? await repos().insurance.get(id) : null, draft: renewFrom ? await repos().insurance.renewalDraft(renewFrom) : null }), [id, renewFrom]);

  const [loaded, setLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [insurer, setInsurer] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDays(addMonths(today, 12), -1));
  const [premium, setPremium] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [frequency, setFrequency] = useState<PaymentFrequency>('annual');
  const [coverage, setCoverage] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [remindDays, setRemindDays] = useState('30');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const attachments = useAttachments('insurance_id', id, 'insurance_contract');
  const { discard } = attachments;
  // Picked-but-unsaved files are removed when the form closes (committed ones were already taken).
  useEffect(() => discard, [discard]);

  // Hydrate the form once the record is loaded (render-time state adjustment, no extra effect pass).
  if (data && !loaded) {
    const src = data.existing ?? data.draft;
    const vId = src?.vehicleId ?? pickVehicleId(data.vehicles, vParam);
    setVehicleId(vId);
    if (src) {
      setInsurer(src.insurer);
      setPolicyNumber(src.policyNumber ?? '');
      setStart(src.startDay);
      setEnd(src.endDay);
      setPremium(src.premiumMinor === null ? '' : String(src.premiumMinor / 100));
      setCurrency(src.currency);
      setFrequency(src.paymentFrequency);
      setCoverage(src.coverage ?? '');
      setContactName(src.contactName ?? '');
      setContactPhone(src.contactPhone ?? '');
      setContactEmail(src.contactEmail ?? '');
      setRemindDays(String(src.remindDaysBefore));
      setNotes(src.notes ?? '');
    } else setCurrency(currencyFor(data.vehicles.find((v) => v.id === vId)));
    setLoaded(true);
  }

  const premiumN = readNumber(premium);
  const remindN = readNumber(remindDays);
  const errors = {
    vehicle: !vehicleId ? t('common.chooseVehicle') : null,
    insurer: !insurer.trim() ? t('common.required') : null,
    start: !isValidDay(start) ? t('common.invalidDate') : null,
    end: !isValidDay(end) ? t('common.invalidDate') : end < start ? t('insurance.endBeforeStart') : null,
    premium: premiumN !== null && !(premiumN >= 0) ? t('common.invalidNumber') : null,
    remind: remindN === null || !(Number.isInteger(remindN) && remindN >= 0 && remindN <= 365) ? t('common.invalidNumber') : null,
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
      const savedId = await repos().insurance.save(
        {
          id: id ?? undefined,
          vehicleId,
          insurer: insurer.trim(),
          policyNumber: cleanText(policyNumber, 60),
          startDay: start,
          endDay: end,
          premiumMinor: premiumN === null ? null : toMinor(premiumN),
          currency,
          paymentFrequency: frequency,
          coverage: cleanText(coverage, 1000),
          contactName: cleanText(contactName, 120),
          contactPhone: cleanText(contactPhone, 40),
          contactEmail: cleanText(contactEmail, 120),
          remindDaysBefore: remindN ?? 30,
          renewedFromId: data?.existing?.renewedFromId ?? data?.draft?.renewedFromId ?? null,
          notes: cleanText(notes, 2000),
        },
        clock.now(),
      );
      await attachments.commit(savedId, vehicleId, insurer.trim());
      afterWrite();
      feedback.success();
      router.back();
    } catch (e) {
      recordError(e, 'insurance_save');
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
          await repos().insurance.remove(id!);
          afterWrite();
          router.back();
        },
      },
    ]);

  return (
    <>
      <RouterStack.Screen options={{ title: renewFrom ? t('insurance.renewTitle') : id ? t('insurance.editTitle') : t('insurance.new') }} />
      <FormScreen onSave={() => void save()} saving={saving} extra={id ? <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} /> : null}>
        {renewFrom ? <InfoNote icon="refresh" text={t('insurance.renewedFrom')} /> : null}
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        {show(errors.vehicle) ? (
          <Text variant="caption" tone="danger">
            {errors.vehicle}
          </Text>
        ) : null}
        <Field label={t('insurance.insurer')} value={insurer} onChangeText={setInsurer} error={show(errors.insurer)} />
        <Field label={`${t('insurance.policyNumber')} (${t('common.optional')})`} value={policyNumber} onChangeText={setPolicyNumber} autoCapitalize="characters" />
        <DateField label={t('insurance.start')} value={start} onChange={setStart} error={show(errors.start)} />
        <DateField label={t('insurance.end')} value={end} onChange={setEnd} error={show(errors.end)} />
        <NumberField label={t('insurance.premium')} value={premium} onChange={setPremium} suffix={currency} error={show(errors.premium)} />
        <ChoiceChips label={t('insurance.frequency')} value={frequency} options={PAYMENT_FREQUENCIES.map((x) => ({ value: x, label: t(`paymentFrequencies.${x}`) }))} onChange={setFrequency} />
        <Field label={t('insurance.coverage')} value={coverage} onChangeText={setCoverage} placeholder={t('insurance.coveragePlaceholder')} multiline />
        <Field label={t('insurance.contactName')} value={contactName} onChangeText={setContactName} />
        <Field label={t('insurance.contactPhone')} value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
        <Field label={t('insurance.contactEmail')} value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" autoCapitalize="none" />
        <NumberField label={t('insurance.remindDays')} value={remindDays} onChange={setRemindDays} keyboardType="number-pad" error={show(errors.remind)} />
        <AttachmentList state={attachments} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
      </FormScreen>
    </>
  );
}
