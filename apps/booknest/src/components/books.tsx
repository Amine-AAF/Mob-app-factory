import { Icon, Text } from '@factory/design-system';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { progressRatio } from '@/features/tracking/progress';
import { fmt } from '@/i18n';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange, type AdScreen } from '@/services/ads';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { READING_STATUSES, type BookListItem, type ReadingStatus } from '@/types';

import { useBookTheme } from './theme';
import { BookCover, Pill, ProgressLine, StarRating } from './ui';

export const STATUS_ICONS: Record<ReadingStatus, 'bookmark-outline' | 'book' | 'checkmark-circle' | 'pause-circle' | 'close-circle'> = {
  want_to_read: 'bookmark-outline',
  reading: 'book',
  completed: 'checkmark-circle',
  on_hold: 'pause-circle',
  abandoned: 'close-circle',
};

export const STATUS_TONES: Record<ReadingStatus, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'> = {
  want_to_read: 'neutral',
  reading: 'primary',
  completed: 'success',
  on_hold: 'warning',
  abandoned: 'danger',
};

export function StatusPill({ status }: { status: ReadingStatus }) {
  const { t } = useTranslation();
  return <Pill label={t(`status.${status}`)} icon={STATUS_ICONS[status]} tone={STATUS_TONES[status]} />;
}

export function itemProgress(b: BookListItem): number | null {
  if (b.format === 'audiobook') return b.audioProgress;
  if (b.status === 'completed') return 1;
  return progressRatio(b.currentPage, b.pageCount);
}

/** Grid tile: the cover is the hero. Memoized for smooth scrolling in large libraries. */
export const BookTile = memo(function BookTile({ book, width, onPress }: { book: BookListItem; width: number; onPress: (id: string) => void }) {
  const t = useBookTheme();
  const { t: tr } = useTranslation();
  const progress = itemProgress(book);
  return (
    <Pressable
      onPress={() => onPress(book.id)}
      accessibilityRole="button"
      accessibilityLabel={tr('library.bookA11y', { title: book.title, author: book.authorName ?? tr('book.unknownAuthor'), status: tr(`status.${book.status}`) })}
      style={({ pressed }) => ({ width, gap: 6, opacity: pressed ? 0.8 : 1 })}
      testID={`book-${book.id}`}
    >
      <View>
        <BookCover uri={book.coverThumbUri} title={book.title} author={book.authorName} width={width} />
        {book.isFavorite ? (
          <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: 4 }}>
            <Icon name="heart" size={12} color="#F2D6A0" />
          </View>
        ) : null}
        {book.format === 'audiobook' ? (
          <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: 4 }}>
            <Icon name="headset" size={12} color="#F2D6A0" />
          </View>
        ) : null}
      </View>
      {book.status === 'reading' ? <ProgressLine ratio={progress} height={4} /> : null}
      <Text variant="bodySmall" numberOfLines={2} style={{ fontWeight: '600', fontFamily: t.serif }}>
        {book.title}
      </Text>
      {book.authorName ? (
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {book.authorName}
        </Text>
      ) : null}
    </Pressable>
  );
});

export const BOOK_ROW_HEIGHT = 104;

export const BookRow = memo(function BookRow({ book, onPress }: { book: BookListItem; onPress: (id: string) => void }) {
  const t = useBookTheme();
  const { t: tr } = useTranslation();
  const progress = itemProgress(book);
  return (
    <Pressable
      onPress={() => onPress(book.id)}
      accessibilityRole="button"
      accessibilityLabel={tr('library.bookA11y', { title: book.title, author: book.authorName ?? tr('book.unknownAuthor'), status: tr(`status.${book.status}`) })}
      style={({ pressed }) => ({ height: BOOK_ROW_HEIGHT, flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 8, opacity: pressed ? 0.8 : 1 })}
      testID={`book-${book.id}`}
    >
      <BookCover uri={book.coverThumbUri} title={book.title} width={56} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text numberOfLines={1} style={{ fontWeight: '700', fontFamily: t.serif }}>
          {book.title}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {[book.authorName, book.genreName].filter(Boolean).join(' · ') || tr('book.unknownAuthor')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StatusPill status={book.status} />
          {book.rating ? <StarRating value={book.rating} size={12} /> : null}
        </View>
        {book.status === 'reading' && progress != null ? <ProgressLine ratio={progress} height={3} /> : null}
      </View>
      {book.status === 'reading' && progress != null ? (
        <Text variant="caption" tone="primary" style={{ fontWeight: '700' }}>
          {fmt.percent(progress)}
        </Text>
      ) : null}
    </Pressable>
  );
});

export function StatusPicker({ value, onChange }: { value: ReadingStatus; onChange: (s: ReadingStatus) => void }) {
  const t = useBookTheme();
  const { t: tr } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityRole="radiogroup">
      {READING_STATUSES.map((s) => {
        const active = s === value;
        return (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            testID={`status-${s}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: active ? t.colors.primary : t.colors.border, backgroundColor: active ? t.colors.primarySoft : t.colors.surface }}
          >
            <Icon name={STATUS_ICONS[s]} size={16} color={active ? t.colors.primary : t.colors.textMuted} />
            <Text variant="bodySmall" style={{ fontWeight: active ? '700' : '500', color: active ? t.colors.primary : t.colors.text }}>
              {tr(`status.${s}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Banner ad slot for browsing screens only (see services/ads.ts). Renders nothing
 * for Premium users, before consent, during the grace sessions, or without the SDK.
 */
export function AdBanner({ screen }: { screen: AdScreen }) {
  const premium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  useEffect(() => onAdsStateChange(() => force((x) => x + 1)), []);
  if (!bannerAllowed({ isPremium: premium, sessionCount, screen })) return null;
  const sdk = adsSdk();
  if (!sdk || !adUnits.banner) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: false }} />
    </View>
  );
}
