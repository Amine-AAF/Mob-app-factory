import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text as RNText,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextProps as RNTextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export { Ionicons as Icon };

/* ------------------------------------------------------------------ Text */

const variants = {
  hero: { fontSize: 34, lineHeight: 40, fontWeight: '400', letterSpacing: -0.4 },
  display: { fontSize: 28, lineHeight: 34, fontWeight: '400', letterSpacing: -0.3 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
  number: { fontSize: 26, lineHeight: 30, fontWeight: '300' },
} satisfies Record<string, TextStyle>;
const SERIF: (keyof typeof variants)[] = ['hero', 'display', 'title', 'number'];

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
      style={[variants[variant], { color }, SERIF.includes(variant) && t.fonts.display ? { fontFamily: t.fonts.display } : null, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}

/* ---------------------------------------------------------------- Layout */

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  padded = true,
  footer,
  header,
  testID,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  footer?: ReactNode;
  /** Fixed content above the scroll area (e.g. a search bar). */
  header?: ReactNode;
  testID?: string;
}) {
  const t = useTheme();
  const pad = padded ? { paddingHorizontal: t.spacing(5), paddingTop: t.spacing(3), paddingBottom: t.spacing(10) } : null;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: t.colors.background }} testID={testID}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header}
        {scroll ? (
          <ScrollView contentContainerStyle={[pad, { gap: t.spacing(4) }]} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1, gap: t.spacing(4) }, pad]}>{children}</View>
        )}
        {footer ? (
          <View style={{ paddingHorizontal: t.spacing(5), paddingVertical: t.spacing(3), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border, backgroundColor: t.colors.surface }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Editorial page header: small uppercase eyebrow + serif title + optional actions. */
export function PageHeader({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <Stack gap={1} style={{ flex: 1 }}>
        {eyebrow ? (
          <Text variant="label" tone="accent">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="display" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
      </Stack>
      {right ? <Row gap={1}>{right}</Row> : null}
    </Row>
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

export function PressableScale({ children, style, disabled, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Pressable disabled={disabled} style={({ pressed }) => [style, { opacity: disabled ? 0.45 : pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]} {...rest}>
      {children}
    </Pressable>
  );
}

/* --------------------------------------------------------------- Buttons */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  small,
  testID,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const palette = {
    primary: { bg: t.colors.primary, fg: t.colors.onPrimary, border: t.colors.primary },
    accent: { bg: t.colors.accentSoft, fg: t.colors.text, border: t.colors.accentSoft },
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
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      testID={testID}
      style={[
        {
          minHeight: small ? 38 : 50,
          paddingHorizontal: small ? t.spacing(3.5) : t.spacing(5),
          borderRadius: t.radius.pill,
          backgroundColor: palette.bg,
          borderWidth: 1,
          borderColor: palette.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.spacing(2),
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={palette.fg} /> : icon ? <Ionicons name={icon} size={small ? 16 : 18} color={palette.fg} /> : null}
      <Text variant={small ? 'bodySmall' : 'heading'} style={{ color: palette.fg, fontWeight: '600', fontSize: small ? 13 : 15 }} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  tone = 'default',
  size = 22,
  filled,
  testID,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  tone?: 'default' | 'primary' | 'accent' | 'danger';
  size?: number;
  filled?: boolean;
  testID?: string;
}) {
  const t = useTheme();
  const color = { default: t.colors.text, primary: t.colors.primary, accent: t.colors.accent, danger: t.colors.danger }[tone];
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      testID={testID}
      style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: filled ? t.colors.surface : 'transparent', borderWidth: filled ? StyleSheet.hairlineWidth : 0, borderColor: t.colors.border }}
    >
      <Ionicons name={icon} size={size} color={color} />
    </PressableScale>
  );
}

/** Floating action button (bottom-right). */
export function Fab({ icon = 'add', label, onPress, testID }: { icon?: IconName; label: string; onPress: () => void; testID?: string }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={{
        position: 'absolute',
        right: t.spacing(5),
        bottom: t.spacing(5),
        height: 56,
        paddingHorizontal: t.spacing(5),
        borderRadius: 28,
        backgroundColor: t.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing(2),
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Ionicons name={icon} size={22} color={t.colors.onPrimary} />
      <Text style={{ color: t.colors.onPrimary, fontWeight: '600' }}>{label}</Text>
    </PressableScale>
  );
}

/* ----------------------------------------------------------------- Cards */

export function Card({ children, onPress, style, tone = 'surface', testID, accessibilityLabel }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; tone?: 'surface' | 'alt' | 'primary' | 'accent'; testID?: string; accessibilityLabel?: string }) {
  const t = useTheme();
  const bg = { surface: t.colors.surface, alt: t.colors.surfaceAlt, primary: t.colors.primarySoft, accent: t.colors.accentSoft }[tone];
  const base: StyleProp<ViewStyle> = [{ backgroundColor: bg, borderRadius: t.radius.lg, padding: t.spacing(4), borderWidth: tone === 'surface' ? StyleSheet.hairlineWidth : 0, borderColor: t.colors.border, gap: t.spacing(2) }, style];
  if (!onPress)
    return (
      <View style={base} testID={testID}>
        {children}
      </View>
    );
  return (
    <PressableScale onPress={onPress} style={base} accessibilityRole="button" accessibilityLabel={accessibilityLabel} testID={testID}>
      {children}
    </PressableScale>
  );
}

export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'; icon?: IconName }) {
  const t = useTheme();
  const c = {
    primary: [t.colors.primarySoft, t.colors.primary],
    accent: [t.colors.accentSoft, t.colors.text],
    success: [t.colors.successSoft, t.colors.success],
    warning: [t.colors.warningSoft, t.colors.warning],
    danger: [t.colors.dangerSoft, t.colors.danger],
    neutral: [t.colors.surfaceAlt, t.colors.textMuted],
  }[tone] as [string, string];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: c[0], borderRadius: t.radius.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
      {icon ? <Ionicons name={icon} size={12} color={c[1]} /> : null}
      <Text variant="caption" style={{ color: c[1] }}>
        {label}
      </Text>
    </View>
  );
}

export function Chip({ label, selected, onPress, icon, color, testID }: { label: string; selected: boolean; onPress: () => void; icon?: IconName; color?: string; testID?: string }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 13,
        minHeight: 36,
        borderRadius: t.radius.pill,
        borderWidth: 1,
        borderColor: selected ? t.colors.primary : t.colors.border,
        backgroundColor: selected ? t.colors.primary : t.colors.surface,
      }}
    >
      {color ? <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, borderWidth: 1, borderColor: t.colors.border }} /> : null}
      {icon ? <Ionicons name={icon} size={14} color={selected ? t.colors.onPrimary : t.colors.textMuted} /> : null}
      <Text variant="bodySmall" style={{ color: selected ? t.colors.onPrimary : t.colors.text, fontWeight: selected ? '600' : '400' }}>
        {label}
      </Text>
    </PressableScale>
  );
}

/** Horizontally scrolling row of chips. */
export function ChipScroller({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing(2), paddingRight: t.spacing(4) }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

/** Single-select chips over a list of options. */
export function ChoiceChips<T extends string>({ options, value, onChange, label, allowNone, wrap = true }: { options: { value: T; label: string; color?: string }[]; value: T | null; onChange: (v: T | null) => void; label?: string; allowNone?: boolean; wrap?: boolean }) {
  const content = options.map((o) => <Chip key={o.value} label={o.label} color={o.color} selected={value === o.value} onPress={() => onChange(value === o.value && allowNone ? null : o.value)} />);
  return (
    <Stack gap={2}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      {wrap ? (
        <Row gap={2} wrap>
          {content}
        </Row>
      ) : (
        <ChipScroller>{content}</ChipScroller>
      )}
    </Stack>
  );
}

/** Multi-select chips. */
export function MultiChips<T extends string>({ options, values, onChange, label, wrap = true }: { options: { value: T; label: string; color?: string }[]; values: readonly T[]; onChange: (v: T[]) => void; label?: string; wrap?: boolean }) {
  const toggle = (v: T) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  const content = options.map((o) => <Chip key={o.value} label={o.label} color={o.color} selected={values.includes(o.value)} onPress={() => toggle(o.value)} />);
  return (
    <Stack gap={2}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      {wrap ? (
        <Row gap={2} wrap>
          {content}
        </Row>
      ) : (
        <ChipScroller>{content}</ChipScroller>
      )}
    </Stack>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string; icon?: IconName }[]; value: T; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.pill, padding: 3 }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={{ flex: 1, minHeight: 36, borderRadius: t.radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: selected ? t.colors.surface : 'transparent' }}
          >
            {o.icon ? <Ionicons name={o.icon} size={15} color={selected ? t.colors.text : t.colors.textMuted} /> : null}
            <Text variant="bodySmall" style={{ fontWeight: selected ? '600' : '400', color: selected ? t.colors.text : t.colors.textMuted }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  icon,
  right,
  onPress,
  danger,
  testID,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  right?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
  testID?: string;
}) {
  const t = useTheme();
  const content = (
    <Row style={{ paddingVertical: t.spacing(3.5), minHeight: 52 }}>
      {icon ? <Ionicons name={icon} size={20} color={danger ? t.colors.danger : t.colors.textMuted} /> : null}
      <Stack gap={0.5} style={{ flex: 1 }}>
        <Text tone={danger ? 'danger' : 'default'}>{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" tone="subtle">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={t.colors.textSubtle} /> : null)}
    </Row>
  );
  return onPress ? (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={title} testID={testID}>
      {content}
    </PressableScale>
  ) : (
    content
  );
}

export function SwitchRow({ title, subtitle, value, onChange, disabled, testID }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; testID?: string }) {
  const t = useTheme();
  return (
    <ListRow
      title={title}
      subtitle={subtitle}
      right={
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          accessibilityLabel={title}
          testID={testID}
          trackColor={{ true: t.colors.primary, false: t.colors.border }}
          thumbColor={t.colors.surface}
        />
      }
    />
  );
}

export function ProgressBar({ progress, tone = 'primary', height = 6, label }: { progress: number; tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger'; height?: number; label?: string }) {
  const t = useTheme();
  const color = { primary: t.colors.primary, accent: t.colors.accent, success: t.colors.success, warning: t.colors.warning, danger: t.colors.danger }[tone];
  const pct = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}
    >
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

export function Stat({ value, label, icon }: { value: string; label: string; icon?: IconName }) {
  const t = useTheme();
  return (
    <Card style={{ flex: 1, minWidth: 96, gap: t.spacing(1) }}>
      {icon ? <Ionicons name={icon} size={16} color={t.colors.accent} /> : null}
      <Text variant="number" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text variant="caption" tone="subtle" numberOfLines={2}>
        {label}
      </Text>
    </Card>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
      <Text variant="label" tone="subtle" accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text variant="bodySmall" tone="primary" style={{ fontWeight: '600' }}>
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
    <Stack gap={3} style={{ alignItems: 'center', paddingVertical: t.spacing(10), paddingHorizontal: t.spacing(4) }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={30} color={t.colors.text} />
      </View>
      <Text variant="title" center>
        {title}
      </Text>
      {message ? (
        <Text tone="muted" center>
          {message}
        </Text>
      ) : null}
      {action}
    </Stack>
  );
}

export function FadeIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 260, delay, useNativeDriver: true }).start();
  }, [opacity, delay]);
  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
}

/* ----------------------------------------------------------------- Forms */

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text variant="label" tone="subtle">
      {children}
    </Text>
  );
}

export function Field({ label, hint, error, style, ...input }: TextInputProps & { label: string; hint?: string; error?: string | null }) {
  const t = useTheme();
  return (
    <Stack gap={1.5}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        placeholderTextColor={t.colors.textSubtle}
        accessibilityLabel={label}
        maxFontSizeMultiplier={t.maxFontSizeMultiplier}
        style={[
          {
            minHeight: input.multiline ? 88 : 48,
            borderWidth: 1,
            borderColor: error ? t.colors.danger : t.colors.border,
            borderRadius: t.radius.md,
            paddingHorizontal: t.spacing(3.5),
            paddingVertical: t.spacing(2.5),
            color: t.colors.text,
            backgroundColor: t.colors.surface,
            fontSize: 15,
            textAlignVertical: input.multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...input}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </Stack>
  );
}

export function SearchBar({ value, onChangeText, placeholder, right }: { value: string; onChangeText: (s: string) => void; placeholder: string; right?: ReactNode }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Row gap={2} style={{ backgroundColor: t.colors.surface, borderRadius: t.radius.pill, borderWidth: 1, borderColor: t.colors.border, paddingLeft: t.spacing(4), paddingRight: t.spacing(1), minHeight: 46 }}>
      <Ionicons name="search" size={18} color={t.colors.textSubtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textSubtle}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        style={{ flex: 1, color: t.colors.text, fontSize: 15, paddingVertical: 8 }}
      />
      {value ? <IconButton icon="close-circle" size={18} label={tr('common.clear')} onPress={() => onChangeText('')} /> : null}
      {right}
    </Row>
  );
}

/** Bottom sheet modal used for pickers and filters. */
export function Sheet({ visible, onClose, title, children, footer }: { visible: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" transparent statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: t.colors.overlay }} onPress={onClose} accessibilityLabel={title} accessibilityRole="button" />
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: t.colors.background, borderTopLeftRadius: t.radius.xl, borderTopRightRadius: t.radius.xl, maxHeight: '88%' }}>
        <View style={{ alignItems: 'center', paddingTop: 8 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.colors.border }} />
        </View>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: t.spacing(5), paddingTop: t.spacing(2) }}>
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          <IconButton icon="close" label={tr('common.close')} onPress={onClose} />
        </Row>
        <ScrollView contentContainerStyle={{ padding: t.spacing(5), paddingTop: t.spacing(2), gap: t.spacing(4) }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {footer ? <View style={{ paddingHorizontal: t.spacing(5), paddingBottom: t.spacing(3), gap: t.spacing(2) }}>{footer}</View> : null}
      </SafeAreaView>
    </Modal>
  );
}

export function ColorDot({ hex, size = 14 }: { hex: string; size?: number }) {
  const t = useTheme();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: hex, borderWidth: 1, borderColor: t.colors.border }} />;
}

export function Loading() {
  const t = useTheme();
  return (
    <View style={{ padding: t.spacing(10), alignItems: 'center' }}>
      <ActivityIndicator color={t.colors.primary} />
    </View>
  );
}
