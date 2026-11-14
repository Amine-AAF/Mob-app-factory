import { Badge, Button, Card, Icon, PressableScale, Row, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { totalMinutes } from '@/domain/recipes';
import type { Recipe } from '@/domain/types';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange, type AdScreen } from '@/services/ads';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

import { RecipeArt } from './ui';

/** Recipe list row: illustration, title, time, difficulty and a premium lock when needed. */
export function RecipeCard({ recipe, onPress, favorite, testID, compact }: { recipe: Recipe; onPress?: () => void; favorite?: boolean; testID?: string; compact?: boolean }) {
  const { t } = useLang();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const locked = recipe.premium && !isPremium;
  const minutes = totalMinutes(recipe);
  return (
    <PressableScale
      onPress={onPress ?? (() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } }))}
      accessibilityRole="button"
      accessibilityLabel={[recipe.title, t('recipe.totalTime', { time: fmt.minutes(minutes) }), locked ? t('premium.locked') : null].filter(Boolean).join('. ')}
      testID={testID}
      style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 10, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
    >
      <RecipeArt emoji={recipe.emoji} color={recipe.color} size={compact ? 52 : 64} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="subheading" numberOfLines={2}>
          {recipe.title}
        </Text>
        <Row gap={2} wrap>
          <Row gap={1}>
            <Icon name="time-outline" size={14} color={theme.colors.textMuted} />
            <Text variant="caption" tone="muted">
              {fmt.minutes(minutes)}
            </Text>
          </Row>
          <Text variant="caption" tone="subtle">
            ·
          </Text>
          <Text variant="caption" tone="muted">
            {t(`difficulty.${recipe.difficulty}`)}
          </Text>
          {recipe.source === 'user' ? <Badge label={t('recipes.mine')} tone="accent" /> : null}
          {recipe.categories.includes('vegan') ? <Badge label={t('categories.vegan')} tone="success" /> : recipe.categories.includes('vegetarian') ? <Badge label={t('categories.vegetarian')} tone="success" /> : null}
        </Row>
      </View>
      {locked ? <Icon name="lock-closed" size={18} color={theme.colors.warning} /> : favorite ? <Icon name="heart" size={18} color={theme.colors.primary} /> : null}
    </PressableScale>
  );
}

/** Explains a premium feature and opens the paywall. */
export function PremiumGate({ title, message, source }: { title: string; message: string; source: string }) {
  const { t } = useLang();
  return (
    <Card tone="primary" testID="premium-gate">
      <Row gap={2}>
        <Icon name="sparkles" size={18} color={useTheme().colors.primary} />
        <Text variant="subheading" style={{ flex: 1 }}>
          {title}
        </Text>
      </Row>
      <Text variant="bodySmall" tone="muted">
        {message}
      </Text>
      <Button label={t('premium.discover')} icon="sparkles-outline" size="md" onPress={() => router.push({ pathname: '/paywall', params: { source } })} />
    </Card>
  );
}

/**
 * Anchored adaptive banner, clearly labelled and separated from content.
 * Rendered only on browsing screens listed in AD_SCREENS — never on a recipe,
 * in cooking mode or on the active grocery list.
 */
export function AdBanner({ screen }: { screen: AdScreen }) {
  const { t } = useLang();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);

  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium, sessionCount, screen })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12 }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}
