import { Badge, Button, Card, Chip, Icon, OptionCard, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CHALLENGES } from '@/content';
import { repos } from '@/database';
import { canUseTimer, CATEGORIES, difficultyUnlocked, DIFFICULTIES, suggestDifficulty, TIMER_OPTIONS, UNLOCK_THRESHOLD, type Category, type Difficulty, type TimerOption } from '@/engine';
import { useAsync } from '@/hooks';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { CATEGORY_META } from '@/theme/game';

type Target = Category | 'mixed';

/** Difficulty + timer selection for a category, or for the Timed Challenge (`/mode/timed`). */
export default function ModeSetup() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ category: string }>();
  const timedMode = params.category === 'timed';
  const isPremium = useIsPremium();
  const start = usePreferences((s) => s.startingDifficulty);
  const defaultTimer = usePreferences((s) => s.defaultTimer);
  const [target, setTarget] = useState<Target>(timedMode ? 'mixed' : ((CATEGORIES as readonly string[]).includes(params.category) ? (params.category as Category) : 'sequence'));
  const [picked, setPicked] = useState<Difficulty | null>(null);
  const [timer, setTimer] = useState<TimerOption>(timedMode ? 60 : defaultTimer);
  const isMemory = target === 'memory';

  const { data } = useAsync(async () => {
    const r = repos();
    const solved = await r.progress.solvedCounts();
    const suggestion = target === 'mixed' ? null : suggestDifficulty('easy', await r.progress.recentFirstTry(target, 'easy'));
    return { solved, suggestion };
  }, [target]);

  const status = (d: Difficulty): 'open' | 'premium' | 'locked' => {
    if (d === 'hard' && !isPremium) return 'premium';
    if (target !== 'mixed' && data && !difficultyUnlocked(target, d, data.solved, start)) return 'locked';
    return 'open';
  };
  const firstOpen = DIFFICULTIES.filter((d) => status(d) === 'open').at(-1) ?? 'easy';
  const difficulty = picked ?? (start === 'medium' && status('medium') === 'open' ? 'medium' : firstOpen === 'hard' ? 'medium' : firstOpen);
  const effectiveTimer: TimerOption = isMemory ? 0 : timer;

  const choose = (d: Difficulty) => {
    const s = status(d);
    if (s === 'premium') return router.push({ pathname: '/paywall', params: { source: 'hard_difficulty' } });
    if (s === 'open') setPicked(d);
  };
  const chooseTimer = (o: TimerOption) => (canUseTimer(o, isPremium) ? setTimer(o) : router.push({ pathname: '/paywall', params: { source: 'marathon_timer' } }));

  const play = () =>
    router.push({ pathname: '/game', params: { mode: 'standard', category: target, difficulty, timer: String(effectiveTimer) } });

  const total = (d: Difficulty) => (target === 'mixed' ? CHALLENGES.filter((c) => c.difficulty === d && c.category !== 'memory').length : CHALLENGES.filter((c) => c.category === target && c.difficulty === d).length);
  const solvedAt = (d: Difficulty) => (data && target !== 'mixed' ? data.solved[target][d] : null);
  const title = timedMode ? t('play.timedTitle') : t(`category.${target as Category}.name`);

  return (
    <>
      <RouterStack.Screen options={{ title }} />
      <Screen edges={[]} testID="mode-setup" footer={<Button label={t('mode.play')} icon="play" onPress={play} disabled={status(difficulty) !== 'open'} testID="start-game" />}>
        {!timedMode ? (
          <Card tone="alt">
            <Row gap={3}>
              <Icon name={CATEGORY_META[target as Category].icon} size={28} color={CATEGORY_META[target as Category][theme.scheme]} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {t(`category.${target as Category}.howTo`)}
              </Text>
            </Row>
          </Card>
        ) : (
          <Stack gap={2}>
            <Text variant="bodySmall" tone="muted">
              {t('mode.timedIntro')}
            </Text>
            <Row wrap gap={2}>
              {(['mixed', 'sequence', 'pattern', 'deduction'] as Target[]).map((c) => (
                <Chip key={c} label={c === 'mixed' ? t('category.mixed.name') : t(`category.${c}.name`)} selected={target === c} onPress={() => setTarget(c)} />
              ))}
            </Row>
          </Stack>
        )}

        <Text variant="heading" accessibilityRole="header">
          {t('mode.difficulty')}
        </Text>
        <Stack gap={2} accessibilityRole="radiogroup">
          {DIFFICULTIES.map((d) => {
            const s = status(d);
            const solved = solvedAt(d);
            const subtitle =
              s === 'locked'
                ? t('mode.lockedHint', { count: Math.max(0, UNLOCK_THRESHOLD - (solvedAt(d === 'medium' ? 'easy' : 'medium') ?? 0)), previous: t(`difficulty.${d === 'medium' ? 'easy' : 'medium'}`) })
                : solved !== null
                  ? `${t(`difficulty.${d}Desc`)} · ${t('home.solvedOf', { solved, total: total(d) })}`
                  : t(`difficulty.${d}Desc`);
            return (
              <OptionCard
                key={d}
                title={`${t(`difficulty.${d}`)}${s === 'premium' ? ` · ${t('common.premium')}` : ''}`}
                subtitle={subtitle}
                icon={s === 'locked' ? 'lock-closed' : s === 'premium' ? 'diamond' : d === 'easy' ? 'leaf-outline' : d === 'medium' ? 'flash-outline' : 'flame-outline'}
                selected={difficulty === d && s === 'open'}
                onPress={() => choose(d)}
                testID={`difficulty-${d}`}
              />
            );
          })}
        </Stack>
        {data?.suggestion && data.suggestion !== 'easy' && status(data.suggestion) === 'open' && difficulty === 'easy' ? <Badge label={t('mode.suggestUp', { difficulty: t(`difficulty.${data.suggestion}`) })} tone="success" icon="trending-up" /> : null}

        {!isMemory ? (
          <>
            <Text variant="heading" accessibilityRole="header">
              {t('mode.timer')}
            </Text>
            <Row wrap gap={2}>
              {TIMER_OPTIONS.filter((o) => !timedMode || o > 0).map((o) => (
                <Chip key={o} label={`${o === 0 ? t('mode.untimed') : t(`mode.timer${o}`)}${canUseTimer(o, isPremium) ? '' : ' 🔒'}`} selected={timer === o} onPress={() => chooseTimer(o)} icon={o === 0 ? 'infinite' : 'stopwatch-outline'} testID={`timer-${o}`} />
              ))}
            </Row>
            <Text variant="caption" tone="muted">
              {effectiveTimer > 0 ? t('mode.timerHelp') : t('mode.untimedHelp')}
            </Text>
          </>
        ) : (
          <Text variant="caption" tone="muted">
            {t('mode.memoryNoTimer')}
          </Text>
        )}
      </Screen>
    </>
  );
}
