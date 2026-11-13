import { EmptyState, Screen, Stack } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Segmented } from '@/components/forms';
import { PremiumLock } from '@/components/media';
import { ItemRow, ScreenHeader } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { addDays } from '@/domain/dates';
import { useData } from '@/hooks/useData';
import { useActiveHome, useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

/** Interventions log: maintenance done/postponed and chores completed. Free plan: last 90 days. */
export default function History() {
  const { t } = useTranslation();
  const home = useActiveHome();
  const today = useToday();
  const isPremium = useIsPremium();
  const [mode, setMode] = useState<'maintenance' | 'household'>('maintenance');
  const since = isPremium ? null : addDays(today, -FREE_LIMITS.historyDays);
  const { data } = useData(async () => {
    if (!home) return null;
    const r = repos();
    const [maintenance, household] = await Promise.all([r.maintenance.history(home.id, { since }), r.household.history(home.id, { since })]);
    return { maintenance, household };
  }, [home?.id, since]);

  const empty = data && (mode === 'maintenance' ? data.maintenance.length === 0 : data.household.length === 0);

  return (
    <Screen>
      <ScreenHeader title={t('history.title')} subtitle={isPremium ? t('history.full') : t('limits.history', { days: FREE_LIMITS.historyDays })} back />
      <Segmented options={['maintenance', 'household'] as const} value={mode} onChange={setMode} renderLabel={(m) => t(`maintenance.modes.${m}`)} />
      {!isPremium ? <PremiumLock feature="full_history" message={t('history.unlock')} /> : null}
      {empty ? <EmptyState icon="time-outline" title={t('history.empty')} /> : null}
      <Stack gap={2}>
        {mode === 'maintenance'
          ? data?.maintenance.map((h) => (
              <ItemRow
                key={h.id}
                icon={h.action === 'completed' ? 'checkmark-circle-outline' : 'time-outline'}
                title={h.taskTitle ?? ''}
                subtitle={[fmt.day(h.doneOn), t(`history.actions.${h.action}`), h.costMinor != null && h.currency ? fmt.money({ amountMinor: h.costMinor, currency: h.currency }) : null].filter(Boolean).join(' · ')}
                onPress={() => router.push(`/maintenance/${h.taskId}`)}
              />
            ))
          : data?.household.map((h) => (
              <ItemRow key={h.id} icon="checkbox-outline" title={h.title} subtitle={[fmt.day(h.completed_on), h.member_name].filter(Boolean).join(' · ')} onPress={() => router.push(`/household/${h.task_id}`)} />
            ))}
      </Stack>
    </Screen>
  );
}
