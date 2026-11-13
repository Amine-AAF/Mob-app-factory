import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, orNull } from '@/components/FormScreen';
import { AmountField, ChipSelect, DateField, PickerSheet, SelectField, SwitchRow, TextField } from '@/components/forms';
import { Notice } from '@/components/ui';
import { repos } from '@/database';
import { amountInputValue, COMMON_CURRENCIES, parseAmount } from '@/domain/money';
import { REPAIR_STATUSES, type Asset, type HomeDocument, type RepairStatus } from '@/domain/types';
import { coveredByWarranty } from '@/domain/warranty';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { formatLocale } from '@/i18n';
import { recordError } from '@/services/analytics';
import { cleanOrphanFiles } from '@/services/boot';
import { mutate } from '@/services/mutations';

export default function RepairEdit() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; assetId?: string }>();
  const id = params.id;
  const home = useActiveHome();
  const today = useToday();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [docs, setDocs] = useState<HomeDocument[]>([]);
  const [assetId, setAssetId] = useState<string | null>(params.assetId ?? null);
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [status, setStatus] = useState<RepairStatus>('reported');
  const [reportedOn, setReportedOn] = useState<string | null>(today);
  const [scheduledOn, setScheduledOn] = useState<string | null>(null);
  const [completedOn, setCompletedOn] = useState<string | null>(null);
  const [provider, setProvider] = useState('');
  const [contact, setContact] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState(home?.currency ?? 'USD');
  const [underWarranty, setUnderWarranty] = useState(false);
  const [warrantyTouched, setWarrantyTouched] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [asExpense, setAsExpense] = useState(true);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!home) return;
    void repos().assets.list(home.id).then(setAssets);
    void repos().documents.list(home.id).then(setDocs);
    if (!id) return;
    void repos()
      .repairs.get(id)
      .then((r) => {
        if (!r) return;
        setAssetId(r.assetId);
        setTitle(r.title);
        setProblem(r.problem ?? '');
        setStatus(r.status);
        setReportedOn(r.reportedOn);
        setScheduledOn(r.scheduledOn);
        setCompletedOn(r.completedOn);
        setProvider(r.provider ?? '');
        setContact(r.providerContact ?? '');
        setCurrency(r.currency ?? home.currency);
        setCost(amountInputValue(r.costMinor, r.currency ?? home.currency, formatLocale()));
        setUnderWarranty(r.underWarranty);
        setWarrantyTouched(true);
        setOutcome(r.outcome ?? '');
        setDocumentId(r.documentId);
        setNotes(r.notes ?? '');
        setAsExpense(false);
      });
  }, [id, home]);

  // Suggest "under warranty" from the asset's warranty end date.
  const asset = assets.find((a) => a.id === assetId);
  const warranty = warrantyTouched ? underWarranty : !!asset && !!reportedOn && coveredByWarranty(asset.warrantyEnd, reportedOn);

  const save = async () => {
    if (!home || !reportedOn) return;
    if (!title.trim()) {
      setError(t('validation.required'));
      return;
    }
    const costMinor = cost.trim() ? parseAmount(cost, currency) : null;
    const input = {
      assetId,
      title: title.trim(),
      problem: orNull(problem),
      status,
      reportedOn,
      scheduledOn,
      completedOn: status === 'completed' ? (completedOn ?? today) : completedOn,
      provider: orNull(provider),
      providerContact: orNull(contact),
      costMinor,
      currency: costMinor != null ? currency : null,
      underWarranty: warranty,
      outcome: orNull(outcome),
      documentId,
      notes: orNull(notes),
    };
    setSaving(true);
    try {
      const repairId = await mutate(async () => {
        let rid = id;
        if (id) await repos().repairs.update(id, input);
        else rid = (await repos().repairs.create(home.id, input)).id;
        if (asExpense && costMinor && !id) {
          await repos().expenses.create(home.id, { category: 'repairs', title: input.title, amountMinor: costMinor, currency, spentOn: input.completedOn ?? reportedOn, paymentMethod: null, assetId, roomId: asset?.roomId ?? null, documentId, notes: null });
        }
        // Keep the asset status in step with the repair.
        if (assetId && asset) {
          if ((status === 'in_progress' || status === 'scheduled' || status === 'reported') && asset.status === 'active') await repos().assets.update(assetId, { status: 'in_repair' });
          if (status === 'completed' && asset.status === 'in_repair') await repos().assets.update(assetId, { status: 'active' });
        }
        return rid;
      });
      if (id) router.back();
      else router.replace(`/repairs/${repairId}`);
    } catch (e) {
      recordError(e, 'repair_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    await mutate(async () => {
      await repos().photos.removeForOwner('repair', id);
      await repos().repairs.remove(id);
    });
    await cleanOrphanFiles(repos());
    router.replace('/repairs');
  };

  return (
    <FormScreen title={id ? t('repairs.edit') : t('repairs.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined}>
      <SelectField label={t('fields.asset')} options={assets.map((a) => a.id)} value={assetId} renderLabel={(v) => assets.find((a) => a.id === v)?.name ?? ''} onChange={setAssetId} allowNone noneLabel={t('common.noAsset')} icon="cube-outline" optional />
      <TextField
        label={t('fields.title')}
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          setError(null);
        }}
        placeholder={t('repairs.placeholder')}
        error={error}
      />
      <TextField label={t('fields.problem')} value={problem} onChangeText={setProblem} optional multiline />
      <ChipSelect label={t('fields.status')} options={REPAIR_STATUSES} value={status} onChange={(v) => v && setStatus(v)} renderLabel={(v) => t(`repairStatus.${v}`)} />
      <DateField label={t('fields.reportedOn')} value={reportedOn} onChange={setReportedOn} clearable={false} shortcuts="past" />
      <DateField label={t('fields.scheduledOn')} value={scheduledOn} onChange={setScheduledOn} optional />
      {status === 'completed' ? <DateField label={t('fields.completedOn')} value={completedOn ?? today} onChange={setCompletedOn} shortcuts="past" /> : null}
      <TextField label={t('fields.provider')} value={provider} onChangeText={setProvider} optional />
      <TextField label={t('fields.providerContact')} value={contact} onChangeText={setContact} optional />
      <AmountField label={t('fields.cost')} value={cost} onChangeText={setCost} currency={currency} onPressCurrency={() => setCurrencyOpen(true)} optional />
      {!id && cost.trim() ? <SwitchRow label={t('maintenance.addAsExpense')} value={asExpense} onValueChange={setAsExpense} /> : null}
      <SwitchRow
        label={t('fields.underWarranty')}
        subtitle={asset?.warrantyEnd ? t('repairs.warrantyUntil', { date: asset.warrantyEnd }) : undefined}
        value={warranty}
        onValueChange={(v) => {
          setUnderWarranty(v);
          setWarrantyTouched(true);
        }}
      />
      {warranty ? <Notice tone="success" icon="shield-checkmark-outline">{t('repairs.warrantyTip')}</Notice> : null}
      <TextField label={t('fields.outcome')} value={outcome} onChangeText={setOutcome} optional multiline />
      <SelectField label={t('fields.invoice')} options={docs.map((d) => d.id)} value={documentId} renderLabel={(v) => docs.find((d) => d.id === v)?.title ?? ''} onChange={setDocumentId} allowNone noneLabel={t('common.none')} icon="receipt-outline" optional />
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
      <PickerSheet visible={currencyOpen} title={t('fields.currency')} options={COMMON_CURRENCIES} value={currency} renderLabel={(c) => c} onSelect={(c) => c && setCurrency(c)} onClose={() => setCurrencyOpen(false)} />
    </FormScreen>
  );
}
