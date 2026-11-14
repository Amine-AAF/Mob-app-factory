import { Badge, Button, Card, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdBanner } from '@/components/AdBanner';
import { PetAvatar } from '@/components/pet';
import { ageFrom } from '@/domain/dates';
import { canAddPet, FREE_LIMITS } from '@/domain/limits';
import { useData } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';

/** My Pets: one card per pet, quick access to each profile. Browse screen (banner allowed). */
export default function Pets() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const [showArchived, setShowArchived] = useState(false);
  const { data: pets } = useData((r) => r.pets.listAll());
  const active = (pets ?? []).filter((p) => !p.archived);
  const archived = (pets ?? []).filter((p) => p.archived);
  const list = showArchived ? archived : active;
  const canAdd = canAddPet(active.length, isPremium);

  return (
    <Screen
      footer={
        <Button
          label={canAdd ? t('pets.new') : t('pets.limitReached', { count: FREE_LIMITS.pets })}
          icon={canAdd ? 'add' : 'lock-closed-outline'}
          onPress={() => router.push(canAdd ? '/pet/edit' : '/paywall?source=pet_limit')}
          testID="add-pet"
        />
      }
    >
      <Text variant="title">{t('tabs.pets')}</Text>
      {list.length === 0 ? (
        <EmptyState icon="paw-outline" title={t(showArchived ? 'pets.noArchived' : 'home.noPetsTitle')} message={showArchived ? undefined : t('home.noPetsBody')} />
      ) : (
        list.map((p) => {
          const age = p.birthDate ? ageFrom(p.birthDate, clock.today()) : null;
          return (
            <Card key={p.id} onPress={() => router.push(`/pet/${p.id}`)} accessibilityLabel={p.name} testID={`pet-card-${p.id}`}>
              <Row gap={4}>
                <PetAvatar pet={p} size={64} />
                <Stack gap={1} style={{ flex: 1 }}>
                  <Text variant="heading">{p.name}</Text>
                  <Text variant="bodySmall" tone="muted">
                    {[t(`species.${p.species}`), p.breed].filter(Boolean).join(' · ')}
                  </Text>
                  {age ? <Badge label={`${p.birthEstimated ? '≈ ' : ''}${t('pets.age', { years: age.years, months: age.months })}`} tone="neutral" /> : null}
                </Stack>
              </Row>
            </Card>
          );
        })
      )}
      {archived.length > 0 ? <Button label={t(showArchived ? 'pets.showActive' : 'pets.showArchived', { count: archived.length })} variant="ghost" onPress={() => setShowArchived((s) => !s)} /> : null}
      <AdBanner />
    </Screen>
  );
}
