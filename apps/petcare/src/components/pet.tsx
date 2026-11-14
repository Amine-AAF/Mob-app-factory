import { Badge, Chip, Icon, Row, Text, useTheme, type IconName } from '@factory/design-system';
import { Image, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Pet, Species } from '@/domain/types';
import { fileExists, fileUri } from '@/services/files';

export const SPECIES_ICON: Record<Species, IconName> = {
  dog: 'paw',
  cat: 'paw-outline',
  bird: 'airplane-outline',
  rabbit: 'leaf-outline',
  fish: 'fish-outline',
  reptile: 'bug-outline',
  other: 'heart-outline',
};

/** Warm per-species tints used for avatars without a photo (decorative only). */
const SPECIES_TINT: Record<Species, [string, string]> = {
  dog: ['#F6DCCB', '#8A3D21'],
  cat: ['#E8DDF4', '#5A3D82'],
  bird: ['#D8EEF6', '#1F5F78'],
  rabbit: ['#E2F1DA', '#3C6A2A'],
  fish: ['#D6E9FB', '#1E4E86'],
  reptile: ['#E9EFCF', '#56601E'],
  other: ['#F6E3D2', '#7A4A23'],
};

export function PetAvatar({ pet, size = 56 }: { pet: Pick<Pet, 'name' | 'species' | 'photo'>; size?: number }) {
  const theme = useTheme();
  const [bg, fg] = SPECIES_TINT[pet.species] ?? SPECIES_TINT.other;
  const hasPhoto = pet.photo && fileExists('photos', pet.photo);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.scheme === 'dark' ? theme.colors.surfaceAlt : bg,
        borderWidth: 2,
        borderColor: theme.colors.surface,
      }}
    >
      {hasPhoto ? (
        <Image source={{ uri: fileUri('photos', pet.photo!) }} style={{ width: size, height: size }} />
      ) : (
        <Icon name={SPECIES_ICON[pet.species] ?? 'paw'} size={size * 0.46} color={theme.scheme === 'dark' ? theme.colors.primary : fg} />
      )}
    </View>
  );
}

/** Horizontal pet filter. `null` = all pets. */
export function PetFilter({ pets, value, onChange, allowAll = true }: { pets: readonly Pet[]; value: string | null; onChange: (id: string | null) => void; allowAll?: boolean }) {
  const { t } = useTranslation();
  if (pets.length < 2 && allowAll) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {allowAll ? <Chip label={t('common.allPets')} selected={value === null} onPress={() => onChange(null)} /> : null}
      {pets.map((p) => (
        <Chip key={p.id} label={p.name} icon={SPECIES_ICON[p.species]} selected={value === p.id} onPress={() => onChange(p.id)} testID={`pet-chip-${p.id}`} />
      ))}
    </ScrollView>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const tone = (
    {
      overdue: 'danger',
      upcoming: 'warning',
      done: 'success',
      active: 'primary',
      ending_soon: 'warning',
      scheduled: 'accent',
      completed: 'success',
      stopped: 'neutral',
      cancelled: 'neutral',
      low: 'warning',
      empty: 'danger',
      ok: 'success',
    } as const
  )[status] ?? 'neutral';
  return <Badge label={t(`status.${status}`)} tone={tone} />;
}

/** Permanent, non-dismissable reminder that PetCare is not a medical tool. */
export function MedicalDisclaimer({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Row gap={2} style={{ alignItems: 'flex-start', padding: compact ? 10 : 14, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }} accessibilityRole="text">
      <Icon name="information-circle-outline" size={18} color={theme.colors.textMuted} />
      <Text variant="caption" tone="muted" style={{ flex: 1 }}>
        {t('disclaimer.short')}
      </Text>
    </Row>
  );
}
