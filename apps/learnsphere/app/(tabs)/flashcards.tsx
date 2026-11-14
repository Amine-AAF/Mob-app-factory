import { Button, Chip, EmptyState, Icon, Row, Screen, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { SubjectPicker } from '@/components/pickers';
import { Fab, LimitNotice, Panel, Pill, SearchField } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import type { CardDifficulty } from '@/database/repositories/flashcards';
import { cardMaturity } from '@/features/flashcards/scheduler';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

export default function Flashcards() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const params = useLocalSearchParams<{ subjectId?: string }>();
  const [subjectId, setSubjectId] = useState<string | null>(params.subjectId || null);
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState(false);
  const [difficulty, setDifficulty] = useState<CardDifficulty | null>(null);
  const { data: subjects = [] } = useAsync(() => repos().subjects.list('all'), []);
  const { data: cards } = useAsync(() => repos().flashcards.list({ subjectId, query, favoritesOnly: favorites, difficulty }), [subjectId, query, favorites, difficulty]);
  const { data: summary } = useAsync(async () => ({ due: await repos().flashcards.dueCount(), total: await repos().flashcards.count(), maturity: await repos().flashcards.maturity() }), []);
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const atLimit = !isPremium && (summary?.total ?? 0) >= FREE_LIMITS.flashcards;

  const newCard = () => (atLimit ? router.push({ pathname: '/paywall', params: { source: 'flashcards_limit' } }) : router.push({ pathname: '/flashcards/edit', params: { subjectId: subjectId ?? '' } }));

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="flashcards-screen">
        <Text variant="title" accessibilityRole="header">
          {t('flashcards.title')}
        </Text>
        <Panel title={t('flashcards.today')} icon="repeat-outline">
          <Row gap={3}>
            <Stat value={fmt.number(summary?.due ?? 0)} label={t('flashcards.due')} icon="time-outline" />
            <Stat value={fmt.number(summary?.maturity.new ?? 0)} label={t('flashcards.maturity.new')} icon="sparkles-outline" tone="accent" />
            <Stat value={fmt.number(summary?.maturity.mature ?? 0)} label={t('flashcards.maturity.mature')} icon="ribbon-outline" tone="success" />
          </Row>
          <Button label={t('flashcards.reviewNow')} icon="play" disabled={!summary?.due} onPress={() => router.push({ pathname: '/flashcards/review', params: { subjectId: subjectId ?? '' } })} testID="start-review" />
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <Button
                size="md"
                variant="secondary"
                label={isPremium ? t('flashcards.cram') : `${t('flashcards.cram')} · ${t('premium.badge')}`}
                disabled={!summary?.total}
                onPress={() => (isPremium ? router.push({ pathname: '/flashcards/review', params: { subjectId: subjectId ?? '', mode: 'cram' } }) : router.push({ pathname: '/paywall', params: { source: 'cram' } }))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button size="md" variant="secondary" label={t('flashcards.settings')} onPress={() => router.push('/settings/srs')} />
            </View>
          </Row>
          {!summary?.due && summary?.total ? (
            <Text variant="bodySmall" tone="muted">
              {t('flashcards.allDone')}
            </Text>
          ) : null}
        </Panel>
        {atLimit ? <LimitNotice message={t('limits.flashcards', { count: FREE_LIMITS.flashcards })} onUpgrade={() => router.push({ pathname: '/paywall', params: { source: 'flashcards_limit' } })} /> : null}
        <SearchField value={query} onChangeText={setQuery} placeholder={t('flashcards.search')} />
        <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('common.favorites')} icon="star-outline" selected={favorites} onPress={() => setFavorites((f) => !f)} />
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <Chip key={d} label={t(`flashcards.difficulty.${d}`)} selected={difficulty === d} onPress={() => setDifficulty(difficulty === d ? null : d)} />
          ))}
        </ScrollView>
        {cards && cards.length === 0 ? <EmptyState icon="albums-outline" title={query ? t('common.noResults') : t('flashcards.empty')} message={query ? undefined : t('flashcards.emptyBody')} /> : null}
        <Stack gap={2}>
          {cards?.map((c) => {
            const s = c.subjectId ? subjectById.get(c.subjectId) : undefined;
            const maturity = cardMaturity(c);
            return (
              <Pressable
                key={c.id}
                onPress={() => router.push({ pathname: '/flashcards/edit', params: { id: c.id } })}
                accessibilityRole="button"
                accessibilityLabel={c.front}
                style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 12, gap: 6 }}
              >
                <Row gap={2}>
                  <Text numberOfLines={2} style={{ flex: 1, fontWeight: '600' }}>
                    {c.front}
                  </Text>
                  {c.favorite ? <Icon name="star" size={14} color={theme.colors.accent} /> : null}
                </Row>
                <Text variant="bodySmall" tone="muted" numberOfLines={1}>
                  {c.back}
                </Text>
                <Row gap={2} wrap>
                  {s ? <Pill label={s.name} color={s.color} /> : null}
                  <Pill label={t(`flashcards.maturity.${maturity}`)} color={maturity === 'mature' ? theme.colors.success : maturity === 'new' ? theme.colors.accent : theme.colors.primary} />
                  <Text variant="caption" tone="subtle" style={{ marginLeft: 'auto' }}>
                    {c.lastReviewedAt ? t('flashcards.nextReview', { date: fmt.day(c.dueDay) }) : t('flashcards.notReviewed')}
                  </Text>
                </Row>
              </Pressable>
            );
          })}
        </Stack>
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('flashcards.new')} onPress={newCard} testID="new-card" />
    </View>
  );
}
