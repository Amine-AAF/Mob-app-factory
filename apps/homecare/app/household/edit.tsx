import { Button, IconButton, Row, Stack } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { FormScreen, orNull } from '@/components/FormScreen';
import { ChipSelect, DateField, Field, SelectField, Stepper, SwitchRow, TextField } from '@/components/forms';
import { HOUSEHOLD_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { INTERVAL_UNITS, isValidRecurrence, type IntervalUnit } from '@/domain/recurrence';
import { HOUSEHOLD_CATEGORIES, HOUSEHOLD_RECURRENCES, PRIORITIES, type HouseholdCategory, type HouseholdMember, type HouseholdRecurrence, type Priority, type Room } from '@/domain/types';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { recordError } from '@/services/analytics';
import { mutate } from '@/services/mutations';

export default function HouseholdEdit() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const home = useActiveHome();
  const today = useToday();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HouseholdCategory>('cleaning');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string | null>(today);
  const [recurrence, setRecurrence] = useState<HouseholdRecurrence>('once');
  const [intervalValue, setIntervalValue] = useState(2);
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('week');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [reminder, setReminder] = useState(true);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!home) return;
    void repos().homes.listRooms(home.id).then(setRooms);
    void repos().household.listMembers(home.id).then(setMembers);
    if (!id) return;
    void repos()
      .household.get(id)
      .then((h) => {
        if (!h) return;
        setTitle(h.title);
        setDescription(h.description ?? '');
        setCategory(h.category);
        setPriority(h.priority);
        setDueDate(h.dueDate);
        setRecurrence(h.recurrence);
        if (h.intervalValue) setIntervalValue(h.intervalValue);
        if (h.intervalUnit) setIntervalUnit(h.intervalUnit);
        setRoomId(h.roomId);
        setAssigneeId(h.assigneeId);
        setReminder(h.reminderEnabled);
        setChecklist(h.checklist?.map((c) => c.label) ?? []);
      });
  }, [id, home]);

  const addItem = () => {
    if (!newItem.trim()) return;
    setChecklist((c) => [...c, newItem.trim()]);
    setNewItem('');
  };

  const save = async () => {
    if (!home) return;
    if (!title.trim()) {
      setError(t('validation.required'));
      return;
    }
    const rec = { frequency: recurrence, intervalValue: recurrence === 'custom' ? intervalValue : null, intervalUnit: recurrence === 'custom' ? intervalUnit : null };
    if (!isValidRecurrence(rec)) {
      Alert.alert(t('common.error'), t('validation.interval'));
      return;
    }
    if (recurrence !== 'once' && !dueDate) {
      Alert.alert(t('common.error'), t('validation.recurringNeedsDate'));
      return;
    }
    const input = { title: title.trim(), description: orNull(description), category, priority, dueDate, recurrence, intervalValue: rec.intervalValue, intervalUnit: rec.intervalUnit, roomId, assigneeId, reminderEnabled: reminder };
    const items = newItem.trim() ? [...checklist, newItem.trim()] : checklist;
    setSaving(true);
    try {
      if (id) await mutate(() => repos().household.update(id, input, items));
      else await mutate(() => repos().household.create(home.id, input, items));
      router.back();
    } catch (e) {
      recordError(e, 'household_save');
      Alert.alert(t('common.error'), t('common.saveFailed'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    await mutate(() => repos().household.remove(id));
    router.replace({ pathname: '/(tabs)/maintenance', params: { tab: 'household' } });
  };

  return (
    <FormScreen title={id ? t('household.edit') : t('household.add')} onSave={save} saving={saving} onDelete={id ? remove : undefined}>
      <TextField
        label={t('fields.title')}
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          setError(null);
        }}
        placeholder={t('household.placeholder')}
        error={error}
        testID="chore-title"
      />
      <ChipSelect label={t('fields.category')} options={HOUSEHOLD_CATEGORIES} value={category} onChange={(v) => v && setCategory(v)} renderLabel={(v) => t(`householdCategories.${v}`)} icon={(v) => HOUSEHOLD_ICONS[v]} />
      <DateField label={t('fields.dueDate')} value={dueDate} onChange={setDueDate} optional />
      <ChipSelect label={t('fields.recurrence')} options={HOUSEHOLD_RECURRENCES} value={recurrence} onChange={(v) => v && setRecurrence(v)} renderLabel={(v) => t(`recurrences.${v}`)} />
      {recurrence === 'custom' ? (
        <>
          <Stepper label={t('fields.every')} value={intervalValue} onChange={setIntervalValue} min={1} max={365} />
          <ChipSelect options={INTERVAL_UNITS} value={intervalUnit} onChange={(v) => v && setIntervalUnit(v)} renderLabel={(v) => t(`intervalUnits.${v}`, { count: intervalValue })} />
        </>
      ) : null}
      <ChipSelect label={t('fields.priority')} options={PRIORITIES} value={priority} onChange={(v) => v && setPriority(v)} renderLabel={(v) => t(`priorities.${v}`)} />
      <SelectField label={t('fields.room')} options={rooms.map((r) => r.id)} value={roomId} renderLabel={(v) => rooms.find((r) => r.id === v)?.name ?? ''} onChange={setRoomId} allowNone noneLabel={t('common.noRoom')} icon="grid-outline" optional />
      {members.length ? (
        <SelectField label={t('fields.assignee')} options={members.map((m) => m.id)} value={assigneeId} renderLabel={(v) => members.find((m) => m.id === v)?.name ?? ''} onChange={setAssigneeId} allowNone noneLabel={t('household.nobody')} icon="person-outline" optional />
      ) : (
        <Button label={t('members.addHint')} variant="ghost" size="md" icon="people-outline" onPress={() => router.push('/household/members')} />
      )}
      <Field label={t('fields.checklist')} optional>
        <Stack gap={2}>
          {checklist.map((label, i) => (
            <Row key={`${label}-${i}`} gap={2}>
              <View style={{ flex: 1 }}>
                <TextField label={t('household.item', { n: i + 1 })} value={label} onChangeText={(v) => setChecklist((c) => c.map((x, j) => (j === i ? v : x)))} />
              </View>
              <IconButton icon="close" label={t('common.delete')} onPress={() => setChecklist((c) => c.filter((_, j) => j !== i))} />
            </Row>
          ))}
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <TextField label={t('household.newItem')} value={newItem} onChangeText={setNewItem} />
            </View>
            <IconButton icon="add-circle" tone="primary" label={t('common.add')} onPress={addItem} />
          </Row>
        </Stack>
      </Field>
      <TextField label={t('fields.description')} value={description} onChangeText={setDescription} optional multiline />
      <SwitchRow label={t('fields.reminder')} value={reminder} onValueChange={setReminder} />
    </FormScreen>
  );
}
