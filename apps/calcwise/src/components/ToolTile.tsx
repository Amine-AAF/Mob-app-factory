import { Icon, PressableScale, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { getTool, type ToolId } from '@/constants/tools';
import { openTool } from '@/features/navigation';

/** Square shortcut used on Home (favorites) — icon in a tinted badge + name. */
export function ToolTile({ id }: { id: ToolId }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const tool = getTool(id);
  if (!tool) return null;
  return (
    <PressableScale
      onPress={() => openTool(id)}
      accessibilityRole="button"
      accessibilityLabel={t(`tools.${id}.name`)}
      testID={`tile-${id}`}
      style={{ flex: 1, minWidth: 96, padding: 14, gap: 10, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={tool.icon} size={22} color={theme.colors.primary} />
      </View>
      <Text variant="bodySmall" style={{ fontWeight: '700' }} numberOfLines={2}>
        {t(`tools.${id}.short`)}
      </Text>
    </PressableScale>
  );
}
