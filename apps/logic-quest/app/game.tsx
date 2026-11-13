import { Badge, Button, Card, Icon, IconButton, ProgressBar, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, BackHandler, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChallengeView } from '@/components/ChallengeView';
import { AchievementBadge, FeedbackPanel, Reveal } from '@/components/ui';
import {
  applyHint,
  describeChallenge,
  nextQuestion,
  quitSession,
  remainingMs,
  retry,
  revealSolution,
  startSession,
  submitAnswer,
  summarize,
  tick,
  type Category,
  type Challenge,
  type DailyChallenge,
  type Difficulty,
  type PlayerAnswer,
  type QuestionResult,
  type SessionState,
  type TimerOption,
} from '@/engine';
import { useContentT, useInterstitial, useNow, useRewardedAd } from '@/hooks';
import { interstitialAllowed, rewardedAvailable } from '@/services/ads';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { dailyFor, dailyStatus, settleDaily } from '@/services/dailyService';
import { feedback } from '@/services/feedback';
import { AccessError, beginGame, buildQueue, endGame, grantAdHint, hintBalance, settleQuestion, spendHint, type GameSetup } from '@/services/gameService';
import { usePreferences } from '@/store/preferences';
import { useAdsDisabled, useIsPremium, useSession } from '@/store/session';

type Params = { mode?: string; category?: string; difficulty?: string; timer?: string };

const now = () => clock.now().getTime();

export default function Game() {
  const { t } = useTranslation();
  const theme = useTheme();
  const ct = useContentT();
  const params = useLocalSearchParams<Params>();
  const isPremium = useIsPremium();
  const adsDisabled = useAdsDisabled();
  const relaxed = usePreferences((s) => s.relaxedTiming);
  const start = usePreferences((s) => s.startingDifficulty);

  const isDaily = params.mode === 'daily';
  const setup = useMemo<GameSetup>(
    () => ({
      mode: params.mode === 'mixed' ? 'mixed' : 'standard',
      category: (params.category ?? 'sequence') as Category | 'mixed',
      difficulty: (params.difficulty ?? 'easy') as Difficulty | 'any',
      timer: Number(params.timer ?? 0) as TimerOption,
    }),
    [params.mode, params.category, params.difficulty, params.timer],
  );

  const [queue, setQueue] = useState<Challenge[] | null>(null);
  const [daily, setDaily] = useState<DailyChallenge | null>(null);
  const [state, setState] = useState<SessionState | null>(null);
  const [error, setError] = useState<'premium' | 'locked' | 'empty' | 'done' | 'generic' | null>(null);
  const [lastAnswer, setLastAnswer] = useState<PlayerAnswer | null>(null);
  const [xpByQuestion, setXpByQuestion] = useState<Record<number, number>>({});
  const [hintShown, setHintShown] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const [hints, setHints] = useState<{ remaining: number; canEarn: boolean }>({ remaining: 0, canEarn: false });
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const sessionId = useRef<string | null>(null);
  const ended = useRef(false);

  const rewarded = useRewardedAd(rewardedAvailable(adsDisabled));
  const interstitial = useInterstitial(!!state?.finished && !isDaily && interstitialAllowed({ adsDisabled, now: now() }));

  const refreshHints = useCallback(() => hintBalance(isPremium).then(setHints).catch(() => undefined), [isPremium]);

  /* -------------------------------------------------------------- start */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isDaily) {
          const d = dailyFor();
          if (await dailyStatus(d.day)) return !cancelled && setError('done');
          if (cancelled) return;
          setDaily(d);
          setQueue([d.challenge]);
          sessionId.current = `daily-${d.day}`;
          setState(startSession({ mode: 'daily', challengeIds: [d.challenge.id], timeLimitMs: null, maxAttempts: 2 }, now()));
        } else {
          const q = await buildQueue(setup, isPremium, undefined, start);
          if (cancelled) return;
          sessionId.current = await beginGame(setup);
          setQueue(q);
          setState(startSession({ mode: setup.timer > 0 ? 'timed' : setup.mode, challengeIds: q.map((c) => c.id), timeLimitMs: setup.timer > 0 ? setup.timer * 1000 : null, maxAttempts: setup.timer > 0 ? 1 : 2 }, now()));
        }
        await refreshHints();
      } catch (e) {
        if (e instanceof AccessError) setError(e.reason);
        else {
          recordError(e, 'game_start');
          setError('generic');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Start once per screen: entitlement changes mid-game must not rebuild the queue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const challenge = useMemo(() => (state && queue ? queue.find((c) => c.id === state.question.challengeId) ?? null : null), [state, queue]);
  const text = useMemo(() => (challenge ? describeChallenge(challenge, ct) : null), [challenge, ct]);

  /* -------------------------------------------------------------- timer */
  const timed = !!state && state.config.timeLimitMs !== null;
  const running = timed && !state?.finished && state?.question.phase === 'answering';
  const clockNow = useNow(250, running);
  // The engine decides when time is up; the interval only feeds it the current time.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setState((s) => (s && !s.finished ? tick(s, now()) : s)), 250);
    return () => clearInterval(id);
  }, [running]);
  const left = state ? remainingMs(state, clockNow) : null;

  /* ------------------------------------------------------------ settle */
  const finish = useCallback(
    async (final: SessionState) => {
      if (ended.current || !sessionId.current) return;
      ended.current = true;
      if (isDaily) return;
      try {
        const fresh = await endGame(sessionId.current, final, setup);
        setNewAchievements((a) => [...a, ...fresh]);
      } catch (e) {
        recordError(e, 'game_end');
      }
    },
    [isDaily, setup],
  );

  useEffect(() => {
    if (state?.finished) void finish(state);
  }, [state, finish]);

  const persist = async (c: Challenge, result: QuestionResult, index: number) => {
    try {
      const out = isDaily && daily ? await settleDaily(daily, result) : await settleQuestion(sessionId.current as string, c, result);
      setXpByQuestion((m) => ({ ...m, [index]: out.xp }));
      if (out.achievements.length) setNewAchievements((a) => [...a, ...out.achievements]);
    } catch (e) {
      recordError(e, 'settle');
    }
  };

  const onSubmit = (answer: PlayerAnswer) => {
    if (!state || !challenge) return;
    const out = submitAnswer(state, challenge, answer, now());
    setLastAnswer(answer);
    setState(out.state);
    if (out.correct) feedback.success();
    else feedback.error();
    if (out.result) void persist(challenge, out.result, out.state.index);
  };

  const onRetry = () => {
    if (!state) return;
    setLastAnswer(null);
    setState(retry(state, now()));
  };

  const onReveal = () => {
    if (!state || !challenge) return;
    const out = revealSolution(state, now());
    setState(out.state);
    if (out.result) void persist(challenge, out.result, out.state.index);
  };

  const onNext = () => {
    if (!state) return;
    setLastAnswer(null);
    setHintShown(false);
    setState(nextQuestion(state, now()));
  };

  const takeHint = async () => {
    if (!state || !challenge) return;
    if (state.question.hintUsed) {
      setHintShown(true);
      if (challenge.category === 'memory') setReplayToken((n) => n + 1);
      return;
    }
    const ok = await spendHint(isPremium, challenge, isPremium ? 'premium' : 'free');
    if (!ok) return;
    setState((s) => (s ? applyHint(s) : s));
    setHintShown(true);
    if (challenge.category === 'memory') setReplayToken((n) => n + 1);
    void refreshHints();
  };

  const earnHint = async () => {
    const shown = await rewarded.show(() => {
      void grantAdHint().then(refreshHints);
    });
    if (!shown) Alert.alert(t('game.adUnavailableTitle'), t('game.adUnavailableBody'));
  };

  const quit = useCallback(() => {
    if (!state || state.finished) return router.back();
    Alert.alert(t('game.quitTitle'), t('game.quitBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('game.quit'),
        style: 'destructive',
        onPress: () => {
          const q = quitSession(state, now());
          setState(q);
          if (isDaily || q.results.length === 0) router.back();
        },
      },
    ]);
  }, [state, isDaily, t]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      quit();
      return true;
    });
    return () => sub.remove();
  }, [quit]);

  /* ------------------------------------------------------------- render */
  if (error) {
    const msg = { premium: t('game.errorPremium'), locked: t('game.errorLocked'), empty: t('game.errorEmpty'), done: t('daily.alreadyDone'), generic: t('common.error') }[error];
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20, justifyContent: 'center' }} testID="game-error">
        <Stack gap={4}>
          <Text variant="title" center>
            {msg}
          </Text>
          {error === 'premium' ? <Button label={t('paywall.cta')} icon="diamond" onPress={() => router.replace({ pathname: '/paywall', params: { source: 'game_gate' } })} /> : null}
          <Button label={t('common.back')} variant="secondary" onPress={() => router.back()} />
        </Stack>
      </SafeAreaView>
    );
  }

  if (!state || !queue) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (state.finished) {
    return <Results state={state} xp={Object.values(xpByQuestion).reduce((s, v) => s + v, 0)} achievements={newAchievements} isDaily={isDaily} onDone={() => interstitial.showThen(() => router.back())} onAgain={() => interstitial.showThen(() => router.replace({ pathname: '/game', params }))} />;
  }

  const q = state.question;
  const total = timed ? null : state.config.challengeIds.length;
  const settled = q.phase === 'correct' || q.phase === 'failed';
  const isLast = state.index === state.config.challengeIds.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']} testID="game">
      <Row style={{ paddingHorizontal: 8, justifyContent: 'space-between' }}>
        <IconButton icon="close" label={t('game.quit')} onPress={quit} />
        <Text variant="subheading" accessibilityRole="header">
          {isDaily ? t('daily.title') : total ? t('game.progress', { current: state.index + 1, total }) : t('game.solvedCount', { count: state.results.filter((r) => r.correct).length })}
        </Text>
        <Badge label={t(`difficulty.${challenge?.difficulty ?? 'easy'}`)} tone="neutral" />
      </Row>
      {total ? <View style={{ paddingHorizontal: 20 }}><ProgressBar progress={(state.index + (settled ? 1 : 0)) / total} height={6} label={t('game.progress', { current: state.index + 1, total })} /></View> : null}
      {left !== null ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 6, gap: 4 }}>
          <ProgressBar progress={left / (state.config.timeLimitMs ?? 1)} tone={left < 10_000 ? 'accent' : 'primary'} height={8} label={t('game.timeLeft', { seconds: Math.ceil(left / 1000) })} />
          <Text variant="caption" tone={left < 10_000 ? 'warning' : 'muted'} accessibilityLiveRegion={left < 10_000 ? 'polite' : 'none'}>
            {q.phase === 'answering' ? t('game.timeLeft', { seconds: Math.ceil(left / 1000) }) : t('game.timerPaused')}
          </Text>
        </View>
      ) : null}

      {challenge && text ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Reveal key={challenge.id}>
            <Stack gap={1}>
              <Text variant="label" tone="accent">
                {t(`category.${challenge.category}.name`)}
              </Text>
              <Text variant="title">{text.title}</Text>
              <Text tone="muted">{text.instructions}</Text>
            </Stack>
          </Reveal>

          <ChallengeView key={`${challenge.id}-${q.attempts}-${q.phase === "answering"}-${replayToken}`} challenge={challenge} text={text} ct={ct} phase={q.phase} lastAnswer={lastAnswer} relaxed={relaxed} replayToken={replayToken} onSubmit={onSubmit} />

          {q.phase === 'answering' ? (
            <Stack gap={2}>
              {hintShown && challenge.category !== 'memory' ? (
                <Card tone="accent" testID="hint">
                  <Row gap={2}>
                    <Icon name="bulb" size={18} color={theme.colors.accent} />
                    <Text variant="bodySmall" style={{ flex: 1 }}>
                      {text.hint}
                    </Text>
                  </Row>
                </Card>
              ) : null}
              {!hintShown || challenge.category === 'memory' ? (
                hints.remaining > 0 || q.hintUsed ? (
                  <Button
                    label={challenge.category === 'memory' ? t('game.replay') : t('game.hint')}
                    variant="ghost"
                    icon="bulb-outline"
                    size="md"
                    onPress={takeHint}
                    accessibilityHint={isPremium ? t('game.hintPenalty') : t('game.hintsLeft', { count: hints.remaining })}
                    testID="hint-button"
                  />
                ) : hints.canEarn && rewarded.ready ? (
                  <Button label={t('game.earnHint')} variant="ghost" icon="play-circle-outline" size="md" onPress={earnHint} testID="earn-hint" />
                ) : (
                  <Button label={t('game.noHints')} variant="ghost" size="md" icon="diamond-outline" onPress={() => router.push({ pathname: '/paywall', params: { source: 'hints' } })} />
                )
              ) : null}
              {!isPremium && !hintShown ? (
                <Text variant="caption" tone="subtle" center>
                  {t('game.hintsLeft', { count: hints.remaining })} · {t('game.hintPenalty')}
                </Text>
              ) : null}
            </Stack>
          ) : null}

          <FeedbackPanel
            phase={q.phase}
            xp={settled ? (xpByQuestion[state.index] ?? null) : null}
            explanation={text.explanation}
            answerLabel={text.answerLabel}
            canRetry={q.attempts < state.config.maxAttempts}
            onRetry={onRetry}
            onReveal={onReveal}
            onNext={onNext}
            nextLabel={isLast ? t('game.seeResults') : t('game.next')}
          />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function Results({ state, xp, achievements, isDaily, onDone, onAgain }: { state: SessionState; xp: number; achievements: string[]; isDaily: boolean; onDone: () => void; onAgain: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const s = summarize(state);
  const showPaywallHint = !useSession((x) => x.entitlement.isPremium);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']} testID="results">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Reveal>
          <Stack gap={3} style={{ alignItems: 'center', paddingTop: 24 }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: s.perfect ? theme.colors.accentSoft : theme.colors.primarySoft }}>
              <Icon name={s.perfect ? 'sparkles' : state.endReason === 'time' ? 'stopwatch' : 'ribbon'} size={46} color={s.perfect ? theme.colors.accent : theme.colors.primary} />
            </View>
            <Text variant="display" center accessibilityRole="header">
              {s.perfect ? t('results.perfect') : state.endReason === 'time' ? t('results.timeUp') : isDaily ? t('results.dailyDone') : t('results.title')}
            </Text>
            <Text tone="muted" center>
              {t('results.summary', { correct: s.correct, count: s.answered })}
            </Text>
          </Stack>
        </Reveal>
        <Row gap={2}>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="title" tone="success" testID="results-xp">{`+${xp}`}</Text>
            <Text variant="caption" tone="muted">
              {t('results.xp')}
            </Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="title">{`${Math.round(s.accuracy * 100)}%`}</Text>
            <Text variant="caption" tone="muted">
              {t('results.accuracy')}
            </Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="title">{s.hintsUsed}</Text>
            <Text variant="caption" tone="muted">
              {t('results.hints')}
            </Text>
          </Card>
        </Row>
        {xp === 0 && s.correct > 0 ? (
          <Text variant="bodySmall" tone="muted" center>
            {t('results.replayNoXp')}
          </Text>
        ) : null}
        {achievements.length ? (
          <Card tone="accent">
            <Text variant="subheading">{t('results.newAchievements')}</Text>
            {achievements.map((id) => (
              <AchievementBadge key={id} id={id} unlockedAt={clock.now().toISOString()} />
            ))}
          </Card>
        ) : null}
        <Stack gap={2}>
          {!isDaily ? <Button label={t('results.again')} icon="refresh" onPress={onAgain} testID="play-again" /> : null}
          <Button label={t('results.done')} variant={isDaily ? 'primary' : 'secondary'} onPress={onDone} testID="results-done" />
          {showPaywallHint && !isDaily ? <Button label={t('results.premiumHint')} variant="ghost" size="md" icon="diamond-outline" onPress={() => router.push({ pathname: '/paywall', params: { source: 'results' } })} /> : null}
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
