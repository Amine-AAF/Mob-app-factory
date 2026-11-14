import { Card, Icon, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AnimatedBar } from '@/components/ui';
import { repos } from '@/database';
import { BADGES, levelInfo } from '@/features/gamification/rewards';
import { useAsync } from '@/hooks';
import { fmt } from '@/i18n';

/** Level and badges, all derived from validated completions (see features/gamification). */
export default function AchievementsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useAsync(async () => ({ xp: await repos().logs.totalXp(), unlocked: await repos().achievements.unlocked() }), []);
  const info = levelInfo(data?.xp ?? 0);
  const unlocked = new Map((data?.unlocked ?? []).map((u) => [u.id, u.unlockedAt]));

  return (
    <>
      <RouterStack.Screen options={{ title: t('badges.title') }} />
      <Screen edges={['bottom']}>
        <Card tone="primary">
          <Text variant="heading">{t('today.level', { level: info.level })}</Text>
          <AnimatedBar progress={info.progress} label={t('badges.levelProgress')} />
          <Text variant="caption" tone="muted">
            {t('badges.xpLine', { xp: fmt.number(data?.xp ?? 0), next: fmt.number(Math.max(0, info.xpForNext - info.xpIntoLevel)) })}
          </Text>
          <Text variant="caption" tone="subtle">
            {t('badges.rules')}
          </Text>
        </Card>
        <Stack gap={2}>
          {BADGES.map((b) => {
            const at = unlocked.get(b.id);
            return (
              <Card key={b.id} tone={at ? 'default' : 'alt'} accessibilityLabel={`${t(`badges.items.${b.id}.name`)}, ${at ? t('badges.unlockedState') : t('badges.lockedState')}`}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: at ? 1 : 0.55 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: at ? theme.colors.accentSoft : theme.colors.surfaceAlt }}>
                    <Icon name={(at ? b.icon : `${b.icon}-outline`) as IconName} size={22} color={at ? theme.colors.accent : theme.colors.textSubtle} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="subheading">{t(`badges.items.${b.id}.name`)}</Text>
                    <Text variant="caption" tone="muted">
                      {t(`badges.items.${b.id}.desc`)}
                    </Text>
                  </View>
                  {at ? <Icon name="checkmark-circle" size={20} color={theme.colors.success} /> : <Icon name="lock-closed-outline" size={18} color={theme.colors.textSubtle} />}
                </View>
              </Card>
            );
          })}
        </Stack>
      </Screen>
    </>
  );
}
