import { Button, Chip, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { DateField } from '@/components/forms';
import { Field, Page, Paper, Serif, StarRating } from '@/components/ui';
import { repos } from '@/database';
import { useAction, useToday } from '@/hooks';
import { saveReview } from '@/services/contentService';
import { useSession } from '@/store/session';
import type { Recommendation } from '@/types';

/** Private review: never presented as a public review, never shared automatically. */
export default function ReviewScreen() {
  const { t } = useTranslation();
  const today = useToday();
  const run = useAction(t);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [body, setBody] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [readOn, setReadOn] = useState('');
  const [recommend, setRecommend] = useState<Recommendation | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    const r = repos();
    Promise.all([r.books.get(id), r.content.review(id), r.reading.current(id)]).then(([b, rv, rec]) => {
      setTitle(b?.title ?? '');
      setGenre(b?.genreName ?? null);
      if (rv) {
        setExists(true);
        setRating(rv.rating);
        setBody(rv.body ?? '');
        setPros(rv.pros ?? '');
        setCons(rv.cons ?? '');
        setReadOn(rv.readOn ?? '');
        setRecommend(rv.recommend);
      } else setReadOn(rec?.finishedOn ?? '');
    });
  }, [id]);

  const save = () => run(() => saveReview(repos(), id, { rating, body, pros, cons, readOn: readOn || null, recommend }).then(() => router.back()));

  return (
    <Page edges={['bottom']} footer={<Button label={t('common.save')} onPress={() => void save()} size="lg" testID="save-review" />}>
      <View style={{ gap: 4 }}>
        <Serif size={22}>{title}</Serif>
        {genre ? (
          <Text variant="caption" tone="subtle">
            {genre}
          </Text>
        ) : null}
      </View>
      <Paper tone="alt">
        <Text variant="caption" tone="muted">
          {t('review.privateHint')}
        </Text>
      </Paper>
      <View style={{ gap: 6 }}>
        <Text variant="label" tone="muted">
          {t('review.rating')}
        </Text>
        <StarRating value={rating} onChange={setRating} size={34} testID="rating" />
      </View>
      <Field label={t('review.body')} value={body} onChangeText={setBody} multiline />
      <Field label={t('review.pros')} value={pros} onChangeText={setPros} multiline />
      <Field label={t('review.cons')} value={cons} onChangeText={setCons} multiline />
      <DateField label={t('review.readOn')} value={readOn} onChange={setReadOn} today={today} />
      <View style={{ gap: 6 }}>
        <Text variant="label" tone="muted">
          {t('review.recommend')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['yes', 'maybe', 'no'] as const).map((v) => (
            <Chip key={v} label={t(`review.recommendOptions.${v}`)} selected={recommend === v} onPress={() => setRecommend(recommend === v ? null : v)} />
          ))}
        </View>
      </View>
      {exists ? (
        <Button
          label={t('review.delete')}
          variant="danger"
          onPress={() =>
            Alert.alert(t('review.delete'), t('common.cannotUndo'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.delete'), style: 'destructive', onPress: () => void run(() => repos().content.deleteReview(id).then(() => (useSession.getState().bump(), router.back()))) },
            ])
          }
        />
      ) : null}
    </Page>
  );
}
