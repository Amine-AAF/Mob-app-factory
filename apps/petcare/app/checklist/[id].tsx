import { Button, Card, Icon, IconButton, ProgressBar, Row, Screen, Text, useTheme } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';

import { TextField } from '@/components/fields';
import { repos } from '@/database';
import { useData } from '@/hooks/useData';
import { mutate } from '@/services/mutations';

/** A personal checklist created from a template (fully editable). */
export default function ChecklistScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [label, setLabel] = useState('');
  const { data: list } = useData((r) => r.checklists.get(id), [id]);
  if (!list) return <Screen>{null}</Screen>;
  const done = list.items.filter((i) => i.done).length;

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: list.title }} />
      <Card tone="primary">
        <Text variant="subheading">{t('templates.progress', { done, total: list.items.length })}</Text>
        <ProgressBar progress={list.items.length ? done / list.items.length : 0} tone="success" label={t('templates.progress', { done, total: list.items.length })} />
      </Card>
      <Card>
        {list.items.map((item) => (
          <Row key={item.id} gap={2}>
            <Pressable
              onPress={() => mutate(t, () => repos().checklists.toggle(item.id, !item.done))}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              accessibilityLabel={item.label}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}
            >
              <Icon name={item.done ? 'checkbox' : 'square-outline'} size={24} color={item.done ? theme.colors.success : theme.colors.textMuted} />
              <Text style={{ flex: 1, textDecorationLine: item.done ? 'line-through' : 'none' }} tone={item.done ? 'muted' : 'default'}>
                {item.label}
              </Text>
            </Pressable>
            <IconButton icon="close" label={t('common.delete')} size={18} onPress={() => mutate(t, () => repos().checklists.removeItem(item.id))} />
          </Row>
        ))}
        <TextField label={t('templates.addItem')} value={label} onChange={setLabel} maxLength={120} />
        <Button
          label={t('common.add')}
          size="md"
          variant="secondary"
          icon="add"
          disabled={!label.trim()}
          onPress={async () => {
            await mutate(t, () => repos().checklists.addItem(id, label.trim()));
            setLabel('');
          }}
        />
      </Card>
      <Button label={t('templates.reset')} variant="secondary" icon="refresh" onPress={() => mutate(t, () => repos().checklists.reset(id))} />
      <Button
        label={t('templates.saveAsTemplate')}
        variant="ghost"
        icon="bookmark-outline"
        onPress={async () => {
          await mutate(t, () => repos().customTemplates.create(list.title, 'custom', list.items.map((i) => i.label)));
          Alert.alert(t('templates.savedTitle'), t('templates.savedBody'));
        }}
      />
      <Button
        label={t('common.delete')}
        variant="danger"
        icon="trash-outline"
        onPress={() =>
          Alert.alert(t('common.deleteTitle'), t('common.deleteBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: async () => {
                await mutate(t, () => repos().checklists.remove(id));
                router.back();
              },
            },
          ])
        }
      />
    </Screen>
  );
}
