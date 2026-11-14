import { Icon, PressableScale, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, Switch, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

/* --------------------------------------------------------------- Inputs */

export function TextField({ label, hint, error, multiline, style, testID, ...rest }: TextInputProps & { label?: string; hint?: string; error?: string | null; testID?: string }) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Stack gap={1}>
      {label ? (
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        placeholderTextColor={t.colors.textSubtle}
        multiline={multiline}
        maxFontSizeMultiplier={t.maxFontSizeMultiplier}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          {
            minHeight: multiline ? 110 : 48,
            borderWidth: 1.5,
            borderColor: error ? t.colors.danger : focused ? t.colors.primary : t.colors.border,
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

export function SearchField({ value, onChangeText, placeholder, testID }: { value: string; onChangeText: (v: string) => void; placeholder: string; testID?: string }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Row gap={2} style={{ backgroundColor: t.colors.surface, borderRadius: t.radius.pill, borderWidth: 1, borderColor: t.colors.border, paddingHorizontal: t.spacing(4), minHeight: 46 }}>
      <Icon name="search" size={18} color={t.colors.textSubtle} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textSubtle}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        style={{ flex: 1, color: t.colors.text, fontSize: 16, minHeight: 44 }}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel={tr('common.clear')} hitSlop={10}>
          <Icon name="close-circle" size={18} color={t.colors.textSubtle} />
        </Pressable>
      ) : null}
    </Row>
  );
}

export function Segmented<T extends string>({ options, value, onChange, testID }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; testID?: string }) {
  const t = useTheme();
  return (
    <View testID={testID} accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 3 }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={{ flex: 1, minHeight: 38, borderRadius: t.radius.sm + 2, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? t.colors.surface : 'transparent' }}
          >
            <Text variant="bodySmall" style={{ fontWeight: selected ? '700' : '500', color: selected ? t.colors.primary : t.colors.textMuted }} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({ title, subtitle, value, onChange, disabled, testID }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; testID?: string }) {
  const t = useTheme();
  return (
    <Row gap={3} style={{ minHeight: 56, paddingVertical: t.spacing(2) }}>
      <View style={{ flex: 1 }}>
        <Text>{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        accessibilityLabel={title}
        trackColor={{ true: t.colors.primary, false: t.colors.border }}
        thumbColor={t.colors.surface}
      />
    </Row>
  );
}

/** −/+ stepper, accessible as an adjustable control. */
export function Stepper({ label, value, onChange, min, max, step = 1, format, testID }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string; testID?: string }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  const btn = (icon: IconName, delta: number, a11y: string) => (
    <Pressable
      onPress={() => set(value + delta)}
      disabled={delta < 0 ? value <= min : value >= max}
      accessibilityRole="button"
      accessibilityLabel={`${a11y} ${label}`}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? t.colors.primarySoft : t.colors.surfaceAlt, opacity: (delta < 0 ? value <= min : value >= max) ? 0.4 : 1 })}
    >
      <Icon name={icon} size={20} color={t.colors.primary} />
    </Pressable>
  );
  return (
    <Row
      gap={3}
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: format ? format(value) : String(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === 'increment' ? step : -step))}
      style={{ minHeight: 56 }}
    >
      <Text style={{ flex: 1 }}>{label}</Text>
      {btn('remove', -step, tr('common.decrease'))}
      <Text variant="subheading" style={{ minWidth: 72, textAlign: 'center' }}>
        {format ? format(value) : value}
      </Text>
      {btn('add', step, tr('common.increase'))}
    </Row>
  );
}

/** Monday-first weekday picker (ISO 1..7). */
export function WeekdayPicker({ value, onChange, labels }: { value: number[]; onChange: (days: number[]) => void; labels: string[] }) {
  const t = useTheme();
  return (
    <Row gap={1} style={{ justifyContent: 'space-between' }}>
      {labels.map((label, i) => {
        const day = i + 1;
        const selected = value.includes(day);
        return (
          <Pressable
            key={day}
            onPress={() => onChange(selected ? value.filter((d) => d !== day) : [...value, day].sort())}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={label}
            style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? t.colors.primary : t.colors.surfaceAlt }}
          >
            <Text variant="bodySmall" style={{ fontWeight: '700', color: selected ? t.colors.onPrimary : t.colors.textMuted }}>
              {label.slice(0, 2)}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}

export const SUBJECT_COLORS = ['#1F6F8B', '#2F80ED', '#6C5CE7', '#9B51E0', '#E84393', '#EB5757', '#F2994A', '#D4A017', '#27AE60', '#00A3A3', '#16A085', '#6D4C41', '#4B4B8F', '#2D3436'];
export const SUBJECT_ICONS: IconName[] = ['book', 'school', 'calculator', 'flask', 'earth', 'language', 'code-slash', 'musical-notes', 'brush', 'barbell', 'briefcase', 'medkit', 'leaf', 'planet', 'library', 'trophy', 'shield-checkmark', 'construct', 'chatbubbles', 'map'];

export function ColorPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  const t = useTheme();
  return (
    <Stack gap={2}>
      <Text variant="bodySmall" style={{ fontWeight: '600' }}>
        {label}
      </Text>
      <Row gap={2} wrap>
        {SUBJECT_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            accessibilityRole="radio"
            accessibilityState={{ checked: c === value }}
            accessibilityLabel={c}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c, borderWidth: 3, borderColor: c === value ? t.colors.text : 'transparent', alignItems: 'center', justifyContent: 'center' }}
          >
            {c === value ? <Icon name="checkmark" size={18} color="#FFFFFF" /> : null}
          </Pressable>
        ))}
      </Row>
    </Stack>
  );
}

export function IconPicker({ value, onChange, color, label }: { value: string; onChange: (i: string) => void; color: string; label: string }) {
  const t = useTheme();
  return (
    <Stack gap={2}>
      <Text variant="bodySmall" style={{ fontWeight: '600' }}>
        {label}
      </Text>
      <Row gap={2} wrap>
        {SUBJECT_ICONS.map((i) => (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            accessibilityRole="radio"
            accessibilityState={{ checked: i === value }}
            accessibilityLabel={i}
            style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: i === value ? color : t.colors.surfaceAlt }}
          >
            <Icon name={i} size={20} color={i === value ? '#FFFFFF' : t.colors.textMuted} />
          </Pressable>
        ))}
      </Row>
    </Stack>
  );
}

/* --------------------------------------------------------------- Display */

export function SubjectIcon({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon as IconName} size={size * 0.5} color="#FFFFFF" />
    </View>
  );
}

/** Simple, readable bar chart (no SVG dependency). Values are drawn relative to the max. */
export function BarChart({ data, height = 120, format, highlightLast = true, testID }: { data: { label: string; value: number; color?: string }[]; height?: number; format?: (v: number) => string; highlightLast?: boolean; testID?: string }) {
  const t = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View testID={testID} accessible accessibilityRole="image" accessibilityLabel={data.map((d) => `${d.label}: ${format ? format(d.value) : d.value}`).join(', ')}>
      <Row gap={1} style={{ alignItems: 'flex-end', height }}>
        {data.map((d, i) => {
          const h = Math.max(d.value > 0 ? 4 : 2, (d.value / max) * (height - 18));
          const last = highlightLast && i === data.length - 1;
          return (
            <View key={`${d.label}-${i}`} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height }}>
              {d.value > 0 && data.length <= 12 ? (
                <Text variant="caption" tone="subtle" style={{ fontSize: 10 }} numberOfLines={1}>
                  {format ? format(d.value) : d.value}
                </Text>
              ) : null}
              <View style={{ width: '70%', maxWidth: 28, height: h, borderRadius: 6, backgroundColor: d.color ?? (last ? t.colors.primary : t.colors.primarySoft) }} />
            </View>
          );
        })}
      </Row>
      <Row gap={1} style={{ marginTop: 4 }}>
        {data.map((d, i) => (
          <Text key={`${d.label}-l-${i}`} variant="caption" tone="subtle" center style={{ flex: 1, fontSize: 10 }} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </Row>
    </View>
  );
}

/** Horizontal share bars (e.g. minutes per subject). */
export function ShareBars({ data, format }: { data: { label: string; value: number; color: string }[]; format: (v: number) => string }) {
  const t = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Stack gap={2}>
      {data.map((d) => (
        <View key={d.label} accessible accessibilityLabel={`${d.label}: ${format(d.value)}`}>
          <Row gap={2} style={{ justifyContent: 'space-between' }}>
            <Text variant="bodySmall" numberOfLines={1} style={{ flex: 1 }}>
              {d.label}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {format(d.value)}
            </Text>
          </Row>
          <View style={{ height: 8, backgroundColor: t.colors.surfaceAlt, borderRadius: 4, marginTop: 4 }}>
            <View style={{ width: `${(d.value / max) * 100}%`, height: 8, backgroundColor: d.color, borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </Stack>
  );
}

/** Progress ring drawn as 32 dots placed on a circle (no SVG dependency, exact at any angle). */
export function ProgressRing({ progress, size = 88, label, sublabel, color }: { progress: number; size?: number; label: string; sublabel?: string; color?: string }) {
  const t = useTheme();
  const p = Math.max(0, Math.min(1, progress));
  const c = color ?? t.colors.primary;
  const DOTS = 32;
  const dot = Math.max(4, size * 0.085);
  const radius = size / 2 - dot / 2;
  const filled = Math.round(p * DOTS);
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={sublabel ? `${label} ${sublabel}` : label} accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }} style={{ width: size, height: size }}>
      {Array.from({ length: DOTS }, (_, i) => {
        const angle = (i / DOTS) * 2 * Math.PI - Math.PI / 2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              left: size / 2 + radius * Math.cos(angle) - dot / 2,
              top: size / 2 + radius * Math.sin(angle) - dot / 2,
              backgroundColor: i < filled ? c : t.colors.surfaceAlt,
            }}
          />
        );
      })}
      <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="subheading" style={{ fontWeight: '800' }}>
          {label}
        </Text>
        {sublabel ? (
          <Text variant="caption" tone="subtle">
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function Pill({ label, color, icon }: { label: string; color: string; icon?: IconName }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: `${color}22`, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      {icon ? <Icon name={icon} size={12} color={color} /> : null}
      <Text variant="caption" style={{ color, fontWeight: '700' }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Fab({ icon = 'add', label, onPress, testID }: { icon?: IconName; label: string; onPress: () => void; testID?: string }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={{ position: 'absolute', right: 20, bottom: 24, height: 56, paddingHorizontal: 20, borderRadius: 28, backgroundColor: t.colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}
    >
      <Icon name={icon} size={22} color={t.colors.onPrimary} />
      <Text variant="subheading" style={{ color: t.colors.onPrimary }}>
        {label}
      </Text>
    </PressableScale>
  );
}

/** Section card with a title and optional action — the building block of the dashboard. */
export function Panel({ title, icon, action, onAction, children, style, testID }: { title: string; icon?: IconName; action?: string; onAction?: () => void; children: ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) {
  const t = useTheme();
  return (
    <View testID={testID} style={[{ backgroundColor: t.colors.surface, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing(4), gap: t.spacing(3) }, style]}>
      <Row gap={2}>
        {icon ? <Icon name={icon} size={18} color={t.colors.primary} /> : null}
        <Text variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
          {title}
        </Text>
        {action && onAction ? (
          <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={action} hitSlop={10}>
            <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
              {action}
            </Text>
          </Pressable>
        ) : null}
      </Row>
      {children}
    </View>
  );
}

/** Gentle celebration toast (achievements). Auto-hides; never blocks the screen. */
export function Toast({ title, message, icon = 'ribbon', onHide }: { title: string; message?: string; icon?: IconName; onHide: () => void }) {
  const t = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    const timer = setTimeout(() => Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => onHide()), 3200);
    return () => clearTimeout(timer);
  }, [opacity, onHide]);
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={{ position: 'absolute', left: 16, right: 16, top: 56, opacity, backgroundColor: t.colors.surface, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing(4), flexDirection: 'row', gap: 12, alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10 }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} color={t.colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="subheading">{title}</Text>
        {message ? (
          <Text variant="bodySmall" tone="muted">
            {message}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

/** Banner shown where a free limit applies, with a link to Premium. */
export function LimitNotice({ message, onUpgrade }: { message: string; onUpgrade: () => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Pressable onPress={onUpgrade} accessibilityRole="button" accessibilityLabel={`${message}. ${tr('premium.learnMore')}`} style={{ backgroundColor: t.colors.accentSoft, borderRadius: t.radius.md, padding: t.spacing(3), flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <Icon name="sparkles" size={18} color={t.colors.accent} />
      <Text variant="bodySmall" style={{ flex: 1 }}>
        {message}
      </Text>
      <Text variant="bodySmall" tone="accent" style={{ fontWeight: '700' }}>
        {tr('premium.learnMore')}
      </Text>
    </Pressable>
  );
}
