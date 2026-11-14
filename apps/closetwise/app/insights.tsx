import { router, Stack as RouterStack } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { PremiumCard } from '@/components/forms';
import { repos } from '@/database';
import { colorHex } from '@/domain/catalog';
import { computeInsights, type UsageLevel } from '@/domain/insights';
import { BarList } from '@/features/insights/BarList';
import { InsightItemRow } from '@/features/insights/InsightItemRow';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useIsPremium, useSettings } from '@/store/session';
import { Button, Card, EmptyState, FadeIn, Loading, Row, Screen, SectionHeader, Stack, Stat, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

const USAGE_LEVELS: UsageLevel[] = ['never', 'rare', 'occasional', 'frequent'];

function Section({ title, children, subtitle }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Card>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="caption" tone="subtle">
          {subtitle}
        </Text>
      ) : null}
      {children}
    </Card>
  );
}

export default function InsightsScreen() {
  const { t } = useTranslation();
  const labels = useLabels();
  const settings = useSettings();
  const isPremium = useIsPremium();
  const { data: items } = useAsync(() => repos().wardrobe.list({ archived: false }), []);

  const insights = useMemo(
    () => (items ? computeInsights(items, { today: clock.today(), categoryKeyOf: labels.categoryKey, fallbackCurrency: settings.currency }) : null),
    [items, labels, settings.currency],
  );
  const withoutPrice = useMemo(() => (items ?? []).filter((i) => i.purchasePrice == null).length, [items]);

  const body = () => {
    if (!insights) return <Loading />;
    if (insights.total === 0) {
      return (
        <EmptyState
          icon="stats-chart-outline"
          title={t('insights.empty.title')}
          message={t('insights.empty.message')}
          action={<Button label={t('insights.empty.action')} icon="add" onPress={() => router.push('/item/edit')} />}
        />
      );
    }
    const money = (n: number, c: string | null) => fmt.money(n, c ?? settings.currency);
    return (
      <>
        <Row gap={3}>
          <Stat value={fmt.number(insights.total)} label={t('insights.totalItems')} icon="shirt-outline" />
          <Stat value={fmt.number(insights.byCategory.length)} label={t('insights.categoriesUsed')} icon="grid-outline" />
        </Row>

        <Section title={t('insights.byCategory')}>
          <BarList entries={insights.byCategory.map((c) => ({ key: c.key, label: t(`catalog.category.${c.key}`), value: c.count }))} />
        </Section>

        <Section title={t('insights.recentlyAdded')}>
          {insights.recentlyAdded.map((i) => (
            <InsightItemRow key={i.id} item={i} labels={labels} detail={`${labels.category(i.categoryId)} · ${fmt.day(i.createdAt.slice(0, 10))}`} />
          ))}
        </Section>

        {!isPremium ? (
          <PremiumCard message={t('insights.premiumMessage')} source="insights" />
        ) : (
          <FadeIn>
            <Stack gap={4}>
              <SectionHeader title={t('insights.premiumSection')} />

              <Section title={t('insights.usageTitle')} subtitle={t('insights.usageSubtitle')}>
                <Row gap={2} wrap>
                  {USAGE_LEVELS.map((level) => (
                    <View key={level} style={{ flexBasis: '47%', flexGrow: 1 }}>
                      <Card tone="alt" style={{ gap: 2 }}>
                        <Text variant="number">{fmt.number(insights.usage[level])}</Text>
                        <Text variant="caption" tone="subtle">
                          {t(`catalog.usage.${level}`)}
                        </Text>
                      </Card>
                    </View>
                  ))}
                </Row>
              </Section>

              <Section title={t('insights.colors')}>
                {insights.byColor.length === 0 ? (
                  <Text tone="muted">{t('insights.noColors')}</Text>
                ) : (
                  <BarList entries={insights.byColor.slice(0, 10).map((c) => ({ key: c.key, label: labels.color(c.key), value: c.count, swatch: colorHex(c.key) }))} />
                )}
              </Section>

              <Section title={t('insights.seasons')} subtitle={t('insights.seasonsHint')}>
                <BarList entries={insights.bySeason.map((s) => ({ key: s.key, label: t(`catalog.season.${s.key}`), value: s.count }))} />
              </Section>

              <Section title={t('insights.brands')}>
                {insights.byBrand.length === 0 ? (
                  <Text tone="muted">{t('insights.noBrands')}</Text>
                ) : (
                  <BarList entries={insights.byBrand.slice(0, 8).map((b) => ({ key: b.key, label: b.key, value: b.count }))} />
                )}
              </Section>

              <Section title={t('insights.mostWorn')}>
                {insights.mostWorn.length === 0 ? (
                  <Text tone="muted">{t('insights.noWears')}</Text>
                ) : (
                  insights.mostWorn.map((i) => <InsightItemRow key={i.id} item={i} labels={labels} detail={t('common.wears', { count: i.wearCount })} />)
                )}
              </Section>

              <Section title={t('insights.rarelyWorn')} subtitle={t('insights.rarelyWornHint')}>
                {insights.rarelyWorn.length === 0 ? (
                  <Text tone="muted">{t('insights.noRarelyWorn')}</Text>
                ) : (
                  <>
                    {insights.rarelyWorn.map((i) => (
                      <InsightItemRow key={i.id} item={i} labels={labels} detail={i.lastWornOn ? t('insights.lastWorn', { date: fmt.day(i.lastWornOn) }) : t('catalog.usage.never')} />
                    ))}
                    <Button small variant="accent" icon="sparkles-outline" label={t('insights.giveChance')} onPress={() => router.push('/suggestions')} style={{ alignSelf: 'flex-start' }} />
                  </>
                )}
              </Section>

              <Section title={t('insights.value')} subtitle={t('insights.valueHint')}>
                {insights.value.length === 0 ? (
                  <Text tone="muted">{t('insights.noValue')}</Text>
                ) : (
                  insights.value.map((v) => (
                    <Row key={v.currency} style={{ justifyContent: 'space-between' }}>
                      <Text variant="title">{fmt.money(v.total, v.currency)}</Text>
                      <Text variant="bodySmall" tone="subtle">
                        {t('common.items', { count: v.count })}
                      </Text>
                    </Row>
                  ))
                )}
                {withoutPrice > 0 ? (
                  <Text variant="caption" tone="subtle">
                    {t('insights.withoutPrice', { count: withoutPrice })}
                  </Text>
                ) : null}
              </Section>

              <Section title={t('insights.cpwTitle')} subtitle={t('insights.cpwExplain')}>
                {insights.bestCostPerWear.length === 0 ? (
                  <Text tone="muted">{t('insights.cpwEmpty')}</Text>
                ) : (
                  insights.bestCostPerWear.map(({ item, cpw }) => (
                    <InsightItemRow
                      key={item.id}
                      item={item}
                      labels={labels}
                      detail={t('common.wears', { count: item.wearCount })}
                      right={
                        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                          {t('insights.perWear', { amount: money(cpw, item.currency) })}
                        </Text>
                      }
                    />
                  ))
                )}
                <Text variant="caption" tone="subtle">
                  {t('insights.cpwNotAvailable', { label: t('common.notAvailable') })}
                </Text>
              </Section>
            </Stack>
          </FadeIn>
        )}
      </>
    );
  };

  return (
    <Screen edges={[]} scroll={false} padded={false}>
      <RouterStack.Screen options={{ title: t('insights.title') }} />
      <View style={{ flex: 1 }}>
        <InsightsScroll>{body()}</InsightsScroll>
      </View>
      <AdBanner screen="insights" />
    </Screen>
  );
}

/** Scrollable content area (the page is a bounded set of sections, so a ScrollView is enough). */
function InsightsScroll({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing(5), paddingTop: theme.spacing(3), paddingBottom: theme.spacing(10) }}>
      <Stack gap={4}>{children}</Stack>
    </ScrollView>
  );
}
