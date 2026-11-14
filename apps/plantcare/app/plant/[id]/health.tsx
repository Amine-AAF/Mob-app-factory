import { Badge, Button, Card, EmptyState, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { HEALTH_ICON } from '@/components/icons';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';

export default function PlantHealth() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData(async (r) => ({ plant: await r.plants.get(id), records: await r.health.forPlant(id) }), [id]);
  const records = data?.records ?? [];

  return (
    <Screen edges={[]} footer={<Button label={t('health.report')} icon="add" onPress={() => router.push({ pathname: '/record/health', params: { plantId: id } })} />}>
      <RouterStack.Screen options={{ title: t('health.title') }} />
      <Text variant="subheading">{data?.plant?.nickname}</Text>
      <Card tone="alt">
        <Text variant="bodySmall" tone="muted">
          {t('health.disclaimer')}
        </Text>
        <Button size="md" variant="ghost" icon="book-outline" label={t('healthGuide.title')} onPress={() => router.push('/health-guide')} />
      </Card>
      {records.length === 0 ? (
        <EmptyState icon="happy-outline" title={t('health.empty')} />
      ) : (
        <Stack gap={2}>
          {records.map((h) => (
            <Card key={h.id} onPress={() => router.push(`/health/${h.id}`)} accessibilityLabel={t(`healthCategories.${h.category}`)}>
              <Row gap={3}>
                <Icon name={HEALTH_ICON[h.category]} size={22} color={h.status === 'resolved' ? theme.colors.success : theme.colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{t(`healthCategories.${h.category}`)}</Text>
                  <Text variant="caption" tone="muted">{`${fmt.day(h.observedOn)} · ${t('health.actionsCount', { count: h.actions.length })}`}</Text>
                  {h.description ? (
                    <Text variant="bodySmall" numberOfLines={2}>
                      {h.description}
                    </Text>
                  ) : null}
                </View>
                <Badge label={t(`healthStatus.${h.status}`)} tone={h.status === 'resolved' ? 'success' : h.status === 'improving' ? 'primary' : 'warning'} />
              </Row>
            </Card>
          ))}
        </Stack>
      )}
    </Screen>
  );
}
