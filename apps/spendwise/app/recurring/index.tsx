import { Badge, Button, Card, EmptyState, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDay, IconBubble } from '@/components/finance';
import { SwitchRow } from '@/components/inputs';
import { UPCOMING_DAYS } from '@/constants';
import { mutate, useCategoryName, useData, useMoney } from '@/hooks';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import type { RecurringRule } from '@/types';

export default function RecurringScreen() {
  const { t } = useTranslation();
  const money = useMoney();
  const catName = useCategoryName();
  const today = clock.today();
  const { data, error, reload } = useData(async (r) => {
    const [rules, pending, upcoming, categories, accounts] = await Promise.all([
      r.recurring.list(),
      r.recurring.due(today, { autoPost: false }),
      r.recurring.upcoming(today, UPCOMING_DAYS),
      r.categories.list({ includeArchived: true }),
      r.accounts.list({ includeArchived: true }),
    ]);
    return {
      rules: rules.map((rule) => ({ rule, next: r.recurring.nextFor(rule, today) })),
      pending,
      upcoming: upcoming.slice(0, 10),
      categories: new Map(categories.map((c) => [c.id, c])),
      accounts: new Map(accounts.map((a) => [a.id, a])),
    };
  }, [today]);

  const signed = (rule: RecurringRule) => (rule.type === 'expense' ? -rule.amount : rule.amount);
  const title = (rule: RecurringRule) => rule.description || (rule.type === 'transfer' ? t('tx.types.transfer') : catName(rule.categoryId ? data?.categories.get(rule.categoryId) : null));

  const run = (fn: () => Promise<unknown>, ctx: string) => fn().catch((e) => recordError(e, ctx));

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('recurring.title') }} />
      <Text tone="muted">{t('recurring.intro')}</Text>
      <Button label={t('recurring.new')} icon="add" onPress={() => router.push('/recurring/edit')} testID="recurring-add" />
      {error ? (
        <Card>
          <Text>{t('common.loadError')}</Text>
          <Button label={t('common.retry')} variant="secondary" size="md" onPress={reload} />
        </Card>
      ) : null}

      {data && data.pending.length > 0 ? (
        <Stack gap={2}>
          <SectionHeader title={t('recurring.toConfirm')} />
          <Text variant="caption" tone="muted">
            {t('recurring.toConfirmHint')}
          </Text>
          {data.pending.map((o) => (
            <Card key={`${o.rule.id}-${o.date}`}>
              <Row gap={3}>
                <View style={{ flex: 1 }}>
                  <Text variant="subheading" numberOfLines={1}>
                    {title(o.rule)}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {formatDay(o.date)}
                  </Text>
                </View>
                <Text variant="subheading">{money(signed(o.rule), o.rule.currency, { signed: o.rule.type !== 'transfer' })}</Text>
              </Row>
              <Row gap={2}>
                <View style={{ flex: 1 }}>
                  <Button label={t('recurring.confirm')} size="md" icon="checkmark" onPress={() => run(() => mutate((r) => r.recurring.confirm(o.rule.id, o.date)), 'recurring_confirm')} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label={t('recurring.skip')} size="md" variant="secondary" onPress={() => run(() => mutate((r) => r.recurring.skip(o.rule.id, o.date)), 'recurring_skip')} />
                </View>
              </Row>
            </Card>
          ))}
        </Stack>
      ) : null}

      <SectionHeader title={t('recurring.rules')} />
      {data && data.rules.length === 0 ? <EmptyState icon="repeat-outline" title={t('recurring.empty')} message={t('recurring.emptyBody')} /> : null}
      {data?.rules.map(({ rule, next }) => {
        const cat = rule.categoryId ? data.categories.get(rule.categoryId) : undefined;
        return (
          <Card key={rule.id} onPress={() => router.push(`/recurring/edit?id=${rule.id}`)} accessibilityLabel={title(rule)} testID={`rule-${rule.id}`}>
            <Row gap={3}>
              <IconBubble icon={cat?.icon ?? 'swap-horizontal'} color={cat?.color ?? '#64748B'} />
              <View style={{ flex: 1 }}>
                <Text variant="subheading" numberOfLines={1}>
                  {title(rule)}
                </Text>
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {[t(`freq.${rule.frequency}`, { count: rule.interval }), data.accounts.get(rule.accountId)?.name].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Stack gap={0} style={{ alignItems: 'flex-end' }}>
                <Text variant="subheading">{money(signed(rule), rule.currency, { signed: rule.type !== 'transfer' })}</Text>
                <Badge label={rule.autoPost ? t('recurring.auto') : t('recurring.manual')} tone={rule.autoPost ? 'primary' : 'neutral'} />
              </Stack>
            </Row>
            <Text variant="caption" tone="muted">
              {rule.active ? (next ? t('recurring.nextOn', { date: formatDay(next) }) : t('recurring.ended')) : t('common.inactive')}
            </Text>
            <SwitchRow label={t('common.active')} value={rule.active} onChange={(v) => run(() => mutate((r) => r.recurring.setActive(rule.id, v)), 'recurring_toggle')} testID={`rule-active-${rule.id}`} />
          </Card>
        );
      })}

      {data && data.upcoming.length > 0 ? (
        <Stack gap={2}>
          <SectionHeader title={t('recurring.planned')} />
          <Text variant="caption" tone="muted">
            {t('recurring.plannedHint')}
          </Text>
          <Card tone="alt">
            {data.upcoming.map((o) => (
              <Row key={`${o.rule.id}-${o.date}`} gap={3} style={{ paddingVertical: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1}>{title(o.rule)}</Text>
                  <Text variant="caption" tone="muted">
                    {formatDay(o.date)} · {t('recurring.plannedTag')}
                  </Text>
                </View>
                <Text tone="muted">{money(signed(o.rule), o.rule.currency, { signed: o.rule.type !== 'transfer' })}</Text>
              </Row>
            ))}
          </Card>
        </Stack>
      ) : null}
    </Screen>
  );
}
