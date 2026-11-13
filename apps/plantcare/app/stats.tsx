import { Card, Icon, Row, Screen, SectionHeader, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { addDays } from '@factory/app-core';
import { Stack as RouterStack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PremiumCard } from '@/components/care';
import { BarChart, ShareBars } from '@/components/charts';
import { useLeaf } from '@/components/leaf';
import { computeInsights } from '@/domain/stats';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';

/** Statistics & insights dashboard. Basic numbers are free; trends are Premium. */
export default function Stats() {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const router = useRouter();
  const isPremium = useIsPremium();
  const today = clock.today();

  const { data } = useData(async (r) => {
    const since = addDays(today, -200);
    const [plants, tasks, history, waterings, health] = await Promise.all([r.plants.list(), r.tasks.listActive(), r.history.between(since, today), r.watering.between(since, today), r.health.open()]);
    return { ins: computeInsights({ plants, tasks, history, waterings, health, today }), plants };
  });
  const ins = data?.ins;
  if (!ins) return <Screen edges={[]}>{null}</Screen>;
  const names = new Map(data.plants.map((p) => [p.id, p.nickname]));

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('stats.title') }} />
      <Card tone="primary">
        <Row gap={3}>
          <Icon name="flame-outline" size={28} color={theme.colors.primary} />
          <Stack gap={0} style={{ flex: 1 }}>
            <Text variant="heading">{t('stats.streak', { count: ins.careStreak })}</Text>
            <Text variant="bodySmall" tone="muted">
              {ins.careStreak > 0 ? t('stats.streakBody') : t('stats.streakZero')}
            </Text>
          </Stack>
        </Row>
      </Card>
      <Row gap={2}>
        <Stat value={String(ins.totalPlants)} label={t('stats.plants')} icon="leaf-outline" />
        <Stat value={String(ins.wateringsLast30)} label={t('stats.waterings30')} icon="water-outline" tone="accent" />
      </Row>
      <Row gap={2}>
        <Stat value={String(ins.tasksDoneLast30)} label={t('stats.tasks30')} icon="checkmark-done-outline" tone="success" />
        <Stat value={String(ins.needingAttention.length)} label={t('stats.attention')} icon="alert-circle-outline" tone="warning" />
      </Row>

      {ins.byCategory.length > 0 ? (
        <>
          <SectionHeader title={t('stats.byCategory')} />
          <Card>
            <ShareBars rows={ins.byCategory.map((c) => ({ label: t(`categories.${c.category}`), value: c.count }))} />
          </Card>
        </>
      ) : null}

      {ins.needingAttention.length > 0 ? (
        <>
          <SectionHeader title={t('stats.attention')} />
          <Card>
            {ins.needingAttention.map((id) => (
              <Text key={id} tone="primary" onPress={() => router.push(`/plant/${id}`)} accessibilityRole="link">
                {`• ${names.get(id) ?? ''}`}
              </Text>
            ))}
          </Card>
        </>
      ) : null}

      {isPremium ? (
        <>
          <SectionHeader title={t('stats.regularity')} />
          <Card>
            <Text variant="title">{ins.regularity === null ? '—' : fmt.percent(ins.regularity)}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('stats.regularityHint')}
            </Text>
          </Card>
          <SectionHeader title={t('stats.monthlyCare')} />
          <Card>
            <BarChart
              color={tokens.water}
              data={ins.monthlyCare.map((m) => ({ label: fmt.monthShort(m.month), value: m.waterings + m.tasks }))}
              summary={ins.monthlyCare.map((m) => `${fmt.monthShort(m.month)}: ${m.waterings + m.tasks}`).join(', ')}
            />
          </Card>
          <SectionHeader title={t('stats.collectionGrowth')} />
          <Card>
            <BarChart
              data={ins.collectionGrowth.map((m) => ({ label: fmt.monthShort(m.month), value: m.total }))}
              summary={ins.collectionGrowth.map((m) => `${fmt.monthShort(m.month)}: ${m.total}`).join(', ')}
            />
          </Card>
        </>
      ) : (
        <PremiumCard title={t('premium.statsTitle')} message={t('premium.statsBody')} source="stats" />
      )}
    </Screen>
  );
}
