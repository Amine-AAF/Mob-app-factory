import { Badge, Button, Card, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { InfoNote, PremiumBadge } from '@/components/ui';
import { TEMPLATES } from '@/content/templates';
import { repos } from '@/database';
import { useExercises, useFormat } from '@/hooks';
import { currentLanguage } from '@/i18n';
import { adsSdk, adUnits, countActivityForAds, interstitialAllowed, markInterstitialShown } from '@/services/ads';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { planFromTemplateDay, startEmpty, WorkoutError } from '@/services/workoutService';
import { useIsPremium, useSession } from '@/store/session';

/** Shows the single interstitial placement (after adopting a template), when the policy allows it. */
function maybeShowInterstitial(premium: boolean) {
  const now = clock.now().getTime();
  countActivityForAds();
  if (!interstitialAllowed({ adsDisabled: premium, now, workoutActive: !!useSession.getState().activeSessionId })) return;
  const sdk = adsSdk();
  if (!sdk || !adUnits.interstitial) return;
  try {
    const ad = sdk.InterstitialAd.createForAdRequest(adUnits.interstitial, { requestNonPersonalizedAdsOnly: true });
    const off = ad.addAdEventListener(sdk.AdEventType.LOADED, () => {
      off();
      markInterstitialShown(clock.now().getTime());
      ad.show().catch(() => undefined);
    });
    ad.load();
  } catch (e) {
    recordError(e, 'interstitial');
  }
}

export default function TemplateDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const premium = useIsPremium();
  const ex = useExercises();
  const f = useFormat();
  const lng = currentLanguage();
  const tpl = TEMPLATES.find((x) => x.id === id);
  const [busy, setBusy] = useState(false);
  if (!tpl) return <EmptyState icon="alert-circle" title={t('common.notFound')} />;
  const locked = tpl.premium && !premium;

  const adopt = async () => {
    if (locked) return router.push({ pathname: '/paywall', params: { source: 'template' } });
    setBusy(true);
    try {
      const pid = await repos().programs.createFromTemplate(tpl, lng);
      track('program_created', { origin: 'template', type: tpl.type });
      useSession.getState().bump();
      router.replace({ pathname: '/program/[id]', params: { id: pid } });
      maybeShowInterstitial(premium);
    } finally {
      setBusy(false);
    }
  };

  const tryNow = async (dayIndex: number) => {
    if (locked) return router.push({ pathname: '/paywall', params: { source: 'template' } });
    const day = tpl.days[dayIndex]!;
    try {
      await startEmpty(repos(), tpl.days.length > 1 ? `${tpl.i18n[lng].name} · ${day.name[lng]}` : tpl.i18n[lng].name, planFromTemplateDay(day));
      router.push('/workout/active');
    } catch (e) {
      if (e instanceof WorkoutError && e.code === 'already_active') Alert.alert(t('workout.alreadyActiveTitle'), t('workout.alreadyActiveBody'), [{ text: t('common.ok'), onPress: () => router.push('/workout/active') }]);
    }
  };

  const target = (e: (typeof tpl.days)[number]['exercises'][number]) =>
    e.durationSec ? `${e.sets} × ${f.duration(e.durationSec)}` : e.repsMin === e.repsMax ? `${e.sets} × ${e.repsMin}` : `${e.sets} × ${e.repsMin}–${e.repsMax}`;

  return (
    <Screen edges={[]} footer={<Button label={locked ? t('premium.unlock') : t('templates.use')} icon={locked ? 'star' : 'add'} loading={busy} onPress={() => void adopt()} testID="adopt-template" />}>
      <RouterStack.Screen options={{ title: tpl.i18n[lng].name }} />
      <Stack gap={2}>
        <Row wrap gap={2}>
          <Badge label={t(`levels.${tpl.level}`)} tone="neutral" />
          <Badge label={t(`goals.${tpl.goal}`)} tone="primary" />
          <Badge label={t('templates.perWeek', { count: tpl.daysPerWeek })} tone="neutral" icon="calendar-outline" />
          <Badge label={t('units.minutesShort', { count: tpl.estMinutes })} tone="neutral" icon="time-outline" />
          {tpl.premium ? <PremiumBadge /> : null}
        </Row>
        <Text tone="muted">{tpl.i18n[lng].description}</Text>
      </Stack>
      {tpl.days.map((d, i) => (
        <Card key={i}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="heading">{d.name[lng]}</Text>
            <Button label={t('templates.tryNow')} size="md" variant="ghost" icon="play" onPress={() => void tryNow(i)} />
          </Row>
          {d.exercises.map((e, j) => (
            <Row key={j} style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.exerciseId } })}>
                {ex.get(e.exerciseId)?.name ?? e.exerciseId}
              </Text>
              <Text variant="bodySmall" tone="muted">
                {`${target(e)} · ${t('builder.restShort', { time: f.duration(e.restSec) })}`}
              </Text>
            </Row>
          ))}
        </Card>
      ))}
      <InfoNote text={t('templates.disclaimer')} />
    </Screen>
  );
}
