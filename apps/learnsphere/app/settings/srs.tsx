import { Button, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Panel, Stepper } from '@/components/ui';
import { DEFAULT_SRS } from '@/config/limits';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/** Advanced spaced-repetition settings (Premium). Free learners use the defaults. */
export default function SrsSettings() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const srs = usePreferences((s) => s.srs);
  const set = usePreferences((s) => s.set);
  const update = (patch: Partial<typeof srs>) => set({ srs: { ...srs, ...patch } });

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('flashcards.settings') }} />
      <Panel title={t('srs.howItWorks')} icon="information-circle-outline">
        <Text variant="bodySmall" tone="muted">
          {t('srs.explanation')}
        </Text>
      </Panel>
      {isPremium ? (
        <Panel title={t('srs.advanced')} icon="sparkles-outline">
          <Stepper label={t('srs.newPerDay')} value={srs.newCardsPerDay} onChange={(v) => update({ newCardsPerDay: v })} min={0} max={200} step={5} />
          <Stepper label={t('srs.maxReviews')} value={srs.maxReviewsPerDay} onChange={(v) => update({ maxReviewsPerDay: v })} min={10} max={1000} step={10} />
          <Stepper label={t('srs.intervalModifier')} value={Math.round(srs.intervalModifier * 100)} onChange={(v) => update({ intervalModifier: v / 100 })} min={50} max={200} step={10} format={(v) => `${v}%`} />
          <Text variant="caption" tone="subtle">
            {t('srs.intervalHelp')}
          </Text>
          <Button size="md" variant="ghost" label={t('srs.reset')} onPress={() => set({ srs: DEFAULT_SRS })} />
        </Panel>
      ) : (
        <Panel title={t('srs.advanced')} icon="lock-closed-outline">
          <Text variant="bodySmall" tone="muted">
            {t('srs.premiumOnly', { newCards: DEFAULT_SRS.newCardsPerDay, reviews: DEFAULT_SRS.maxReviewsPerDay })}
          </Text>
          <Button size="md" label={t('premium.learnMore')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'srs' } })} />
        </Panel>
      )}
    </Screen>
  );
}
