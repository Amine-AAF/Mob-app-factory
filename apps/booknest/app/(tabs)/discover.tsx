import { Button, Icon, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AdBanner } from '@/components/books';
import { useBookTheme } from '@/components/theme';
import { BookCover, Empty, Page, Paper, Section, Serif } from '@/components/ui';
import { CHALLENGES } from '@/config/presets';
import { discover, randomWantToRead, type Suggestion } from '@/features/discover/recommend';
import { useData, useToday } from '@/hooks';

/**
 * Discover = transparent rules over the user's own library (no AI, no network).
 * Every card says why it is suggested.
 */
/** Horizontal shelf of suggested books, each with the reason it was suggested. */
function Row({ items }: { items: Suggestion[] }) {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const reason = (s: Suggestion) => t(`discover.reasons.${s.reason}`, { about: s.about ?? '', days: s.score });
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
      {items.map((s) => (
        <Pressable key={s.bookId} onPress={() => router.push(`/book/${s.bookId}`)} accessibilityRole="button" accessibilityLabel={`${s.title}. ${reason(s)}`} style={{ width: 110, gap: 6 }}>
          <BookCover uri={s.coverThumbUri} title={s.title} author={s.authorName} width={110} />
          <Text variant="bodySmall" numberOfLines={2} style={{ fontWeight: '600', fontFamily: theme.serif }}>
            {s.title}
          </Text>
          <Text variant="caption" tone="accent" numberOfLines={2}>
            {reason(s)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function Discover() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const { data } = useData(
    async (r) => {
      const [books, wishlist, last] = await Promise.all([r.books.list(), r.organize.wishlist(), r.reading.lastSessionByBook()]);
      const lastActivity = new Map([...last].map(([k, v]) => [k, v.slice(0, 10)]));
      return { books, result: discover({ books, wishlist, lastActivity, today }) };
    },
    [today],
  );

  const surprise = () => {
    const b = data ? randomWantToRead(data.books) : null;
    if (b) router.push(`/book/${b.id}`);
  };

  const r = data?.result;
  const nothing = r && !r.forYou.length && !r.unfinished.length && !r.forgottenWishlist.length && !r.randomPick;

  return (
    <Page testID="discover">
      <Serif size={30}>{t('discover.title')}</Serif>
      <Text tone="muted">{t('discover.intro')}</Text>

      {r?.randomPick ? (
        <Paper tone="primary" onPress={() => router.push(`/book/${r.randomPick!.bookId}`)} accessibilityLabel={t('discover.pickOfDay')}>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <BookCover uri={r.randomPick.coverThumbUri} title={r.randomPick.title} author={r.randomPick.authorName} width={80} />
            <View style={{ flex: 1, gap: 6, justifyContent: 'center' }}>
              <Text variant="label" tone="accent">
                {t('discover.pickOfDay')}
              </Text>
              <Serif size={19} numberOfLines={2}>
                {r.randomPick.title}
              </Serif>
              <Text variant="caption" tone="muted">
                {t('discover.pickOfDayHint')}
              </Text>
            </View>
          </View>
          <Button label={t('discover.surprise')} icon="shuffle" variant="secondary" onPress={surprise} testID="surprise" />
        </Paper>
      ) : null}

      {r?.forYou.length ? (
        <Section title={t('discover.forYou')}>
          {r.topGenres.length ? (
            <Text variant="caption" tone="subtle">
              {t('discover.basedOnGenres', { genres: r.topGenres.join(', ') })}
            </Text>
          ) : null}
          <Row items={r.forYou} />
        </Section>
      ) : null}

      {r?.unfinished.length ? (
        <Section title={t('discover.unfinished')}>
          <Row items={r.unfinished} />
        </Section>
      ) : null}

      <AdBanner screen="discover" />

      {r?.forgottenWishlist.length ? (
        <Section title={t('discover.forgotten')} action={t('common.seeAll')} onAction={() => router.push('/wishlist')}>
          {r.forgottenWishlist.slice(0, 4).map(({ item, ageDays }) => (
            <Paper key={item.id} onPress={() => router.push('/wishlist')} accessibilityLabel={item.title}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <BookCover uri={item.coverUri} title={item.title} width={44} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600' }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {t('discover.waitingSince', { count: ageDays })}
                  </Text>
                </View>
              </View>
            </Paper>
          ))}
        </Section>
      ) : null}

      <Section title={t('challenges.title')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/goals')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {CHALLENGES.map((c) => (
            <Paper key={c.id} tone="alt" style={{ width: 170 }} onPress={() => router.push('/(tabs)/goals')} accessibilityLabel={t(`challenges.${c.id}.title`)}>
              <Icon name={c.icon} size={24} color={theme.colors.accent} />
              <Text style={{ fontWeight: '700' }}>{t(`challenges.${c.id}.title`)}</Text>
              <Text variant="caption" tone="muted" numberOfLines={3}>
                {t(`challenges.${c.id}.body`)}
              </Text>
            </Paper>
          ))}
        </ScrollView>
      </Section>

      {nothing ? <Empty icon="compass-outline" title={t('discover.emptyTitle')} message={t('discover.emptyBody')} action={<Button label={t('library.addBook')} onPress={() => router.push('/book/edit')} />} /> : null}

      <Text variant="caption" tone="subtle" center>
        {t('discover.howItWorks')}
      </Text>
    </Page>
  );
}
