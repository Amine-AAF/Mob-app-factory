import { Icon, IconButton, Row, Text, useTheme, type IconName } from '@factory/design-system';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

/**
 * Labelled slider with its value, an individual reset and an optional Premium badge.
 * `onChange` fires continuously (preview), `onCommit` once when the finger lifts (history).
 */
export function AdjustmentSlider({
  label,
  icon,
  value,
  min,
  max,
  step = 1,
  neutral = 0,
  onChange,
  onCommit,
  premium,
  format = (v) => String(Math.round(v)),
  testID,
}: {
  label: string;
  icon?: IconName;
  value: number;
  min: number;
  max: number;
  step?: number;
  neutral?: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
  premium?: boolean;
  format?: (v: number) => string;
  testID?: string;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const changed = value !== neutral;
  return (
    <View style={{ gap: 2 }} testID={testID}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={2}>
          {icon ? <Icon name={icon} size={16} color={t.colors.textMuted} /> : null}
          <Text variant="bodySmall" style={{ fontWeight: '600' }}>
            {label}
          </Text>
          {premium ? <Icon name="diamond" size={12} color={t.colors.accent} accessibilityLabel={tr('premium.badge')} /> : null}
        </Row>
        <Row gap={0}>
          <Text variant="mono" tone={changed ? 'primary' : 'muted'}>
            {format(value)}
          </Text>
          {changed ? (
            <IconButton icon="close-circle-outline" size={18} label={tr('editor.resetOne', { name: label })} onPress={() => (onCommit ?? onChange)(neutral)} />
          ) : (
            <View style={{ width: 44 }} />
          )}
        </Row>
      </Row>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        onSlidingComplete={onCommit}
        minimumTrackTintColor={t.colors.primary}
        maximumTrackTintColor={t.colors.border}
        thumbTintColor={t.colors.primary}
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: Math.round(value) }}
        style={{ height: 36 }}
      />
    </View>
  );
}
