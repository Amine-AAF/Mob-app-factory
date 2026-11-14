import { Button, Card, EmptyState, Icon, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, TextInput, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { CopyButton } from '@/components/fields';
import { getTool, LIMITS, TOOLS } from '@/constants/tools';
import { repos } from '@/database';
import { describeEntry, reusableValue } from '@/features/history/describe';
import { useAsync } from '@/hooks/useAsync';
import { useFormat } from '@/hooks/useFormat';
import { recordError } from '@/services/analytics';
import { useIsPremium, useSession } from '@/store/session';
import type { HistoryEntry } from '@/types';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const f = useFormat();
  const isPremium = useIsPremium();
  const [query, setQuery] = useState('');

  // Tools whose localized name matches the query are included in the search.
  const toolIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? TOOLS.filter((tool) => t(`tools.${tool.id}.name`).toLowerCase().includes(q)).map((tool) => tool.id) : [];
  }, [query, t]);
  // Numbers are stored canonically ("1234.5"): search with the canonical form too.
  const canonicalQuery = useMemo(() => {
    const parsed = f.parse(query);
    return parsed ? parsed.toString() : query;
  }, [query, f]);

  const { data, reload } = useAsync(async () => ({ entries: await repos().history.list({ query: canonicalQuery, toolIds, limit: 300 }), total: await repos().history.count() }), [canonicalQuery, toolIds.join(',')]);
  const entries = data?.entries ?? [];

  const remove = async (entry: HistoryEntry) => {
    try {
      await repos().history.remove(entry.id);
      useSession.getState().bump();
      reload();
    } catch (e) {
      recordError(e, 'history_remove');
    }
  };

  const clearAll = () =>
    Alert.alert(t('history.clearTitle'), t('history.clearMessage', { count: data?.total ?? 0 }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('history.clearConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await repos().history.clear();
            useSession.getState().bump();
          } catch (e) {
            recordError(e, 'history_clear');
          }
        },
      },
    ]);

  return (
    <Screen testID="history-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('tabs.history')}
        </Text>
        {data?.total ? <Button label={t('history.clearAll')} variant="danger" size="md" icon="trash-outline" onPress={clearAll} testID="history-clear" /> : null}
      </Row>

      <Row gap={2} style={{ minHeight: 48, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: 12 }}>
        <Icon name="search" size={18} color={theme.colors.textSubtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('history.search')}
          placeholderTextColor={theme.colors.textSubtle}
          accessibilityLabel={t('history.search')}
          style={{ flex: 1, color: theme.colors.text, fontSize: 16, paddingVertical: 10 }}
          testID="history-search"
          autoCorrect={false}
        />
        {query ? <IconButton icon="close-circle" label={t('common.clear')} onPress={() => setQuery('')} size={18} /> : null}
      </Row>

      {!isPremium ? (
        <Text variant="caption" tone="subtle">
          {t('history.freeLimit', { count: LIMITS.freeHistory })}
        </Text>
      ) : null}

      {entries.length === 0 ? (
        query ? (
          <EmptyState icon="search-outline" title={t('history.noResults')} />
        ) : (
          <EmptyState icon="time-outline" title={t('history.emptyTitle')} message={t('history.emptyMessage')} action={<Button label={t('home.openCalculator')} size="md" onPress={() => router.navigate('/(tabs)/calculator')} />} />
        )
      ) : (
        <Stack gap={3}>
          {entries.map((entry) => {
            const d = describeEntry(entry, t, f);
            const reusable = reusableValue(entry);
            return (
              <Card key={entry.id} testID={`history-${entry.id}`}>
                <Row gap={2} style={{ alignItems: 'flex-start' }}>
                  <Icon name={getTool(entry.tool)?.icon ?? 'calculator-outline'} size={18} color={theme.colors.primary} />
                  <Stack gap={1} style={{ flex: 1 }}>
                    <Text variant="caption" tone="subtle">
                      {`${d.title} · ${f.date(entry.createdAt)}`}
                    </Text>
                    {d.detail ? (
                      <Text variant="bodySmall" tone="muted">
                        {d.detail}
                      </Text>
                    ) : null}
                    <Text variant={entry.payload ? 'bodySmall' : 'heading'} style={{ fontWeight: '700', fontVariant: ['tabular-nums'] }}>
                      {entry.payload ? d.result : `= ${d.result}`}
                    </Text>
                  </Stack>
                </Row>
                <Row gap={1} style={{ justifyContent: 'flex-end' }}>
                  <CopyButton text={d.copyText} />
                  {reusable ? <IconButton icon="arrow-undo-outline" label={t('history.useInCalculator')} onPress={() => router.navigate({ pathname: '/(tabs)/calculator', params: { load: reusable } })} /> : null}
                  <IconButton icon="trash-outline" tone="danger" label={t('history.delete')} onPress={() => remove(entry)} />
                </Row>
              </Card>
            );
          })}
        </Stack>
      )}
      <View style={{ height: 4 }} />
      <AdBanner />
    </Screen>
  );
}
