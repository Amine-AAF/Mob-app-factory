import { Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { BookCover, Empty, Paper, Serif, StarRating } from '@/components/ui';
import { useData } from '@/hooks';

/** Personal ranking from private ratings — "my favourites", not public reviews. */
export default function Ranking() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const { data } = useData((r) => r.content.ranking(100), []);
  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
      data={data ?? []}
      keyExtractor={(x) => x.bookId}
      ListHeaderComponent={
        <Text variant="caption" tone="subtle">
          {t('review.rankingHint')}
        </Text>
      }
      renderItem={({ item, index }) => (
        <Paper onPress={() => router.push(`/book/${item.bookId}`)} accessibilityLabel={`${index + 1}. ${item.title}`}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Serif size={22} style={{ width: 34, color: index < 3 ? theme.colors.accent : theme.colors.textSubtle }}>
              {index + 1}
            </Serif>
            <BookCover uri={item.coverThumbUri} title={item.title} width={44} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontWeight: '700' }} numberOfLines={1}>
                {item.title}
              </Text>
              {item.authorName ? (
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {item.authorName}
                </Text>
              ) : null}
              <StarRating value={item.rating} size={13} />
            </View>
            {item.recommend ? (
              <Text variant="caption" tone="subtle">
                {t(`review.recommendOptions.${item.recommend}`)}
              </Text>
            ) : null}
          </View>
        </Paper>
      )}
      ListEmptyComponent={<Empty icon="star-outline" title={t('review.rankingEmpty')} message={t('review.rankingEmptyBody')} />}
    />
  );
}
