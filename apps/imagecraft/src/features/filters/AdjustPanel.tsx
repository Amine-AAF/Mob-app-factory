import { Button, Chip, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AdjustmentSlider } from '@/components/AdjustmentSlider';
import { LockMark } from '@/components/controls';
import { ADJUSTMENTS, FILTER_PRESETS } from '@/constants/filterPresets';
import { NEUTRAL_ADJUSTMENTS, type AdjustmentKey, type EditState } from '@/types/image';

/** Tone & colour sliders. Each has its own reset; "Reset all" restores every slider. */
export function AdjustPanel({ edit, apply }: { edit: EditState; apply: (next: EditState, key?: string) => void }) {
  const { t } = useTranslation();
  const set = (key: AdjustmentKey, value: number) => apply({ ...edit, adjustments: { ...edit.adjustments, [key]: Math.round(value) } }, `adj-${key}`);
  return (
    <Stack gap={2}>
      {ADJUSTMENTS.map((a) => (
        <AdjustmentSlider
          key={a.key}
          label={t(`adjust.${a.key}`)}
          icon={a.icon}
          value={edit.adjustments[a.key]}
          min={a.min}
          max={a.max}
          onChange={(v) => set(a.key, v)}
          premium={a.premium}
          testID={`slider-${a.key}`}
        />
      ))}
      <Button label={t('adjust.resetAll')} variant="ghost" size="md" icon="refresh-outline" onPress={() => apply({ ...edit, adjustments: { ...NEUTRAL_ADJUSTMENTS } })} />
    </Stack>
  );
}

/** One-tap looks. Premium looks can be previewed; exporting them needs Premium or an unlock. */
export function FiltersPanel({ edit, apply }: { edit: EditState; apply: (next: EditState) => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Stack gap={3}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing(2) }}>
        {FILTER_PRESETS.map((f) => {
          const selected = edit.filterId === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => apply({ ...edit, filterId: f.id })}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              accessibilityLabel={f.premium ? `${tr(`filters.presets.${f.id}`)}, ${tr('premium.badge')}` : tr(`filters.presets.${f.id}`)}
              testID={`filter-${f.id}`}
              style={{
                minWidth: 88,
                minHeight: 56,
                paddingHorizontal: 12,
                borderRadius: t.radius.md,
                borderWidth: 1.5,
                borderColor: selected ? t.colors.primary : t.colors.border,
                backgroundColor: selected ? t.colors.primarySoft : t.colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="bodySmall" style={{ fontWeight: '700', color: selected ? t.colors.primary : t.colors.text }}>
                  {tr(`filters.presets.${f.id}`)}
                </Text>
                {f.premium ? <LockMark /> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text variant="caption" tone="muted">
        {tr('filters.hint')}
      </Text>
      <Row gap={2} wrap>
        <Chip label={tr('filters.reset')} selected={false} onPress={() => apply({ ...edit, filterId: 'original' })} icon="refresh-outline" />
      </Row>
    </Stack>
  );
}
