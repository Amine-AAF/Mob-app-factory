import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ----------------------------------------------------------------- Text */

const variants = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.3 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  subheading: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  mono: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof variants;
export type TextTone = 'default' | 'muted' | 'subtle' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'onPrimary';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  center?: boolean;
}

export function Text({ variant = 'body', tone = 'default', center, style, ...rest }: TextProps) {
  const t = useTheme();
  const color = {
    default: t.colors.text,
    muted: t.colors.textMuted,
    subtle: t.colors.textSubtle,
    primary: t.colors.primary,
    accent: t.colors.accent,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
    onPrimary: t.colors.onPrimary,
  }[tone];
  return (
    <RNText
      maxFontSizeMultiplier={t.maxFontSizeMultiplier}
      style={[
        variants[variant],
        { color },
        variant === 'mono' && { fontFamily: t.fonts.mono },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}

/** Code-comment styled section label, part of the DevSpeak identity ("// today"). */
export function CodeLabel({ children, tone = 'accent' }: { children: string; tone?: TextTone }) {
  return (
    <Text variant="mono" tone={tone} accessibilityRole="header">
      {`// ${children}`}
    </Text>
  );
}

/* ----------------------------------------------------------------- Layout */

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  padded = true,
  footer,
  testID,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  footer?: ReactNode;
  testID?: string;
}) {
  const t = useTheme();
  const pad = padded ? { paddingHorizontal: t.spacing(5), paddingTop: t.spacing(4), paddingBottom: t.spacing(8) } : null;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: t.colors.background }} testID={testID}>
      {scroll ? (
        <ScrollView contentContainerStyle={[pad, { gap: t.spacing(4) }]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, gap: t.spacing(4) }, pad]}>{children}</View>
      )}
      {footer ? (
        <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: t.spacing(5), paddingVertical: t.spacing(3), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border, backgroundColor: t.colors.surface }}>
          {footer}
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}

export function Row({ children, gap = 3, style, wrap, ...rest }: ViewProps & { children: ReactNode; gap?: number; wrap?: boolean }) {
  const t = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: t.spacing(gap) }, wrap && { flexWrap: 'wrap' }, style]} {...rest}>
      {children}
    </View>
  );
}

export function Stack({ children, gap = 3, style, ...rest }: ViewProps & { children: ReactNode; gap?: number }) {
  const t = useTheme();
  return (
    <View style={[{ gap: t.spacing(gap) }, style]} {...rest}>
      {children}
    </View>
  );
}

export function Divider() {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.border }} />;
}

/* ----------------------------------------------------------------- Pressables */

/** Pressable with a subtle spring scale. Respects reduced motion by keeping the effect tiny. */
export function PressableScale({ children, style, disabled, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <Pressable disabled={disabled} onPressIn={() => to(0.97)} onPressOut={() => to(1)} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.5 }]}>{children}</Animated.View>
    </Pressable>
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  size = 'lg',
  testID,
  accessibilityHint,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
  testID?: string;
  accessibilityHint?: string;
}) {
  const t = useTheme();
  const palette = {
    primary: { bg: t.colors.primary, fg: t.colors.onPrimary, border: t.colors.primary },
    accent: { bg: t.colors.accent, fg: t.scheme === 'dark' ? '#06140F' : '#FFFFFF', border: t.colors.accent },
    secondary: { bg: t.colors.surface, fg: t.colors.text, border: t.colors.border },
    ghost: { bg: 'transparent', fg: t.colors.primary, border: 'transparent' },
    danger: { bg: t.colors.dangerSoft, fg: t.colors.danger, border: t.colors.dangerSoft },
  }[variant];
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      testID={testID}
      style={{
        minHeight: size === 'lg' ? 52 : 44,
        paddingHorizontal: t.spacing(5),
        borderRadius: t.radius.md,
        backgroundColor: palette.bg,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: t.spacing(2),
      }}
    >
      {loading ? <ActivityIndicator color={palette.fg} /> : icon ? <Ionicons name={icon} size={18} color={palette.fg} /> : null}
      <Text variant="subheading" style={{ color: palette.fg }} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

export function IconButton({ icon, onPress, label, tone = 'default', size = 22 }: { icon: IconName; onPress: () => void; label: string; tone?: 'default' | 'primary' | 'accent' | 'danger'; size?: number }) {
  const t = useTheme();
  const color = { default: t.colors.text, primary: t.colors.primary, accent: t.colors.accent, danger: t.colors.danger }[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? t.colors.surfaceAlt : 'transparent' })}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

/* ----------------------------------------------------------------- Surfaces */

export function Card({
  children,
  onPress,
  style,
  tone = 'default',
  accessibilityLabel,
  testID,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'primary' | 'accent' | 'alt';
  accessibilityLabel?: string;
  testID?: string;
}) {
  const t = useTheme();
  const bg = { default: t.colors.surface, primary: t.colors.primarySoft, accent: t.colors.accentSoft, alt: t.colors.surfaceAlt }[tone];
  const base: ViewStyle = {
    backgroundColor: bg,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: tone === 'default' ? t.colors.border : 'transparent',
    padding: t.spacing(4),
    gap: t.spacing(2),
  };
  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={[base, style]} accessibilityRole="button" accessibilityLabel={accessibilityLabel} testID={testID}>
        {children}
      </PressableScale>
    );
  }
  return (
    <View style={[base, style]} testID={testID}>
      {children}
    </View>
  );
}

export function Badge({ label, tone = 'primary', icon }: { label: string; tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'; icon?: IconName }) {
  const t = useTheme();
  const map = {
    primary: [t.colors.primarySoft, t.colors.primary],
    accent: [t.colors.accentSoft, t.colors.accent],
    success: [t.colors.successSoft, t.colors.success],
    warning: [t.colors.warningSoft, t.colors.warning],
    danger: [t.colors.dangerSoft, t.colors.danger],
    neutral: [t.colors.surfaceAlt, t.colors.textMuted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: bg, borderRadius: t.radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text variant="caption" style={{ color: fg, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

export function Chip({ label, selected, onPress, icon, testID }: { label: string; selected: boolean; onPress: () => void; icon?: IconName; testID?: string }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: t.radius.pill,
        borderWidth: 1.5,
        borderColor: selected ? t.colors.primary : t.colors.border,
        backgroundColor: selected ? t.colors.primarySoft : t.colors.surface,
      }}
    >
      {icon ? <Ionicons name={icon} size={16} color={selected ? t.colors.primary : t.colors.textMuted} /> : null}
      <Text variant="bodySmall" style={{ color: selected ? t.colors.primary : t.colors.text, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Big selectable option (radio-like) for onboarding and quizzes. */
export function OptionCard({
  title,
  subtitle,
  icon,
  selected,
  onPress,
  state = 'idle',
  testID,
  role = 'radio',
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  selected: boolean;
  onPress?: () => void;
  state?: 'idle' | 'correct' | 'wrong';
  testID?: string;
  role?: 'radio' | 'checkbox';
}) {
  const t = useTheme();
  const border = state === 'correct' ? t.colors.success : state === 'wrong' ? t.colors.danger : selected ? t.colors.primary : t.colors.border;
  const bg = state === 'correct' ? t.colors.successSoft : state === 'wrong' ? t.colors.dangerSoft : selected ? t.colors.primarySoft : t.colors.surface;
  const trailing: IconName | null = state === 'correct' ? 'checkmark-circle' : state === 'wrong' ? 'close-circle' : selected ? 'radio-button-on' : null;
  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={role}
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing(3), padding: t.spacing(4), borderRadius: t.radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: bg }}
    >
      {icon ? (
        <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surfaceAlt }}>
          <Ionicons name={icon} size={20} color={t.colors.primary} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="subheading">{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <Ionicons name={trailing} size={22} color={border} /> : null}
    </PressableScale>
  );
}

export function ListRow({
  title,
  subtitle,
  icon,
  right,
  onPress,
  testID,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  right?: ReactNode;
  onPress?: () => void;
  testID?: string;
}) {
  const t = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing(3), minHeight: 56, paddingVertical: t.spacing(2) }}>
      {icon ? <Ionicons name={icon} size={20} color={t.colors.textMuted} /> : null}
      <View style={{ flex: 1 }}>
        <Text variant="body">{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={t.colors.textSubtle} /> : null)}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title} testID={testID}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

/* ----------------------------------------------------------------- Data display */

export function ProgressBar({ progress, tone = 'primary', height = 8, label }: { progress: number; tone?: 'primary' | 'accent' | 'success'; height?: number; label?: string }) {
  const t = useTheme();
  const value = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const [anim] = useState(() => new Animated.Value(value));
  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 450, useNativeDriver: false }).start();
  }, [anim, value]);
  const color = { primary: t.colors.primary, accent: t.colors.accent, success: t.colors.success }[tone];
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={{ height, borderRadius: height, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}
    >
      <Animated.View style={{ height, borderRadius: height, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export function Stat({ value, label, icon, tone = 'primary' }: { value: string; label: string; icon: IconName; tone?: 'primary' | 'accent' | 'warning' | 'success' }) {
  const t = useTheme();
  const color = { primary: t.colors.primary, accent: t.colors.accent, warning: t.colors.warning, success: t.colors.success }[tone];
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={{ flex: 1, gap: 4, padding: t.spacing(3), borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border }}>
      <Ionicons name={icon} size={18} color={color} />
      <Text variant="heading">{value}</Text>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10}>
          <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </Row>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: IconName; title: string; message?: string; action?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: t.spacing(3), paddingVertical: t.spacing(10) }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.primarySoft }}>
        <Ionicons name={icon} size={28} color={t.colors.primary} />
      </View>
      <Text variant="heading" center>
        {title}
      </Text>
      {message ? (
        <Text variant="bodySmall" tone="muted" center>
          {message}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

/** Fades + slides content in on mount. */
export function FadeIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 320, delay, useNativeDriver: true }).start();
  }, [v, delay]);
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>{children}</Animated.View>;
}

export { Ionicons as Icon };
