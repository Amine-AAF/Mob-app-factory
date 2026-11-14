import { Icon, Text, type IconName, type TextProps } from '@factory/design-system';
import { memo, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spineColor, useBookTheme } from './theme';

/* ------------------------------------------------------------------ layout */

export function Page({
  children,
  scroll = true,
  edges = ['top'],
  footer,
  testID,
  padded = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  footer?: ReactNode;
  testID?: string;
  padded?: boolean;
}) {
  const t = useBookTheme();
  const pad = padded ? { paddingHorizontal: t.spacing(5), paddingTop: t.spacing(4), paddingBottom: t.spacing(10) } : null;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: t.colors.background }} testID={testID}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={[pad, { gap: t.spacing(4) }]} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1, gap: t.spacing(3) }, pad]}>{children}</View>
        )}
        {footer ? (
          <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: t.spacing(5), paddingVertical: t.spacing(3), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border, backgroundColor: t.colors.surface }}>
            {footer}
          </SafeAreaView>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Serif heading for the editorial look. */
export function Serif({ size = 26, style, ...rest }: TextProps & { size?: number }) {
  const t = useBookTheme();
  return <Text {...rest} style={[{ fontFamily: t.serif, fontSize: size, lineHeight: Math.round(size * 1.25), fontWeight: Platform.OS === 'android' ? '700' : '600' }, style]} />;
}

export function Paper({ children, style, onPress, accessibilityLabel, testID, tone = 'surface' }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string; testID?: string; tone?: 'surface' | 'alt' | 'primary' }) {
  const t = useBookTheme();
  const bg = tone === 'alt' ? t.colors.surfaceAlt : tone === 'primary' ? t.colors.primarySoft : t.colors.surface;
  const base: ViewStyle = { backgroundColor: bg, borderRadius: t.radius.lg, borderWidth: tone === 'surface' ? 1 : 0, borderColor: t.colors.border, padding: t.spacing(4), gap: t.spacing(2) };
  if (!onPress)
    return (
      <View style={[base, style]} testID={testID}>
        {children}
      </View>
    );
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} testID={testID} style={({ pressed }) => [base, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }, style]}>
      {children}
    </Pressable>
  );
}

export function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: ReactNode }) {
  const t = useBookTheme();
  return (
    <View style={{ gap: t.spacing(3) }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Serif size={19} accessibilityRole="header">
          {title}
        </Serif>
        {action && onAction ? (
          <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10}>
            <Text variant="bodySmall" tone="primary" style={{ fontWeight: '600' }}>
              {action}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ covers */

export const BookCover = memo(function BookCover({ uri, title, author, width = 96, style }: { uri: string | null; title: string; author?: string | null; width?: number; style?: StyleProp<ViewStyle> }) {
  const t = useBookTheme();
  const height = Math.round(width * 1.5);
  const radius = Math.max(4, Math.round(width / 18));
  const frame: ViewStyle = { width, height, borderRadius: radius, overflow: 'hidden', backgroundColor: t.colors.surfaceAlt, elevation: 3, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } };
  if (uri) {
    return (
      <View style={[frame, style]} accessible={false}>
        <Image source={{ uri }} style={{ width, height }} resizeMode="cover" />
      </View>
    );
  }
  // Generated cover: colored cloth with a gilt frame and the title.
  const color = spineColor(title);
  const small = width < 70;
  return (
    <View style={[frame, { backgroundColor: color, padding: small ? 5 : 9 }, style]} accessible={false}>
      <View style={{ flex: 1, borderWidth: 1, borderColor: 'rgba(242,214,160,0.55)', borderRadius: 2, padding: small ? 3 : 6, justifyContent: 'space-between' }}>
        <Text numberOfLines={small ? 3 : 4} style={{ color: '#F7EBD3', fontFamily: t.serif, fontSize: small ? 8 : Math.max(10, width / 8), lineHeight: small ? 10 : Math.max(13, width / 6), fontWeight: '700' }}>
          {title}
        </Text>
        {!small && author ? (
          <Text numberOfLines={1} style={{ color: 'rgba(247,235,211,0.8)', fontSize: Math.max(8, width / 12) }}>
            {author}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

/* ------------------------------------------------------------------ rating */

export function StarRating({ value, onChange, size = 22, testID }: { value: number | null; onChange?: (v: number | null) => void; size?: number; testID?: string }) {
  const t = useBookTheme();
  const { t: tr } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }} accessibilityRole={onChange ? 'adjustable' : 'text'} accessibilityLabel={tr('review.ratingLabel', { count: value ?? 0 })} testID={testID}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value != null && i <= value;
        const star = <Icon name={filled ? 'star' : 'star-outline'} size={size} color={filled ? t.colors.accent : t.colors.textSubtle} />;
        return onChange ? (
          <Pressable key={i} onPress={() => onChange(value === i ? null : i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={tr('review.setRating', { count: i })} testID={testID ? `${testID}-${i}` : undefined}>
            {star}
          </Pressable>
        ) : (
          <View key={i}>{star}</View>
        );
      })}
    </View>
  );
}

/* ---------------------------------------------------------------- progress */

export function ProgressLine({ ratio, label, tone = 'primary', height = 6 }: { ratio: number | null; label?: string; tone?: 'primary' | 'accent' | 'success'; height?: number }) {
  const t = useBookTheme();
  const [anim] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(anim, { toValue: ratio ?? 0, duration: 450, useNativeDriver: false }).start();
  }, [anim, ratio]);
  const color = { primary: t.colors.primary, accent: t.colors.accent, success: t.colors.success }[tone];
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={ratio == null ? undefined : { min: 0, max: 100, now: Math.round(ratio * 100) }}
      style={{ height, borderRadius: height, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}
    >
      {ratio == null ? null : <Animated.View style={{ height, borderRadius: height, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />}
    </View>
  );
}

/** Circular progress drawn as a ring of beads (no SVG dependency, exact at any ratio). */
export function Ring({ ratio, size = 88, children, label }: { ratio: number; size?: number; children?: ReactNode; label?: string }) {
  const t = useBookTheme();
  const r = Math.max(0, Math.min(1, ratio));
  const beads = 40;
  const dot = Math.max(4, size / 13);
  const radius = size / 2 - dot / 2;
  const filled = Math.round(r * beads);
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(r * 100) }} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: beads }, (_, i) => {
        const a = (i / beads) * 2 * Math.PI - Math.PI / 2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              left: size / 2 + radius * Math.cos(a) - dot / 2,
              top: size / 2 + radius * Math.sin(a) - dot / 2,
              backgroundColor: i < filled ? t.colors.accent : t.colors.surfaceAlt,
            }}
          />
        );
      })}
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------- forms */

export function Field({ label, error, hint, style, multiline, testID, ...rest }: TextInputProps & { label: string; error?: string | null; hint?: string }) {
  const t = useBookTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.colors.textSubtle}
        maxFontSizeMultiplier={t.maxFontSizeMultiplier}
        multiline={multiline}
        testID={testID}
        style={[
          {
            minHeight: multiline ? 110 : 48,
            borderWidth: 1,
            borderColor: error ? t.colors.danger : t.colors.border,
            borderRadius: t.radius.md,
            paddingHorizontal: t.spacing(3),
            paddingVertical: multiline ? t.spacing(3) : 0,
            backgroundColor: t.colors.surface,
            color: t.colors.text,
            fontSize: 16,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...rest}
      />
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

export function Segmented<T extends string>({ options, value, onChange, testID }: { options: { value: T; label: string; icon?: IconName }[]; value: T; onChange: (v: T) => void; testID?: string }) {
  const t = useBookTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 3 }} accessibilityRole="tablist" testID={testID}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            style={{ flex: 1, minHeight: 38, borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4, backgroundColor: active ? t.colors.surface : 'transparent' }}
          >
            {o.icon ? <Icon name={o.icon} size={16} color={active ? t.colors.primary : t.colors.textMuted} /> : null}
            <Text variant="bodySmall" style={{ fontWeight: active ? '700' : '500', color: active ? t.colors.primary : t.colors.textMuted }} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Pill({ label, icon, tone = 'neutral' }: { label: string; icon?: IconName; tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' }) {
  const t = useBookTheme();
  const [bg, fg] = {
    neutral: [t.colors.surfaceAlt, t.colors.textMuted],
    primary: [t.colors.primarySoft, t.colors.primary],
    accent: [t.colors.accentSoft, t.colors.accent],
    success: [t.colors.successSoft, t.colors.success],
    warning: [t.colors.warningSoft, t.colors.warning],
    danger: [t.colors.dangerSoft, t.colors.danger],
  }[tone] as [string, string];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: bg }}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text variant="caption" style={{ color: fg, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

/** Icon + value + label tile for dashboards. Shows "—" for unknown values. */
export function Metric({ icon, value, label, sub }: { icon: IconName; value: string | null; label: string; sub?: string }) {
  const t = useBookTheme();
  return (
    <View style={{ flex: 1, minWidth: 140, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.lg, padding: t.spacing(3), gap: 4 }} accessible accessibilityLabel={`${label}: ${value ?? '—'}`}>
      <Icon name={icon} size={18} color={t.colors.accent} />
      <Serif size={22}>{value ?? '—'}</Serif>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      {sub ? (
        <Text variant="caption" tone="subtle">
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/** Simple vertical bar chart (accessible summary label, no SVG dependency). */
export function Bars({ values, labels, height = 120, highlight, accessibilityLabel, format }: { values: number[]; labels: string[]; height?: number; highlight?: number; accessibilityLabel: string; format?: (v: number) => string }) {
  const t = useBookTheme();
  const max = Math.max(1, ...values);
  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 4 }}>
        {values.map((v, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height }}>
            {v > 0 && format ? (
              <Text variant="caption" tone="subtle" style={{ fontSize: 9 }} numberOfLines={1}>
                {format(v)}
              </Text>
            ) : null}
            <View style={{ width: '78%', height: Math.max(v > 0 ? 3 : 1, (v / max) * (height - 16)), borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: i === highlight ? t.colors.accent : v > 0 ? t.colors.primary : t.colors.border }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {labels.map((l, i) => (
          <Text key={i} variant="caption" tone="subtle" style={{ flex: 1, textAlign: 'center', fontSize: 10 }} numberOfLines={1}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function TagInput({ tags, onChange, label, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; label: string; placeholder: string }) {
  const t = useBookTheme();
  const { t: tr } = useTranslation();
  const add = (raw: string) => {
    const parts = raw.split(/[,#\n]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...tags, ...parts])].slice(0, 12));
  };
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {tags.map((tag) => (
          <Pressable key={tag} onPress={() => onChange(tags.filter((x) => x !== tag))} accessibilityRole="button" accessibilityLabel={tr('common.removeTag', { tag })} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: t.colors.primarySoft }}>
            <Text variant="caption" tone="primary" style={{ fontWeight: '700' }}>
              #{tag}
            </Text>
            <Icon name="close" size={12} color={t.colors.primary} />
          </Pressable>
        ))}
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={t.colors.textSubtle}
        accessibilityLabel={label}
        onSubmitEditing={(e) => add(e.nativeEvent.text)}
        onEndEditing={(e) => add(e.nativeEvent.text)}
        blurOnSubmit={false}
        returnKeyType="done"
        style={{ minHeight: 44, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.md, paddingHorizontal: t.spacing(3), color: t.colors.text, backgroundColor: t.colors.surface }}
      />
    </View>
  );
}

export function Empty({ icon, title, message, action }: { icon: IconName; title: string; message?: string; action?: ReactNode }) {
  const t = useBookTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: t.spacing(8), paddingHorizontal: t.spacing(4), gap: t.spacing(3) }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={32} color={t.colors.accent} />
      </View>
      <Serif size={20} center>
        {title}
      </Serif>
      {message ? (
        <Text tone="muted" center>
          {message}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

export function IconAction({ icon, label, onPress, tone = 'default', testID }: { icon: IconName; label: string; onPress: () => void; tone?: 'default' | 'primary' | 'danger' | 'accent'; testID?: string }) {
  const t = useBookTheme();
  const color = { default: t.colors.text, primary: t.colors.primary, danger: t.colors.danger, accent: t.colors.accent }[tone];
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} testID={testID} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? t.colors.surfaceAlt : 'transparent' })}>
      <Icon name={icon} size={22} color={color} />
    </Pressable>
  );
}
