import { Chip, Icon, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, ScrollView, TextInput, View } from 'react-native';

import { AdBanner } from '@/components/books';
import { useBookTheme } from '@/components/theme';
import { BookCover, Empty, IconAction, Paper, Pill, Serif } from '@/components/ui';
import { repos, type WishlistSort } from '@/database';
import { useAction, useData, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { linkWishToBook, moveWishToLibrary, setWishStatus, wishlistBudget } from '@/services/contentService';
import { usePreferences } from '@/store/preferences';
import { WISHLIST_STATUSES, type WishlistItem, type WishlistStatus } from '@/types';

const SORTS: WishlistSort[] = ['priority', 'recent', 'price', 'title'];

export default function Wishlist() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const run = useAction(t);
  const today = useToday();
  const currency = usePreferences((s) => s.currency);
  const monthlyBudget = usePreferences((s) => s.monthlyBudgetCents);
  const [query, setQuery] = useState('');
  const search = useDeferredValue(query);
  const [status, setStatus] = useState<WishlistStatus | null>(null);
  const [sort, setSort] = useState<WishlistSort>('priority');
  const { data } = useData((r) => Promise.all([r.organize.wishlist({ status, search, sort }), r.organize.wishlist()]), [status, search, sort]);
  const [items, all] = data ?? [[], []];
  const budget = wishlistBudget(all, currency, today.slice(0, 7));

  const toLibrary = (w: WishlistItem) =>
    void run(async () => {
      const res = await moveWishToLibrary(repos(), w.id);
      if (res.status === 'duplicate') {
        Alert.alert(t('book.duplicateTitle'), t('wishlist.duplicateBody', { title: w.title }), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('wishlist.linkExisting'), onPress: () => void run(() => linkWishToBook(repos(), w.id, res.match.id)) },
          { text: t('book.addAnyway'), onPress: () => void run(() => moveWishToLibrary(repos(), w.id, { allowDuplicate: true })) },
        ]);
      }
    });

  const actions = (w: WishlistItem) =>
    Alert.alert(w.title, undefined, [
      { text: t('common.edit'), onPress: () => router.push({ pathname: '/wishlist/edit', params: { id: w.id } }) },
      ...(w.status === 'want_to_buy' || w.status === 'want_to_read' ? [{ text: t('wishlist.markPurchased'), onPress: () => void run(() => setWishStatus(repos(), w.id, 'purchased')) }] : []),
      ...(w.status !== 'added_to_library' ? [{ text: t('wishlist.addToLibrary'), onPress: () => toLibrary(w) }] : w.bookId ? [{ text: t('wishlist.openBook'), onPress: () => router.push(`/book/${w.bookId}`) }] : []),
      { text: t('common.cancel'), style: 'cancel' as const },
    ]);

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 10 }}
      data={items}
      keyExtractor={(w) => w.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 4 }}>
          <Paper tone="primary">
            <Text variant="label" tone="muted">
              {t('wishlist.budget')}
            </Text>
            <Serif size={24}>{fmt.money(budget.pendingCents, currency)}</Serif>
            <Text variant="caption" tone="subtle">
              {t('wishlist.budgetPending')}
              {budget.pendingWithoutPrice ? ` · ${t('wishlist.withoutPrice', { count: budget.pendingWithoutPrice })}` : ''}
              {budget.otherCurrencies ? ` · ${t('wishlist.otherCurrencies', { count: budget.otherCurrencies })}` : ''}
            </Text>
            <Text variant="bodySmall">
              {monthlyBudget != null
                ? t('wishlist.spentOf', { spent: fmt.money(budget.spentThisMonthCents, currency), budget: fmt.money(monthlyBudget, currency) })
                : t('wishlist.spentThisMonth', { spent: fmt.money(budget.spentThisMonthCents, currency) })}
            </Text>
          </Paper>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 12 }}>
            <Icon name="search" size={18} color={theme.colors.textSubtle} />
            <TextInput value={query} onChangeText={setQuery} placeholder={t('wishlist.search')} placeholderTextColor={theme.colors.textSubtle} accessibilityLabel={t('wishlist.search')} style={{ flex: 1, minHeight: 46, color: theme.colors.text }} />
            <IconAction icon="add-circle" tone="primary" label={t('wishlist.add')} onPress={() => router.push('/wishlist/edit')} testID="add-wish" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            <Chip label={t('library.all')} selected={!status} onPress={() => setStatus(null)} />
            {WISHLIST_STATUSES.map((s) => (
              <Chip key={s} label={t(`wishlist.statuses.${s}`)} selected={status === s} onPress={() => setStatus(status === s ? null : s)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {SORTS.map((s) => (
              <Chip key={s} label={t(`wishlist.sort.${s}`)} icon="swap-vertical" selected={sort === s} onPress={() => setSort(s)} />
            ))}
          </ScrollView>
          <AdBanner screen="wishlist" />
        </View>
      }
      renderItem={({ item: w }) => (
        <Paper onPress={() => actions(w)} accessibilityLabel={w.title}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <BookCover uri={w.coverUri} title={w.title} width={52} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontWeight: '700', fontFamily: theme.serif }} numberOfLines={2}>
                {w.title}
              </Text>
              {w.author ? (
                <Text variant="caption" tone="muted">
                  {w.author}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <Pill label={t(`wishlist.statuses.${w.status}`)} tone={w.status === 'added_to_library' ? 'success' : w.status === 'purchased' ? 'accent' : 'neutral'} />
                <Pill label={t(`wishlist.priorities.${w.priority}`)} icon="flag" tone={w.priority === 1 ? 'danger' : w.priority === 2 ? 'warning' : 'neutral'} />
              </View>
              <Text variant="caption" tone="subtle">
                {[w.estimatedPriceCents != null ? fmt.money(w.estimatedPriceCents, w.currency ?? currency) : null, w.store].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>
        </Paper>
      )}
      ListEmptyComponent={<Empty icon="gift-outline" title={t('wishlist.emptyTitle')} message={t('wishlist.emptyBody')} />}
    />
  );
}
