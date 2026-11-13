import { Badge, Card, IconButton, ListRow, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdBanner } from '@/components/AdBanner';
import { LIMITS, TOOLS, type ToolDef } from '@/constants/tools';
import { repos } from '@/database';
import { openTool } from '@/features/navigation';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { isPremiumNow, useIsPremium, useSession } from '@/store/session';

const CATEGORIES: ToolDef['category'][] = ['everyday', 'money', 'convert'];

export default function ToolsScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { data: favorites, reload } = useAsync(() => repos().favorites.list(), []);
  const [limitHit, setLimitHit] = useState(false);

  const toggle = async (id: ToolDef['id']) => {
    try {
      const outcome = await repos().favorites.toggle(id, { max: isPremiumNow() ? null : LIMITS.freeFavorites });
      setLimitHit(outcome === 'limit');
      reload();
      useSession.getState().bump();
    } catch (e) {
      recordError(e, 'favorite_toggle');
    }
  };

  return (
    <Screen testID="tools-screen">
      <Text variant="title" accessibilityRole="header">
        {t('tabs.tools')}
      </Text>
      <Text tone="muted">{t('toolsTab.subtitle')}</Text>
      {limitHit ? (
        <Card tone="accent" onPress={() => router.push({ pathname: '/paywall', params: { source: 'favorites_limit' } })} accessibilityLabel={t('favorites.limitReached', { count: LIMITS.freeFavorites })}>
          <Text variant="bodySmall">{t('favorites.limitReached', { count: LIMITS.freeFavorites })}</Text>
        </Card>
      ) : null}
      {CATEGORIES.map((cat) => (
        <Card key={cat}>
          <SectionHeader title={t(`toolsTab.categories.${cat}`)} />
          {TOOLS.filter((tool) => tool.category === cat).map((tool) => {
            const fav = favorites?.includes(tool.id) ?? false;
            return (
              <ListRow
                key={tool.id}
                icon={tool.icon}
                title={t(`tools.${tool.id}.name`)}
                subtitle={t(`tools.${tool.id}.tagline`)}
                onPress={() => openTool(tool.id)}
                testID={`tools-${tool.id}`}
                right={
                  <Row gap={1}>
                    {tool.advanced && !isPremium ? <Badge label={t('premium.badge')} tone="accent" icon="diamond-outline" /> : null}
                    <IconButton icon={fav ? 'star' : 'star-outline'} tone={fav ? 'accent' : 'default'} label={fav ? t('favorites.remove') : t('favorites.add')} onPress={() => toggle(tool.id)} />
                  </Row>
                }
              />
            );
          })}
        </Card>
      ))}
      <AdBanner />
    </Screen>
  );
}
