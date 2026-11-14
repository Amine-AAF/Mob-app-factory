import { Button, Card, ListRow, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MedicalDisclaimer, StatusBadge } from '@/components/pet';
import { isTreatmentOngoing, treatmentStatus, vaccinationStatus } from '@/domain/health';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

/**
 * Health overview across pets. Medical context: no advertising on this screen.
 * Everything shown is what the user entered; nothing is inferred.
 */
export default function Health() {
  const { t } = useTranslation();
  const today = clock.today();
  const { data } = useData(async (r) => ({
    pets: await r.pets.listActive(),
    vaccinations: await r.vaccinations.all(),
    treatments: await r.treatments.all(),
    health: await r.health.all(),
    documents: await r.documents.all(),
  }));
  const active = new Set((data?.pets ?? []).map((p) => p.id));
  const petName = (id: string) => data?.pets.find((p) => p.id === id)?.name ?? '';
  const order = ['overdue', 'upcoming', 'done'];
  const vaccinations = (data?.vaccinations ?? [])
    .filter((v) => active.has(v.petId))
    .map((v) => ({ v, status: vaccinationStatus(v, today) }))
    .filter((x) => x.status !== 'done')
    .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || (a.v.nextDueDate ?? '').localeCompare(b.v.nextDueDate ?? ''));
  const treatments = (data?.treatments ?? []).filter((tr) => active.has(tr.petId)).map((tr) => ({ tr, status: treatmentStatus(tr, today) })).filter((x) => isTreatmentOngoing(x.status) || x.status === 'scheduled');

  const shortcuts: { label: string; icon: 'medkit-outline' | 'shield-checkmark-outline' | 'bandage-outline' | 'scale-outline' | 'calendar-outline' | 'folder-open-outline'; route: string }[] = [
    { label: 'lists.health', icon: 'medkit-outline', route: '/list/health' },
    { label: 'lists.vaccination', icon: 'shield-checkmark-outline', route: '/list/vaccination' },
    { label: 'lists.treatment', icon: 'bandage-outline', route: '/list/treatment' },
    { label: 'lists.weight', icon: 'scale-outline', route: '/list/weight' },
    { label: 'lists.appointment', icon: 'calendar-outline', route: '/list/appointment' },
    { label: 'documents.title', icon: 'folder-open-outline', route: '/documents' },
  ];

  return (
    <Screen>
      <Text variant="title">{t('tabs.health')}</Text>
      <MedicalDisclaimer />
      <Row gap={2}>
        <Stack style={{ flex: 1 }}>
          <Button label={t('quick.visit')} icon="add" size="md" onPress={() => router.push('/record/health')} testID="health-add-visit" />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <Button label={t('quick.weight')} icon="scale-outline" size="md" variant="secondary" onPress={() => router.push('/record/weight')} />
        </Stack>
      </Row>

      <Card>
        <SectionHeader title={t('health.vaccinations')} action={t('common.add')} onAction={() => router.push('/record/vaccination')} />
        {vaccinations.length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('health.noVaccinesDue')}
          </Text>
        ) : (
          vaccinations.slice(0, 6).map(({ v, status }) => (
            <ListRow
              key={v.id}
              title={`${v.name} · ${petName(v.petId)}`}
              subtitle={v.nextDueDate ? t('records.vaccination.dueOn', { date: fmt.day(v.nextDueDate) }) : t('records.vaccination.planned')}
              right={<StatusBadge status={status} />}
              onPress={() => router.push(`/record/vaccination?id=${v.id}`)}
            />
          ))
        )}
      </Card>

      <Card>
        <SectionHeader title={t('home.activeTreatments')} action={t('common.add')} onAction={() => router.push('/record/treatment')} />
        {treatments.length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('health.noTreatments')}
          </Text>
        ) : (
          treatments.map(({ tr, status }) => (
            <ListRow key={tr.id} title={`${tr.name} · ${petName(tr.petId)}`} subtitle={t(`options.frequency.${tr.frequency}`)} right={<StatusBadge status={status} />} onPress={() => router.push(`/record/treatment?id=${tr.id}`)} />
          ))
        )}
      </Card>

      <Card>
        <SectionHeader title={t('health.timeline')} action={t('common.seeAll')} onAction={() => router.push('/list/health')} />
        {(data?.health ?? []).filter((h) => active.has(h.petId)).length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('lists.empty.health')}
          </Text>
        ) : (
          (data?.health ?? [])
            .filter((h) => active.has(h.petId))
            .slice(0, 5)
            .map((h) => <ListRow key={h.id} icon="ellipse" title={h.reason} subtitle={`${petName(h.petId)} · ${fmt.day(h.date)}${h.vetName ? ` · ${h.vetName}` : ''}`} onPress={() => router.push(`/record/health?id=${h.id}`)} />)
        )}
      </Card>

      <Card>
        <SectionHeader title={t('health.records')} />
        {shortcuts.map((s) => (
          <ListRow key={s.route} icon={s.icon} title={t(s.label)} onPress={() => router.push(s.route)} />
        ))}
        <Text variant="caption" tone="subtle">
          {t('health.documentsCount', { count: (data?.documents ?? []).filter((d) => active.has(d.petId)).length })}
        </Text>
      </Card>
    </Screen>
  );
}
