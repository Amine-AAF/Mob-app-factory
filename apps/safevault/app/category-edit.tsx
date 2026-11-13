import { Button, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';

import { Field } from '@/components/inputs';
import { CategoryDot, Notice, useCategoryName } from '@/components/vault';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/features/categories/defaults';
import { vaultService } from '@/services/context';
import { logEvent } from '@/services/log';
import { useVault } from '@/store/vault';
import { DEFAULT_CATEGORY_ID } from '@/vault/types';

export default function CategoryEdit() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useVault((s) => s.categories.find((c) => c.id === id));
  const displayName = useCategoryName();
  const [name, setName] = useState(existing ? existing.name || displayName(existing) : '');
  const [color, setColor] = useState<string>(existing?.color ?? CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState<string>(existing?.icon ?? 'folder');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) return setError(t('edit.titleRequired'));
    try {
      // Built-in categories keep their translated name unless the user really renamed them.
      const finalName = existing?.builtin && name === displayName({ ...existing, name: '' }) ? '' : name;
      await vaultService().saveCategory({ id: existing?.id, name: finalName, color, icon });
      router.back();
    } catch (e) {
      logEvent('category_save_failed', e);
      setError(t('errors.generic'));
    }
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert(t('categories.deleteTitle'), t('categories.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await vaultService().deleteCategory(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} />}>
      <RouterStack.Screen options={{ title: existing ? t('categories.editTitle') : t('categories.newTitle') }} />
      <Row style={{ justifyContent: 'center' }}>
        <CategoryDot color={color} icon={icon} size={64} />
      </Row>
      <Field label={t('categories.name')} value={name} onChangeText={setName} maxLength={60} />
      <Stack gap={2}>
        <Text variant="caption" tone="muted">
          {t('categories.color')}
        </Text>
        <Row gap={2} wrap>
          {CATEGORY_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="radio"
              accessibilityState={{ checked: color === c }}
              accessibilityLabel={c}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c, borderWidth: 3, borderColor: color === c ? theme.colors.text : 'transparent' }}
            />
          ))}
        </Row>
      </Stack>
      <Stack gap={2}>
        <Text variant="caption" tone="muted">
          {t('categories.icon')}
        </Text>
        <Row gap={2} wrap>
          {CATEGORY_ICONS.map((i) => (
            <Pressable key={i} onPress={() => setIcon(i)} accessibilityRole="radio" accessibilityState={{ checked: icon === i }} accessibilityLabel={i} style={{ borderRadius: 14, borderWidth: 2, borderColor: icon === i ? theme.colors.primary : 'transparent', padding: 2 }}>
              <CategoryDot color={icon === i ? color : theme.colors.textSubtle} icon={i} size={40} />
            </Pressable>
          ))}
        </Row>
      </Stack>
      {existing && existing.id !== DEFAULT_CATEGORY_ID ? <Button label={t('common.delete')} variant="danger" icon="trash" onPress={remove} /> : null}
      {error ? <Notice tone="danger">{error}</Notice> : null}
    </Screen>
  );
}
