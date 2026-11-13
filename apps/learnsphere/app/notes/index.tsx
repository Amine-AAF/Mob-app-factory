import { Chip, EmptyState, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { SubjectPicker } from '@/components/pickers';
import { Fab, Pill, SearchField } from '@/components/ui';
import { repos } from '@/database';
import { preview } from '@/features/notes/format';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';

export default function NotesList() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ subjectId?: string }>();
  const [subjectId, setSubjectId] = useState<string | null>(params.subjectId || null);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(false);
  const { data: subjects = [] } = useAsync(() => repos().subjects.list('all'), []);
  const { data: tags = [] } = useAsync(() => repos().notes.allTags(), []);
  const { data: notes } = useAsync(() => repos().notes.list({ subjectId, query, tag: tag ?? undefined, favoritesOnly: favorites }), [subjectId, query, tag, favorites]);
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  return (
    <View style={{ flex: 1 }}>
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('notes.title') }} />
        <SearchField value={query} onChangeText={setQuery} placeholder={t('notes.search')} testID="notes-search" />
        <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('common.favorites')} icon="star-outline" selected={favorites} onPress={() => setFavorites((f) => !f)} />
          {tags.map((tg) => (
            <Chip key={tg} label={`#${tg}`} selected={tag === tg} onPress={() => setTag(tag === tg ? null : tg)} />
          ))}
        </ScrollView>
        {notes && notes.length === 0 ? <EmptyState icon="document-text-outline" title={query || tag ? t('common.noResults') : t('notes.empty')} message={query || tag ? undefined : t('notes.emptyBody')} /> : null}
        <Stack gap={3}>
          {notes?.map((n) => {
            const s = n.subjectId ? subjectById.get(n.subjectId) : undefined;
            return (
              <Pressable
                key={n.id}
                onPress={() => router.push({ pathname: '/notes/[id]', params: { id: n.id } })}
                accessibilityRole="button"
                accessibilityLabel={n.title || t('notes.untitled')}
                style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 14, gap: 6 }}
              >
                <Row gap={2}>
                  <Text variant="subheading" numberOfLines={1} style={{ flex: 1 }}>
                    {n.title || t('notes.untitled')}
                  </Text>
                  {n.favorite ? <Icon name="star" size={14} color={theme.colors.accent} /> : null}
                </Row>
                {n.body ? (
                  <Text variant="bodySmall" tone="muted" numberOfLines={2}>
                    {preview(n.body)}
                  </Text>
                ) : null}
                <Row gap={2} wrap>
                  {s ? <Pill label={s.name} color={s.color} /> : null}
                  {n.tags.slice(0, 3).map((tg) => (
                    <Text key={tg} variant="caption" tone="primary">
                      #{tg}
                    </Text>
                  ))}
                  <Text variant="caption" tone="subtle" style={{ marginLeft: 'auto' }}>
                    {fmt.dateTime(n.updatedAt)}
                  </Text>
                </Row>
              </Pressable>
            );
          })}
        </Stack>
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('notes.new')} icon="create-outline" onPress={() => router.push({ pathname: '/notes/[id]', params: { id: 'new', subjectId: subjectId ?? '' } })} testID="new-note" />
    </View>
  );
}
