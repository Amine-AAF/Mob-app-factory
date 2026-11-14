import Slider from '@react-native-community/slider';
import { Badge, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

/* ----------------------------------------------------------------- SegmentedControl */

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Shows a Premium badge and calls onLocked instead of selecting. */
  locked?: boolean;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  onLocked,
  testID,
}: {
  label?: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  onLocked?: () => void;
  testID?: string;
}) {
  const t = useTheme();
  return (
    <Stack gap={2}>
      {label ? (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      ) : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} testID={testID}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => (o.locked ? onLocked?.() : onChange(o.value))}
              disabled={o.disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: !!o.disabled }}
              accessibilityLabel={o.label}
              testID={testID ? `${testID}-${o.value}` : undefined}
              style={{
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: t.radius.md,
                borderWidth: 1.5,
                borderColor: selected ? t.colors.primary : t.colors.border,
                backgroundColor: selected ? t.colors.primarySoft : t.colors.surface,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                opacity: o.disabled ? 0.45 : 1,
              }}
            >
              <Text variant="bodySmall" style={{ fontWeight: '700', color: selected ? t.colors.primary : t.colors.text }}>
                {o.label}
              </Text>
              {o.locked ? <Icon name="lock-closed" size={13} color={t.colors.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Stack>
  );
}

/* ----------------------------------------------------------------- QualitySlider */

export function QualitySlider({ value, onChange, label, hint, disabled }: { value: number; onChange: (v: number) => void; label: string; hint?: string; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Stack gap={1}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="label" tone="muted">
          {label}
        </Text>
        <Text variant="subheading" tone="primary">
          {value}
        </Text>
      </Row>
      <Slider
        value={value}
        minimumValue={10}
        maximumValue={100}
        step={1}
        disabled={disabled}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={t.colors.primary}
        maximumTrackTintColor={t.colors.border}
        thumbTintColor={t.colors.primary}
        accessibilityLabel={label}
        accessibilityValue={{ min: 10, max: 100, now: value }}
        style={{ height: 40 }}
        testID="quality-slider"
      />
      {hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </Stack>
  );
}

/* ----------------------------------------------------------------- NumberField */

export function NumberField({ label, error, suffix, ...rest }: TextInputProps & { label: string; error?: string; suffix?: string }) {
  const t = useTheme();
  return (
    <Stack gap={1} style={{ flex: 1 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Row gap={2}>
        <TextInput
          keyboardType="number-pad"
          inputMode="numeric"
          accessibilityLabel={label}
          placeholderTextColor={t.colors.textSubtle}
          maxFontSizeMultiplier={t.maxFontSizeMultiplier}
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: t.radius.md,
            borderWidth: 1.5,
            borderColor: error ? t.colors.danger : t.colors.border,
            backgroundColor: t.colors.surface,
            color: t.colors.text,
            paddingHorizontal: 12,
            fontSize: 16,
          }}
          {...rest}
        />
        {suffix ? (
          <Text variant="bodySmall" tone="muted">
            {suffix}
          </Text>
        ) : null}
      </Row>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}

/* ----------------------------------------------------------------- Misc */

export function PremiumBadge() {
  const { t } = useTranslation();
  return <Badge label={t('premium.badge')} tone="accent" icon="diamond" />;
}

export function Notice({ tone, icon, children, testID }: { tone: 'info' | 'warning' | 'danger' | 'success'; icon?: IconName; children: ReactNode; testID?: string }) {
  const t = useTheme();
  const palette = {
    info: [t.colors.primarySoft, t.colors.primary],
    warning: [t.colors.warningSoft, t.colors.warning],
    danger: [t.colors.dangerSoft, t.colors.danger],
    success: [t.colors.successSoft, t.colors.success],
  }[tone];
  const defaultIcon: IconName = { info: 'information-circle', warning: 'warning', danger: 'alert-circle', success: 'checkmark-circle' }[tone] as IconName;
  return (
    <View
      testID={testID}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: t.radius.md, backgroundColor: palette[0], alignItems: 'flex-start' }}
    >
      <Icon name={icon ?? defaultIcon} size={20} color={palette[1]} />
      <View style={{ flex: 1 }}>{typeof children === 'string' ? <Text variant="bodySmall">{children}</Text> : children}</View>
    </View>
  );
}
