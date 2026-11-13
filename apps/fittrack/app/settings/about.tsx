import { Card, Screen, SectionHeader, Text } from '@factory/design-system';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LIBRARY } from '@/content/exercises';
import { TEMPLATES } from '@/content/templates';

/** How FitTrack computes things — every estimate is explained and labelled as such. */
export default function About() {
  const { t } = useTranslation();
  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('settings.about') }} />
      <SectionHeader title={t('about.calculations')} />
      {(['oneRm', 'volume', 'pace', 'calories', 'streaks', 'stats'] as const).map((k) => (
        <Card key={k}>
          <Text variant="subheading">{t(`about.${k}.title`)}</Text>
          <Text variant="bodySmall" tone="muted">{t(`about.${k}.body`)}</Text>
        </Card>
      ))}
      <SectionHeader title={t('about.disclaimerTitle')} />
      <Card tone="alt">
        <Text variant="bodySmall">{t('about.disclaimer')}</Text>
      </Card>
      <Text variant="caption" tone="subtle">
        {t('about.version', { version: Constants.expoConfig?.version ?? '1.0.0', exercises: LIBRARY.length, templates: TEMPLATES.length })}
      </Text>
    </Screen>
  );
}
