import { Icon, PressableScale, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { CareTask, Plant } from '@/domain/types';

import { DueBadge } from './care';
import { CATEGORY_ICON } from './icons';
import { PlantPhoto } from './PlantPhoto';

/** Photo-first collection card. */
export function PlantCard({ plant, nextTask, locationName, width }: { plant: Plant; nextTask?: CareTask | null; locationName?: string | null; width?: number | `${number}%` }) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <PressableScale
      onPress={() => router.push(`/plant/${plant.id}`)}
      accessibilityRole="button"
      accessibilityLabel={[plant.nickname, plant.commonName, locationName].filter(Boolean).join(', ')}
      testID={`plant-card-${plant.id}`}
      style={{ width: width ?? '48%', borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}
    >
      <PlantPhoto path={plant.photoPath} height={130} radius={0} icon={CATEGORY_ICON[plant.category]} />
      {plant.favorite ? (
        <View style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={t('plants.favorite')}>
          <Icon name="heart" size={16} color={theme.colors.danger} />
        </View>
      ) : null}
      <View style={{ padding: 10, gap: 4 }}>
        <Text variant="subheading" numberOfLines={1}>
          {plant.nickname}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {locationName ?? (plant.commonName || t(`categories.${plant.category}`))}
        </Text>
        {nextTask ? <DueBadge task={nextTask} /> : null}
      </View>
    </PressableScale>
  );
}
