import { Card, EmptyState, FadeIn, Icon, ListRow, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { ToolTile } from '@/components/ToolTile';
import { getTool, LIMITS, TOOLS } from '@/constants/tools';
import { repos } from '@/database';
import { describeEntry } from '@/features/history/describe';
import { openTool } from '@/features/navigation';
import { useAsync } from '@/hooks/useAsync';
import { useFormat } from '@/hooks/useFormat';
import { useIsPremium } from '@/store/session';

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const f = useFormat();
  const isPremium = useIsPremium();
  const { data } = useAsync(async () => ({ favorites: await repos().favorites.list(), recent: await repos().history.list({ limit: 3 }) }), []);
  const favorites = data?.favorites ?? [];

  return (
    <Screen testID="home-screen">
      <FadeIn>
        <Row style={{ justifyContent: 'space-between' }}>
          <Stack gap={1}>
            <Text variant="title" accessibilityRole="header">
              CalcWise
            </Text>
            <Text tone="muted">{t('home.tagline')}</Text>
          </Stack>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calculator" size={26} color={theme.colors.onPrimary} />
          </View>
        </Row>
      </FadeIn>

      <Card tone="primary" onPress={() => router.navigate('/(tabs)/calculator')} accessibilityLabel={t('home.openCalculator')} testID="home-calculator">
        <Row gap={3}>
          <Icon name="calculator-outline" size={28} color={theme.colors.primary} />
          <Stack gap={1} style={{ flex: 1 }}>
            <Text variant="subheading">{t('home.openCalculator')}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('home.calculatorHint')}
            </Text>
          </Stack>
          <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
        </Row>
      </Card>

      <SectionHeader title={t('home.favorites')} action={t('home.editFavorites')} onAction={() => router.navigate('/(tabs)/tools')} />
      {favorites.length ? (
        <Row gap={3} wrap>
          {favorites.map((id) => (
            <ToolTile key={id} id={id} />
          ))}
        </Row>
      ) : (
        <Text variant="bodySmall" tone="muted">
          {t('home.noFavorites')}
        </Text>
      )}
      {!isPremium ? (
        <Text variant="caption" tone="subtle">
          {t('home.favoritesLimit', { count: LIMITS.freeFavorites })}
        </Text>
      ) : null}

      <SectionHeader title={t('home.allTools')} />
      <Card>
        {TOOLS.filter((tool) => !favorites.includes(tool.id)).map((tool) => (
          <ListRow key={tool.id} icon={getTool(tool.id)?.icon} title={t(`tools.${tool.id}.name`)} subtitle={t(`tools.${tool.id}.tagline`)} onPress={() => openTool(tool.id)} testID={`home-tool-${tool.id}`} />
        ))}
      </Card>

      <SectionHeader title={t('home.recent')} action={data?.recent.length ? t('home.seeAll') : undefined} onAction={() => router.navigate('/(tabs)/history')} />
      {data?.recent.length ? (
        <Card>
          {data.recent.map((entry) => {
            const d = describeEntry(entry, t, f);
            return <ListRow key={entry.id} icon={getTool(entry.tool)?.icon} title={d.result.split('\n')[0] ?? ''} subtitle={`${d.title} · ${d.detail}`} />;
          })}
        </Card>
      ) : (
        <EmptyState icon="time-outline" title={t('history.emptyTitle')} message={t('history.emptyMessage')} />
      )}

      {!isPremium ? (
        <Card tone="accent" onPress={() => router.push({ pathname: '/paywall', params: { source: 'home' } })} accessibilityLabel={t('home.premiumTitle')} testID="home-premium">
          <Row gap={3}>
            <Icon name="diamond-outline" size={24} color={theme.colors.accent} />
            <Stack gap={1} style={{ flex: 1 }}>
              <Text variant="subheading">{t('home.premiumTitle')}</Text>
              <Text variant="bodySmall" tone="muted">
                {t('home.premiumMessage')}
              </Text>
            </Stack>
          </Row>
        </Card>
      ) : null}

      <AdBanner />
    </Screen>
  );
}
