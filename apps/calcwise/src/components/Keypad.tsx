import { Icon, Text, useTheme, type IconName } from '@factory/design-system';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Key } from '@/features/calculator/input';
import { usePreferences } from '@/store/preferences';

export type PadAction = Key | { type: 'equals' } | { type: 'second' } | { type: 'angle' };

export interface PadKey {
  id: string;
  label?: string;
  icon?: IconName;
  /** i18n key under "keys." for screen readers. */
  a11y: string;
  action: PadAction;
  variant?: 'digit' | 'operator' | 'function' | 'action' | 'equals';
  active?: boolean;
  /** Relative width (2 = double key). */
  span?: number;
}

/**
 * Large, comfortable keys (≥ 56 dp in standard mode) with pressed feedback and
 * optional haptics. Every key has a spoken label ("divide", "square root"…).
 */
export function Keypad({ rows, onPress, compact, dense, testID }: { rows: PadKey[][]; onPress: (action: PadAction) => void; compact?: boolean; dense?: boolean; testID?: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = usePreferences((s) => s.haptics);

  const colors = (variant: PadKey['variant'], active?: boolean) => {
    switch (variant) {
      case 'equals':
        return { bg: theme.colors.primary, fg: theme.colors.onPrimary };
      case 'operator':
        return { bg: theme.colors.primarySoft, fg: theme.colors.primary };
      case 'function':
        return { bg: active ? theme.colors.accentSoft : theme.colors.surfaceAlt, fg: active ? theme.colors.accent : theme.colors.text };
      case 'action':
        return { bg: theme.colors.surfaceAlt, fg: theme.colors.danger };
      default:
        return { bg: theme.colors.surface, fg: theme.colors.text };
    }
  };

  return (
    <View style={{ gap: compact ? 6 : 10 }} testID={testID}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: compact ? 6 : 10 }}>
          {row.map((k) => {
            const c = colors(k.variant, k.active);
            return (
              <Pressable
                key={k.id}
                testID={`key-${k.id}`}
                accessibilityRole="button"
                accessibilityLabel={t(`keys.${k.a11y}`)}
                accessibilityState={k.active !== undefined ? { selected: k.active } : undefined}
                onPress={() => {
                  if (haptics) Haptics.selectionAsync().catch(() => undefined);
                  onPress(k.action);
                }}
                style={({ pressed }) => ({
                  flex: k.span ?? 1,
                  height: compact ? 42 : dense ? 52 : 64,
                  borderRadius: compact ? 12 : 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.bg,
                  borderWidth: k.variant === 'digit' || !k.variant ? 1 : 0,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.72 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                {k.icon ? (
                  <Icon name={k.icon} size={compact ? 18 : 24} color={c.fg} />
                ) : (
                  <Text style={{ color: c.fg, fontSize: compact ? 15 : 26, fontWeight: k.variant === 'digit' || !k.variant ? '500' : '700' }} maxFontSizeMultiplier={1.2}>
                    {k.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
