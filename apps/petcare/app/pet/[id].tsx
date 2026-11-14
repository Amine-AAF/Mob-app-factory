import { Badge, Button, Card, Chip, Icon, IconButton, ListRow, ProgressBar, Row, Screen, SectionHeader, Stack as UIStack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { MedicalDisclaimer, PetAvatar, StatusBadge } from '@/components/pet';
import { goalProgress, summarizeDay } from '@/domain/care';
import { ageFrom } from '@/domain/dates';
import { isTreatmentOngoing, treatmentStatus, vaccinationStatus } from '@/domain/health';
import { describe } from '@/features/records/describe';
import type { RecordKind } from '@/features/records/specs';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { exportPetReport } from '@/services/exports';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

const TABS = ['health', 'care', 'documents', 'expenses'] as const;
type Tab = (typeof TABS)[number];

const QUICK: { kind: RecordKind | 'document'; icon: IconName; label: string }[] = [
  { kind: 'health', icon: 'medkit-outline', label: 'quick.visit' },
  { kind: 'vaccination', icon: 'shield-checkmark-outline', label: 'quick.vaccine' },
  { kind: 'treatment', icon: 'bandage-outline', label: 'quick.treatment' },
  { kind: 'weight', icon: 'scale-outline', label: 'quick.weight' },
  { kind: 'appointment', icon: 'calendar-outline', label: 'quick.appointment' },
  { kind: 'activity', icon: 'walk-outline', label: 'quick.activity' },
  { kind: 'document', icon: 'document-attach-outline', label: 'quick.document' },
  { kind: 'expense', icon: 'wallet-outline', label: 'quick.expense' },
];

export default function PetProfile() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const [active, setActive] = useState<Tab>((TABS as readonly string[]).includes(tab ?? '') ? (tab as Tab) : 'health');
  const unit = usePreferences((s) => s.weightUnit);
  const isPremium = useIsPremium();
  const [exporting, setExporting] = useState(false);
  const today = clock.today();

  const { data } = useData(
    async (r) => {
      const pet = await r.pets.get(id);
      if (!pet) return null;
      const [health, vaccinations, treatments, weights, feeding, appointments, documents, activities, expenses] = await Promise.all([
        r.health.forPet(id),
        r.vaccinations.forPet(id),
        r.treatments.forPet(id),
        r.weights.forPet(id),
        r.feeding.forPet(id),
        r.appointments.forPet(id),
        r.documents.forPet(id),
        r.activities.forPet(id),
        r.expenses.forPet(id),
      ]);
      return { pet, health, vaccinations, treatments, weights, feeding, appointments, documents, activities, expenses };
    },
    [id],
  );

  if (!data) return <Screen>{null}</Screen>;
  const { pet } = data;
  const age = pet.birthDate ? ageFrom(pet.birthDate, today) : null;
  const lastWeight = data.weights.at(-1);
  const ctx = { t, petName: '', today, now: clock.now(), unit };
  const row = (kind: RecordKind, e: Record<string, unknown>) => {
    const info = describe(kind, e, ctx);
    return <ListRow key={String(e.id)} title={info.title} subtitle={info.subtitle} right={info.status ? <StatusBadge status={info.status} /> : undefined} onPress={() => router.push(`/record/${kind}?id=${String(e.id)}`)} />;
  };
  const section = (kind: RecordKind, items: Record<string, unknown>[], max = 3) => (
    <Card key={kind}>
      <SectionHeader title={t(`lists.${kind}`)} action={items.length > 0 ? t('common.seeAll') : undefined} onAction={() => router.push(`/list/${kind}?petId=${id}`)} />
      {items.length === 0 ? (
        <Text variant="bodySmall" tone="muted">
          {t(`lists.empty.${kind}`)}
        </Text>
      ) : (
        items.slice(0, max).map((e) => row(kind, e))
      )}
      <Button label={t(`records.${kind}.new`)} variant="ghost" size="md" icon="add" onPress={() => router.push(`/record/${kind}?petId=${id}`)} />
    </Card>
  );
  const asRows = <T extends object>(list: T[]) => list as unknown as Record<string, unknown>[];
  const walk = summarizeDay(data.activities, today, 'walk');
  const goal = goalProgress(walk.minutes, pet.walkGoalMinutes);

  const exportPdf = async () => {
    if (!isPremium) {
      router.push('/paywall?source=pdf_export');
      return;
    }
    setExporting(true);
    try {
      await exportPetReport(pet.id, t);
    } catch {
      Alert.alert(t('errors.exportTitle'), t('errors.exportBody'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: pet.name, headerRight: () => <IconButton icon="create-outline" label={t('pets.edit')} onPress={() => router.push(`/pet/edit?id=${id}`)} /> }} />
      <Card tone="primary">
        <Row gap={4}>
          <PetAvatar pet={pet} size={76} />
          <UIStack gap={1} style={{ flex: 1 }}>
            <Text variant="title">{pet.name}</Text>
            <Text tone="muted">{[t(`species.${pet.species}`), pet.breed, pet.sex && pet.sex !== 'unknown' ? t(`sex.${pet.sex}`) : null].filter(Boolean).join(' · ')}</Text>
            <Row wrap gap={2}>
              {age ? <Badge icon="gift-outline" label={`${pet.birthEstimated ? '≈ ' : ''}${t('pets.age', { years: age.years, months: age.months })}`} tone="neutral" /> : null}
              {lastWeight ? <Badge icon="scale-outline" label={fmt.weight(lastWeight.weightKg, unit)} tone="neutral" /> : null}
              {pet.archived ? <Badge label={t('pets.archived')} tone="warning" /> : null}
            </Row>
          </UIStack>
        </Row>
        {pet.identification || pet.adoptionDate || pet.color ? (
          <Text variant="caption" tone="muted">
            {[pet.color, pet.identification ? `${t('fields.identification')}: ${pet.identification}` : null, pet.adoptionDate ? `${t('fields.adoptionDate')}: ${fmt.day(pet.adoptionDate)}` : null].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {QUICK.map((q) => (
          <Pressable
            key={q.kind}
            onPress={() => router.push(q.kind === 'document' ? `/document/new?petId=${id}` : `/record/${q.kind}?petId=${id}`)}
            accessibilityRole="button"
            accessibilityLabel={t(q.label)}
            style={{ width: '23%', flexGrow: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}>
              <Icon name={q.icon} size={19} color={theme.colors.primary} />
            </View>
            <Text variant="caption" center numberOfLines={1}>
              {t(q.label)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Row wrap gap={2}>
        {TABS.map((k) => (
          <Chip key={k} label={t(`pets.tabs.${k}`)} selected={active === k} onPress={() => setActive(k)} testID={`tab-${k}`} />
        ))}
      </Row>

      {active === 'health' ? (
        <>
          <MedicalDisclaimer compact />
          {section(
            'vaccination',
            asRows([...data.vaccinations].sort((a, b) => ['overdue', 'upcoming', 'done'].indexOf(vaccinationStatus(a, today)) - ['overdue', 'upcoming', 'done'].indexOf(vaccinationStatus(b, today)))),
          )}
          {section('treatment', asRows([...data.treatments].sort((a, b) => Number(isTreatmentOngoing(treatmentStatus(b, today))) - Number(isTreatmentOngoing(treatmentStatus(a, today))))))}
          {section('health', asRows(data.health))}
          {section('weight', asRows([...data.weights].reverse()))}
          {section('appointment', asRows(data.appointments))}
          <Button label={t('exports.petReport')} icon="document-text-outline" variant="secondary" loading={exporting} onPress={exportPdf} testID="export-pdf" />
        </>
      ) : null}

      {active === 'care' ? (
        <>
          {pet.species === 'dog' ? (
            <Card>
              <Text variant="subheading">{t('care.walkToday')}</Text>
              <Text tone="muted">{t('care.walkSummary', { minutes: walk.minutes, count: walk.count })}</Text>
              {goal != null ? <ProgressBar progress={goal} tone="accent" label={t('care.walkGoal', { goal: pet.walkGoalMinutes })} /> : null}
              {goal != null ? (
                <Text variant="caption" tone="subtle">
                  {t('care.walkGoal', { goal: pet.walkGoalMinutes })}
                </Text>
              ) : null}
            </Card>
          ) : null}
          {section('feeding', asRows(data.feeding))}
          {section('activity', asRows(data.activities))}
          <Button label={t('templates.title')} icon="list-outline" variant="secondary" onPress={() => router.push(`/templates?petId=${id}`)} />
        </>
      ) : null}

      {active === 'documents' ? (
        <Card>
          <SectionHeader title={t('documents.title')} action={t('common.search')} onAction={() => router.push(`/documents?petId=${id}`)} />
          {data.documents.length === 0 ? (
            <Text variant="bodySmall" tone="muted">
              {t('documents.empty')}
            </Text>
          ) : (
            data.documents.map((d) => <ListRow key={d.id} icon="document-outline" title={d.title} subtitle={`${t(`options.documentCategory.${d.category}`)} · ${fmt.day(d.createdAt.slice(0, 10))}`} onPress={() => router.push(`/document/${d.id}`)} />)
          )}
          <Button label={t('documents.add')} variant="ghost" size="md" icon="add" onPress={() => router.push(`/document/new?petId=${id}`)} />
        </Card>
      ) : null}

      {active === 'expenses' ? section('expense', asRows(data.expenses), 6) : null}
    </Screen>
  );
}

