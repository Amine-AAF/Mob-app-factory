import { Icon, PressableScale, Text, useTheme, type IconName } from '@factory/design-system';
import type { ReactNode } from 'react';
import { Pressable, TextInput, View, type KeyboardTypeOptions, type StyleProp, type ViewStyle } from 'react-native';

import { ART_PALETTE } from '@/config/brand';
import { displayQuantity } from '@/domain/quantity';
import type { ArtColor, UnitId, UnitSystem } from '@/domain/types';
import { useLang } from '@/hooks/useLang';

/* ------------------------------------------------------------ Recipe art */

/** Illustrated tile: a food emoji on a warm, food-coloured background (no photos needed). */
export function RecipeArt({ emoji, color, size = 64, radius }: { emoji: string; color: ArtColor; size?: number; radius?: number }) {
  const theme = useTheme();
  const bg = ART_PALETTE[color]?.[theme.scheme] ?? theme.colors.surfaceAlt;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: radius ?? Math.round(size * 0.28), backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: Math.round(size * 0.5), lineHeight: Math.round(size * 0.62) }} maxFontSizeMultiplier={1}>
        {emoji}
      </Text>
    </View>
  );
}

/** Wide banner version used at the top of a recipe. */
export function RecipeHero({ emoji, color }: { emoji: string; color: ArtColor }) {
  const theme = useTheme();
  const bg = ART_PALETTE[color]?.[theme.scheme] ?? theme.colors.surfaceAlt;
  return (
    <View style={{ height: 170, borderRadius: theme.radius.xl, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} importantForAccessibility="no-hide-descendants">
      <Text style={{ fontSize: 84, lineHeight: 100 }} maxFontSizeMultiplier={1}>
        {emoji}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------ Quantities */

/** "1½ cups" / "250 g" / "to taste", localized and converted to the user's system. */
export function useQuantityLabel() {
  const { t, lng, system, keepOriginalUnits } = useLang();
  return (quantity: number | null, unit: UnitId, opts: { factor?: number; forShopping?: boolean; systemOverride?: UnitSystem; original?: boolean } = {}) => {
    const d = displayQuantity(quantity, unit, {
      system: opts.systemOverride ?? system,
      lng,
      factor: opts.factor,
      keepOriginalUnits: opts.original ?? keepOriginalUnits,
      forShopping: opts.forShopping,
    });
    if (d.amount === null) return t('units.to_taste');
    return t(`units.${d.unit}`, { count: d.value ?? 0, amount: d.amount });
  };
}

/* ------------------------------------------------------------ Inputs */

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  testID,
  autoFocus,
  maxLength,
  style,
  hint,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  testID?: string;
  autoFocus?: boolean;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
  hint?: string;
}) {
  const theme = useTheme();
  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? (
        <Text variant="caption" tone="muted">
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        keyboardType={keyboardType}
        multiline={multiline}
        autoFocus={autoFocus}
        maxLength={maxLength}
        accessibilityLabel={label ?? placeholder}
        testID={testID}
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        style={{
          minHeight: multiline ? 96 : 48,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 8,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          fontSize: 16,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** − value + control with a large touch target (servings, minutes…). */
export function Stepper({ value, onChange, min = 1, max = 99, label, step = 1, format }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string; step?: number; format?: (v: number) => string }) {
  const theme = useTheme();
  const btn = (icon: IconName, next: number, a11y: string, disabled: boolean) => (
    <Pressable
      onPress={() => onChange(Math.min(max, Math.max(min, next)))}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      hitSlop={6}
      style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt, opacity: disabled ? 0.4 : 1 }}
    >
      <Icon name={icon} size={20} color={theme.colors.text} />
    </Pressable>
  );
  return (
    <View accessible={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {btn('remove', value - step, `${label} −`, value <= min)}
      <View accessible accessibilityLabel={`${label}: ${format ? format(value) : value}`} style={{ minWidth: 44, alignItems: 'center' }}>
        <Text variant="heading">{format ? format(value) : value}</Text>
      </View>
      {btn('add', value + step, `${label} +`, value >= max)}
    </View>
  );
}

/** Round checkbox used by grocery items, cooking ingredients and pantry. */
export function CheckRow({ checked, onToggle, title, subtitle, right, testID, onLongPress }: { checked: boolean; onToggle: () => void; title: string; subtitle?: string; right?: ReactNode; testID?: string; onLongPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onLongPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 6 }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 2,
          borderColor: checked ? theme.colors.success : theme.colors.border,
          backgroundColor: checked ? theme.colors.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Icon name="checkmark" size={16} color={theme.scheme === 'dark' ? '#0A0D18' : '#FFFFFF'} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" style={checked ? { textDecorationLine: 'line-through', color: theme.colors.textSubtle } : undefined}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

/** Segmented control (two to four options). */
export function Segmented<T extends string>({ value, options, onChange, testID }: { value: T; options: { value: T; label: string; icon?: IconName }[]; onChange: (v: T) => void; testID?: string }) {
  const theme = useTheme();
  return (
    <View testID={testID} accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={{
              flex: 1,
              minHeight: 38,
              borderRadius: theme.radius.md - 3,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              backgroundColor: selected ? theme.colors.surface : 'transparent',
            }}
          >
            {o.icon ? <Icon name={o.icon} size={16} color={selected ? theme.colors.primary : theme.colors.textMuted} /> : null}
            <Text variant="bodySmall" style={{ fontWeight: '700', color: selected ? theme.colors.primary : theme.colors.textMuted }} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Horizontal card shortcut (dashboard tiles). */
export function Shortcut({ icon, label, onPress, tone = 'primary', testID }: { icon: IconName; label: string; onPress: () => void; tone?: 'primary' | 'accent' | 'warning'; testID?: string }) {
  const theme = useTheme();
  const color = tone === 'accent' ? theme.colors.accent : tone === 'warning' ? theme.colors.warning : theme.colors.primary;
  const soft = tone === 'accent' ? theme.colors.accentSoft : tone === 'warning' ? theme.colors.warningSoft : theme.colors.primarySoft;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={{ flex: 1, minWidth: 72, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text variant="caption" center numberOfLines={2}>
        {label}
      </Text>
    </PressableScale>
  );
}

/** Small "info" note (disclaimers, estimates). */
export function Note({ children, icon = 'information-circle-outline', tone = 'muted' }: { children: ReactNode; icon?: IconName; tone?: 'muted' | 'warning' }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: 12, borderRadius: theme.radius.md, backgroundColor: tone === 'warning' ? theme.colors.warningSoft : theme.colors.surfaceAlt }}>
      <Icon name={icon} size={18} color={tone === 'warning' ? theme.colors.warning : theme.colors.textMuted} />
      <Text variant="bodySmall" tone={tone === 'warning' ? 'warning' : 'muted'} style={{ flex: 1 }}>
        {children}
      </Text>
    </View>
  );
}

/** Simple bar for charts (budget, nutrition). */
export function Bar({ ratio, color, height = 10 }: { ratio: number; color: string; height?: number }) {
  const theme = useTheme();
  const v = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
      <View style={{ width: `${v * 100}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}
