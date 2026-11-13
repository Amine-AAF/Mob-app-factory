import { Card, Icon, IconButton, ProgressBar, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { PACKING_CATEGORIES } from '@/constants/domain';
import type { PackingListWithItems } from '@/database/repositories/packing';
import { fmt } from '@/i18n';
import type { PackingItem } from '@/types/models';

/** Summary card of a packing list ("Packing progress: 75%"). */
export function PackingListCard({ list, onPress }: { list: PackingListWithItems; onPress: () => void }) {
  const { t } = useTranslation();
  const ratio = list.total ? list.packed / list.total : 0;
  return (
    <Card onPress={onPress} accessibilityLabel={list.name} testID={`packing-list-${list.id}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="subheading" numberOfLines={1} style={{ flex: 1 }}>
          {list.name}
        </Text>
        <Text variant="bodySmall" tone="muted">
          {t('packing.count', { packed: list.packed, total: list.total })}
        </Text>
      </Row>
      {list.total ? (
        <>
          <Text variant="caption" tone="muted">
            {t('packing.progress', { percent: fmt.percent(ratio) })}
          </Text>
          <ProgressBar progress={ratio} tone={ratio >= 1 ? 'success' : 'primary'} label={t('packing.progress', { percent: fmt.percent(ratio) })} />
        </>
      ) : (
        <Text variant="caption" tone="subtle">
          {t('packing.emptyList')}
        </Text>
      )}
    </Card>
  );
}

/** Items grouped by category, with check/uncheck and per-item actions. */
export function PackingItems({ items, onToggle, onEdit }: { items: PackingItem[]; onToggle: (item: PackingItem) => void; onEdit: (item: PackingItem) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const groups = PACKING_CATEGORIES.map((c) => ({ category: c, items: items.filter((i) => i.category === c) })).filter((g) => g.items.length);
  return (
    <Stack gap={4}>
      {groups.map((g) => (
        <Stack key={g.category} gap={1}>
          <Text variant="label">{`${t(`enums.packingCategory.${g.category}`)} · ${g.items.filter((i) => i.packed).length}/${g.items.length}`}</Text>
          {g.items.map((item) => (
            <Row key={item.id} gap={2} style={{ minHeight: 48 }}>
              <Pressable
                onPress={() => onToggle(item)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.packed }}
                accessibilityLabel={item.name}
                testID={`packing-item-${item.id}`}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.spacing(3), paddingVertical: theme.spacing(2) }}
              >
                <Icon name={item.packed ? 'checkbox' : 'square-outline'} size={24} color={item.packed ? theme.colors.success : theme.colors.textMuted} />
                <Stack gap={0} style={{ flex: 1 }}>
                  <Text style={item.packed ? { textDecorationLine: 'line-through', color: theme.colors.textMuted } : undefined}>
                    {item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name}
                  </Text>
                  {item.notes ? (
                    <Text variant="caption" tone="subtle" numberOfLines={1}>
                      {item.notes}
                    </Text>
                  ) : null}
                </Stack>
                {item.priority === 'high' ? <Icon name="alert-circle" size={16} color={theme.colors.warning} accessibilityLabel={t('enums.priority.high')} /> : null}
              </Pressable>
              <IconButton icon="ellipsis-horizontal" label={t('a11y.moreActions')} onPress={() => onEdit(item)} size={18} />
            </Row>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
