import { Icon, PressableScale, Text, useTheme, type IconName } from '@factory/design-system';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { useReducedMotion } from '@/hooks';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/** Round colored icon used for habits. */
export function HabitIcon({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon as IconName} size={size * 0.5} color="#FFFFFF" />
    </View>
  );
}

/** Flame + count; dimmed when the streak is 0. */
export function StreakBadge({ count, unit, compact }: { count: number; unit: 'day' | 'week' | 'month'; compact?: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const active = count > 0;
  return (
    <View
      accessible
      accessibilityLabel={t(`streak.${unit}`, { count })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: compact ? 6 : 10, paddingVertical: compact ? 2 : 4, borderRadius: 999, backgroundColor: active ? theme.colors.warningSoft : theme.colors.surfaceAlt }}
    >
      <Icon name={active ? 'flame' : 'flame-outline'} size={compact ? 13 : 16} color={active ? theme.colors.warning : theme.colors.textSubtle} />
      <Text variant="caption" tone={active ? 'warning' : 'subtle'}>
        {compact ? String(count) : t(`streak.${unit}`, { count })}
      </Text>
    </View>
  );
}

/** Progress bar that animates to its new value (instant when Reduce Motion is on). */
export function AnimatedBar({ progress, color, height = 10, label }: { progress: number; color?: string; height?: number; label?: string }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [value] = useState(() => new Animated.Value(progress));
  useEffect(() => {
    const to = Math.max(0, Math.min(1, progress));
    if (reduced) value.setValue(to);
    else Animated.spring(value, { toValue: to, useNativeDriver: false, friction: 9, tension: 60 }).start();
  }, [progress, reduced, value]);
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={{ height, borderRadius: height, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
      <Animated.View style={{ height, borderRadius: height, backgroundColor: color ?? theme.colors.primary, width: value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

/** Single-choice segmented control. */
export function Segmented<T extends string>({ value, options, onChange, testID }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; testID?: string }) {
  const theme = useTheme();
  return (
    <View testID={testID} accessibilityRole="radiogroup" style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 3 }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={{ flex: 1, paddingVertical: 8, borderRadius: theme.radius.sm, alignItems: 'center', backgroundColor: selected ? theme.colors.surface : 'transparent' }}
          >
            <Text variant="bodySmall" tone={selected ? 'primary' : 'muted'} style={{ fontWeight: selected ? '700' : '500' }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Labelled text input styled with the theme. */
export function Field({ label, error, style, ...rest }: TextInputProps & { label: string; error?: string | null }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textSubtle}
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        style={[
          { borderWidth: 1, borderColor: error ? theme.colors.danger : theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
          rest.multiline ? { minHeight: 80, textAlignVertical: 'top' } : null,
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** − value + stepper for numbers (targets, counts, reminder times). */
export function Stepper({ value, onChange, min = 0, max = 100000, step = 1, label, format }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; label: string; format?: (v: number) => string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const btn = (icon: IconName, delta: number, a11y: string) => (
    <PressableScale
      onPress={() => onChange(Math.min(max, Math.max(min, Math.round((value + delta) * 100) / 100)))}
      disabled={delta < 0 ? value <= min : value >= max}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}
    >
      <Icon name={icon} size={20} color={theme.colors.text} />
    </PressableScale>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} accessible={false}>
      {btn('remove', -step, t('common.decrease', { label }))}
      <Text variant="heading" style={{ minWidth: 64, textAlign: 'center' }} accessibilityLabel={`${label}: ${format ? format(value) : value}`}>
        {format ? format(value) : String(value)}
      </Text>
      {btn('add', step, t('common.increase', { label }))}
    </View>
  );
}

/** Short, polite confirmation that fades out (e.g. "Nice! +10 XP"). */
export function Toast({ message, onHide }: { message: string | null; onHide: () => void }) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    const anim = Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }), Animated.delay(1600), Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true })]);
    anim.start(({ finished }) => finished && onHide());
    return () => anim.stop();
  }, [message, onHide, opacity]);
  if (!message) return null;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, bottom: 96, opacity, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.text, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
        <Icon name="sparkles" size={16} color={theme.colors.background} />
        <Text variant="bodySmall" style={{ color: theme.colors.background, fontWeight: '600' }} accessibilityLiveRegion="polite">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

/** Floating action button. */
export function Fab({ onPress, label, icon = 'add' }: { onPress: () => void; label: string; icon?: IconName }) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID="fab"
      style={{ position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
    >
      <Icon name={icon} size={30} color={theme.colors.onPrimary} />
    </PressableScale>
  );
}

export function PremiumTag() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: theme.colors.accentSoft }}>
      <Icon name="diamond" size={11} color={theme.colors.accent} />
      <Text variant="caption" tone="accent">
        {t('common.premium')}
      </Text>
    </View>
  );
}

/** Anchored adaptive banner, labelled and separated from content. Only on Habits and Insights. */
export function AdBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);
  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ adsDisabled: premium, sessionCount })) return null;
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

/** Small selectable color swatch. */
export function Swatch({ color, selected, onPress, label }: { color: string; selected: boolean; onPress: () => void; label: string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color, borderWidth: 3, borderColor: selected ? theme.colors.text : 'transparent', alignItems: 'center', justifyContent: 'center' }}
    >
      {selected ? <Icon name="checkmark" size={18} color="#FFFFFF" /> : null}
    </Pressable>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'primary' | 'danger' | 'success' }) {
  const theme = useTheme();
  const bg = { neutral: theme.colors.surfaceAlt, primary: theme.colors.primarySoft, danger: theme.colors.dangerSoft, success: theme.colors.successSoft }[tone];
  return <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: bg, alignSelf: 'flex-start' }}>{children}</View>;
}
