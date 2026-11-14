import { Button, Card, EmptyState, ListRow, Screen, SectionHeader, Text } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LineChart } from '@/components/charts';
import { MedicalDisclaimer, PetFilter, StatusBadge } from '@/components/pet';
import type { TableName } from '@/database/repositories';
import { compareWeights } from '@/domain/care';
import { applyHistoryLimit } from '@/domain/limits';
import type { WeightRecord } from '@/domain/types';
import { fromKg } from '@/domain/units';
import { describe } from '@/features/records/describe';
import { isRecordKind, SPECS } from '@/features/records/specs';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/** Generic history list for a record kind, filterable by pet. */
export default function RecordList() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ kind: string; petId?: string }>();
  const kind = isRecordKind(params.kind) ? params.kind : null;
  const [petId, setPetId] = useState<string | null>(params.petId ?? null);
  const isPremium = useIsPremium();
  const unit = usePreferences((s) => s.weightUnit);
  const today = clock.today();

  const { data } = useData(
    async (r) => {
      if (!kind) return null;
      const spec = SPECS[kind];
      const tbl = r.tables[spec.table as TableName] as unknown as { list(where?: string, params?: (string | number | null)[], order?: string): Promise<Record<string, unknown>[]> };
      const order: Record<string, string> = {
        health: 'date DESC',
        vaccinations: 'COALESCE(next_due_date, administered_date) DESC',
        treatments: 'start_date DESC',
        weights: 'date DESC',
        feeding: 'active DESC, created_at DESC',
        food: 'name COLLATE NOCASE',
        appointments: 'starts_at DESC',
        activities: 'date DESC',
        expenses: 'date DESC, created_at DESC',
      };
      const rows = await tbl.list(petId ? 'pet_id = ?' : undefined, petId ? [petId] : [], order[spec.table]);
      return { rows, pets: await r.pets.listAll() };
    },
    [kind, petId],
  );

  if (!kind) return null;
  const spec = SPECS[kind];
  const pets = data?.pets ?? [];
  const petName = (id: unknown) => pets.find((p) => p.id === id)?.name ?? '';
  const limited = ['health', 'weight', 'activity', 'expense', 'vaccination', 'treatment', 'appointment'].includes(kind);
  const { visible, hiddenCount } = limited ? applyHistoryLimit(data?.rows ?? [], (e) => spec.dayOf(e), isPremium, today) : { visible: data?.rows ?? [], hiddenCount: 0 };
  const rows = visible.map((e) => ({ e, info: describe(kind, e, { t, petName: petName(e.petId), today, now: clock.now(), unit }) }));
  const groups = kind === 'treatment' || kind === 'appointment' ? (['current', 'past'] as const) : null;
  const weights = kind === 'weight' && petId ? (visible as unknown as WeightRecord[]) : [];
  const comparison = compareWeights(weights);
  const add = () => router.push(`/record/${kind}${petId ? `?petId=${petId}` : ''}`);

  return (
    <Screen edges={[]} footer={<Button label={t(spec.newTitle)} icon="add" onPress={add} testID="add-record" />}>
      <Stack.Screen options={{ title: t(`lists.${kind}`) }} />
      <PetFilter pets={pets.filter((p) => !p.archived)} value={petId} onChange={setPetId} />
      {kind === 'health' || kind === 'treatment' ? <MedicalDisclaimer compact /> : null}
      {kind === 'weight' ? (
        petId && weights.length > 0 ? (
          <Card>
            <Text variant="subheading">{t('records.weight.evolution')}</Text>
            <LineChart
              values={[...weights].reverse().map((w) => fromKg(w.weightKg, unit))}
              labels={[...weights].reverse().map((w) => fmt.dayShort(w.date))}
              formatValue={(v) => `${fmt.number(v, 1)} ${unit}`}
              accessibilityLabel={t('records.weight.evolution')}
            />
            {comparison?.deltaKg != null ? (
              <Text variant="bodySmall" tone="muted">
                {t('records.weight.change', {
                  delta: `${comparison.deltaKg > 0 ? '+' : ''}${fmt.number(fromKg(comparison.deltaKg, unit), 2)} ${unit}`,
                  days: comparison.daysBetween ?? 0,
                })}
              </Text>
            ) : null}
            <Text variant="caption" tone="subtle">
              {t('records.weight.notMedical')}
            </Text>
          </Card>
        ) : pets.length > 1 && !petId ? (
          <Text variant="bodySmall" tone="muted">
            {t('records.weight.pickPetForChart')}
          </Text>
        ) : null
      ) : null}
      {kind === 'expense' ? <Button label={t('expenses.stats')} variant="secondary" icon="pie-chart-outline" onPress={() => router.push('/expenses')} /> : null}

      {rows.length === 0 ? (
        <EmptyState icon={spec.icon} title={t(`lists.empty.${kind}`)} message={t('lists.emptyHint')} />
      ) : groups ? (
        groups.map((g) => {
          const items = rows.filter((r) => r.info.group === g);
          if (items.length === 0) return null;
          return (
            <Card key={g}>
              <SectionHeader title={t(`lists.group.${kind}.${g}`)} />
              {items.map(({ e, info }) => (
                <ListRow key={String(e.id)} title={info.title} subtitle={info.subtitle} right={info.status ? <StatusBadge status={info.status} /> : undefined} onPress={() => router.push(`/record/${kind}?id=${String(e.id)}`)} />
              ))}
            </Card>
          );
        })
      ) : (
        <Card>
          {rows.map(({ e, info }) => (
            <ListRow key={String(e.id)} title={info.title} subtitle={info.subtitle} right={info.status ? <StatusBadge status={info.status} /> : undefined} onPress={() => router.push(`/record/${kind}?id=${String(e.id)}`)} testID={`row-${String(e.id)}`} />
          ))}
        </Card>
      )}
      {hiddenCount > 0 ? (
        <Card tone="primary" onPress={() => router.push('/paywall?source=history')}>
          <Text variant="subheading">{t('premium.historyHidden', { count: hiddenCount })}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('premium.historyHiddenBody')}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
