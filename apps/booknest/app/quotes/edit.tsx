import { Button, Chip, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Switch, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Field, Page, Paper, TagInput } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useData } from '@/hooks';
import { deleteQuote, MAX_QUOTE_LENGTH, saveQuote } from '@/services/contentService';

/** Quote editor. No ads here. Text is typed by the user (no bulk import of copyrighted passages). */
export default function EditQuote() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const params = useLocalSearchParams<{ id?: string; bookId?: string }>();
  const { data: books } = useData((r) => r.books.list({ sort: 'recent' }), []);
  const [bookId, setBookId] = useState<string | null>(params.bookId ?? null);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [page, setPage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    repos()
      .content.getQuote(params.id)
      .then((q) => {
        if (!q) return;
        setBookId(q.bookId);
        setText(q.text);
        setAuthor(q.authorName ?? '');
        setPage(q.page?.toString() ?? '');
        setTags(q.tags);
        setComment(q.comment ?? '');
        setFavorite(q.isFavorite);
      });
  }, [params.id]);

  // Default the quote author to the book's author.
  useEffect(() => {
    if (!bookId || author) return;
    const b = books?.find((x) => x.id === bookId);
    if (b?.authorName) setAuthor(b.authorName);
  }, [bookId, books, author]);

  const save = () => run(() => saveQuote(repos(), { bookId, text, authorName: author, page: page ? Number(page) : null, tags, comment, isFavorite: favorite }, params.id).then(() => router.back()));

  return (
    <Page edges={['bottom']} footer={<Button label={t('common.save')} size="lg" onPress={() => void save()} disabled={!text.trim()} testID="save-quote" />}>
      <Field label={t('quotes.text')} value={text} onChangeText={setText} multiline maxLength={MAX_QUOTE_LENGTH} style={{ fontFamily: theme.serif, fontSize: 17, minHeight: 140 }} autoFocus={!params.id} hint={`${text.length}/${MAX_QUOTE_LENGTH}`} testID="quote-text" />
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
      <Field label={t('quotes.author')} value={author} onChangeText={setAuthor} />
      <Field label={t('quotes.page')} value={page} onChangeText={(v) => setPage(v.replace(/\D/g, ''))} keyboardType="number-pad" />
      <TagInput label={t('quotes.tags')} tags={tags} onChange={setTags} placeholder={t('quotes.tagsPlaceholder')} />
      <Field label={t('quotes.comment')} value={comment} onChangeText={setComment} multiline />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text>{t('quotes.favorite')}</Text>
        <Switch value={favorite} onValueChange={setFavorite} trackColor={{ true: theme.colors.primary }} accessibilityLabel={t('quotes.favorite')} />
      </View>
      <Paper tone="alt">
        <Text variant="caption" tone="muted">
          {t('quotes.privateHint')}
        </Text>
      </Paper>
      {params.id ? (
        <Button
          label={t('common.delete')}
          variant="danger"
          onPress={() =>
            Alert.alert(t('quotes.deleteTitle'), t('common.cannotUndo'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.delete'), style: 'destructive', onPress: () => void run(() => deleteQuote(repos(), params.id!).then(() => router.back())) },
            ])
          }
        />
      ) : null}
    </Page>
  );
}
