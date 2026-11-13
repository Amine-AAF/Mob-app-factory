import { Badge, Icon, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { OPERATION_ICONS } from '@/config/tools';
import type { FileOperation } from '@/database/repositories/operationsRepository';
import { fmt } from '@/i18n';
import { savedRatio } from '@/utils/format';

const STATUS_TONE = { completed: 'success', failed: 'danger', cancelled: 'neutral', interrupted: 'warning', running: 'primary' } as const;

export function OperationRow({ op }: { op: FileOperation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const ratio = op.outputSize !== null ? savedRatio(op.originalSize, op.outputSize) : null;
  const sizes =
    op.status === 'completed' && op.outputSize !== null
      ? `${fmt.size(op.originalSize)} → ${fmt.size(op.outputSize)}${ratio !== null && ratio > 0 && op.operationType.startsWith('image_') ? ` (−${fmt.percent(ratio)})` : ''}`
      : fmt.size(op.originalSize);
  const label = `${t(`operations.${op.operationType}`)}, ${op.originalFileName}, ${t(`status.${op.status}`)}`;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/result/[id]', params: { id: op.id } })}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}
      testID={`op-${op.id}`}
    >
      <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
        <Icon name={OPERATION_ICONS[op.operationType]} size={20} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodySmall" style={{ fontWeight: '700' }} numberOfLines={1} ellipsizeMode="middle">
          {op.inputCount > 1 ? t('history.multiple', { name: op.originalFileName, count: op.inputCount - 1 }) : op.originalFileName}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {t(`operations.${op.operationType}`)} · {fmt.date(new Date(op.createdAt))}
        </Text>
        <Text variant="caption" tone="subtle">
          {sizes}
        </Text>
      </View>
      {op.status !== 'completed' ? <Badge label={t(`status.${op.status}`)} tone={STATUS_TONE[op.status]} /> : <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />}
    </Pressable>
  );
}
