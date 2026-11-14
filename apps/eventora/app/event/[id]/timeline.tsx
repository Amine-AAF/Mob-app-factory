import { Button, Card, EmptyState, Icon, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { Notice, ScreenTitle } from '@/components/ui';
import { durationMin, findGaps, findOverlaps, moveItem, shiftAll, sortTimeline, spanLabel } from '@/domain/timeline';
import type { TimelineItem } from '@/domain/types';
import { exportReport } from '@/features/exporter';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { shareText } from '@/services/sharing';
import { useIsPremium } from '@/store/session';

/** Chronological programme with overlap detection, reordering and sharing. */
export default function Timeline() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  if (!snap) return null;
  const items = sortTimeline(snap.timeline);
  const overlaps = findOverlaps(items);
  const overlapIds = new Set(overlaps.flatMap((o) => [o.a, o.b]));
  const gaps = findGaps(items, 45);
  const byId = new Map(items.map((x) => [x.id, x]));

  const move = (item: TimelineItem, dir: -1 | 1) => void mutate((r) => r.timeline.saveAll(moveItem(items, item.id, dir)));
  const shift = () =>
    Alert.alert(t('timeline.shiftTitle'), t('timeline.shiftBody'), [
      ...[-30, -15, 15, 30, 60].map((d) => ({ text: `${d > 0 ? '+' : ''}${d} min`, onPress: () => void mutate((r) => r.timeline.saveAll(shiftAll(items, d))) })),
      { text: t('common.cancel'), style: 'cancel' as const },
    ]);

  const shareProgramme = () => {
    const lines = items.map((x) => {
      const s = spanLabel(x);
      return `${fmt.time(x.startMin)}–${fmt.time(x.endMin)}${s.startNextDay ? ` (${t('timeline.nextDay')})` : ''}  ${x.title}${x.location ? ` · ${x.location}` : ''}`;
    });
    void shareText([snap.event.name, fmt.day(snap.event.startDate, 'full'), '', ...lines].join('\n'), snap.event.name);
  };

  return (
    <Screen
      edges={[]}
      footer={<Button label={t('timeline.add')} icon="add" onPress={() => router.push({ pathname: '/event/[id]/activity', params: { id } })} testID="activity-add" />}
    >
      <ScreenTitle
        title={t('modules.timeline')}
        right={
          items.length ? (
            <>
              <IconButton icon="time-outline" label={t('timeline.shiftTitle')} onPress={shift} />
              <IconButton
                icon="share-outline"
                label={t('reports.export')}
                onPress={() =>
                  Alert.alert(t('reports.export'), undefined, [
                    { text: t('timeline.shareText'), onPress: shareProgramme },
                    { text: 'PDF', onPress: () => void exportReport({ t, snap, kind: 'timeline', format: 'pdf', isPremium }) },
                    { text: 'CSV', onPress: () => void exportReport({ t, snap, kind: 'timeline', format: 'csv', isPremium }) },
                    { text: t('common.cancel'), style: 'cancel' },
                  ])
                }
              />
            </>
          ) : undefined
        }
      />
      <Text variant="caption" tone="subtle">
        {t('timeline.zoneNote', { zone: snap.event.timezone.replace(/_/g, ' ') })}
      </Text>
      {overlaps.length ? (
        <Notice tone="warning" icon="warning" title={t('timeline.overlapsFound', { count: overlaps.length })}>
          {overlaps
            .slice(0, 3)
            .map((o) => t('timeline.overlapLine', { a: byId.get(o.a)?.title ?? '', b: byId.get(o.b)?.title ?? '', minutes: o.minutes }))
            .join('\n')}
        </Notice>
      ) : null}
      {items.length === 0 ? (
        <EmptyState icon="time-outline" title={t('timeline.emptyTitle')} message={t('timeline.emptyBody')} />
      ) : (
        <Stack gap={0}>
          {items.map((x, i) => {
            const s = spanLabel(x);
            const warn = overlapIds.has(x.id);
            const gap = gaps.find((g) => g.toMin === x.startMin);
            return (
              <View key={x.id}>
                {gap ? (
                  <Text variant="caption" tone="subtle" style={{ marginLeft: 64, marginVertical: 4 }}>
                    {t('timeline.freeTime', { minutes: gap.toMin - gap.fromMin })}
                  </Text>
                ) : null}
                <Row gap={3} style={{ alignItems: 'stretch' }}>
                  <View style={{ width: 52, alignItems: 'flex-end', paddingTop: 14 }}>
                    <Text variant="subheading">{fmt.time(x.startMin)}</Text>
                    {s.startNextDay ? (
                      <Text variant="caption" tone="accent">
                        +1
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ width: 2, backgroundColor: warn ? theme.colors.warning : theme.colors.primary, opacity: 0.5 }} />
                  <Pressable style={{ flex: 1, paddingVertical: 6 }} onPress={() => router.push({ pathname: '/event/[id]/activity', params: { id, itemId: x.id } })} accessibilityRole="button" accessibilityLabel={`${x.title}, ${fmt.time(x.startMin)} – ${fmt.time(x.endMin)}`}>
                    <Card style={{ borderColor: warn ? theme.colors.warning : theme.colors.border }}>
                      <Row style={{ justifyContent: 'space-between' }}>
                        <Text variant="subheading" style={{ flex: 1 }}>
                          {x.title}
                        </Text>
                        {warn ? <Icon name="warning" size={16} color={theme.colors.warning} /> : null}
                      </Row>
                      <Text variant="caption" tone="muted">
                        {`${fmt.time(x.startMin)} – ${fmt.time(x.endMin)}${s.endNextDay && !s.startNextDay ? ` (${t('timeline.nextDay')})` : ''} · ${t('timeline.minutes', { count: durationMin(x) })}`}
                      </Text>
                      {x.location || x.owner ? (
                        <Text variant="caption" tone="subtle">
                          {[x.location, x.owner].filter(Boolean).join(' · ')}
                        </Text>
                      ) : null}
                    </Card>
                  </Pressable>
                  <Stack gap={0} style={{ justifyContent: 'center' }}>
                    <IconButton icon="chevron-up" size={18} label={t('timeline.moveUp')} onPress={() => i > 0 && move(x, -1)} />
                    <IconButton icon="chevron-down" size={18} label={t('timeline.moveDown')} onPress={() => i < items.length - 1 && move(x, 1)} />
                  </Stack>
                </Row>
              </View>
            );
          })}
        </Stack>
      )}
    </Screen>
  );
}
