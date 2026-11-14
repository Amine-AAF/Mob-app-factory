import { Badge, Button, Card, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { repos } from '@/database';
import { composeAnswer } from '@/features/answer-builder/templates';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';

export default function BuilderList() {
  const { t } = useTranslation();
  const { data } = useAsync(() => repos().practice.listAnswers(), []);

  return (
    <Screen edges={[]} testID="builder-list">
      <RouterStack.Screen options={{ title: t('practice.builder.title') }} />
      <Text tone="muted">{t('builder.intro')}</Text>
      <Button label={t('builder.new')} icon="add" onPress={() => router.push('/builder/edit')} testID="builder-new" />
      {data?.length ? (
        data.map((a) => (
          <Card key={a.id} onPress={() => router.push({ pathname: '/builder/edit', params: { id: String(a.id) } })} accessibilityLabel={a.title}>
            <Stack gap={1}>
              <Row gap={2} wrap>
                <Text variant="subheading" style={{ flex: 1 }}>
                  {a.title}
                </Text>
                <Badge label={a.status === 'final' ? t('builder.final') : t('builder.draft')} tone={a.status === 'final' ? 'success' : 'neutral'} />
              </Row>
              <Text variant="caption" tone="muted">
                {t(`builder.structure.${a.structure}`)} · {fmt.date(new Date(a.updatedAt), { day: 'numeric', month: 'short' })}
              </Text>
              <Text variant="bodySmall" numberOfLines={2}>
                {composeAnswer(a.structure, a.fields) || t('builder.empty')}
              </Text>
            </Stack>
          </Card>
        ))
      ) : (
        <EmptyState icon="construct-outline" title={t('builder.noAnswers')} message={t('builder.noAnswersHint')} />
      )}
    </Screen>
  );
}
