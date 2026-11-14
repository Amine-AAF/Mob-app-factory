import { Icon, PressableScale, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PLATFORM_ICONS, type SocialPreset } from '@/constants/socialPresets';

/** Social format tile: platform, name, pixel size and a ratio thumbnail. */
export function SocialPresetCard({ preset, selected, locked, onPress }: { preset: SocialPreset; selected: boolean; locked: boolean; onPress: () => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const ratio = preset.size.width / preset.size.height;
  const box = 40;
  const w = ratio >= 1 ? box : box * ratio;
  const h = ratio >= 1 ? box / ratio : box;
  const name = tr(`social.presets.${preset.id}`);
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={`${name}, ${preset.size.width} × ${preset.size.height}${locked ? `, ${tr('premium.badge')}` : ''}`}
      testID={`preset-${preset.id}`}
      style={{
        width: 150,
        padding: t.spacing(3),
        gap: t.spacing(2),
        borderRadius: t.radius.md,
        borderWidth: 1.5,
        borderColor: selected ? t.colors.primary : t.colors.border,
        backgroundColor: selected ? t.colors.primarySoft : t.colors.surface,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Icon name={PLATFORM_ICONS[preset.platform]} size={20} color={t.colors.text} />
        {locked ? <Icon name="diamond" size={14} color={t.colors.accent} /> : null}
      </View>
      <View style={{ height: box, justifyContent: 'center' }}>
        <View style={{ width: w, height: h, borderRadius: 4, borderWidth: 2, borderColor: selected ? t.colors.primary : t.colors.textSubtle }} />
      </View>
      <Text variant="bodySmall" style={{ fontWeight: '700' }} numberOfLines={2}>
        {name}
      </Text>
      <Text variant="caption" tone="muted">
        {`${preset.size.width} × ${preset.size.height} · ${preset.ratio}`}
      </Text>
    </PressableScale>
  );
}
