import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { OutfitCollage } from '@/components/OutfitCollage';
import type { Outfit, OutfitSchedule, WardrobeItem } from '@/domain/types';
import { useLabels } from '@/hooks/useLabels';
import { Badge, Button, Card, Icon, Row, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

/** A planned outfit for a day, with quick actions (edit, mark as worn / undo, delete). */
export function PlanCard({
  plan,
  outfit,
  items,
  canWear,
  onOpenOutfit,
  onEdit,
  onToggleWorn,
  onDelete,
}: {
  plan: OutfitSchedule;
  outfit: Outfit | null;
  items: ReadonlyMap<string, WardrobeItem>;
  canWear: boolean;
  onOpenOutfit?: (o: Outfit) => void;
  onEdit?: () => void;
  onToggleWorn?: () => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const occasion = labels.occasion(plan.occasionId);
  return (
    <Card>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <View style={{ width: 96 }}>
          {outfit ? (
            <OutfitCollage refs={outfit.items} items={items} height={128} />
          ) : (
            <View style={{ height: 128, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="shirt-outline" size={26} color={theme.colors.textSubtle} />
            </View>
          )}
        </View>
        <Stack gap={1.5} style={{ flex: 1 }}>
          <Text variant="heading" numberOfLines={2} onPress={outfit && onOpenOutfit ? () => onOpenOutfit(outfit) : undefined}>
            {outfit ? outfit.name : plan.outfitId ? t('calendar.plan.outfitDeleted') : t('calendar.plan.noOutfitChosen')}
          </Text>
          <Row gap={1.5} wrap>
            {occasion ? <Badge label={occasion} icon="pricetag-outline" /> : null}
            {plan.remind ? <Badge label={t('calendar.plan.reminderOn')} icon="notifications-outline" /> : null}
            {plan.wornLogged ? <Badge label={t('calendar.plan.worn')} tone="success" icon="checkmark" /> : null}
          </Row>
          {plan.notes ? (
            <Text variant="bodySmall" tone="muted" numberOfLines={3}>
              {plan.notes}
            </Text>
          ) : null}
        </Stack>
      </Row>
      <Row gap={2} wrap>
        {onEdit ? <Button small variant="secondary" icon="create-outline" label={t('common.edit')} onPress={onEdit} /> : null}
        {onToggleWorn && canWear && outfit ? (
          <Button
            small
            variant={plan.wornLogged ? 'ghost' : 'accent'}
            icon={plan.wornLogged ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
            label={plan.wornLogged ? t('calendar.plan.undoWorn') : t('calendar.plan.markWorn')}
            onPress={onToggleWorn}
          />
        ) : null}
        {onDelete ? <Button small variant="danger" icon="trash-outline" label={t('common.delete')} onPress={onDelete} /> : null}
      </Row>
    </Card>
  );
}
