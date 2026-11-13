import { Chip, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { fmt } from '@/i18n';
import { isDayKey } from '@/utils';

import { useBookTheme } from './theme';
import { Field } from './ui';

/** Day input (YYYY-MM-DD) with quick "today"/"clear" actions and a localized preview. */
export function DateField({ label, value, onChange, today, error, testID }: { label: string; value: string; onChange: (v: string) => void; today: string; error?: string | null; testID?: string }) {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const valid = isDayKey(value);
  return (
    <View style={{ gap: 6 }}>
      <Field label={label} value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" maxLength={10} error={error ?? (value && !valid ? t('errors.invalidDate') : null)} hint={valid ? fmt.day(value) : undefined} testID={testID} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={() => onChange(today)} accessibilityRole="button" hitSlop={6}>
          <Text variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            {t('common.today')}
          </Text>
        </Pressable>
        {value ? (
          <Pressable onPress={() => onChange('')} accessibilityRole="button" hitSlop={6}>
            <Text variant="caption" tone="subtle" style={{ fontWeight: '700' }}>
              {t('common.clear')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ChipChoice<T extends string>({ label, options, value, onChange, render }: { label: string; options: readonly T[]; value: T | null; onChange: (v: T) => void; render: (v: T) => string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <Chip key={o} label={render(o)} selected={value === o} onPress={() => onChange(o)} testID={`choice-${o}`} />
        ))}
      </View>
    </View>
  );
}

/** "H:MM" or "MM" duration text helpers for audiobooks and sessions. */
export function secondsToHm(sec: number | null): string {
  if (sec == null) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return s ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${h}:${String(m).padStart(2, '0')}:00`;
}
