import { Badge, Card, Icon, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner, SectionTitle } from '@/components/ui';
import { CHALLENGES } from '@/content';
import { repos } from '@/database';
import { CATEGORIES } from '@/engine';
import { useAsync } from '@/hooks';
import { useIsPremium } from '@/store/session';
import { CATEGORY_META } from '@/theme/game';

/** Game mode selection: the four categories, the timed challenge and the Premium mixed mode. */
export default function Play() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { data: solved } = useAsync(() => repos().progress.solvedCounts(), []);

  return (
    <Screen testID="play">
      <Text variant="title" accessibilityRole="header">
        {t('play.title')}
      </Text>
      {CATEGORIES.map((c) => {
        const total = CHALLENGES.filter((x) => x.category === c).length;
        const done = solved ? solved[c].easy + solved[c].medium + solved[c].hard : 0;
        return (
          <Card key={c} onPress={() => router.push(`/mode/${c}`)} accessibilityLabel={`${t(`category.${c}.name`)}. ${t(`category.${c}.desc`)}`} testID={`play-${c}`}>
            <Row gap={3}>
              <View style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}>
                <Icon name={CATEGORY_META[c].icon} size={26} color={CATEGORY_META[c][theme.scheme]} />
              </View>
              <Stack gap={1} style={{ flex: 1 }}>
                <Text variant="heading">{t(`category.${c}.name`)}</Text>
                <Text variant="bodySmall" tone="muted">
                  {t(`category.${c}.desc`)}
                </Text>
              </Stack>
              <Icon name="chevron-forward" size={20} color={theme.colors.textSubtle} />
            </Row>
            <ProgressBar progress={done / total} label={t('home.solvedOf', { solved: done, total })} />
            <Text variant="caption" tone="muted">
              {t('home.solvedOf', { solved: done, total })}
            </Text>
          </Card>
        );
      })}

      <SectionTitle icon="flash-outline">{t('play.special')}</SectionTitle>
      <Card tone="accent" onPress={() => router.push('/mode/timed')} accessibilityLabel={t('play.timedTitle')} testID="play-timed">
        <Row gap={3}>
          <Icon name="stopwatch" size={28} color={theme.colors.accent} />
          <Stack gap={1} style={{ flex: 1 }}>
            <Text variant="heading">{t('play.timedTitle')}</Text>
            <Text variant="bodySmall">{t('play.timedDesc')}</Text>
          </Stack>
        </Row>
      </Card>
      <Card
        tone="primary"
        onPress={() => (isPremium ? router.push({ pathname: '/game', params: { mode: 'mixed', category: 'mixed', difficulty: 'any', timer: '0' } }) : router.push({ pathname: '/paywall', params: { source: 'mixed_mode' } }))}
        accessibilityLabel={t('play.mixedTitle')}
        testID="play-mixed"
      >
        <Row gap={3}>
          <Icon name="shuffle" size={28} color={theme.colors.primary} />
          <Stack gap={1} style={{ flex: 1 }}>
            <Row gap={2}>
              <Text variant="heading">{t('play.mixedTitle')}</Text>
              {!isPremium ? <Badge label={t('common.premium')} tone="accent" icon="diamond" /> : null}
            </Row>
            <Text variant="bodySmall">{t('play.mixedDesc')}</Text>
          </Stack>
        </Row>
      </Card>
      <AdBanner />
    </Screen>
  );
}
