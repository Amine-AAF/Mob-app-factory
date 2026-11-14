import { Icon, PressableScale, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { PlannerTask } from '@/types';

/**
 * A one-off planner task. Square checkbox and a priority stripe make it visually
 * distinct from recurring habits (round check, colored icon).
 */
export function DailyTaskCard({ task, overdue, onToggle, onOpen, onMove }: { task: PlannerTask; overdue?: boolean; onToggle: () => void; onOpen: () => void; onMove?: (dir: -1 | 1) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const stripe = { high: theme.colors.danger, medium: theme.colors.warning, low: theme.colors.textSubtle }[task.priority];
  return (
    <View testID={`task-${task.id}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingRight: 8, paddingLeft: 0, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
      <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: stripe }} />
      <PressableScale
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={task.title}
        style={{ width: 28, height: 28, borderRadius: 6, borderWidth: 2, borderColor: task.done ? theme.colors.success : theme.colors.border, backgroundColor: task.done ? theme.colors.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}
      >
        {task.done ? <Icon name="checkmark" size={18} color="#FFFFFF" /> : null}
      </PressableScale>
      <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityHint={t('planner.editHint')} style={{ flex: 1, gap: 2 }}>
        <Text variant="body" numberOfLines={2} tone={task.done ? 'subtle' : 'default'} style={task.done ? { textDecorationLine: 'line-through' } : undefined}>
          {task.title}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Text variant="caption" tone="muted">
            {t(`planner.priority.${task.priority}`)}
          </Text>
          {task.time ? (
            <Text variant="caption" tone="muted">
              {task.time}
            </Text>
          ) : null}
          {overdue ? (
            <Text variant="caption" tone="danger">
              {t('planner.overdue')}
            </Text>
          ) : null}
        </View>
      </PressableScale>
      {onMove && !task.done ? (
        <View>
          <PressableScale onPress={() => onMove(-1)} accessibilityRole="button" accessibilityLabel={t('planner.moveUp')} style={{ padding: 4 }}>
            <Icon name="chevron-up" size={18} color={theme.colors.textMuted} />
          </PressableScale>
          <PressableScale onPress={() => onMove(1)} accessibilityRole="button" accessibilityLabel={t('planner.moveDown')} style={{ padding: 4 }}>
            <Icon name="chevron-down" size={18} color={theme.colors.textMuted} />
          </PressableScale>
        </View>
      ) : null}
    </View>
  );
}
