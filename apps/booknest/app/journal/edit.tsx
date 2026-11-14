import { Button, Chip, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Switch, View } from 'react-native';

import { ChipChoice } from '@/components/forms';
import { useBookTheme } from '@/components/theme';
import { Field, Page, Paper, TagInput } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useData } from '@/hooks';
import { deleteNote, MAX_NOTE_LENGTH, saveNote } from '@/services/contentService';
import { NOTE_KINDS, type NoteKind } from '@/types';

/** Journal editor. No ads while writing. */
export default function EditNote() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const params = useLocalSearchParams<{ id?: string; bookId?: string }>();
  const { data: books } = useData((r) => r.books.list({ sort: 'recent' }), []);
  const [bookId, setBookId] = useState<string | null>(params.bookId ?? null);
  const [kind, setKind] = useState<NoteKind>('impression');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    repos()
      .content.getNote(params.id)
      .then((n) => {
        if (!n) return;
        setBookId(n.bookId);
        setKind(n.kind);
        setTitle(n.title ?? '');
        setBody(n.body);
        setTags(n.tags);
        setFavorite(n.isFavorite);
      });
  }, [params.id]);

  const save = () => run(() => saveNote(repos(), { bookId, kind, title, body, tags, isFavorite: favorite }, params.id).then(() => router.back()));

  return (
    <Page edges={['bottom']} footer={<Button label={t('common.save')} size="lg" onPress={() => void save()} disabled={!body.trim()} testID="save-note" />}>
      <ChipChoice label={t('journal.kind')} options={NOTE_KINDS} value={kind} onChange={setKind} render={(k) => t(`journal.kinds.${k}`)} />
      <View style={{ gap: 6 }}>
        <Text variant="label" tone="muted">
          {t('quotes.book')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <Chip label={t('quotes.noBook')} selected={!bookId} onPress={() => setBookId(null)} />
          {(books ?? []).slice(0, 30).map((b) => (
            <Chip key={b.id} label={b.title} selected={bookId === b.id} onPress={() => setBookId(b.id)} />
          ))}
        </ScrollView>
      </View>
      <Field label={t('journal.entryTitle')} value={title} onChangeText={setTitle} />
      <Field label={t('journal.body')} value={body} onChangeText={setBody} multiline maxLength={MAX_NOTE_LENGTH} style={{ minHeight: 220, fontFamily: theme.serif, fontSize: 16, lineHeight: 24 }} autoFocus={!params.id} testID="note-body" />
      <TagInput label={t('quotes.tags')} tags={tags} onChange={setTags} placeholder={t('quotes.tagsPlaceholder')} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text>{t('quotes.favorite')}</Text>
        <Switch value={favorite} onValueChange={setFavorite} trackColor={{ true: theme.colors.primary }} accessibilityLabel={t('quotes.favorite')} />
      </View>
      <Paper tone="alt">
        <Text variant="caption" tone="muted">
          {t('privacy.localOnly')}
        </Text>
      </Paper>
      {params.id ? (
        <Button
          label={t('common.delete')}
          variant="danger"
          onPress={() =>
            Alert.alert(t('journal.deleteTitle'), t('common.cannotUndo'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.delete'), style: 'destructive', onPress: () => void run(() => deleteNote(repos(), params.id!).then(() => router.back())) },
            ])
          }
        />
      ) : null}
    </Page>
  );
}
