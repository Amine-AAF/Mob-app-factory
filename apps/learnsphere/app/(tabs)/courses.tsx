import { Button, EmptyState, Icon, ProgressBar, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { LimitNotice, SearchField, Segmented, SubjectIcon } from '@/components/ui';
import { canCreate, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import type { SubjectFilter } from '@/database/repositories/subjects';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

const SHORTCUTS: { key: string; icon: IconName; href: '/notes' | '/quiz' | '/agenda' | '/templates' }[] = [
  { key: 'notes', icon: 'document-text-outline', href: '/notes' },
  { key: 'quizzes', icon: 'help-circle-outline', href: '/quiz' },
  { key: 'exams', icon: 'alarm-outline', href: '/agenda' },
  { key: 'templates', icon: 'copy-outline', href: '/templates' },
];

export default function Courses() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const [filter, setFilter] = useState<SubjectFilter>('active');
  const [query, setQuery] = useState('');
  const { data: subjects } = useAsync(() => repos().subjects.list(filter, query), [filter, query]);
  const { data: activeCount = 0 } = useAsync(() => repos().subjects.countActive(), []);

  const create = () => {
    if (!canCreate('subjects', activeCount, isPremium)) router.push({ pathname: '/paywall', params: { source: 'subjects_limit' } });
    else router.push('/subject/edit');
  };

  return (
    <Screen testID="courses-screen">
      <Row>
        <Text variant="title" accessibilityRole="header" style={{ flex: 1 }}>
          {t('courses.title')}
        </Text>
        <Button size="md" icon="add" label={t('courses.newSubject')} onPress={create} testID="new-subject" />
      </Row>
      <Row gap={2}>
        {SHORTCUTS.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => router.push(s.href)}
            accessibilityRole="button"
            accessibilityLabel={t(`courses.shortcuts.${s.key}`)}
            style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Icon name={s.icon} size={22} color={theme.colors.primary} />
            <Text variant="caption" numberOfLines={1}>
              {t(`courses.shortcuts.${s.key}`)}
            </Text>
          </Pressable>
        ))}
      </Row>
      <SearchField value={query} onChangeText={setQuery} placeholder={t('courses.search')} testID="subject-search" />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'active', label: t('courses.filters.active') },
          { value: 'favorites', label: t('courses.filters.favorites') },
          { value: 'archived', label: t('courses.filters.archived') },
        ]}
      />
      {!isPremium && filter === 'active' && activeCount >= FREE_LIMITS.subjects ? (
        <LimitNotice message={t('limits.subjects', { count: FREE_LIMITS.subjects })} onUpgrade={() => router.push({ pathname: '/paywall', params: { source: 'subjects_limit' } })} />
      ) : null}
      {subjects && subjects.length === 0 ? (
        <EmptyState
          icon={query ? 'search-outline' : filter === 'archived' ? 'archive-outline' : 'library-outline'}
          title={query ? t('common.noResults') : t(`courses.empty.${filter}`)}
          message={!query && filter === 'active' ? t('courses.empty.activeBody') : undefined}
          action={!query && filter === 'active' ? <Button label={t('templates.browse')} variant="secondary" onPress={() => router.push('/templates')} /> : undefined}
        />
      ) : null}
      <Stack gap={3}>
        {subjects?.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push({ pathname: '/subject/[id]', params: { id: s.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${s.name}, ${fmt.percent(s.progress)}`}
            style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 16, gap: 10 }}
          >
            <Row gap={3}>
              <SubjectIcon icon={s.icon} color={s.color} />
              <View style={{ flex: 1 }}>
                <Row gap={1}>
                  <Text variant="subheading" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {s.name}
                  </Text>
                  {s.favorite ? <Icon name="star" size={14} color={theme.colors.accent} /> : null}
                </Row>
                <Text variant="caption" tone="subtle">
                  {t('courses.counts', { courses: s.courses, chapters: s.chapters })}
                  {s.targetDay ? ` · ${t('courses.target', { date: fmt.day(s.targetDay) })}` : ''}
                </Text>
              </View>
              <Text variant="subheading" style={{ color: s.color }}>
                {fmt.percent(s.progress)}
              </Text>
            </Row>
            <ProgressBar progress={s.progress} height={6} label={s.name} />
          </Pressable>
        ))}
      </Stack>
      <AdBanner />
    </Screen>
  );
}
