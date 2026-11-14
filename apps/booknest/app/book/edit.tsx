import { Button, Chip, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Switch, View } from 'react-native';

import { StatusPicker } from '@/components/books';
import { ChipChoice, DateField } from '@/components/forms';
import { useBookTheme } from '@/components/theme';
import { BookCover, Field, Page, Paper, Serif } from '@/components/ui';
import { BOOK_LANGUAGES, CURRENCIES, GENRE_SUGGESTIONS } from '@/config/presets';
import { repos } from '@/database';
import { useAction, useToday } from '@/hooks';
import { bookLanguageName } from '@/i18n';
import { pickCoverImage, saveCover } from '@/services/covers';
import { addBook, BookValidationError, updateBook } from '@/services/libraryService';
import { usePreferences } from '@/store/preferences';
import { BOOK_FORMATS, type BookFormat, type BookInput, type ReadingStatus } from '@/types';
import { centsToInput, cleanText, parseIntOrNull, parseMoneyToCents } from '@/utils';

interface FormState {
  title: string;
  subtitle: string;
  originalTitle: string;
  author: string;
  genre: string;
  isbn: string;
  publisher: string;
  year: string;
  pages: string;
  language: string;
  format: BookFormat;
  acquiredOn: string;
  price: string;
  currency: string;
  description: string;
  notes: string;
  isFavorite: boolean;
  coverUri: string | null;
  thumbUri: string | null;
}

export default function EditBook() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const run = useAction(t);
  const params = useLocalSearchParams<{ id?: string; title?: string; author?: string }>();
  const defaultCurrency = usePreferences((s) => s.currency);
  const [status, setStatus] = useState<ReadingStatus>('want_to_read');
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [f, setF] = useState<FormState>({
    title: params.title ?? '', subtitle: '', originalTitle: '', author: params.author ?? '', genre: '', isbn: '', publisher: '', year: '', pages: '',
    language: '', format: 'paperback', acquiredOn: '', price: '', currency: defaultCurrency, description: '', notes: '', isFavorite: false, coverUri: null, thumbUri: null,
  });
  const set = (patch: Partial<FormState>) => setF((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (!params.id) return;
    repos()
      .books.get(params.id)
      .then((b) => {
        if (!b) return;
        setMore(true);
        setF({
          title: b.title, subtitle: b.subtitle ?? '', originalTitle: b.originalTitle ?? '', author: b.authorName ?? '', genre: b.genreName ?? '', isbn: b.isbn ?? '',
          publisher: b.publisher ?? '', year: b.publishedYear?.toString() ?? '', pages: b.pageCount?.toString() ?? '', language: b.language ?? '', format: b.format,
          acquiredOn: b.acquiredOn ?? '', price: centsToInput(b.purchasePriceCents), currency: b.currency ?? defaultCurrency, description: b.description ?? '',
          notes: b.notes ?? '', isFavorite: b.isFavorite, coverUri: b.coverUri, thumbUri: b.coverThumbUri,
        });
      });
  }, [params.id, defaultCurrency]);

  const toInput = (): BookInput | null => {
    const e: typeof errors = {};
    if (!f.title.trim()) e.title = t('errors.book.title');
    const pages = parseIntOrNull(f.pages);
    if (f.pages && (pages == null || pages <= 0)) e.pages = t('errors.book.pageCount');
    const year = parseIntOrNull(f.year);
    if (f.year && year == null) e.year = t('errors.book.publishedYear');
    const price = f.price ? parseMoneyToCents(f.price) : null;
    if (f.price && price == null) e.price = t('errors.book.price');
    setErrors(e);
    if (Object.keys(e).length) return null;
    return {
      title: f.title, subtitle: f.subtitle, originalTitle: f.originalTitle, authorName: f.author, genreName: f.genre, isbn: f.isbn, publisher: f.publisher,
      publishedYear: year, pageCount: f.format === 'audiobook' && !pages ? null : pages, language: cleanText(f.language)?.toLowerCase() ?? null, format: f.format,
      acquiredOn: cleanText(f.acquiredOn), purchasePriceCents: price, currency: price != null ? f.currency : null, description: f.description, notes: f.notes,
      isFavorite: f.isFavorite, coverUri: f.coverUri, coverThumbUri: f.thumbUri,
    };
  };

  const pickCover = () =>
    run(async () => {
      const uri = await pickCoverImage();
      if (!uri) return;
      const saved = await saveCover(uri);
      set({ coverUri: saved.coverUri, thumbUri: saved.thumbUri });
    });

  const save = async (allowDuplicate = false) => {
    const input = toInput();
    if (!input) return;
    setBusy(true);
    try {
      const r = repos();
      if (params.id) {
        const ok = await run(() => updateBook(r, params.id!, input).then(() => true));
        if (ok) router.back();
        return;
      }
      const res = await run(() => addBook(r, input, { allowDuplicate, status }));
      if (!res) return;
      if (res.status === 'duplicate') {
        const existing = await r.books.get(res.match.id);
        Alert.alert(t('book.duplicateTitle'), t(`book.duplicateBody.${res.match.reason}`, { title: existing?.title ?? '' }), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('book.openExisting'), onPress: () => router.replace(`/book/${res.match.id}`) },
          { text: t('book.addAnyway'), onPress: () => void save(true) },
        ]);
        return;
      }
      router.replace(`/book/${res.id}`);
    } catch (e) {
      if (e instanceof BookValidationError) setErrors({ title: t(`errors.book.${e.field}`) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page edges={['bottom']} footer={<Button label={params.id ? t('common.save') : t('library.addBook')} onPress={() => void save()} loading={busy} size="lg" testID="save-book" />}>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <Pressable onPress={pickCover} accessibilityRole="button" accessibilityLabel={t('book.chooseCover')} testID="pick-cover">
          <BookCover uri={f.thumbUri ?? f.coverUri} title={f.title || t('book.untitled')} author={f.author} width={90} />
        </Pressable>
        <View style={{ flex: 1, gap: 8 }}>
          <Serif size={20}>{params.id ? t('book.editTitle') : t('book.newTitle')}</Serif>
          <Button label={f.coverUri ? t('book.changeCover') : t('book.chooseCover')} icon="image" variant="secondary" onPress={pickCover} />
          {f.coverUri ? (
            <Pressable onPress={() => set({ coverUri: null, thumbUri: null })} accessibilityRole="button">
              <Text variant="caption" tone="danger" style={{ fontWeight: '600' }}>
                {t('book.removeCover')}
              </Text>
            </Pressable>
          ) : (
            <Text variant="caption" tone="subtle">
              {t('book.coverHint')}
            </Text>
          )}
        </View>
      </View>

      <Field label={t('book.title')} value={f.title} onChangeText={(v) => set({ title: v })} error={errors.title} autoFocus={!params.id} testID="field-title" />
      <Field label={t('book.author')} value={f.author} onChangeText={(v) => set({ author: v })} testID="field-author" />
      <ChipChoice label={t('book.format')} options={BOOK_FORMATS} value={f.format} onChange={(v) => set({ format: v })} render={(v) => t(`formats.${v}`)} />
      {f.format !== 'audiobook' ? <Field label={t('book.pages')} value={f.pages} onChangeText={(v) => set({ pages: v.replace(/\D/g, '') })} keyboardType="number-pad" error={errors.pages} hint={t('book.pagesHint')} testID="field-pages" /> : null}
      {!params.id ? (
        <View style={{ gap: 6 }}>
          <Text variant="label" tone="muted">
            {t('book.status')}
          </Text>
          <StatusPicker value={status} onChange={setStatus} />
        </View>
      ) : null}
      <View style={{ gap: 6 }}>
        <Field label={t('book.genre')} value={f.genre} onChangeText={(v) => set({ genre: v })} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {GENRE_SUGGESTIONS.slice(0, 10).map((g) => (
            <Chip key={g} label={t(`genres.${g}`)} selected={f.genre === t(`genres.${g}`)} onPress={() => set({ genre: t(`genres.${g}`) })} />
          ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>{t('book.favorite')}</Text>
        <Switch value={f.isFavorite} onValueChange={(v) => set({ isFavorite: v })} accessibilityLabel={t('book.favorite')} trackColor={{ true: theme.colors.primary }} />
      </View>

      <Pressable onPress={() => setMore(!more)} accessibilityRole="button" accessibilityState={{ expanded: more }} testID="more-details">
        <Text tone="primary" style={{ fontWeight: '700' }}>
          {more ? t('book.lessDetails') : t('book.moreDetails')}
        </Text>
      </Pressable>

      {more ? (
        <Paper tone="alt" style={{ gap: 14 }}>
          <Field label={t('book.subtitle')} value={f.subtitle} onChangeText={(v) => set({ subtitle: v })} />
          <Field label={t('book.originalTitle')} value={f.originalTitle} onChangeText={(v) => set({ originalTitle: v })} hint={t('book.originalTitleHint')} />
          <Field label={t('book.isbn')} value={f.isbn} onChangeText={(v) => set({ isbn: v })} keyboardType="numbers-and-punctuation" hint={t('book.isbnHint')} />
          <Field label={t('book.publisher')} value={f.publisher} onChangeText={(v) => set({ publisher: v })} />
          <Field label={t('book.year')} value={f.year} onChangeText={(v) => set({ year: v.replace(/\D/g, '').slice(0, 4) })} keyboardType="number-pad" error={errors.year} />
          <View style={{ gap: 6 }}>
            <Field label={t('book.language')} value={f.language} onChangeText={(v) => set({ language: v })} autoCapitalize="none" hint={bookLanguageName(f.language) ?? t('book.languageHint')} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {BOOK_LANGUAGES.map((l) => (
                <Chip key={l} label={bookLanguageName(l) ?? l} selected={f.language === l} onPress={() => set({ language: l })} />
              ))}
            </View>
          </View>
          <DateField label={t('book.acquiredOn')} value={f.acquiredOn} onChange={(v) => set({ acquiredOn: v })} today={today} />
          <Field label={t('book.price')} value={f.price} onChangeText={(v) => set({ price: v })} keyboardType="decimal-pad" error={errors.price} />
          <ChipChoice label={t('book.currency')} options={CURRENCIES} value={f.currency} onChange={(v) => set({ currency: v })} render={(v) => v} />
          <Field label={t('book.description')} value={f.description} onChangeText={(v) => set({ description: v })} multiline />
          <Field label={t('book.notes')} value={f.notes} onChangeText={(v) => set({ notes: v })} multiline hint={t('privacy.localOnly')} />
        </Paper>
      ) : null}
    </Page>
  );
}
