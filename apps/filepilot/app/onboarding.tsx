import { Button, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FREE_LIMITS } from '@/config/limits';
import { recordError } from '@/services/analytics';
import { completeOnboarding } from '@/services/settingsActions';

const SLIDES: { key: 'privacy' | 'tools' | 'free'; icon: IconName }[] = [
  { key: 'privacy', icon: 'shield-checkmark' },
  { key: 'tools', icon: 'construct' },
  { key: 'free', icon: 'sparkles' },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const slide = (SLIDES[index] ?? SLIDES[0]) as (typeof SLIDES)[number];
  const last = index === SLIDES.length - 1;

  const finish = async () => {
    setBusy(true);
    try {
      await completeOnboarding(consent);
      router.replace('/(tabs)');
    } catch (e) {
      recordError(e, 'onboarding');
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']} testID="onboarding">
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
        <Text variant="subheading" tone="primary">
          FilePilot
        </Text>
        {!last ? (
          <Pressable onPress={() => setIndex(SLIDES.length - 1)} accessibilityRole="button" hitSlop={12}>
            <Text variant="bodySmall" tone="muted" style={{ fontWeight: '700' }}>
              {t('common.skip')}
            </Text>
          </Pressable>
        ) : null}
      </Row>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 20 }}>
        <View style={{ alignSelf: 'center', width: 112, height: 112, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
          <Icon name={slide.icon} size={54} color={theme.colors.primary} />
        </View>
        <Text variant="display" center accessibilityRole="header">
          {t(`onboarding.${slide.key}.title`)}
        </Text>
        <Text tone="muted" center>
          {t(`onboarding.${slide.key}.body`)}
        </Text>
        <Stack gap={2}>
          {[1, 2, 3].map((n) => (
            <Row key={n} gap={3}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {t(`onboarding.${slide.key}.point${n}`, { count: FREE_LIMITS.dailyOperations })}
              </Text>
            </Row>
          ))}
        </Stack>
        {last ? (
          <Row gap={3} style={{ padding: 14, borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="subheading">{t('onboarding.analyticsTitle')}</Text>
              <Text variant="caption" tone="muted">
                {t('onboarding.analyticsBody')}
              </Text>
            </View>
            <Switch value={consent} onValueChange={setConsent} accessibilityLabel={t('onboarding.analyticsTitle')} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} testID="analytics-consent" />
          </Row>
        ) : null}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 14 }}>
        <Row gap={2} style={{ justifyContent: 'center' }} accessibilityLabel={t('onboarding.step', { current: index + 1, total: SLIDES.length })}>
          {SLIDES.map((s, i) => (
            <View key={s.key} style={{ width: i === index ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === index ? theme.colors.primary : theme.colors.border }} />
          ))}
        </Row>
        <Button label={last ? t('onboarding.start') : t('common.next')} onPress={last ? finish : () => setIndex(index + 1)} loading={busy} testID="onboarding-next" />
      </View>
    </SafeAreaView>
  );
}
