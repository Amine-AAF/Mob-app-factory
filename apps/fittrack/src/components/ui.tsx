import { Badge, Button, Card, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { adUnits, adsSdk, bannerAllowed, onAdsStateChange, type AdScreen } from '@/services/ads';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';

/* ------------------------------------------------------------------ inputs */

/** Segmented control (views, units, filters). */
export function Segmented<T extends string>({ value, options, onChange, testID }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; testID?: string }) {
  const theme = useTheme();
  return (
    <View accessibilityRole="tablist" testID={testID} style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={{ flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, backgroundColor: selected ? theme.colors.surface : 'transparent' }}
          >
            <Text variant="bodySmall" style={{ fontWeight: selected ? '700' : '500', color: selected ? theme.colors.primary : theme.colors.textMuted }} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Big −/value/+ stepper built for gym use (sweaty fingers, quick taps): 56-dp buttons,
 * the value is also directly editable.
 */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  label,
  unit,
  decimals = 0,
  big = false,
  testID,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  decimals?: number;
  big?: boolean;
  testID?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const show = (v: number | null) => (v === null ? '' : String(Number(v.toFixed(decimals))));
  const [text, setText] = useState(() => show(value));
  // Re-sync the text when the value changes from outside (steppers, pre-fill) — derived during render.
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    if (Number(text.replace(',', '.')) !== value || (value === null && text !== '')) setText(show(value));
  }
  const clamp = (v: number) => Math.min(max, Math.max(min, Number(v.toFixed(decimals))));
  const size = big ? 56 : 44;
  const btn = (icon: IconName, delta: number, a11y: string) => (
    <Pressable
      onPress={() => onChange(clamp((value ?? 0) + delta))}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      hitSlop={6}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surfaceAlt })}
    >
      <Icon name={icon} size={big ? 26 : 20} color={theme.colors.text} />
    </Pressable>
  );
  return (
    <View style={{ gap: 4, flex: 1 }}>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {btn('remove', -step, t('common.decrease', { label }))}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TextInput
            value={text}
            onChangeText={(s) => {
              setText(s);
              const n = Number(s.replace(',', '.'));
              if (s.trim() === '') onChange(null);
              else if (Number.isFinite(n)) onChange(clamp(n));
            }}
            keyboardType={decimals > 0 ? 'decimal-pad' : 'number-pad'}
            accessibilityLabel={label}
            testID={testID}
            selectTextOnFocus
            maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
            style={{ fontSize: big ? 30 : 20, fontWeight: '800', color: theme.colors.text, textAlign: 'center', minWidth: 56, paddingVertical: 2 }}
            placeholder="—"
            placeholderTextColor={theme.colors.textSubtle}
          />
          {unit ? (
            <Text variant="caption" tone="subtle">
              {unit}
            </Text>
          ) : null}
        </View>
        {btn('add', step, t('common.increase', { label }))}
      </View>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  maxLength = 200,
  testID,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  testID?: string;
  error?: string | null;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        accessibilityLabel={label}
        testID={testID}
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        style={{
          minHeight: multiline ? 88 : 48, borderRadius: theme.radius.md, borderWidth: 1, borderColor: error ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.surface, color: theme.colors.text, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** Horizontally scrolling chip row (filters). */
export function ChipScroller({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {children}
    </ScrollView>
  );
}

/** Toggle row for settings. */
export function ToggleRow({ title, subtitle, value, onChange, icon, testID }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; icon?: IconName; testID?: string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title}
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 6 }}
    >
      {icon ? <Icon name={icon} size={20} color={theme.colors.textMuted} /> : null}
      <View style={{ flex: 1 }}>
        <Text>{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 48, height: 28, borderRadius: 14, padding: 3, backgroundColor: value ? theme.colors.primary : theme.colors.border, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' }} />
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ premium & ads */

export function PremiumBadge() {
  const { t } = useTranslation();
  return <Badge label={t('premium.badge')} tone="warning" icon="star" />;
}

/** Inline upsell shown in place of a Premium feature. Never blocks existing data. */
export function PremiumGate({ title, message, source }: { title: string; message: string; source: string }) {
  const { t } = useTranslation();
  return (
    <Card tone="primary">
      <Row gap={2}>
        <Icon name="star" size={18} color={useTheme().colors.primary} />
        <Text variant="subheading" style={{ flex: 1 }}>
          {title}
        </Text>
      </Row>
      <Text variant="bodySmall" tone="muted">
        {message}
      </Text>
      <Button label={t('premium.cta')} size="md" onPress={() => router.push({ pathname: '/paywall', params: { source } })} />
    </Card>
  );
}

/** Banner slot. Renders nothing for Premium, before consent, during a workout or on non-ad screens. */
export function AdBanner({ screen }: { screen: AdScreen }) {
  const premium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const workoutActive = useSession((s) => !!s.activeSessionId);
  const [, force] = useState(0);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);
  if (!bannerAllowed({ adsDisabled: premium, sessionCount, screen, workoutActive }) || !adUnits.banner) return null;
  const sdk = adsSdk();
  if (!sdk) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', marginTop: 8 }}>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
    </View>
  );
}

/* ------------------------------------------------------------------ misc */

export function InfoNote({ text, icon = 'information-circle-outline' }: { text: string; icon?: IconName }) {
  const theme = useTheme();
  return (
    <Row gap={2} style={{ alignItems: 'flex-start' }}>
      <Icon name={icon} size={16} color={theme.colors.textSubtle} style={{ marginTop: 2 }} />
      <Text variant="caption" tone="subtle" style={{ flex: 1 }}>
        {text}
      </Text>
    </Row>
  );
}

export function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Text variant="bodySmall" tone="muted">
        {label}
      </Text>
      <Text variant="bodySmall" style={{ fontWeight: '700' }}>
        {value}
      </Text>
    </Row>
  );
}

export function ScreenTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Stack gap={1} style={{ flex: 1 }}>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
      </Stack>
      {right}
    </Row>
  );
}
