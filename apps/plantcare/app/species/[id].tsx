import { Badge, Button, Card, EmptyState, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PremiumCard } from '@/components/care';
import { CATEGORY_ICON } from '@/components/icons';
import { useLeaf } from '@/components/leaf';
import { getSpecies } from '@/content/species';
import { bloomLabel, describeSpecies, speciesName } from '@/content/species/localize';
import { canOpenSpecies } from '@/domain/limits';
import { celsiusTo, temperatureUnit } from '@/domain/units';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 6 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={20} color={theme.colors.primary} />
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text>{value}</Text>
      </View>
    </View>
  );
}

export default function SpeciesSheet() {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const router = useRouter();
  const isPremium = useIsPremium();
  const tempUnit = usePreferences((s) => s.temperature) ?? 'c';
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = getSpecies(id);

  if (!s) return <EmptyState icon="leaf-outline" title={t('library.notFound')} />;
  if (!canOpenSpecies(isPremium, s)) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: speciesName(s) }} />
        <PremiumCard title={t('premium.libraryTitle')} message={t('premium.libraryBody')} source="library" />
      </Screen>
    );
  }
  const temp = `${celsiusTo(s.tempC[0], tempUnit)}–${celsiusTo(s.tempC[1], tempUnit)} ${temperatureUnit(tempUnit)}`;

  return (
    <Screen edges={[]} footer={<Button label={t('library.addToMyPlants')} icon="add" onPress={() => router.push({ pathname: '/plant/edit', params: { speciesId: s.id } })} testID="add-from-library" />}>
      <RouterStack.Screen options={{ title: speciesName(s) }} />
      <View style={{ borderRadius: theme.radius.xl, padding: 20, backgroundColor: tokens.mint, gap: 6, alignItems: 'flex-start' }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tokens.sage, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={CATEGORY_ICON[s.category]} size={28} color={theme.colors.primary} />
        </View>
        <Text variant="title">{speciesName(s)}</Text>
        <Text tone="muted" style={{ fontStyle: 'italic' }}>
          {s.scientificName}
        </Text>
        {s.synonyms.length ? <Text variant="caption" tone="muted">{`${t('library.synonyms')}: ${s.synonyms.join(', ')}`}</Text> : null}
        <Row wrap gap={1}>
          <Badge label={t(`categories.${s.category}`)} tone="primary" />
          <Badge label={t(`difficulty.${s.difficulty}`)} tone="neutral" />
          <Badge label={t(`placement.${s.placement}`)} tone="neutral" />
        </Row>
      </View>

      <Text>{describeSpecies(s, t)}</Text>

      <Card>
        <Fact icon="sunny-outline" label={t('library.light')} value={s.light.map((l) => t(`light.${l}`)).join(' · ')} />
        <Fact icon="water-outline" label={t('library.water')} value={`${t(`water.${s.water}`)} — ${t(`waterHint.${s.water}`)}`} />
        <Fact icon="layers-outline" label={t('library.soil')} value={s.soil.map((x) => t(`soilTypes.${x}`)).join(' · ')} />
        <Fact icon="thermometer-outline" label={t('library.temperature')} value={temp} />
        <Fact icon="cloud-outline" label={t('library.humidity')} value={t(`humidity.${s.humidity}`)} />
        <Fact icon="flower-outline" label={t('library.bloom')} value={bloomLabel(s, t)} />
        <Fact icon="earth-outline" label={t('library.origin')} value={s.origin.map((o) => t(`regions.${o}`)).join(', ')} />
        <Fact icon="git-network-outline" label={t('library.family')} value={s.family} />
      </Card>

      <Card tone={s.pets === 'toxic' ? 'accent' : s.pets === 'non_toxic' ? 'primary' : 'alt'}>
        <Row gap={2}>
          <Icon name="paw-outline" size={20} color={s.pets === 'toxic' ? theme.colors.warning : theme.colors.primary} />
          <Text variant="subheading">{t(`pets.${s.pets}`)}</Text>
        </Row>
        <Text variant="bodySmall" tone="muted">
          {t(`pets.${s.pets}Body`)}
        </Text>
      </Card>

      <SectionHeader title={t('library.careNotes')} />
      <Stack gap={1}>
        <Text variant="bodySmall">{`• ${t('library.tips.checkSoil')}`}</Text>
        <Text variant="bodySmall">{`• ${t('library.tips.adjust')}`}</Text>
        {s.bloom === 'all_year' || s.bloom.length ? <Text variant="bodySmall">{`• ${t('library.tips.hemisphere')}`}</Text> : null}
      </Stack>
      <Text variant="caption" tone="subtle">
        {t('library.sourcesNote')}
      </Text>
    </Screen>
  );
}
