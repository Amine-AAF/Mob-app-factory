import { addDays } from '@factory/app-core';
import { Button, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, SectionList, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Empty, Paper } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { useAction, useData, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { deleteSession } from '@/services/readingService';
import { useIsPremium } from '@/store/session';

/** Session history grouped by month. Free shows the last 90 days; Premium shows everything (data is never deleted). */
export default function Sessions() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const run = useAction(t);
  const premium = useIsPremium();
  const { bookId } = useLocalSearchParams<{ bookId?: string }>();
  const from = premium ? undefined : addDays(today, -FREE_LIMITS.historyDays);
  const { data } = useData(async (r) => {
    const all = await r.reading.sessions({ from });
    const older = premium ? 0 : ((await r.db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM reading_sessions WHERE day < ?', [from!]))?.c ?? 0);
    return { sessions: bookId ? all.filter((s) => s.bookId === bookId) : all, older };
  }, [bookId, from, premium]);

  const groups = new Map<string, NonNullable<typeof data>['sessions']>();
  for (const s of data?.sessions ?? []) {
    const k = s.day.slice(0, 7);
    groups.set(k, [...(groups.get(k) ?? []), s]);
  }
  const sections = [...groups.entries()].map(([month, items]) => ({ title: month, total: items.reduce((a, s) => a + s.durationSec, 0), data: items }));

  return (
    <SectionList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 8 }}
      sections={sections}
      keyExtractor={(s) => s.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <Text variant="label" tone="accent">
            {fmt.month(section.title)}
          </Text>
          <Text variant="caption" tone="subtle">
            {fmt.duration(section.total)}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <Pressable
          onLongPress={() =>
            Alert.alert(t('session.deleteTitle'), t('common.cannotUndo'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.delete'), style: 'destructive', onPress: () => void run(() => deleteSession(repos(), item.id)) },
            ])
          }
          onPress={() => router.push(`/book/${item.bookId}`)}
          accessibilityRole="button"
          accessibilityHint={t('session.longPressDelete')}
        >
          <Paper>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '600', flex: 1 }} numberOfLines={1}>
                {item.bookTitle}
              </Text>
              <Text style={{ fontWeight: '700' }}>{fmt.duration(item.durationSec)}</Text>
            </View>
            <Text variant="caption" tone="subtle">
              {`${fmt.longDay(item.day)} · ${fmt.time(item.startedAt)}`}
              {item.startPage != null && item.endPage != null ? ` · ${t('session.pagesRange', { from: item.startPage, to: item.endPage })}` : ''}
              {item.source === 'manual' ? ` · ${t('session.manual')}` : ''}
            </Text>
            {item.notes ? (
              <Text variant="bodySmall" tone="muted">
                {item.notes}
              </Text>
            ) : null}
          </Paper>
        </Pressable>
      )}
      ListEmptyComponent={<Empty icon="timer-outline" title={t('session.none')} message={t('session.noneBody')} />}
      ListFooterComponent={
        data?.older ? (
          <Paper tone="primary" style={{ marginTop: 16 }}>
            <Text variant="bodySmall">{t('premium.olderHistory', { count: data.older })}</Text>
            <Button label={t('premium.discover')} variant="secondary" onPress={() => router.push({ pathname: '/paywall', params: { source: 'full_history' } })} />
          </Paper>
        ) : undefined
      }
    />
  );
}
