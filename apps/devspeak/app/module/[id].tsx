import { Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { LessonCard } from '@/components/learning';
import { interviewPaths, type Level, type ModuleId } from '@/content';
import { repos } from '@/database';
import { canAccessLesson } from '@/features/learning/recommendations';
import { useAsync } from '@/hooks/useAsync';
import { useIsPremium } from '@/store/session';

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: ModuleId }>();
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const [level, setLevel] = useState<Level | null>(null);
  const { data } = useAsync(async () => {
    const [lessons, statuses] = await Promise.all([repos().content.listLessons(id), repos().progress.lessonStatuses()]);
    return { lessons, statuses };
  }, [id]);

  const groups = useMemo(() => {
    const filtered = (data?.lessons ?? []).filter((l) => !level || l.level === level);
    if (id === 'interview') {
      return interviewPaths.map((p) => ({ key: p, title: t(`paths.${p}`), lessons: filtered.filter((l) => l.interviewPath === p) })).filter((g) => g.lessons.length);
    }
    return [{ key: 'all', title: '', lessons: filtered }];
  }, [data, level, id, t]);

  return (
    <>
      <RouterStack.Screen options={{ title: t(`modules.${id}`) }} />
      <Screen edges={[]}>
        <Text tone="muted">{t(`modules.${id}Desc`)}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('learn.allLevels')} selected={level === null} onPress={() => setLevel(null)} />
          {LEVELS.map((l) => (
            <Chip key={l} label={t(`levels.${l}`)} selected={level === l} onPress={() => setLevel(l)} testID={`filter-${l}`} />
          ))}
        </ScrollView>
        {data && groups.every((g) => g.lessons.length === 0) ? <EmptyState icon="filter-outline" title={t('learn.empty')} /> : null}
        {groups.map((g) => (
          <Stack key={g.key} gap={3}>
            {g.title ? (
              <Row style={{ marginTop: 8 }}>
                <Text variant="heading" accessibilityRole="header">
                  {g.title}
                </Text>
              </Row>
            ) : null}
            {g.lessons.map((l) => (
              <LessonCard
                key={l.id}
                lesson={l}
                status={data?.statuses.get(l.id)}
                locked={!canAccessLesson(l, isPremium)}
                onPress={() => (canAccessLesson(l, isPremium) ? router.push(`/lesson/${l.id}`) : router.push({ pathname: '/paywall', params: { source: `module_${id}` } }))}
              />
            ))}
          </Stack>
        ))}
        <AdBanner />
      </Screen>
    </>
  );
}
