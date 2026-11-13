import { Button, Card, EmptyState, ProgressBar, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { PackingItems } from '@/components/PackingList';
import { TextField } from '@/components/TextField';
import { PACKING_CATEGORIES, PRIORITIES, type PackingCategory, type Priority } from '@/constants/domain';
import { repos } from '@/database';
import { PackingValidationError } from '@/database/repositories/packing';
import {
  addPackingItem,
  deletePackingItem,
  deletePackingList,
  renamePackingList,
  resetPackingList,
  savePackingAsTemplate,
  togglePacked,
  updatePackingItem,
} from '@/features/packing/actions';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import type { PackingItem } from '@/types/models';

/** Inline editor for a new or existing item. */
function ItemEditor({ item, onSave, onCancel, onDelete }: { item: PackingItem | null; onSave: (v: { name: string; category: PackingCategory; quantity: number; notes: string; priority: Priority }) => Promise<void>; onCancel?: () => void; onDelete?: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState<PackingCategory>(item?.category ?? 'custom');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [priority, setPriority] = useState<Priority>(item?.priority ?? 'medium');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const q = Number(quantity);
    try {
      await onSave({ name, category, quantity: Number.isInteger(q) ? q : NaN, notes, priority });
      if (!item) {
        setName('');
        setNotes('');
        setQuantity('1');
      }
    } catch (e) {
      if (e instanceof PackingValidationError) setError(t(`packing.errors.${e.code}`));
      else {
        recordError(e, 'packing_item');
        setError(t('tripForm.errors.generic'));
      }
    }
  };

  return (
    <Card tone="alt">
      <TextField label={t('packing.itemName')} value={name} onChangeText={setName} maxLength={120} testID={item ? 'packing-edit-name' : 'packing-new-name'} />
      <ChoiceChips label={t('packing.category')} options={PACKING_CATEGORIES} value={category} onChange={setCategory} labelOf={(c) => t(`enums.packingCategory.${c}`)} />
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Stack gap={0} style={{ width: 110 }}>
          <TextField label={t('packing.quantity')} keyboardType="number-pad" value={quantity} onChangeText={setQuantity} maxLength={2} />
        </Stack>
        <Stack gap={0} style={{ flex: 1 }}>
          <ChoiceChips label={t('packing.priority')} options={PRIORITIES} value={priority} onChange={setPriority} labelOf={(p) => t(`enums.priority.${p}`)} />
        </Stack>
      </Row>
      <TextField label={t('packing.notes')} value={notes} onChangeText={setNotes} optional optionalLabel={t('common.optional')} />
      {error ? <Text tone="danger">{error}</Text> : null}
      <Row gap={2} wrap>
        <Button label={item ? t('common.save') : t('packing.addItem')} icon={item ? undefined : 'add'} onPress={submit} testID={item ? 'packing-edit-save' : 'packing-add-item'} />
        {onCancel ? <Button label={t('common.cancel')} variant="ghost" onPress={onCancel} /> : null}
        {onDelete ? <Button label={t('common.delete')} variant="danger" onPress={onDelete} /> : null}
      </Row>
    </Card>
  );
}

export default function PackingListScreen() {
  const { listId } = useLocalSearchParams<{ id: string; listId: string }>();
  const { t } = useTranslation();
  const { data: list } = useAsync(() => repos().packing.getList(listId), [listId]);
  const [editing, setEditing] = useState<PackingItem | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);

  if (list === null) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="alert-circle-outline" title={t('packing.errors.not_found')} />
      </Screen>
    );
  }
  if (!list) return <Screen edges={[]}>{null}</Screen>;

  const ratio = list.total ? list.packed / list.total : 0;
  const fail = (e: unknown) => {
    recordError(e, 'packing_list');
    Alert.alert(t('tripForm.errors.generic'));
  };

  const confirmDeleteList = () =>
    Alert.alert(t('packing.deleteListTitle'), list.name, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deletePackingList(list.id).then(() => router.back(), fail) },
    ]);

  return (
    <Screen edges={[]} testID="packing-screen">
      <RouterStack.Screen options={{ headerShown: true, title: list.name }} />
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{t('packing.progress', { percent: fmt.percent(ratio) })}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('packing.count', { packed: list.packed, total: list.total })}
          </Text>
        </Row>
        <ProgressBar progress={ratio} tone={ratio >= 1 ? 'success' : 'primary'} label={t('packing.progress', { percent: fmt.percent(ratio) })} />
      </Card>

      {list.items.length === 0 ? <Text tone="subtle">{t('packing.emptyList')}</Text> : null}
      <PackingItems items={list.items} onToggle={(item) => togglePacked(list.id, item.id, !item.packed).catch(fail)} onEdit={setEditing} />

      {editing ? (
        <ItemEditor
          key={editing.id}
          item={editing}
          onSave={async (v) => {
            await updatePackingItem(editing.id, { ...v, packed: editing.packed });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
          onDelete={() => deletePackingItem(editing.id).then(() => setEditing(null), fail)}
        />
      ) : (
        <ItemEditor item={null} onSave={async (v) => void (await addPackingItem(list.id, v))} />
      )}

      <Stack gap={2}>
        {renaming !== null ? (
          <Card tone="alt">
            <TextField label={t('packing.listName')} value={renaming} onChangeText={setRenaming} />
            <Row gap={2}>
              <Button label={t('common.save')} onPress={() => renamePackingList(list.id, renaming).then(() => setRenaming(null), fail)} />
              <Button label={t('common.cancel')} variant="ghost" onPress={() => setRenaming(null)} />
            </Row>
          </Card>
        ) : (
          <Row gap={2} wrap>
            <Button label={t('packing.rename')} variant="secondary" icon="create-outline" onPress={() => setRenaming(list.name)} />
            <Button
              label={t('packing.saveAsTemplate')}
              variant="secondary"
              icon="bookmark-outline"
              testID="packing-save-template"
              onPress={() => savePackingAsTemplate(list.id, list.name).then(() => Alert.alert(t('packing.templateSaved')), fail)}
            />
          </Row>
        )}
        <Row gap={2} wrap>
          <Button label={t('packing.unpackAll')} variant="ghost" icon="refresh-outline" onPress={() => resetPackingList(list.id).catch(fail)} />
          <Button label={t('packing.deleteList')} variant="danger" icon="trash-outline" onPress={confirmDeleteList} />
        </Row>
      </Stack>
    </Screen>
  );
}
