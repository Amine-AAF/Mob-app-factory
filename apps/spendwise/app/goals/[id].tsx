import { Button, Card, IconButton, ProgressBar, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { formatDay, IconBubble } from '@/components/finance';
import { AmountInput, DateField, FormField, Sheet } from '@/components/inputs';
import { mutate, useData, useMoney } from '@/hooks';
import { goalProgress } from '@/features/savings-goals/goals';
import { ValidationError } from '@/features/transactions/validation';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import type { DayKey } from '@/utils/dates';
import { parseAmount } from '@/utils/money';

export default function GoalDetailScreen() {
  const { t } = useTranslation();
  const money = useMoney();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = clock.today();
  const { data, error, reload } = useData(async (r) => {
    const goal = await r.goals.get(id);
    const contributions = goal ? await r.goals.contributions(id) : [];
    return { goal, contributions, progress: goal ? goalProgress(goal.target, contributions, goal.targetDate, today) : null };
  }, [id, today]);

  const [mode, setMode] = useState<'add' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<DayKey>(today);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const goal = data?.goal;
  const p = data?.progress;

  const openSheet = (m: 'add' | 'withdraw') => {
    setMode(m);
    setAmount('');
    setNote('');
    setDate(today);
    setFormError(null);
  };

  const submit = async () => {
    if (!goal || !mode) return;
    setFormError(null);
    const parsed = parseAmount(amount, goal.currency);
    if (!parsed.ok) return setFormError(t(`errors.${parsed.error}`));
    if (parsed.minor <= 0) return setFormError(t('errors.amount'));
    try {
      await mutate((r) => r.goals.addContribution(goal.id, mode === 'add' ? parsed.minor : -parsed.minor, date, note));
      setMode(null);
    } catch (e) {
      if (e instanceof ValidationError) setFormError(t(`errors.${e.code}`));
      else {
        recordError(e, 'goal_contribution');
        setFormError(t('common.error'));
      }
    }
  };

  const removeContribution = (cid: string) =>
    Alert.alert(t('goals.deleteContributionTitle'), t('common.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          void mutate((r) => r.goals.removeContribution(cid)).catch((e) => {
            if (e instanceof ValidationError) Alert.alert(t(`errors.${e.code}`));
            else recordError(e, 'goal_contribution_delete');
          }),
      },
    ]);

  const archive = () => {
    if (!goal) return;
    void mutate((r) => r.goals.setArchived(goal.id, !goal.archived)).catch((e) => recordError(e, 'goal_archive'));
  };

  const remove = () => {
    if (!goal) return;
    Alert.alert(t('goals.deleteTitle'), t('goals.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          mutate((r) => r.goals.remove(goal.id))
            .then(() => router.back())
            .catch((e) => recordError(e, 'goal_delete')),
      },
    ]);
  };

  if (error) {
    return (
      <Screen edges={[]}>
        <Text>{t('common.loadError')}</Text>
        <Button label={t('common.retry')} variant="secondary" onPress={reload} />
      </Screen>
    );
  }
  if (data && !goal) {
    return (
      <Screen edges={[]}>
        <Text>{t('errors.not_found')}</Text>
      </Screen>
    );
  }
  if (!goal || !p) return <Screen edges={[]}>{null}</Screen>;

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: goal.name, headerRight: () => <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push(`/goals/edit?id=${goal.id}`)} /> }} />
      <Card tone="primary">
        <Row gap={3}>
          <IconBubble icon={goal.icon} color={goal.color} size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">{money(p.saved, goal.currency)}</Text>
            <Text variant="caption" tone="muted">
              {t('goals.savedOf', { saved: money(p.saved, goal.currency), target: money(goal.target, goal.currency) })}
            </Text>
          </View>
          <Text variant="title">{p.percent}%</Text>
        </Row>
        <ProgressBar progress={p.ratio} tone="success" label={`${p.percent}%`} />
        <Row gap={4}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="muted">
              {t('goals.remaining')}
            </Text>
            <Text variant="subheading">{money(p.remaining, goal.currency)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="muted">
              {t('goals.targetDate')}
            </Text>
            <Text variant="subheading">{goal.targetDate ? formatDay(goal.targetDate) : t('common.none')}</Text>
          </View>
        </Row>
      </Card>

      {p.reached ? (
        <Text tone="success">{t('goals.reachedBody')}</Text>
      ) : p.overdue ? (
        <Text tone="warning">{t('goals.overdue')}</Text>
      ) : p.recommendedMonthly !== null ? (
        <Card tone="alt">
          <Text variant="subheading">{t('goals.recommended', { amount: money(p.recommendedMonthly, goal.currency) })}</Text>
          <Text variant="caption" tone="muted">
            {t('goals.recommendedFormula', { count: p.monthsLeft ?? 1 })}
          </Text>
          <Text variant="caption" tone="muted">
            {t('common.notFinancialAdvice')}
          </Text>
        </Card>
      ) : null}

      {goal.description ? <Text tone="muted">{goal.description}</Text> : null}

      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <Button label={t('goals.addContribution')} icon="add" size="md" onPress={() => openSheet('add')} testID="goal-contribute" />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={t('goals.withdraw')} icon="remove" size="md" variant="secondary" onPress={() => openSheet('withdraw')} disabled={p.saved <= 0} testID="goal-withdraw" />
        </View>
      </Row>
      <Text variant="caption" tone="muted">
        {t('goals.trackingOnly')}
      </Text>

      <SectionHeader title={t('goals.history')} />
      {data.contributions.length === 0 ? <Text tone="muted">{t('goals.noContributions')}</Text> : null}
      <Card>
        {data.contributions.map((c) => (
          <Row key={c.id} gap={3} style={{ paddingVertical: 6 }}>
            <View style={{ flex: 1 }}>
              <Text tone={c.amount < 0 ? 'danger' : 'success'}>{money(c.amount, goal.currency, { signed: true })}</Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {[formatDay(c.date), c.note === 'initial' ? t('goals.initialNote') : c.note].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <IconButton icon="trash-outline" label={t('common.delete')} tone="danger" onPress={() => removeContribution(c.id)} size={18} />
          </Row>
        ))}
      </Card>

      <Stack gap={2}>
        <Button label={goal.archived ? t('common.unarchive') : t('common.archive')} variant="secondary" icon="archive-outline" onPress={archive} />
        <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={remove} />
      </Stack>

      <Sheet visible={mode !== null} onClose={() => setMode(null)} title={mode === 'withdraw' ? t('goals.withdraw') : t('goals.addContribution')}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
          <AmountInput label={t('common.amount')} value={amount} onChange={setAmount} currency={goal.currency} autoFocus testID="goal-contribution-amount" />
          <DateField label={t('common.date')} value={date} onChange={(d) => d && setDate(d)} today={today} />
          <FormField label={t('common.notes')} value={note} onChangeText={setNote} maxLength={200} />
          {formError ? <Text tone="danger">{formError}</Text> : null}
          <Button label={t('common.save')} onPress={submit} testID="goal-contribution-save" />
        </View>
      </Sheet>
    </Screen>
  );
}
