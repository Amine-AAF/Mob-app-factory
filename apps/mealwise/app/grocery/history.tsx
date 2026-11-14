import { Badge, Button, Card, EmptyState, Row, Screen, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';

import { AdBanner } from '@/components/cards';
import { repos } from '@/database';
import { formatMoney } from '@/domain/budget';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { dataChanged } from '@/store/session';

/** Past lists: reuse one as a new list, reopen, or delete. */
export default function GroceryHistory() {
  const { t, lng, currency } = useLang();
  const { data } = useAsync(() => repos().grocery.summaries(), []);

  const reuse = async (id: number, name: string) => {
    await repos().grocery.reuse(id, t('grocery.reusedName', { name }));
    dataChanged();
    router.navigate('/(tabs)/grocery');
  };

  const remove = (id: number) =>
    Alert.alert(t('grocery.deleteListTitle'), t('grocery.deleteListBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().grocery.removeList(id);
          dataChanged();
        },
      },
    ]);

  return (
    <Screen edges={[]}>
      {data && data.length === 0 ? <EmptyState icon="time-outline" title={t('grocery.noHistory')} /> : null}
      {data?.map((l) => (
        <Card key={l.id} testID={`list-${l.id}`}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="subheading" style={{ flex: 1 }} numberOfLines={1}>
              {l.name}
            </Text>
            {l.completedAt ? <Badge label={t('grocery.completed')} tone="success" /> : <Badge label={t('grocery.active')} tone="primary" />}
          </Row>
          <Text variant="caption" tone="muted">
            {fmt.date(new Date(l.createdAt))} · {t('grocery.progress', { done: l.done, total: l.total })}
            {l.spent !== null ? ` · ${t('grocery.spentValue', { amount: formatMoney(l.spent, currency, lng) })}` : ''}
          </Text>
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <Button label={t('grocery.reuse')} size="md" variant="secondary" icon="repeat" onPress={() => void reuse(l.id, l.name)} />
            </View>
            {l.completedAt ? (
              <View style={{ flex: 1 }}>
                <Button
                  label={t('grocery.reopen')}
                  size="md"
                  variant="ghost"
                  onPress={async () => {
                    await repos().grocery.reopen(l.id);
                    dataChanged();
                  }}
                />
              </View>
            ) : null}
            <Button label={t('common.delete')} size="md" variant="danger" onPress={() => remove(l.id)} />
          </Row>
        </Card>
      ))}
      <AdBanner screen="grocery_history" />
    </Screen>
  );
}
