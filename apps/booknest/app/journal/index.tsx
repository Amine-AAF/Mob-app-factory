import { Chip, Icon, Text } from '@factory/design-system';
import { router, Stack } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, SectionList, TextInput, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Empty, IconAction, Paper } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useData, usePremiumGate } from '@/hooks';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { shareTextFile } from '@/services/files';
import { journalMarkdown } from '@/services/transferService';
import { NOTE_KINDS, type NoteKind } from '@/types';

/** Reading journal timeline. Entries never leave the device unless the user exports them. */
export default function Journal() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const gate = usePremiumGate();
  const [query, setQuery] = useState('');
  const search = useDeferredValue(query);
  const [kind, setKind] = useState<NoteKind | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(false);
  const { data } = useData((r) => Promise.all([r.content.notes({ search, kind, tag, favoritesOnly: favorites }), r.content.allTags()]), [search, kind, tag, favorites]);
  const [notes, tags] = data ?? [[], []];

  const groups = new Map<string, typeof notes>();
  for (const n of notes) groups.set(n.createdAt.slice(0, 7), [...(groups.get(n.createdAt.slice(0, 7)) ?? []), n]);

  const exportJournal = () => {
    if (!gate('advanced_journal')) return;
    void run(async () => {
      const all = await repos().content.notes();
      const md = journalMarkdown(all, { title: t('journal.exportTitle'), kind: (k) => t(`journal.kinds.${k}`), date: (iso) => fmt.day(iso.slice(0, 10)) });
      await shareTextFile(`booknest-journal-${new Date().toISOString().slice(0, 10)}.md`, md, 'text/markdown');
      track('export_completed', { kind: 'journal' });
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <IconAction icon="share-outline" label={t('journal.export')} onPress={exportJournal} testID="export-journal" /> }} />
      <SectionList
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 20, gap: 10 }}
        sections={[...groups.entries()].map(([month, data]) => ({ title: month, data }))}
        keyExtractor={(n) => n.id}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 12 }}>
              <Icon name="search" size={18} color={theme.colors.textSubtle} />
              <TextInput value={query} onChangeText={setQuery} placeholder={t('journal.search')} placeholderTextColor={theme.colors.textSubtle} accessibilityLabel={t('journal.search')} style={{ flex: 1, minHeight: 46, color: theme.colors.text }} />
              <IconAction icon="add-circle" tone="primary" label={t('journal.add')} onPress={() => router.push('/journal/edit')} testID="add-note" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              <Chip label={t('library.favorites')} icon="heart" selected={favorites} onPress={() => setFavorites(!favorites)} />
              {NOTE_KINDS.map((k) => (
                <Chip key={k} label={t(`journal.kinds.${k}`)} selected={kind === k} onPress={() => (gate('advanced_journal') ? setKind(kind === k ? null : k) : undefined)} />
              ))}
            </ScrollView>
            {tags.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {tags.map((x) => (
                  <Chip key={x} label={`#${x}`} selected={tag === x} onPress={() => (gate('advanced_journal') ? setTag(tag === x ? null : x) : undefined)} />
                ))}
              </ScrollView>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text variant="label" tone="accent" style={{ marginTop: 10 }}>
            {fmt.month(section.title)}
          </Text>
        )}
        renderItem={({ item: n }) => (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 14 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.accent, marginTop: 18 }} />
              <View style={{ flex: 1, width: 2, backgroundColor: theme.colors.border }} />
            </View>
            <Paper style={{ flex: 1 }} onPress={() => router.push({ pathname: '/journal/edit', params: { id: n.id } })} accessibilityLabel={n.title ?? t(`journal.kinds.${n.kind}`)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="caption" tone="accent" style={{ fontWeight: '700' }}>
                  {t(`journal.kinds.${n.kind}`)}
                </Text>
                <Text variant="caption" tone="subtle">
                  {fmt.shortDay(n.createdAt.slice(0, 10))}
                  {n.isFavorite ? ' ♥' : ''}
                </Text>
              </View>
              {n.title ? <Text style={{ fontWeight: '700', fontFamily: theme.serif }}>{n.title}</Text> : null}
              <Text variant="bodySmall" numberOfLines={4}>
                {n.body}
              </Text>
              {n.bookTitle ? (
                <Text variant="caption" tone="subtle">
                  {n.bookTitle}
                </Text>
              ) : null}
            </Paper>
          </View>
        )}
        ListEmptyComponent={<Empty icon="journal-outline" title={t('journal.emptyTitle')} message={t('journal.emptyBody')} />}
      />
    </>
  );
}
