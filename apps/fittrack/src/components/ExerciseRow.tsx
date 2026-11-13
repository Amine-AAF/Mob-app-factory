import { Icon, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { isPremiumExercise } from '@/features/library/library';
import type { Exercise } from '@/types';

const CATEGORY_ICON: Record<string, React.ComponentProps<typeof Icon>['name']> = {
  chest: 'fitness', back: 'git-merge', shoulders: 'triangle', arms: 'barbell', legs: 'walk', glutes: 'ellipse',
  abs: 'grid', full_body: 'body', cardio: 'heart', mobility: 'sync', stretching: 'leaf',
};

export const categoryIcon = (c: string) => CATEGORY_ICON[c] ?? 'barbell';

/** One exercise in a list: category glyph, name, muscle · equipment, favorite / lock markers. */
export function ExerciseRow({
  exercise,
  onPress,
  favorite,
  locked,
  selected,
  right,
  testID,
}: {
  exercise: Exercise;
  onPress: () => void;
  favorite?: boolean;
  locked?: boolean;
  selected?: boolean;
  right?: React.ReactNode;
  testID?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const sub = `${t(`muscles.${exercise.primary}`)} · ${exercise.equipment.map((e) => t(`equipment.${e}`)).join(', ')}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`${exercise.name}. ${sub}${locked ? `. ${t('premium.badge')}` : ''}`}
      testID={testID}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 8, paddingHorizontal: 12, borderRadius: theme.radius.md,
        backgroundColor: selected ? theme.colors.primarySoft : pressed ? theme.colors.surfaceAlt : theme.colors.surface,
        borderWidth: 1, borderColor: selected ? theme.colors.primary : theme.colors.border,
      })}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={categoryIcon(exercise.category)} size={20} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="subheading" numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {sub}
        </Text>
      </View>
      {favorite ? <Icon name="star" size={16} color={theme.colors.warning} /> : null}
      {locked && isPremiumExercise(exercise) ? <Icon name="lock-closed" size={16} color={theme.colors.textSubtle} /> : null}
      {selected ? <Icon name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
      {right}
    </Pressable>
  );
}
