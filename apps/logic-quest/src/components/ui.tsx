import { Button, Card, Icon, ProgressBar, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';

import { ACHIEVEMENTS, playerLevel, type QuestionPhase } from '@/engine';
import { useReducedMotion } from '@/hooks';
import { fmt } from '@/i18n';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { usePreferences } from '@/store/preferences';
import { useAdsDisabled } from '@/store/session';

/** Fade/slide-in that becomes instant when reduced motion is requested. */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  const [v] = useState(() => new Animated.Value(reduced ? 1 : 0));
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    Animated.timing(v, { toValue: 1, duration: 260, delay, useNativeDriver: true }).start();
  }, [v, delay, reduced]);
  return <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>{children}</Animated.View>;
}

/** Shown after an answer. In 'retry' it never reveals the solution. */
export function FeedbackPanel({
  phase,
  xp,
  explanation,
  answerLabel,
  canRetry,
  onRetry,
  onReveal,
  onNext,
  nextLabel,
}: {
  phase: QuestionPhase;
  xp: number | null;
  explanation: string[];
  answerLabel: string;
  canRetry: boolean;
  onRetry: () => void;
  onReveal: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (phase === 'answering') return null;
  if (phase === 'retry') {
    return (
      <Reveal>
        <Card tone="alt" accessibilityLabel={t('game.notQuite')}>
          <Row gap={2}>
            <Icon name="refresh-circle" size={24} color={theme.colors.warning} />
            <Text variant="heading" accessibilityLiveRegion="assertive">
              {t('game.notQuite')}
            </Text>
          </Row>
          <Text variant="bodySmall" tone="muted">
            {t('game.retryHelp')}
          </Text>
          <Row gap={2}>
            {canRetry ? (
              <View style={{ flex: 1 }}>
                <Button label={t('game.tryAgain')} size="md" onPress={onRetry} testID="retry" />
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              <Button label={t('game.showSolution')} variant="secondary" size="md" onPress={onReveal} testID="reveal" />
            </View>
          </Row>
        </Card>
      </Reveal>
    );
  }
  const correct = phase === 'correct';
  return (
    <Reveal>
      <View style={{ borderRadius: 18, padding: 16, gap: 10, backgroundColor: correct ? theme.colors.successSoft : theme.colors.dangerSoft }} testID="feedback">
        <Row gap={2} style={{ justifyContent: 'space-between' }}>
          <Row gap={2}>
            <Icon name={correct ? 'checkmark-circle' : 'close-circle'} size={26} color={correct ? theme.colors.success : theme.colors.danger} />
            <Text variant="heading" tone={correct ? 'success' : 'danger'} accessibilityLiveRegion="assertive">
              {correct ? t('game.correct') : t('game.incorrect')}
            </Text>
          </Row>
          {xp !== null ? (
            <Text variant="subheading" tone={xp > 0 ? 'success' : 'muted'} testID="xp-earned">
              {xp > 0 ? t('game.xpGained', { xp }) : t('game.noXp')}
            </Text>
          ) : null}
        </Row>
        {!correct ? <Text variant="subheading">{t('game.answerWas', { answer: answerLabel })}</Text> : null}
        <Stack gap={1}>
          <Text variant="label" tone="muted">
            {t('game.why')}
          </Text>
          {explanation.map((line, i) => (
            <Text key={i} variant="bodySmall">
              {line}
            </Text>
          ))}
        </Stack>
        <Button label={nextLabel} onPress={onNext} icon="arrow-forward" testID="next" />
      </View>
    </Reveal>
  );
}

/** Anchored adaptive banner, labelled and visually separated; browse screens only. */
export function AdBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const adsDisabled = useAdsDisabled();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);
  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ adsDisabled, sessionCount })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12 }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}

export function LevelCard({ totalXp, streak, onPress }: { totalXp: number; streak: number; onPress?: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const info = playerLevel(totalXp);
  return (
    <Card tone="primary" onPress={onPress} accessibilityLabel={t('home.levelA11y', { level: info.level, rank: t(`rank.${info.rank}`), xp: totalXp, streak })} testID="level-card">
      <Row style={{ justifyContent: 'space-between' }}>
        <Stack gap={0}>
          <Text variant="label" tone="primary">
            {t(`rank.${info.rank}`)}
          </Text>
          <Text variant="title">{t('home.level', { level: info.level })}</Text>
        </Stack>
        <Row gap={2} style={{ backgroundColor: theme.colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Icon name="flame" size={18} color={streak > 0 ? theme.colors.warning : theme.colors.textSubtle} />
          <Text variant="subheading">{t('home.streakDays', { count: streak })}</Text>
        </Row>
      </Row>
      <ProgressBar progress={info.progress} label={t('home.levelProgress')} />
      <Text variant="caption" tone="muted">
        {t('home.xpToNext', { current: fmt.number(info.xpIntoLevel), next: fmt.number(info.xpForNext), total: fmt.number(totalXp) })}
      </Text>
    </Card>
  );
}

/** Simple accessible bar chart (no chart library). */
export function Bars({ data, tone = 'primary', format }: { data: { label: string; value: number }[]; tone?: 'primary' | 'accent' | 'success'; format?: (v: number) => string }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const color = { primary: theme.colors.primary, accent: theme.colors.accent, success: theme.colors.success }[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 120 }} accessible accessibilityLabel={data.map((d) => `${d.label}: ${format ? format(d.value) : d.value}`).join(', ')}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {d.value ? (format ? format(d.value) : d.value) : ''}
          </Text>
          <View style={{ width: '70%', height: Math.max(3, (d.value / max) * 80), borderRadius: 6, backgroundColor: d.value ? color : theme.colors.surfaceAlt }} />
          <Text variant="caption" tone="subtle">
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function AchievementBadge({ id, unlockedAt, progress }: { id: string; unlockedAt?: string; progress?: number }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const def = ACHIEVEMENTS.find((a) => a.id === id);
  const unlocked = !!unlockedAt;
  return (
    <Row gap={3} style={{ paddingVertical: 8, opacity: unlocked ? 1 : 0.8 }} accessible accessibilityLabel={`${t(`achievements.${id}.title`)}. ${t(`achievements.${id}.desc`)}. ${unlocked ? t('awards.unlocked') : t('awards.locked')}`}>
      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: unlocked ? theme.colors.accentSoft : theme.colors.surfaceAlt }}>
        <Icon name={(def?.icon ?? 'trophy') as IconName} size={22} color={unlocked ? theme.colors.accent : theme.colors.textSubtle} />
      </View>
      <Stack gap={1} style={{ flex: 1 }}>
        <Text variant="subheading">{t(`achievements.${id}.title`)}</Text>
        <Text variant="bodySmall" tone="muted">
          {t(`achievements.${id}.desc`)}
        </Text>
        {unlocked ? (
          <Text variant="caption" tone="success">
            {t('awards.unlockedOn', { date: fmt.date(new Date(unlockedAt)) })}
          </Text>
        ) : progress !== undefined ? (
          <ProgressBar progress={progress} height={6} tone="accent" label={t('awards.progress')} />
        ) : null}
      </Stack>
    </Row>
  );
}

export function SectionTitle({ icon, children }: { icon?: IconName; children: string }) {
  const theme = useTheme();
  return (
    <Row gap={2} style={{ marginTop: 8 }}>
      {icon ? <Icon name={icon} size={18} color={theme.colors.primary} /> : null}
      <Text variant="heading" accessibilityRole="header">
        {children}
      </Text>
    </Row>
  );
}
