import { EmptyState, Icon, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Fab, Pill, Segmented } from '@/components/ui';
import { repos } from '@/database';
import { countdown, readiness, sortAgenda } from '@/features/agenda/agenda';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

export default function AgendaList() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { subjectId } = useLocalSearchParams<{ subjectId?: string }>();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const today = clock.today();
  const { data } = useAsync(async () => ({ items: await repos().agenda.list({ subjectId: subjectId || undefined }), subjects: await repos().subjects.list('all') }), [subjectId]);
  const subjectById = new Map((data?.subjects ?? []).map((s) => [s.id, s]));
  const items = sortAgenda(data?.items ?? [], today).filter((i) => (tab === 'upcoming' ? !i.done && i.day >= today : i.done || i.day < today));

  return (
    <View style={{ flex: 1 }}>
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('agenda.title') }} />
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: t('agenda.upcoming') },
            { value: 'past', label: t('agenda.past') },
          ]}
        />
        {data && items.length === 0 ? <EmptyState icon="alarm-outline" title={tab === 'upcoming' ? t('agenda.noneUpcoming') : t('agenda.nonePast')} message={tab === 'upcoming' ? t('agenda.emptyBody') : undefined} /> : null}
        <Stack gap={2}>
          {items.map((i) => {
            const c = countdown(i.day, i.minute, clock.now());
            const s = i.subjectId ? subjectById.get(i.subjectId) : undefined;
            const ready = readiness(i);
            const urgent = c.state === 'today' || c.state === 'tomorrow';
            return (
              <Pressable
                key={i.id}
                onPress={() => router.push({ pathname: '/agenda/[id]', params: { id: i.id, table: i.table } })}
                accessibilityRole="button"
                accessibilityLabel={`${t(`agenda.kinds.${i.kind}`)} ${i.title}, ${fmt.dayLong(i.day)}`}
                style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: urgent && !i.done ? theme.colors.danger : theme.colors.border, padding: 14, gap: 8 }}
              >
                <Row gap={3}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="caption" tone="subtle">
                      {t(`agenda.kinds.${i.kind}`)} · {t(`agenda.priority.${i.priority}`)}
                    </Text>
                    <Text variant="subheading" style={{ textDecorationLine: i.done ? 'line-through' : 'none' }}>
                      {i.title}
                    </Text>
                    <Text variant="caption" tone="subtle">
                      {fmt.dayLong(i.day)}
                      {i.minute != null ? ` · ${fmt.time(i.minute)}` : ''}
                    </Text>
                  </View>
                  {i.done ? (
                    <Icon name="checkmark-circle" size={26} color={theme.colors.success} />
                  ) : c.state !== 'past' ? (
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="title" tone={urgent ? 'danger' : 'primary'}>
                        {c.state === 'today' ? t('agenda.todayShort') : fmt.number(c.days)}
                      </Text>
                      {c.state !== 'today' ? (
                        <Text variant="caption" tone="subtle">
                          {t('agenda.days', { count: c.days })}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </Row>
                <Row gap={2} wrap>
                  {s ? <Pill label={s.name} color={s.color} /> : null}
                </Row>
                {ready != null ? <ProgressBar progress={ready} height={5} tone="success" label={t('agenda.readiness')} /> : null}
              </Pressable>
            );
          })}
        </Stack>
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('agenda.new')} onPress={() => router.push({ pathname: '/agenda/edit', params: { subjectId: subjectId ?? '' } })} testID="new-agenda" />
    </View>
  );
}
