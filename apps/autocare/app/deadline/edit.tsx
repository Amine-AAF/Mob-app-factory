import { Button, Row, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { AttachmentList, useAttachments } from '@/components/Attachments';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { ChoiceChips, DateField, Field, FormScreen, InfoNote, NumberField, readNumber, VehicleChooser } from '@/components/ui';
import { DEADLINE_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { normalizeLeadDays } from '@/features/deadlines/deadlines';
import { toMinor } from '@/features/money/money';
import { useAsync, useToday } from '@/hooks';
import { currencyFor, pickVehicleId, useEditorParams } from '@/hooks/data';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { useIsPremium } from '@/store/session';
import { DEADLINE_TYPES, type DeadlineType } from '@/types';
import { cleanText } from '@/utils';
import { isValidDay } from '@/utils/dates';

const LEAD_OPTIONS = [60, 30, 14, 7, 3, 1, 0];

export default function DeadlineEdit() {
  const { t } = useTranslation();
  const today = useToday();
  const premium = useIsPremium();
  const { id, vehicleId: vParam } = useEditorParams();
  const { data } = useAsync(async () => ({ vehicles: await repos().vehicles.list(), existing: id ? await repos().deadlines.get(id) : null }), [id]);

  const [loaded, setLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [type, setType] = useState<DeadlineType>('inspection');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(today);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [leads, setLeads] = useState<number[]>([30, 7]);
  const [repeat, setRepeat] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const attachments = useAttachments('deadline_id', id, 'other');
  const { discard } = attachments;
  // Picked-but-unsaved files are removed when the form closes (committed ones were already taken).
  useEffect(() => discard, [discard]);

  // Hydrate the form once the record is loaded (render-time state adjustment, no extra effect pass).
  if (data && !loaded) {
    const e = data.existing;
    const vId = e?.vehicleId ?? pickVehicleId(data.vehicles, vParam);
    setVehicleId(vId);
    if (e) {
      setType(e.type);
      setTitle(e.title ?? '');
      setDue(e.dueDay);
      setAmount(e.amountMinor === null ? '' : String(e.amountMinor / 100));
      setCurrency(e.currency);
      setLeads(e.remindDaysBefore);
      setRepeat(e.repeatMonths ? String(e.repeatMonths) : '');
      setNotes(e.notes ?? '');
    } else setCurrency(currencyFor(data.vehicles.find((v) => v.id === vId)));
    setLoaded(true);
  }

  const amountN = readNumber(amount);
  const repeatN = readNumber(repeat);
  const errors = {
    vehicle: !vehicleId ? t('common.chooseVehicle') : null,
    due: !isValidDay(due) ? t('common.invalidDate') : null,
    amount: amountN !== null && !(amountN >= 0) ? t('common.invalidNumber') : null,
    repeat: repeatN !== null && !(Number.isInteger(repeatN) && repeatN > 0 && repeatN <= 120) ? t('common.invalidNumber') : null,
    title: type === 'other' && !title.trim() ? t('common.required') : null,
  };
  const show = (e: string | null) => (submitted ? e : null);

  const toggleLead = (d: number) => {
    // Free plan: one reminder per deadline. Premium: several (advanced reminders).
    if (leads.includes(d)) setLeads(leads.filter((x) => x !== d));
    else setLeads(premium ? normalizeLeadDays([...leads, d]) : [d]);
  };

  const save = async () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !vehicleId) {
      feedback.warning();
      return;
    }
    setSaving(true);
    try {
      const savedId = await repos().deadlines.save(
        {
          id: id ?? undefined,
          vehicleId,
          type,
          title: cleanText(title, 80),
          dueDay: due,
          amountMinor: amountN === null ? null : toMinor(amountN),
          currency,
          remindDaysBefore: leads,
          repeatMonths: repeatN,
          completedAt: data?.existing?.completedAt ?? null,
          notes: cleanText(notes, 2000),
        },
        clock.now(),
      );
      await attachments.commit(savedId, vehicleId, cleanText(title) ?? t(`deadlineTypes.${type}`));
      afterWrite();
      feedback.success();
      router.back();
    } catch (e) {
      recordError(e, 'deadline_save');
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
          await repos().deadlines.remove(id!);
          afterWrite();
          router.back();
        },
      },
    ]);

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('deadlines.editTitle') : t('deadlines.new') }} />
      <FormScreen
        onSave={() => void save()}
        saving={saving}
        extra={
          id ? (
            <Row gap={2}>
              {data?.existing?.completedAt ? (
                <View style={{ flex: 1 }}>
                  <Button
                    label={t('deadlines.reopen')}
                    variant="secondary"
                    size="md"
                    icon="refresh"
                    onPress={async () => {
                      await repos().deadlines.reopen(id, clock.now());
                      afterWrite();
                      router.back();
                    }}
                  />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} />
              </View>
            </Row>
          ) : null
        }
      >
        <InfoNote icon="globe-outline" text={t('deadlines.countryNote')} />
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        <ChoiceChips label={t('deadlines.type')} value={type} options={DEADLINE_TYPES.map((x) => ({ value: x, label: t(`deadlineTypes.${x}`), icon: DEADLINE_ICONS[x] }))} onChange={setType} />
        <Field label={`${t('deadlines.customTitle')}${type === 'other' ? '' : ` (${t('common.optional')})`}`} value={title} onChangeText={setTitle} error={show(errors.title)} />
        <DateField label={t('deadlines.due')} value={due} onChange={setDue} error={show(errors.due)} />
        <Text variant="label" tone="muted">
          {t('deadlines.remind')}
        </Text>
        <Row gap={2} wrap>
          {LEAD_OPTIONS.map((d) => (
            <Button key={d} label={String(d)} size="md" variant={leads.includes(d) ? 'primary' : 'secondary'} onPress={() => toggleLead(d)} />
          ))}
        </Row>
        <Text variant="caption" tone="subtle">
          {t('deadlines.remindHint')}
          {!premium ? ` · ${t('settings.advancedReminders')}` : ''}
        </Text>
        <NumberField label={t('deadlines.repeat')} value={repeat} onChange={setRepeat} keyboardType="number-pad" suffix={t('common.months', { count: repeatN && Number.isFinite(repeatN) ? repeatN : 2 }).replace(/^\S+\s/, '')} error={show(errors.repeat)} hint={t('deadlines.repeatHint')} />
        <NumberField label={t('deadlines.amount')} value={amount} onChange={setAmount} suffix={currency} error={show(errors.amount)} />
        <AttachmentList state={attachments} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
      </FormScreen>
    </>
  );
}
