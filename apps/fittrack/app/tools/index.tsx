import { Card, Icon, Row, Screen, Stack as UIStack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PremiumBadge } from '@/components/ui';
import { PREMIUM_TIMERS, type TimerKind } from '@/features/timers/engine';
import { useIsPremium } from '@/store/session';

const TOOLS: { kind: TimerKind; icon: IconName }[] = [
  { kind: 'rest', icon: 'hourglass-outline' },
  { kind: 'stopwatch', icon: 'stopwatch-outline' },
  { kind: 'countdown', icon: 'timer-outline' },
  { kind: 'interval', icon: 'repeat-outline' },
  { kind: 'tabata', icon: 'flash-outline' },
  { kind: 'emom', icon: 'reload-outline' },
];

/** Workout tools — all offline, all computed from timestamps. */
export default function Tools() {
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('tools.title') }} />
      {TOOLS.map((tool) => (
        <Card key={tool.kind} onPress={() => router.push({ pathname: '/tools/[kind]', params: { kind: tool.kind } })} accessibilityLabel={t(`tools.${tool.kind}.name`)} testID={`tool-${tool.kind}`}>
          <Row gap={3}>
            <Icon name={tool.icon} size={26} color={theme.colors.primary} />
            <UIStack gap={0} style={{ flex: 1 }}>
              <Text variant="subheading">{t(`tools.${tool.kind}.name`)}</Text>
              <Text variant="caption" tone="muted">{t(`tools.${tool.kind}.desc`)}</Text>
            </UIStack>
            {PREMIUM_TIMERS.includes(tool.kind) && !premium ? <PremiumBadge /> : null}
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
