import { ListRow, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CategoryCard, JobCategoryCard } from '@/components/content';
import { SearchField } from '@/components/SearchField';
import { matchesRole } from '@/features/questions/search';
import { useQuestions } from '@/hooks/useContent';
import { useSession } from '@/store/session';
import { CATEGORIES, JOB_ROLES, type JobRoleId } from '@/types/content';

export default function ExploreScreen() {
  const { t } = useTranslation();
  const questions = useQuestions();
  const myRole = useSession((s) => s.profile?.jobRole ?? null);
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const q of questions) byCategory.set(q.category, (byCategory.get(q.category) ?? 0) + 1);
    const byRole = new Map<JobRoleId, number>(JOB_ROLES.map((r) => [r, questions.filter((q) => matchesRole(q, r)).length]));
    return { byCategory, byRole };
  }, [questions]);

  // The user's role first, then the others.
  const roles = myRole ? [myRole, ...JOB_ROLES.filter((r) => r !== myRole)] : [...JOB_ROLES];

  const search = () => {
    if (query.trim().length < 2) return;
    router.push({ pathname: '/questions', params: { q: query.trim() } });
  };

  return (
    <Screen testID="explore">
      <Text variant="title" accessibilityRole="header">
        {t('explore.title')}
      </Text>
      <Text tone="muted">{t('explore.subtitle', { count: questions.length })}</Text>
      <SearchField value={query} onChangeText={setQuery} onSubmit={search} placeholder={t('explore.searchPlaceholder')} testID="explore-search" />

      <ListRow title={t('explore.favorites')} icon="bookmark-outline" onPress={() => router.push({ pathname: '/questions', params: { favorites: '1' } })} testID="explore-favorites" />

      <SectionHeader title={t('explore.categories')} />
      <Stack gap={3}>
        {chunk(CATEGORIES, 2).map((pair) => (
          <Row key={pair.join()} gap={3} style={{ alignItems: 'stretch' }}>
            {pair.map((c) => (
              <CategoryCard key={c} category={c} count={counts.byCategory.get(c) ?? 0} onPress={() => router.push({ pathname: '/questions', params: { category: c } })} />
            ))}
          </Row>
        ))}
      </Stack>

      <SectionHeader title={t('explore.roles')} />
      {roles.map((r) => (
        <JobCategoryCard key={r} role={r} count={counts.byRole.get(r) ?? 0} selected={r === myRole} onPress={() => router.push({ pathname: '/questions', params: { role: r } })} />
      ))}
    </Screen>
  );
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
