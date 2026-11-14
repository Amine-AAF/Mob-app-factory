import { Button, Icon, Text } from '@factory/design-system';
import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Bars, Empty, Page, Paper, Pill, ProgressLine, Ring, Section, Serif } from '@/components/ui';
import { CHALLENGES } from '@/config/presets';
import { repos } from '@/database';
import { goalHistory, yearlyPace, type GoalProgress } from '@/features/goals/goals';
import { useAction, useData, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { archiveGoal, deleteGoal, evaluateGoals, joinChallenge, loadActivity, setCustomProgress } from '@/services/goalService';
import { computeGoalProgress } from '@/features/goals/goals';

function periodLabel(p: GoalProgress, t: TFunction): string {
  switch (p.goal.type) {
    case 'books_per_year':
      return p.period.start.slice(0, 4);
    case 'pages_per_month':
      return fmt.month(p.period.start.slice(0, 7));
    case 'minutes_per_day':
      return t('goals.today');
    case 'days_per_week':
      return t('goals.weekOf', { date: fmt.shortDay(p.period.start) });
    case 'custom':
      return p.goal.periodEnd ? t('goals.until', { date: fmt.day(p.goal.periodEnd) }) : '';
  }
}

export default function Goals() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const run = useAction(t);
  const [showPast, setShowPast] = useState(false);
  const { data } = useData(
    async (r) => {
      const activity = await loadActivity(r, today);
      const [active, all] = await Promise.all([evaluateGoals(r, today, activity), r.organize.goals()]);
      const past = all.filter((g) => !g.isActive).map((g) => computeGoalProgress(g, activity, today));
      return { active, past, activity };
    },
    [today],
  );

  const goalTitle = (p: GoalProgress) => p.goal.title ?? (p.goal.challengeId ? t(`challenges.${p.goal.challengeId}.title`) : t(`goals.types.${p.goal.type}`, { count: p.target }));
  const joined = new Set((data?.active ?? []).map((p) => p.goal.challengeId).filter(Boolean));

  const actions = (p: GoalProgress) =>
    Alert.alert(goalTitle(p), undefined, [
      { text: t('common.edit'), onPress: () => router.push({ pathname: '/goals/edit', params: { id: p.goal.id } }) },
      { text: p.goal.isActive ? t('goals.archive') : t('goals.reactivate'), onPress: () => void run(() => archiveGoal(repos(), p.goal.id, !p.goal.isActive)) },
      { text: t('common.delete'), style: 'destructive', onPress: () => void run(() => deleteGoal(repos(), p.goal.id)) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Page testID="goals">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Serif size={30}>{t('goals.title')}</Serif>
        <Button label={t('goals.new')} icon="add" variant="secondary" onPress={() => router.push('/goals/edit')} testID="new-goal" />
      </View>
      <Text tone="muted">{t('goals.intro')}</Text>

      {data && !data.active.length ? <Empty icon="flag-outline" title={t('goals.emptyTitle')} message={t('goals.emptyBody')} /> : null}

      {(data?.active ?? []).map((p) => {
        const pace = yearlyPace(p, today);
        const history = data ? goalHistory(p.goal, data.activity, today, p.goal.type === 'minutes_per_day' ? 7 : 6) : [];
        return (
          <Paper key={p.goal.id} onPress={() => actions(p)} accessibilityLabel={goalTitle(p)} testID={`goal-${p.goal.type}`}>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <Ring ratio={p.ratio} size={72} label={t('goals.progressA11y', { value: p.value, target: p.target })}>
                {p.reached ? <Icon name="checkmark" size={26} color={theme.colors.success} /> : <Text style={{ fontWeight: '800' }}>{fmt.percent(p.ratio)}</Text>}
              </Ring>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontWeight: '700' }}>{goalTitle(p)}</Text>
                <Text variant="caption" tone="subtle">
                  {periodLabel(p, t)}
                </Text>
                <Serif size={18}>{`${fmt.integer(p.value)} / ${fmt.integer(p.target)}${p.goal.unit ? ` ${p.goal.unit}` : ''}`}</Serif>
                {p.reached ? <Pill label={t('goals.reached')} icon="trophy" tone="success" /> : <Text variant="caption" tone="muted">{t('goals.remaining', { count: p.remaining })}</Text>}
                {pace && !p.reached ? <Text variant="caption" tone={pace.status === 'behind' ? 'subtle' : 'success'}>{t(`goals.pace.${pace.status}`, { count: pace.expected })}</Text> : null}
              </View>
            </View>
            {p.goal.type === 'custom' ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button label="−1" variant="secondary" onPress={() => void run(() => setCustomProgress(repos(), p.goal.id, p.value - 1))} />
                <Button label="+1" variant="secondary" onPress={() => void run(() => setCustomProgress(repos(), p.goal.id, p.value + 1))} testID="custom-plus" />
              </View>
            ) : history.length > 1 ? (
              <Bars
                values={history.map((h) => h.value)}
                labels={history.map((h) => (p.goal.type === 'pages_per_month' ? fmt.monthShort(h.period.start.slice(0, 7)) : p.goal.type === 'books_per_year' ? h.period.start.slice(2, 4) : fmt.shortDay(h.period.start).split(' ')[0]!))}
                highlight={history.length - 1}
                height={60}
                accessibilityLabel={t('goals.compareA11y')}
              />
            ) : null}
          </Paper>
        );
      })}

      <Section title={t('challenges.title')}>
        <Text variant="bodySmall" tone="muted">
          {t('challenges.intro')}
        </Text>
        {CHALLENGES.map((c) => (
          <Paper key={c.id} tone={joined.has(c.id) ? 'primary' : 'alt'}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Icon name={c.icon} size={26} color={theme.colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{t(`challenges.${c.id}.title`)}</Text>
                <Text variant="caption" tone="muted">
                  {t(`challenges.${c.id}.body`)}
                </Text>
              </View>
              {joined.has(c.id) ? (
                <Pill label={t('challenges.joined')} icon="checkmark" tone="success" />
              ) : (
                <Pressable onPress={() => void run(() => joinChallenge(repos(), c.id))} accessibilityRole="button" accessibilityLabel={t('challenges.joinA11y', { name: t(`challenges.${c.id}.title`) })} testID={`join-${c.id}`} hitSlop={8}>
                  <Text tone="primary" style={{ fontWeight: '700' }}>
                    {t('challenges.join')}
                  </Text>
                </Pressable>
              )}
            </View>
          </Paper>
        ))}
      </Section>

      {data?.past.length ? (
        <Section title={t('goals.history')} action={showPast ? t('common.hide') : t('common.show')} onAction={() => setShowPast(!showPast)}>
          {showPast
            ? data.past.map((p) => (
                <Paper key={p.goal.id} tone="alt" onPress={() => actions(p)} accessibilityLabel={goalTitle(p)}>
                  <Text style={{ fontWeight: '600' }}>{goalTitle(p)}</Text>
                  <ProgressLine ratio={p.ratio} tone={p.reached ? 'success' : 'primary'} />
                  <Text variant="caption" tone="subtle">
                    {p.goal.completedAt ? t('goals.completedOn', { date: fmt.day(p.goal.completedAt.slice(0, 10)) }) : t('goals.archived')}
                  </Text>
                </Paper>
              ))
            : null}
        </Section>
      ) : null}
    </Page>
  );
}
