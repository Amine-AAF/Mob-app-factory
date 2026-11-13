import { Card, CodeLabel, Icon, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { modules } from '@/content';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';

export default function Learn() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useAsync(async () => {
    const [lessons, statuses] = await Promise.all([repos().content.listLessons(), repos().progress.lessonStatuses()]);
    return modules.map((m) => {
      const inModule = lessons.filter((l) => l.moduleId === m.id);
      const done = inModule.filter((l) => statuses.get(l.id)?.status === 'completed').length;
      return { ...m, total: inModule.length, done };
    });
  }, []);

  return (
    <Screen>
      <Stack gap={1}>
        <CodeLabel>modules</CodeLabel>
        <Text variant="title" accessibilityRole="header">
          {t('learn.title')}
        </Text>
        <Text tone="muted">{t('learn.subtitle')}</Text>
      </Stack>
      {(data ?? modules.map((m) => ({ ...m, total: 0, done: 0 }))).map((m) => (
        <Card key={m.id} onPress={() => router.push(`/module/${m.id}`)} accessibilityLabel={t(`modules.${m.id}`)} testID={`module-${m.id}`} style={{ gap: 12 }}>
          <Row style={{ alignItems: 'flex-start' }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={m.icon} size={26} color={theme.colors.primary} />
            </View>
            <Stack gap={1} style={{ flex: 1 }}>
              <Text variant="heading">{t(`modules.${m.id}`)}</Text>
              <Text variant="bodySmall" tone="muted">
                {t(`modules.${m.id}Desc`)}
              </Text>
            </Stack>
            <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="caption" tone="muted">
              {t('learn.lessonsCount', { count: m.total })}
            </Text>
            <Text variant="caption" tone="muted">
              {t('learn.completedCount', { done: m.done, total: m.total })}
            </Text>
          </Row>
          <ProgressBar progress={m.total ? m.done / m.total : 0} label={t('learn.completedCount', { done: m.done, total: m.total })} />
        </Card>
      ))}
      <AdBanner />
    </Screen>
  );
}
