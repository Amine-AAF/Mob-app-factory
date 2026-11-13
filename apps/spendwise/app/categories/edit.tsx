import { Button, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ColorPicker, FormField, IconPicker, Segmented } from '@/components/inputs';
import { CATEGORY_ICONS, PALETTE } from '@/constants';
import { ValidationError } from '@/features/transactions/validation';
import { mutate, useData } from '@/hooks';
import { recordError } from '@/services/analytics';
import type { Category, CategoryKind } from '@/types';

export default function CategoryEdit() {
  const params = useLocalSearchParams<{ id?: string; kind?: string }>();
  const id = params.id ?? null;
  const { data } = useData(async (r) => ({ category: id ? ((await r.categories.list({ includeArchived: true })).find((c) => c.id === id) ?? null) : null }), [id]);
  if (!data) return <Screen edges={[]}>{null}</Screen>;
  return <CategoryForm key={id ?? 'new'} id={id} category={data.category} initialKind={params.kind === 'income' ? 'income' : 'expense'} />;
}

function CategoryForm({ id, category: c, initialKind }: { id: string | null; category: Category | null; initialKind: CategoryKind }) {
  const { t } = useTranslation();
  const [kind, setKind] = useState<CategoryKind>(c?.kind ?? initialKind);
  const [name, setName] = useState(c?.name ?? '');
  const [icon, setIcon] = useState<string>(c?.icon ?? CATEGORY_ICONS[0]);
  const [color, setColor] = useState<string>(c?.color ?? PALETTE[1]);
  const [error, setError] = useState<string | null>(null);
  const isSystem = !!c?.systemKey;

  async function save() {
    setError(null);
    try {
      if (id) await mutate((r) => r.categories.update(id, { name, icon, color }));
      else await mutate((r) => r.categories.create({ kind, name, icon, color }));
      router.back();
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else {
        recordError(e, 'category_save');
        setError(t('common.error'));
      }
    }
  }

  function remove() {
    if (!id) return;
    Alert.alert(t('common.deleteConfirmTitle'), t('common.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const res = await mutate((r) => r.categories.remove(id));
          if (res === 'in_use') {
            await mutate((r) => r.categories.setArchived(id, true));
            Alert.alert(t('categories.inUse'));
          }
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} testID="category-save" />}>
      <RouterStack.Screen options={{ title: id ? t('categories.edit') : t('categories.new') }} />
      {!id ? <Segmented options={[{ value: 'expense', label: t('tx.types.expense') }, { value: 'income', label: t('tx.types.income') }]} value={kind} onChange={setKind} /> : null}
      <FormField label={t('common.name')} value={name} onChangeText={setName} maxLength={40} placeholder={isSystem ? t(`categories.${c!.systemKey}`) : ''} error={error} testID="category-name" />
      {isSystem ? (
        <Text variant="caption" tone="muted">
          {t('categories.renameHint')}
        </Text>
      ) : null}
      <ColorPicker label={t('common.color')} colors={PALETTE} value={color} onChange={setColor} />
      <IconPicker label={t('common.icon')} icons={CATEGORY_ICONS} value={icon} color={color} onChange={setIcon} />
      {id ? (
        c?.archived ? (
          <Button label={t('common.unarchive')} variant="secondary" size="md" onPress={() => mutate((r) => r.categories.setArchived(id, false)).then(() => router.back())} />
        ) : (
          <>
            <Button label={t('common.archive')} variant="secondary" size="md" icon="archive-outline" onPress={() => mutate((r) => r.categories.setArchived(id, true)).then(() => router.back())} />
            {!isSystem ? <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={remove} /> : null}
          </>
        )
      ) : null}
    </Screen>
  );
}
