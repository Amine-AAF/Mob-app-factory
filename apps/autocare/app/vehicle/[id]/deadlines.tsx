import { Button, Card, EmptyState, Screen, SectionHeader } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Fab, InfoNote, ItemRow, StatusBadge } from '@/components/ui';
import { DEADLINE_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { deadlineStatus } from '@/features/deadlines/deadlines';
import { useAsync, useFormat, useToday } from '@/hooks';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { diffDays } from '@/utils/dates';

export default function VehicleDeadlines() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAsync(() => repos().deadlines.list(id), [id]);
  const [message, setMessage] = useState<string | null>(null);
  const open = (data ?? []).filter((d) => !d.completedAt);
  const done = (data ?? []).filter((d) => d.completedAt);

  const complete = async (deadlineId: string) => {
    const nextId = await repos().deadlines.complete(deadlineId, clock.now());
    if (nextId) {
      const next = await repos().deadlines.get(nextId);
      setMessage(next ? t('deadlines.nextCreated', { date: f.day(next.dueDay) }) : null);
    } else setMessage(null);
    feedback.success();
    afterWrite();
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t('deadlines.title') }} />
      <View style={{ flex: 1 }}>
        <Screen edges={[]}>
          <InfoNote icon="globe-outline" text={t('deadlines.countryNote')} />
          {message ? <InfoNote icon="checkmark-circle-outline" text={message} /> : null}
          {data && open.length === 0 ? <EmptyState icon="calendar-outline" title={t('deadlines.empty')} /> : null}
          {open.length ? (
            <Card>
              {open.map((d) => {
                const status = deadlineStatus(d, today);
                const days = diffDays(today, d.dueDay);
                return (
                  <View key={d.id} style={{ gap: 4 }}>
                    <ItemRow
                      icon={DEADLINE_ICONS[d.type]}
                      tone={status === 'overdue' ? 'danger' : status === 'due_soon' ? 'warning' : 'primary'}
                      title={d.title ?? t(`deadlineTypes.${d.type}`)}
                      subtitle={[f.day(d.dueDay), days < 0 ? t('common.overdueBy', { count: -days }) : t('common.daysLeft', { count: days }), d.amountMinor !== null ? f.money(d.amountMinor, d.currency) : null, d.repeatMonths ? t('common.months', { count: d.repeatMonths }) : null].filter(Boolean).join(' · ')}
                      badge={<StatusBadge status={status} />}
                      onPress={() => router.push({ pathname: '/deadline/edit', params: { id: d.id } })}
                    />
                    <Button label={t('deadlines.markDone')} icon="checkmark-done" variant="secondary" size="md" onPress={() => void complete(d.id)} />
                  </View>
                );
              })}
            </Card>
          ) : null}
          {done.length ? (
            <>
              <SectionHeader title={t('deadlines.completed')} />
              <Card>
                {done.map((d) => (
                  <ItemRow key={d.id} icon={DEADLINE_ICONS[d.type]} tone="neutral" title={d.title ?? t(`deadlineTypes.${d.type}`)} subtitle={f.day(d.dueDay)} onPress={() => router.push({ pathname: '/deadline/edit', params: { id: d.id } })} />
                ))}
              </Card>
            </>
          ) : null}
          <View style={{ height: 72 }} />
        </Screen>
        <Fab label={t('deadlines.add')} onPress={() => router.push({ pathname: '/deadline/edit', params: { vehicleId: id } })} />
      </View>
    </>
  );
}
