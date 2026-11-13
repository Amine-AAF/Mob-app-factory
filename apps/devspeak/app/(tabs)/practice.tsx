import { Badge, Button, Card, CodeLabel, Icon, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { repos } from '@/database';
import type { PracticeMode } from '@/features/practice/exercises';
import { FREE_DAILY_PRACTICE, grantBonus, REWARDED_BONUS, remainingPractice } from '@/features/practice/limits';
import { useAsync } from '@/hooks/useAsync';
import { useRewardedAd } from '@/hooks/useRewardedAd';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

const MODES: { mode: PracticeMode; icon: IconName; key: string }[] = [
  { mode: 'listening', icon: 'ear-outline', key: 'listening' },
  { mode: 'readAloud', icon: 'megaphone-outline', key: 'readAloud' },
  { mode: 'completion', icon: 'create-outline', key: 'completion' },
  { mode: 'dialogue', icon: 'people-outline', key: 'dialogue' },
  { mode: 'interview', icon: 'mic-outline', key: 'interview' },
  { mode: 'explain', icon: 'bulb-outline', key: 'explain' },
];

export default function Practice() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const bonus = usePreferences((s) => s.bonusPractice);
  const setPrefs = usePreferences((s) => s.set);
  const [adMessage, setAdMessage] = useState<string | null>(null);
  const { data: doneToday } = useAsync(() => repos().progress.speakingDoneOn(clock.now()), []);
  const remaining = remainingPractice({ isPremium, doneToday: doneToday ?? 0, bonus, today: clock.today() });
  const rewarded = useRewardedAd(!isPremium && remaining === 0);

  const watchAd = async () => {
    setAdMessage(null);
    const shown = await rewarded.show(() => setPrefs({ bonusPractice: grantBonus(usePreferences.getState().bonusPractice, clock.today()) }));
    if (!shown) setAdMessage(t('practice.adNotReady'));
  };

  return (
    <Screen>
      <Stack gap={1}>
        <CodeLabel>practice</CodeLabel>
        <Text variant="title" accessibilityRole="header">
          {t('practice.title')}
        </Text>
        <Text tone="muted">{t('practice.subtitle')}</Text>
      </Stack>

      <Card tone="accent" onPress={() => router.push('/challenge')} accessibilityLabel={t('home.dailyChallenge')}>
        <Row>
          <Icon name="flash" size={22} color={theme.colors.accent} />
          <Text variant="subheading" style={{ flex: 1 }}>
            {t('home.dailyChallenge')}
          </Text>
          <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
        </Row>
      </Card>

      {!isPremium ? (
        <Card tone="alt">
          <Text variant="bodySmall" style={{ fontWeight: '700' }}>
            {remaining > 0 ? t('practice.remainingToday', { count: remaining }) : t('practice.limitReached')}
          </Text>
          <Text variant="caption" tone="muted">
            {t('practice.dailyLimit', { count: FREE_DAILY_PRACTICE })}
          </Text>
          {remaining === 0 ? (
            <Stack gap={2}>
              <Button label={t('practice.watchAd', { count: REWARDED_BONUS })} variant="secondary" icon="play-circle-outline" size="md" onPress={watchAd} disabled={!rewarded.ready} />
              <Button label={t('practice.unlimited')} icon="diamond-outline" size="md" onPress={() => router.push({ pathname: '/paywall', params: { source: 'practice_limit' } })} />
              {adMessage ? (
                <Text variant="caption" tone="muted">
                  {adMessage}
                </Text>
              ) : null}
            </Stack>
          ) : null}
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {MODES.map((m) => (
          <Card
            key={m.mode}
            style={{ width: '47.5%', minHeight: 150 }}
            onPress={() => (remaining > 0 ? router.push({ pathname: '/speaking/[mode]', params: { mode: m.mode } }) : router.push({ pathname: '/paywall', params: { source: 'practice_limit' } }))}
            accessibilityLabel={t(`practice.${m.key}`)}
            testID={`practice-${m.mode}`}
          >
            <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={m.icon} size={22} color={theme.colors.primary} />
            </View>
            <Text variant="subheading">{t(`practice.${m.key}`)}</Text>
            <Text variant="caption" tone="muted">
              {t(`practice.${m.key}Desc`)}
            </Text>
          </Card>
        ))}
      </View>
      <Row gap={2} style={{ alignItems: 'flex-start' }}>
        <Icon name="information-circle-outline" size={16} color={theme.colors.textMuted} />
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>
          {t('practice.honestNote')}
        </Text>
      </Row>
      {isPremium ? <Badge label={t('common.premium')} tone="accent" icon="diamond" /> : null}
    </Screen>
  );
}
