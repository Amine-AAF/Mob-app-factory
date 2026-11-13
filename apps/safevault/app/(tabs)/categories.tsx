import { Badge, Button, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { CategoryDot, useCategoryName } from '@/components/vault';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/app';
import { useVault } from '@/store/vault';

export default function Categories() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const isPremium = useIsPremium();
  const items = useVault((s) => s.items);
  const categories = useVault((s) => s.categories);
  const name = useCategoryName();
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) m.set(i.meta.categoryId, (m.get(i.meta.categoryId) ?? 0) + 1);
    return m;
  }, [items]);

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {t('categories.title')}
      </Text>
      <Text tone="muted">{t('categories.subtitle')}</Text>
      <Stack gap={1}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: '/items', params: { categoryId: c.id } })}
            onLongPress={() => (isPremium ? router.push({ pathname: '/category-edit', params: { id: c.id } }) : router.push('/paywall'))}
            accessibilityRole="button"
            accessibilityLabel={`${name(c)}, ${t('categories.count', { count: counts.get(c.id) ?? 0 })}`}
            accessibilityHint={t('categories.longPressHint')}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 4, borderRadius: theme.radius.md, backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent' })}
          >
            <CategoryDot color={c.color} icon={c.icon} />
            <View style={{ flex: 1 }}>
              <Text variant="subheading">{name(c)}</Text>
              {!c.builtin ? (
                <Text variant="caption" tone="subtle">
                  {t('categories.custom')}
                </Text>
              ) : null}
            </View>
            <Text variant="bodySmall" tone="muted">
              {fmt.number(counts.get(c.id) ?? 0)}
            </Text>
          </Pressable>
        ))}
      </Stack>
      <Row style={{ justifyContent: 'center' }}>{!isPremium ? <Badge label={t('premium.badge')} tone="accent" icon="sparkles" /> : null}</Row>
      <Button label={t('categories.add')} icon="add" variant={isPremium ? 'primary' : 'secondary'} onPress={() => (isPremium ? router.push('/category-edit') : router.push('/paywall'))} />
      <Text variant="caption" tone="subtle" center>
        {isPremium ? t('categories.editHint') : t('categories.premiumHint')}
      </Text>
    </Screen>
  );
}
