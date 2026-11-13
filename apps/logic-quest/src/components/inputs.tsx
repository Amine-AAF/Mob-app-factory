import { OptionCard, PressableScale, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { feedback } from '@/services/feedback';

/** Large-key numeric keypad (≥ 56 dp targets). The value is a string so leading digits and "−" can be typed. */
export function NumberKeypad({ value, onChange, allowNegative, maxLength = 7, disabled }: { value: string; onChange: (v: string) => void; allowNegative?: boolean; maxLength?: number; disabled?: boolean }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const press = (key: string) => {
    feedback.tap();
    if (key === 'del') return onChange(value.slice(0, -1));
    if (key === '±') return onChange(value.startsWith('-') ? value.slice(1) : `-${value}`);
    if (value.replace('-', '').length >= maxLength) return;
    onChange(value + key);
  };
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [allowNegative ? '±' : '', '0', 'del'],
  ];
  return (
    <Stack gap={2}>
      <View
        accessible
        accessibilityLiveRegion="polite"
        accessibilityLabel={value ? t('game.yourAnswer', { value: value.replace('-', '−') }) : t('game.typeAnswer')}
        style={{ height: 60, borderRadius: 14, borderWidth: 2, borderColor: value ? theme.colors.primary : theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }}
      >
        <Text variant="display" tone={value ? 'default' : 'subtle'} testID="keypad-value">
          {value ? value.replace('-', '−') : '—'}
        </Text>
      </View>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((k, c) =>
            k === '' ? (
              <View key={c} style={{ flex: 1 }} />
            ) : (
              <PressableScale
                key={c}
                disabled={disabled}
                onPress={() => press(k)}
                accessibilityRole="button"
                accessibilityLabel={k === 'del' ? t('game.delete') : k === '±' ? t('game.toggleSign') : k}
                testID={`key-${k}`}
                style={{ flex: 1, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}
              >
                <Text variant="title">{k === 'del' ? '⌫' : k}</Text>
              </PressableScale>
            ),
          )}
        </View>
      ))}
    </Stack>
  );
}

/** Text answer options (logic puzzles, number choices). */
export function ChoiceList({
  labels,
  selected,
  correctIndex,
  wrongIndex,
  onSelect,
  compact,
}: {
  labels: string[];
  selected: number | null;
  correctIndex?: number;
  wrongIndex?: number | null;
  onSelect?: (i: number) => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }} accessibilityRole="radiogroup">
        {labels.map((l, i) => (
          <View key={i} style={{ width: '46%' }}>
            <OptionCard title={l} selected={selected === i} onPress={onSelect ? () => onSelect(i) : undefined} state={i === correctIndex ? 'correct' : i === wrongIndex ? 'wrong' : 'idle'} testID={`option-${i}`} />
          </View>
        ))}
      </View>
    );
  }
  return (
    <Stack gap={2} accessibilityRole="radiogroup">
      {labels.map((l, i) => (
        <OptionCard key={i} title={l} selected={selected === i} onPress={onSelect ? () => onSelect(i) : undefined} state={i === correctIndex ? 'correct' : i === wrongIndex ? 'wrong' : 'idle'} testID={`option-${i}`} />
      ))}
    </Stack>
  );
}
