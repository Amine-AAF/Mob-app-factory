import { Button, Card, Icon, IconButton, ProgressBar, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckRow, Segmented, Stepper, useQuantityLabel } from '@/components/ui';
import { repos } from '@/database';
import { ingredientName } from '@/domain/ingredients';
import { servingsFactor } from '@/domain/quantity';
import { formatClock } from '@/domain/time';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { track } from '@/services/analytics';
import { cancelTimer, requestPermission, scheduleTimer } from '@/services/notifications';
import { getRecipe } from '@/services/recipeCatalog';
import { dataChanged } from '@/store/session';

/**
 * Cooking mode: large text, one step at a time, ingredient check-list,
 * timer (with a local notification so it rings even if the screen is off),
 * the screen is kept awake. No ads here, ever.
 */
export default function CookingMode() {
  useKeepAwake();
  const { t, lng } = useLang();
  const theme = useTheme();
  const q = useQuantityLabel();
  const params = useLocalSearchParams<{ id: string; servings?: string; entry?: string }>();
  const { data } = useAsync(() => getRecipe(params.id, lng), [params.id, lng]);
  const [servings, setServings] = useState<number | null>(params.servings ? Number(params.servings) : null);
  const [tab, setTab] = useState<'steps' | 'ingredients'>('steps');
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState<{ endsAt: number; total: number; notificationId: string | null } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [custom, setCustom] = useState(5);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(
    () => () => {
      // Leaving cooking mode cancels a pending timer notification.
      if (timer?.notificationId) void cancelTimer(timer.notificationId);
    },
    [timer],
  );

  const recipe = data;
  if (!recipe) return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} />;

  const portions = servings ?? recipe.servings;
  const factor = servingsFactor(recipe.servings, portions);
  const current = recipe.steps[step];
  const last = step >= recipe.steps.length - 1;
  const remaining = timer ? Math.max(0, (timer.endsAt - now) / 1000) : 0;
  const ringing = timer !== null && remaining <= 0;

  const startTimer = async (minutes: number) => {
    if (timer?.notificationId) await cancelTimer(timer.notificationId);
    const seconds = Math.round(minutes * 60);
    await requestPermission(t);
    const notificationId = await scheduleTimer(seconds, t('cook.timerDoneTitle'), t('cook.timerDoneBody', { title: recipe.title }));
    setNow(Date.now());
    setTimer({ endsAt: Date.now() + seconds * 1000, total: seconds, notificationId });
  };

  const stopTimer = async () => {
    if (timer?.notificationId) await cancelTimer(timer.notificationId);
    setTimer(null);
  };

  const finish = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    await stopTimer();
    await repos().recipes.logHistory(recipe.id, 'cooked');
    if (params.entry) await repos().plan.setCooked(Number(params.entry), true);
    track('cooking_mode_completed', { builtin: recipe.source === 'builtin' });
    dataChanged();
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} testID="cooking-mode">
      <Row style={{ paddingHorizontal: 12, paddingTop: 4, justifyContent: 'space-between' }}>
        <IconButton icon="close" label={t('cook.exit')} onPress={() => router.back()} />
        <Text variant="subheading" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          {recipe.title}
        </Text>
        <View style={{ width: 44 }} />
      </Row>
      <View style={{ paddingHorizontal: 20, gap: 12, paddingBottom: 8 }}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'steps', label: t('recipe.steps'), icon: 'list' },
            { value: 'ingredients', label: t('cook.ingredientsChecked', { done: checked.size, total: recipe.ingredients.length }), icon: 'checkbox-outline' },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        {tab === 'steps' && current ? (
          <Stack gap={4}>
            <ProgressBar progress={(step + 1) / recipe.steps.length} label={t('cook.stepOf', { current: step + 1, total: recipe.steps.length })} />
            <Text variant="label" tone="primary" accessibilityLiveRegion="polite">
              {t('cook.stepOf', { current: step + 1, total: recipe.steps.length })}
            </Text>
            <Text style={{ fontSize: 24, lineHeight: 34, fontWeight: '500' }} testID="cook-step-text">
              {current.text}
            </Text>
            {current.timerMinutes && !timer ? (
              <Button label={t('cook.startTimer', { count: current.timerMinutes })} icon="timer-outline" variant="accent" onPress={() => void startTimer(current.timerMinutes!)} testID="cook-step-timer" />
            ) : null}
          </Stack>
        ) : null}

        {tab === 'ingredients' ? (
          <Stack gap={2}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="subheading">{t('recipe.servings')}</Text>
              <Stepper value={portions} onChange={setServings} min={1} max={24} label={t('recipe.servings')} />
            </Row>
            {recipe.ingredients.map((ing, i) => (
              <CheckRow
                key={`${ing.key}-${i}`}
                checked={checked.has(i)}
                onToggle={() =>
                  setChecked((s) => {
                    const next = new Set(s);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  })
                }
                title={`${q(ing.quantity, ing.unit, { factor })} · ${ingredientName(ing.key, lng, ing.name)}`}
                subtitle={ing.note}
                testID={`cook-ing-${i}`}
              />
            ))}
          </Stack>
        ) : null}

        <Card tone={ringing ? 'accent' : 'default'} testID="cook-timer">
          <Row gap={2}>
            <Icon name={ringing ? 'alarm' : 'timer-outline'} size={22} color={ringing ? theme.colors.accent : theme.colors.primary} />
            <Text variant="subheading" style={{ flex: 1 }}>
              {ringing ? t('cook.timerDoneTitle') : t('cook.timer')}
            </Text>
            {timer ? (
              <Text style={{ fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] }} accessibilityLabel={t('cook.timeLeft', { time: formatClock(remaining) })}>
                {formatClock(remaining)}
              </Text>
            ) : null}
          </Row>
          {timer ? (
            <>
              <ProgressBar progress={timer.total ? 1 - remaining / timer.total : 1} tone="accent" />
              <Button label={ringing ? t('cook.dismiss') : t('cook.stopTimer')} variant="secondary" size="md" onPress={() => void stopTimer()} />
            </>
          ) : (
            <Row style={{ justifyContent: 'space-between' }}>
              <Stepper value={custom} onChange={setCustom} min={1} max={240} label={t('cook.minutes')} format={(v) => `${v} min`} />
              <Button label={t('cook.start')} size="md" icon="play" onPress={() => void startTimer(custom)} />
            </Row>
          )}
        </Card>
      </ScrollView>

      {tab === 'steps' ? (
        <Row gap={3} style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
          <View style={{ flex: 1 }}>
            <Button label={t('cook.previous')} variant="secondary" icon="chevron-back" onPress={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} testID="cook-prev" />
          </View>
          <View style={{ flex: 1 }}>
            {last ? (
              <Button label={t('cook.finish')} icon="checkmark-done" onPress={() => void finish()} testID="cook-finish" />
            ) : (
              <Button label={t('cook.next')} icon="chevron-forward" onPress={() => setStep((s) => Math.min(recipe.steps.length - 1, s + 1))} testID="cook-next" />
            )}
          </View>
        </Row>
      ) : null}
    </SafeAreaView>
  );
}
