import { Badge, Button, Card, Icon, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, TextInput, View, type TextInputProps } from 'react-native';

import type { PremiumFeature } from '@/features/premium/limits';
import { parseDecimal } from '@/features/units/units';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange, type AdScreen } from '@/services/ads';
import { fileExists, fileUri } from '@/services/fileStore';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import type { Vehicle } from '@/types';
import { addDays, isValidDay } from '@/utils/dates';

/* ------------------------------------------------------------------ inputs */

/** Labelled text input styled with the theme. */
export function Field({ label, error, hint, suffix, style, ...rest }: TextInputProps & { label: string; error?: string | null; hint?: string | null; suffix?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: error ? theme.colors.danger : theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md }}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.colors.textSubtle}
          maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
          style={[{ flex: 1, color: theme.colors.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 }, rest.multiline ? { minHeight: 88, textAlignVertical: 'top' } : null, style]}
          {...rest}
        />
        {suffix ? (
          <Text variant="bodySmall" tone="muted" style={{ paddingRight: 14 }}>
            {suffix}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Decimal input accepting "," or "." — keeps the raw text so typing is never fought. */
export function NumberField({ value, onChange, ...rest }: Omit<TextInputProps, 'value' | 'onChange'> & { label: string; value: string; onChange: (raw: string) => void; error?: string | null; hint?: string | null; suffix?: string }) {
  return <Field keyboardType="decimal-pad" inputMode="decimal" value={value} onChangeText={onChange} {...rest} />;
}

/** Parses a NumberField value: '' → null, invalid → NaN (so the form can show an error). */
export function readNumber(raw: string): number | null {
  if (!raw.trim()) return null;
  const n = parseDecimal(raw);
  return n === null ? Number.NaN : n;
}

/** Date as YYYY-MM-DD with one-tap shortcuts (no native date picker dependency). */
export function DateField({ label, value, onChange, error, allowEmpty }: { label: string; value: string; onChange: (v: string) => void; error?: string | null; allowEmpty?: boolean }) {
  const { t } = useTranslation();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const invalid = value.trim() !== '' && !isValidDay(value.trim());
  return (
    <Stack gap={2}>
      <Field label={label} value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" maxLength={10} error={error ?? (invalid ? t('common.invalidDate') : null)} />
      <Row gap={2} wrap>
        <MiniChip label={t('common.today')} onPress={() => onChange(todayKey)} />
        <MiniChip label={t('common.yesterday')} onPress={() => onChange(addDays(todayKey, -1))} />
        {allowEmpty && value ? <MiniChip label={t('common.none')} onPress={() => onChange('')} /> : null}
      </Row>
    </Stack>
  );
}

function MiniChip({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: theme.colors.surfaceAlt }}>
      <Text variant="caption" tone="primary">
        {label}
      </Text>
    </Pressable>
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
            accessibilityLabel={o.label}
            style={{ flex: 1, paddingVertical: 9, paddingHorizontal: 4, borderRadius: theme.radius.sm, alignItems: 'center', backgroundColor: selected ? theme.colors.surface : 'transparent' }}
          >
            <Text variant="bodySmall" tone={selected ? 'primary' : 'muted'} numberOfLines={1} style={{ fontWeight: selected ? '700' : '500' }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Choice among many options as a wrapping set of chips. */
export function ChoiceChips<T extends string>({ label, value, options, onChange }: { label?: string; value: T | null; options: { value: T; label: string; icon?: IconName }[]; onChange: (v: T) => void }) {
  const theme = useTheme();
  return (
    <Stack gap={2}>
      {label ? (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityRole="radiogroup">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={o.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface }}
            >
              {o.icon ? <Icon name={o.icon} size={15} color={selected ? theme.colors.primary : theme.colors.textMuted} /> : null}
              <Text variant="bodySmall" style={{ color: selected ? theme.colors.primary : theme.colors.text, fontWeight: '600' }}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Stack>
  );
}

export function ToggleRow({ label, hint, value, onChange, disabled }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const theme = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between', minHeight: 48 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="subtle">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} accessibilityLabel={label} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} thumbColor={theme.colors.surface} />
    </Row>
  );
}

/* ------------------------------------------------------------------ layout */

/** Form screen: scrollable content + sticky save button, keyboard-aware. Never shows ads. */
export function FormScreen({ children, onSave, saving, saveLabel, extra }: { children: ReactNode; onSave: () => void; saving?: boolean; saveLabel?: string; extra?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        edges={[]}
        footer={
          <Stack gap={2}>
            <Button label={saveLabel ?? t('common.save')} icon="checkmark" onPress={onSave} loading={saving} testID="save" />
            {extra}
          </Stack>
        }
      >
        {children}
      </Screen>
    </KeyboardAvoidingView>
  );
}

export function SectionCard({ title, children, action, onAction }: { title?: string; children: ReactNode; action?: string; onAction?: () => void }) {
  return (
    <Card>
      {title ? (
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{title}</Text>
          {action && onAction ? (
            <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10}>
              <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
                {action}
              </Text>
            </Pressable>
          ) : null}
        </Row>
      ) : null}
      {children}
    </Card>
  );
}

export function HScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
      {children}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ vehicle */

export function VehicleAvatar({ vehicle, size = 48 }: { vehicle: Pick<Vehicle, 'photoFile' | 'color' | 'vehicleType' | 'fuelType'>; size?: number }) {
  const icon: IconName = vehicle.vehicleType === 'motorcycle' ? 'bicycle' : vehicle.fuelType === 'electric' ? 'flash' : vehicle.vehicleType === 'van' || vehicle.vehicleType === 'truck' ? 'bus' : 'car-sport';
  const photo = vehicle.photoFile && fileExists(vehicle.photoFile) ? fileUri(vehicle.photoFile) : null;
  if (photo) return <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 4 }} accessibilityIgnoresInvertColors />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 4, backgroundColor: vehicle.color, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={size * 0.5} color="#FFFFFF" />
    </View>
  );
}

/** Horizontal vehicle selector for forms and lists. */
export function VehicleChooser({ vehicles, value, onChange, allowAll, allLabel }: { vehicles: Vehicle[]; value: string | null; onChange: (id: string | null) => void; allowAll?: boolean; allLabel?: string }) {
  const theme = useTheme();
  if (vehicles.length <= 1 && !allowAll) return null;
  const item = (id: string | null, label: string, v?: Vehicle) => {
    const selected = value === id;
    return (
      <Pressable
        key={id ?? 'all'}
        onPress={() => onChange(id)}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingLeft: v ? 6 : 14, paddingRight: 14, borderRadius: 999, borderWidth: 1.5, borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface }}
      >
        {v ? <VehicleAvatar vehicle={v} size={26} /> : null}
        <Text variant="bodySmall" style={{ fontWeight: '600', color: selected ? theme.colors.primary : theme.colors.text }} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  };
  return (
    <HScroll>
      {allowAll ? item(null, allLabel ?? '') : null}
      {vehicles.map((v) => item(v.id, v.name, v))}
    </HScroll>
  );
}

export function StatusBadge({ status }: { status: 'overdue' | 'due_soon' | 'ok' | 'unknown' | 'done' | 'active' | 'expiring' | 'expired' | 'upcoming' | 'valid' | 'none' }) {
  const { t } = useTranslation();
  if (status === 'none') return null;
  const tone = status === 'overdue' || status === 'expired' ? 'danger' : status === 'due_soon' || status === 'expiring' ? 'warning' : status === 'unknown' || status === 'upcoming' ? 'neutral' : 'success';
  const icon: IconName = tone === 'danger' ? 'alert-circle' : tone === 'warning' ? 'time' : tone === 'neutral' ? 'help-circle' : 'checkmark-circle';
  return <Badge label={t(`status.${status}`)} tone={tone} icon={icon} />;
}

/** Shown in place of a Premium feature; opens the paywall with the reason. */
export function PremiumGate({ reason, title, body }: { reason: PremiumFeature; title?: string; body?: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card tone="primary">
      <Row gap={2}>
        <Icon name="diamond" size={18} color={theme.colors.primary} />
        <Text variant="subheading">{title ?? t('paywall.title')}</Text>
      </Row>
      <Text variant="bodySmall" tone="muted">
        {body ?? t(`paywall.reasons.${reason}`)}
      </Text>
      <Button label={t('common.unlock')} icon="lock-open-outline" size="md" onPress={() => router.push({ pathname: '/paywall', params: { reason } })} />
    </Card>
  );
}

/** Banner on overview screens only. Forms never render it (see services/ads.ts). */
export function AdBanner({ screen }: { screen: AdScreen }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);
  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium: premium, sessionCount, screen })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 8 }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      {/* No keywords / content URL: no vehicle data reaches the ad request. */}
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}

/** Small round icon used in list rows. */
export function RowIcon({ icon, tone = 'primary' }: { icon: IconName; tone?: 'primary' | 'accent' | 'warning' | 'danger' | 'success' | 'neutral' }) {
  const theme = useTheme();
  const map = {
    primary: [theme.colors.primarySoft, theme.colors.primary],
    accent: [theme.colors.accentSoft, theme.colors.accent],
    warning: [theme.colors.warningSoft, theme.colors.warning],
    danger: [theme.colors.dangerSoft, theme.colors.danger],
    success: [theme.colors.successSoft, theme.colors.success],
    neutral: [theme.colors.surfaceAlt, theme.colors.textMuted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={19} color={fg} />
    </View>
  );
}

/** Pressable list item with icon, title, subtitle and a right-hand value. */
export function ItemRow({ icon, tone, title, subtitle, value, valueTone, onPress, badge, testID }: { icon: IconName; tone?: 'primary' | 'accent' | 'warning' | 'danger' | 'success' | 'neutral'; title: string; subtitle?: string | null; value?: string | null; valueTone?: 'default' | 'muted' | 'danger' | 'success'; onPress?: () => void; badge?: ReactNode; testID?: string }) {
  const theme = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <RowIcon icon={icon} tone={tone} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" numberOfLines={1} style={{ fontWeight: '600' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {badge}
      </View>
      {value ? (
        <Text variant="bodySmall" tone={valueTone ?? 'default'} style={{ fontWeight: '700' }}>
          {value}
        </Text>
      ) : null}
      {onPress ? <Icon name="chevron-forward" size={16} color={theme.colors.textSubtle} /> : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')} testID={testID} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

/** Floating "+" button for list screens. */
export function Fab({ label, onPress, icon = 'add' }: { label: string; onPress: () => void; icon?: IconName }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ position: 'absolute', right: 20, bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 52, borderRadius: 26, backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } })}
    >
      <Icon name={icon} size={22} color={theme.colors.onPrimary} />
      <Text variant="subheading" style={{ color: theme.colors.onPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function InfoNote({ text, icon = 'information-circle-outline' }: { text: string; icon?: IconName }) {
  const theme = useTheme();
  return (
    <Row gap={2} style={{ alignItems: 'flex-start' }}>
      <Icon name={icon} size={16} color={theme.colors.textMuted} style={{ marginTop: 2 }} />
      <Text variant="caption" tone="muted" style={{ flex: 1 }}>
        {text}
      </Text>
    </Row>
  );
}
