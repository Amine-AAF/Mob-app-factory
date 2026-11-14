import { EmptyState, ListRow, Screen, SectionHeader, Stack as UIStack, Text } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PremiumGate } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { useData, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';
import { groupBy } from '@/utils';

/** Workout history by month. Free: last FREE_LIMITS.historyDays days (older data is kept, not deleted). */
export default function History() {
  const { t } = useTranslation();
  const premium = useIsPremium();
  const f = useFormat();
  const { data } = useData(
    async (r) => {
      const since = premium ? undefined : addDays(clock.today(), -FREE_LIMITS.historyDays);
      const [sessions, all] = await Promise.all([r.sessions.completedWithExercises({ since }), premium ? Promise.resolve(null) : r.sessions.completed()]);
      return { sessions, hidden: all ? all.length - sessions.length : 0 };
    },
    [premium],
  );
  if (!data) return null;
  const months = groupBy(data.sessions, (s) => s.day.slice(0, 7));
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('history.title') }} />
      {data.sessions.length === 0 ? <EmptyState icon="time-outline" title={t('home.noHistoryTitle')} message={t('home.noHistoryBody')} /> : null}
      {[...months.entries()].map(([month, list]) => (
        <UIStack key={month} gap={1}>
          <SectionHeader title={fmt.month(fromDayKey(`${month}-01`))} />
          <Text variant="caption" tone="subtle">
            {t('history.monthSummary', { count: list.length })}
          </Text>
          {list.map((s) => (
            <ListRow
              key={s.id}
              icon="barbell-outline"
              title={s.name}
              subtitle={`${fmt.shortDay(fromDayKey(s.day))} · ${f.duration(s.durationSec)} · ${t('home.setCount', { count: s.exercises.reduce((a, e) => a + e.sets.length, 0) })}`}
              onPress={() => router.push({ pathname: '/session/[id]', params: { id: s.id } })}
            />
          ))}
        </UIStack>
      ))}
      {data.hidden > 0 ? <PremiumGate title={t('premium.fullHistoryTitle')} message={t('premium.fullHistoryBody', { count: data.hidden, days: FREE_LIMITS.historyDays })} source="history" /> : null}
    </Screen>
  );
}
