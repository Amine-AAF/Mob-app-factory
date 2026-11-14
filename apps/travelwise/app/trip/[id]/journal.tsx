import { Button, Card, EmptyState, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView } from 'react-native';

import { TripScaffold } from '@/components/TripScaffold';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import type { JournalEntry } from '@/types/models';
import { dayNumber } from '@/utils/dates';

/** Chronological travel journal. Text and photos stay on this phone. */
export default function TripJournalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: entries } = useAsync(() => repos().journal.list(id), [id]);
  const open = (entryId?: string) => router.push({ pathname: '/trip/[id]/journal-entry', params: entryId ? { id, entryId } : { id } });

  const groups: { date: string; items: JournalEntry[] }[] = [];
  for (const e of entries ?? []) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else groups.push({ date: e.date, items: [e] });
  }

  return (
    <TripScaffold tripId={id} section="journal">
      {({ trip }) => (
        <Stack gap={3}>
          <Row gap={2} style={{ alignItems: 'flex-start' }}>
            <Icon name="lock-closed-outline" size={16} color={theme.colors.textMuted} />
            <Text variant="caption" tone="muted" style={{ flex: 1 }}>
              {t('journal.privacy')}
            </Text>
          </Row>
          <Button label={t('journal.add')} icon="add" onPress={() => open()} testID="journal-add" />
          {entries && entries.length === 0 ? <EmptyState icon="book-outline" title={t('journal.emptyTitle')} message={t('journal.emptyMessage')} /> : null}
          {groups.map((g) => {
            const n = dayNumber(trip.startDate, trip.endDate, g.date);
            return (
              <Stack key={g.date} gap={2}>
                <Text variant="label">{[n ? t('itinerary.dayNumber', { number: n }) : null, fmt.date(g.date, { weekday: 'long', day: 'numeric', month: 'long' })].filter(Boolean).join(' · ')}</Text>
                {g.items.map((e) => (
                  <Card key={e.id} onPress={() => open(e.id)} accessibilityLabel={e.title || fmt.date(e.date)} testID={`journal-${e.id}`}>
                    {e.title ? <Text variant="subheading">{e.title}</Text> : null}
                    {e.city ? (
                      <Text variant="caption" tone="muted">
                        {e.city}
                      </Text>
                    ) : null}
                    {e.body ? (
                      <Text variant="bodySmall" numberOfLines={4}>
                        {e.body}
                      </Text>
                    ) : null}
                    {e.photoUris.length ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {e.photoUris.map((u) => (
                          <Image key={u} source={{ uri: u }} style={{ width: 88, height: 88, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }} accessibilityIgnoresInvertColors />
                        ))}
                      </ScrollView>
                    ) : null}
                  </Card>
                ))}
              </Stack>
            );
          })}
        </Stack>
      )}
    </TripScaffold>
  );
}
