import { Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { FormScreen, intOrNull, orNull } from '@/components/FormScreen';
import { AmountField, ChipSelect, DateField, PickerSheet, SelectField, Stepper, SwitchRow, TextField } from '@/components/forms';
import { Notice } from '@/components/ui';
import { templateById } from '@/content/maintenanceTemplates';
import { MAINTENANCE_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { addInterval, INTERVAL_UNITS, isValidRecurrence, MAINTENANCE_FREQUENCIES, type Frequency, type IntervalUnit } from '@/domain/recurrence';
import { amountInputValue, COMMON_CURRENCIES, parseAmount } from '@/domain/money';
import { MAINTENANCE_CATEGORIES, PRIORITIES, type Asset, type MaintenanceCategory, type Priority, type Room } from '@/domain/types';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { formatLocale } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

export default function MaintenanceEdit() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string; templateId?: string; assetId?: string; roomId?: string }>();
  const id = params.id;
  const home = useActiveHome();
  const today = useToday();
  const isPremium = useIsPremium();
  const template = templateById(params.templateId);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [title, setTitle] = useState(template ? t(`templates.${template.id}.title`) : '');
  const [description, setDescription] = useState(template ? t(`templates.${template.id}.desc`) : '');
  const [category, setCategory] = useState<MaintenanceCategory>(template?.category ?? 'other');
  const [assetId, setAssetId] = useState<string | null>(params.assetId ?? null);
  const [roomId, setRoomId] = useState<string | null>(params.roomId ?? null);
  const [frequency, setFrequency] = useState<Frequency>(template?.frequency ?? 'monthly');
  const [intervalValue, setIntervalValue] = useState(template?.intervalValue ?? 2);
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>(template?.intervalUnit ?? 'month');
  const [lastDone, setLastDone] = useState<string | null>(null);
  const [nextDue, setNextDue] = useState<string | null>(today);
  const [minutes, setMinutes] = useState(template ? String(template.estimatedMinutes) : '');
  const [priority, setPriority] = useState<Priority>(template?.priority ?? 'medium');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState(home?.currency ?? 'USD');
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState(true);
  const [daysBefore, setDaysBefore] = useState<number | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!home) return;
    void repos().assets.list(home.id).then(setAssets);
    void repos().homes.listRooms(home.id).then(setRooms);
    if (!id) return;
    void repos()
      .maintenance.get(id)
      .then((m) => {
        if (!m) return;
        setTitle(m.title);
        setDescription(m.description ?? '');
        setCategory(m.category);
        setAssetId(m.assetId);
        setRoomId(m.roomId);
        setFrequency(m.frequency);
        if (m.intervalValue) setIntervalValue(m.intervalValue);
        if (m.intervalUnit) setIntervalUnit(m.intervalUnit);
        setLastDone(m.lastDone);
        setNextDue(m.nextDue);
        setMinutes(m.estimatedMinutes ? String(m.estimatedMinutes) : '');
        setPriority(m.priority);
        setCurrency(m.currency ?? home.currency);
        setCost(amountInputValue(m.estimatedCostMinor, m.currency ?? home.currency, formatLocale()));
        setNotes(m.notes ?? '');
        setReminder(m.reminderEnabled);
        setDaysBefore(m.reminderDaysBefore);
      });
  }, [id, home]);

  /** Choosing a last-done date proposes the next due date (still editable). */
  const onLastDone = (d: string | null) => {
    setLastDone(d);
    if (d) {
      const next = addInterval(d, { frequency, intervalValue, intervalUnit });
      if (next) setNextDue(next);
    }
  };

  const save = async () => {
    if (!home) return;
    if (!title.trim()) {
      setError(t('validation.required'));
      return;
    }
    const recurrence = { frequency, intervalValue: frequency === 'custom' ? intervalValue : null, intervalUnit: frequency === 'custom' ? intervalUnit : null };
    if (!isValidRecurrence(recurrence)) {
      Alert.alert(t('common.error'), t('validation.interval'));
      return;
    }
    const costMinor = cost.trim() ? parseAmount(cost, currency) : null;
    const input = {
      title: title.trim(),
      description: orNull(description),
      category,
      assetId,
      roomId,
      templateId: template?.id ?? null,
      ...recurrence,
      lastDone,
      nextDue,
      estimatedMinutes: intOrNull(minutes),
      priority,
      estimatedCostMinor: costMinor,
      currency: costMinor != null ? currency : null,
      notes: orNull(notes),
      reminderEnabled: reminder,
      reminderDaysBefore: isPremium ? daysBefore : null,
    };
    setSaving(true);
    try {
      if (id) {
        const { templateId: _unused, ...patch } = input;
        await mutate(() => repos().maintenance.update(id, { ...patch, active: true }));
        router.back();
      } else {
        const task = await mutate(() => repos().maintenance.create(home.id, input));
        if (template) track('template_used', { template_id: template.id });
        router.replace(`/maintenance/${task.id}`);
      }
    } catch (e) {
      recordError(e, 'maintenance_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    await mutate(() => repos().maintenance.remove(id));
    router.replace('/(tabs)/maintenance');
  };

  return (
    <FormScreen title={id ? t('maintenance.edit') : t('maintenance.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined} deleteMessage={t('maintenance.deleteMessage')}>
      {template ? <Notice icon="information-circle-outline">{t('templates.disclaimer')}</Notice> : null}
      <TextField
        label={t('fields.title')}
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          setError(null);
        }}
        error={error}
        testID="task-title"
      />
      <TextField label={t('fields.description')} value={description} onChangeText={setDescription} optional multiline />
      <ChipSelect label={t('fields.category')} options={MAINTENANCE_CATEGORIES} value={category} onChange={(v) => v && setCategory(v)} renderLabel={(v) => t(`maintenanceCategories.${v}`)} icon={(v) => MAINTENANCE_ICONS[v]} />
      <SelectField label={t('fields.asset')} options={assets.map((a) => a.id)} value={assetId} renderLabel={(v) => assets.find((a) => a.id === v)?.name ?? ''} onChange={setAssetId} allowNone noneLabel={t('common.noAsset')} icon="cube-outline" optional />
      <SelectField label={t('fields.room')} options={rooms.map((r) => r.id)} value={roomId} renderLabel={(v) => rooms.find((r) => r.id === v)?.name ?? ''} onChange={setRoomId} allowNone noneLabel={t('common.noRoom')} icon="grid-outline" optional />
      <ChipSelect label={t('fields.frequency')} options={MAINTENANCE_FREQUENCIES} value={frequency} onChange={(v) => v && setFrequency(v)} renderLabel={(v) => t(`frequencies.${v}`)} testIDPrefix="freq" />
      {frequency === 'custom' ? (
        <>
          <Stepper label={t('fields.every')} value={intervalValue} onChange={setIntervalValue} min={1} max={365} />
          <ChipSelect options={INTERVAL_UNITS} value={intervalUnit} onChange={(v) => v && setIntervalUnit(v)} renderLabel={(v) => t(`intervalUnits.${v}`, { count: intervalValue })} />
        </>
      ) : null}
      <Text variant="caption" tone="subtle">
        {t('templates.intervalHint')}
      </Text>
      <DateField label={t('fields.lastDone')} value={lastDone} onChange={onLastDone} optional shortcuts="past" />
      <DateField label={t('fields.nextDue')} value={nextDue} onChange={setNextDue} optional testID="task-due" />
      <ChipSelect label={t('fields.priority')} options={PRIORITIES} value={priority} onChange={(v) => v && setPriority(v)} renderLabel={(v) => t(`priorities.${v}`)} />
      <TextField label={t('fields.estimatedMinutes')} value={minutes} onChangeText={setMinutes} keyboardType="number-pad" optional maxLength={4} />
      <AmountField label={t('fields.estimatedCost')} value={cost} onChangeText={setCost} currency={currency} onPressCurrency={() => setCurrencyOpen(true)} optional />
      <TextField label={t('fields.notes')} value={notes} onChangeText={setNotes} optional multiline />
      <SwitchRow label={t('fields.reminder')} value={reminder} onValueChange={setReminder} />
      {reminder && isPremium ? <Stepper label={t('notifications.daysBefore')} value={daysBefore ?? 1} onChange={setDaysBefore} min={0} max={60} /> : null}
      <PickerSheet visible={currencyOpen} title={t('fields.currency')} options={COMMON_CURRENCIES} value={currency} renderLabel={(c) => c} onSelect={(c) => c && setCurrency(c)} onClose={() => setCurrencyOpen(false)} />
    </FormScreen>
  );
}
