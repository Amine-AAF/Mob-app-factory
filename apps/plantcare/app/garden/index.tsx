import { Button, EmptyState, Icon, PressableScale, Screen, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { LOCATION_ICON } from '@/components/icons';
import { PlantPhoto } from '@/components/PlantPhoto';
import { canAddLocation, FREE_LOCATION_LIMIT } from '@/domain/limits';
import { useData } from '@/hooks/useData';
import { useIsPremium } from '@/store/session';

/** Garden Organizer: spaces (rooms, balcony, greenhouse…) with their plants. */
export default function Garden() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const isPremium = useIsPremium();
  const { data } = useData(async (r) => ({ locations: await r.locations.list(), counts: await r.locations.plantCounts(), unassigned: (await r.plants.list()).filter((p) => !p.locationId).length }));
  const locations = data?.locations ?? [];
  const add = () => (canAddLocation(isPremium, locations.length) ? router.push('/garden/edit') : router.push({ pathname: '/paywall', params: { source: 'garden' } }));

  return (
    <Screen edges={[]} footer={<Button label={t('garden.add')} icon="add" onPress={add} testID="add-location" />}>
      <RouterStack.Screen options={{ title: t('garden.title') }} />
      <Text tone="muted">{t('garden.subtitle')}</Text>
      {!isPremium ? <Text variant="caption" tone="muted">{t('garden.freeLimit', { max: FREE_LOCATION_LIMIT })}</Text> : null}
      {locations.length === 0 && data ? (
        <EmptyState icon="grid-outline" title={t('garden.empty')} message={t('garden.emptyBody')} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
          {locations.map((l) => (
            <PressableScale
              key={l.id}
              onPress={() => router.push(`/garden/${l.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${l.name}, ${t('garden.plantsCount', { count: data?.counts[l.id] ?? 0 })}`}
              style={{ width: '48%', borderRadius: theme.radius.lg, overflow: 'hidden', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
            >
              <PlantPhoto path={l.photoPath} height={100} radius={0} icon={LOCATION_ICON[l.type]} />
              <View style={{ padding: 10, gap: 2 }}>
                <Text variant="subheading" numberOfLines={1}>
                  {l.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name={LOCATION_ICON[l.type]} size={12} color={theme.colors.textMuted} />
                  <Text variant="caption" tone="muted">
                    {t('garden.plantsCount', { count: data?.counts[l.id] ?? 0 })}
                  </Text>
                </View>
              </View>
            </PressableScale>
          ))}
        </View>
      )}
      {(data?.unassigned ?? 0) > 0 ? <Text variant="caption" tone="muted">{t('garden.unassigned', { count: data!.unassigned })}</Text> : null}
      <AdBanner />
    </Screen>
  );
}
