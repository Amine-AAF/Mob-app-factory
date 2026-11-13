import { Badge, Button, Card, Row, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { IconBubble } from '@/components/finance';
import { Segmented, SwitchRow } from '@/components/inputs';
import { useCategoryName, useData } from '@/hooks';
import { canAdd } from '@/services/premium';
import { useIsPremium } from '@/store/session';
import type { CategoryKind } from '@/types';

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const catName = useCategoryName();
  const isPremium = useIsPremium();
  const [kind, setKind] = useState<CategoryKind>('expense');
  const [showArchived, setShowArchived] = useState(false);
  const { data } = useData(async (r) => ({ list: await r.categories.list({ includeArchived: true }), custom: await r.categories.customCount() }), []);
  const list = (data?.list ?? []).filter((c) => c.kind === kind && (showArchived || !c.archived));

  function add() {
    if (!canAdd('customCategories', data?.custom ?? 0, isPremium)) router.push('/paywall?source=categories');
    else router.push(`/categories/edit?kind=${kind}`);
  }

  return (
    <Screen edges={[]} footer={<Button label={t('categories.new')} icon="add" onPress={add} testID="category-add" />}>
      <RouterStack.Screen options={{ title: t('categories.title') }} />
      <Segmented options={[{ value: 'expense', label: t('categories.expense') }, { value: 'income', label: t('categories.income') }]} value={kind} onChange={setKind} />
      <Card>
        {list.map((c) => (
          <Row key={c.id} gap={3} style={{ minHeight: 52, opacity: c.archived ? 0.55 : 1 }}>
            <IconBubble icon={c.icon} color={c.color} size={36} />
            <Text style={{ flex: 1 }} numberOfLines={1} onPress={() => router.push(`/categories/edit?id=${c.id}`)} accessibilityRole="button">
              {catName(c)}
            </Text>
            {c.archived ? <Badge label={t('common.archived')} tone="neutral" /> : c.systemKey ? <Badge label={t('categories.builtIn')} tone="neutral" /> : <Badge label={t('categories.custom')} tone="accent" />}
          </Row>
        ))}
      </Card>
      <View>
        <SwitchRow label={t('categories.showArchived')} value={showArchived} onChange={setShowArchived} />
      </View>
    </Screen>
  );
}
