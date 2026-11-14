import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { OutfitCollage } from '@/components/OutfitCollage';
import { repos } from '@/database';
import type { OutfitSchedule } from '@/domain/types';
import { canMarkWorn, isValidDayKey } from '@/features/calendar/calendarLogic';
import { deletePlan, togglePlanWorn } from '@/features/calendar/planActions';
import { PlanCard } from '@/features/calendar/PlanCard';
import { OutfitPickerSheet } from '@/features/outfits/OutfitPickerSheet';
import { useOutfitData } from '@/features/outfits/useOutfitData';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterWrite } from '@/services/data';
import { Button, Card, ChoiceChips, EmptyState, Field, Icon, Loading, Row, Screen, SectionHeader, Stack, SwitchRow, Text, useTheme } from '@/ui';

interface Draft {
  id?: string;
  outfitId: string | null;
  occasionId: string | null;
  notes: string;
  remind: boolean;
}

/** Day plan editor: several plans per day (e.g. work + evening). No ads (planning flow). */
export default function DayPlanScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ date: string; outfitId?: string }>();
  const date = params.date;
  if (!isValidDayKey(date)) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('calendar.plan.title') }} />
        <EmptyState icon="alert-circle-outline" title={t('calendar.plan.invalidDate')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }
  return <DayPlan key={date} date={date} prefillOutfitId={params.outfitId ?? null} />;
}

function DayPlan({ date, prefillOutfitId }: { date: string; prefillOutfitId: string | null }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const today = clock.today();
  const { outfits, outfitById, map, ready } = useOutfitData();
  const { data } = useAsync(async () => {
    const [plans, notifications] = await Promise.all([repos().schedules.forDate(date), repos().settings.notifications()]);
    return { plans, reminder: notifications.find((n) => n.kind === 'planned_outfit') ?? null };
  }, [date]);

  const [draft, setDraft] = useState<Draft | null>(() => (prefillOutfitId ? { outfitId: prefillOutfitId, occasionId: null, notes: '', remind: false } : null));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const title = fmt.day(date, { weekday: 'long', day: 'numeric', month: 'long' });
  if (!data || !ready) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title }} />
        <Loading />
      </Screen>
    );
  }

  const startNew = () => {
    setError(null);
    setDraft({ outfitId: null, occasionId: null, notes: '', remind: data.reminder?.enabled ?? false });
  };
  const startEdit = (p: OutfitSchedule) => {
    setError(null);
    setDraft({ id: p.id, outfitId: p.outfitId && outfitById.has(p.outfitId) ? p.outfitId : null, occasionId: p.occasionId, notes: p.notes ?? '', remind: p.remind });
  };
  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const save = async () => {
    if (!draft) return;
    const outfitId = draft.outfitId && outfitById.has(draft.outfitId) ? draft.outfitId : null;
    if (!outfitId && !draft.occasionId && !draft.notes.trim()) {
      setError(t('calendar.plan.errorEmpty'));
      return;
    }
    setSaving(true);
    try {
      await repos().schedules.save({ date, outfitId, occasionId: draft.occasionId, notes: draft.notes.trim() || null, remind: draft.remind }, draft.id);
      afterWrite({ notifications: true });
      setDraft(null);
    } catch (e) {
      recordError(e, 'plan_save');
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const draftOutfit = draft?.outfitId ? (outfitById.get(draft.outfitId) ?? null) : null;
  const reminderOn = data.reminder?.enabled ?? false;

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title }} />

      {data.plans.length === 0 && !draft ? <EmptyState icon="calendar-outline" title={t('calendar.day.emptyTitle')} message={t('calendar.plan.emptyMessage')} /> : null}

      {data.plans.map((p) =>
        draft?.id === p.id ? null : (
          <PlanCard
            key={p.id}
            plan={p}
            outfit={p.outfitId ? (outfitById.get(p.outfitId) ?? null) : null}
            items={map}
            canWear={canMarkWorn(date, today)}
            onOpenOutfit={(o) => router.push({ pathname: '/outfit/[id]', params: { id: o.id } })}
            onEdit={() => startEdit(p)}
            onToggleWorn={() => togglePlanWorn(t, p)}
            onDelete={() => deletePlan(t, p)}
          />
        ),
      )}

      {draft ? (
        <Card>
          <SectionHeader title={draft.id ? t('calendar.plan.editPlan') : t('calendar.plan.newPlan')} />
          {draftOutfit ? (
            <Row gap={3} style={{ alignItems: 'flex-start' }}>
              <View style={{ width: 110 }}>
                <OutfitCollage refs={draftOutfit.items} items={map} height={146} />
              </View>
              <Stack gap={2} style={{ flex: 1 }}>
                <Text variant="heading" numberOfLines={2}>
                  {draftOutfit.name}
                </Text>
                <Button small variant="secondary" label={t('calendar.plan.changeOutfit')} onPress={() => setPickerOpen(true)} style={{ alignSelf: 'flex-start' }} />
                <Button small variant="ghost" label={t('calendar.plan.removeOutfit')} onPress={() => patch({ outfitId: null })} style={{ alignSelf: 'flex-start' }} />
              </Stack>
            </Row>
          ) : (
            <Button variant="secondary" icon="layers-outline" label={t('calendar.plan.chooseOutfit')} onPress={() => setPickerOpen(true)} testID="plan-choose-outfit" />
          )}
          {labels.occasionOptions.length ? <ChoiceChips label={t('calendar.plan.occasion')} options={labels.occasionOptions} value={draft.occasionId} onChange={(occasionId) => patch({ occasionId })} allowNone /> : null}
          <Field label={`${t('calendar.plan.notes')} (${t('common.optional')})`} value={draft.notes} onChangeText={(notes) => patch({ notes })} placeholder={t('calendar.plan.notesPlaceholder')} multiline maxLength={300} />
          <SwitchRow
            title={t('calendar.plan.remind')}
            subtitle={reminderOn && data.reminder ? t('calendar.plan.remindHint', { time: fmt.time(data.reminder.hour, data.reminder.minute) }) : t('calendar.plan.remindDisabled')}
            value={draft.remind}
            onChange={(remind) => patch({ remind })}
          />
          {draft.remind && !reminderOn ? (
            <Row gap={2}>
              <Icon name="notifications-off-outline" size={16} color={theme.colors.warning} />
              <Button small variant="ghost" label={t('calendar.plan.enableNotifications')} onPress={() => router.push('/settings/notifications')} />
            </Row>
          ) : null}
          {error ? (
            <Text variant="bodySmall" tone="danger">
              {error}
            </Text>
          ) : null}
          <Row gap={2}>
            <Button variant="secondary" label={t('common.cancel')} onPress={() => setDraft(null)} style={{ flex: 1 }} />
            <Button label={t('common.save')} onPress={save} loading={saving} style={{ flex: 1 }} testID="plan-save" />
          </Row>
        </Card>
      ) : (
        <Button icon="add" label={data.plans.length ? t('calendar.plan.addAnother') : t('calendar.day.addPlan')} onPress={startNew} testID="plan-add" />
      )}

      <OutfitPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        outfits={outfits}
        items={map}
        onPick={(o) => {
          patch({ outfitId: o.id });
          setError(null);
        }}
        onCreateNew={() => {
          setPickerOpen(false);
          // The builder comes back to this day with the new outfit selected.
          router.replace({ pathname: '/outfit/builder', params: { planDate: date } });
        }}
      />
    </Screen>
  );
}
