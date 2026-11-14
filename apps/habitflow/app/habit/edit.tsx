import { Button, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { HabitEditor, validateDraft, type HabitDraft } from '@/components/HabitEditor';
import { FREE_LIMITS, HABIT_COLORS } from '@/constants';
import { repos } from '@/database';
import { scheduleOn } from '@/features/habits/schedule';
import { templateById } from '@/features/templates/data';
import { useInterstitial, useToday } from '@/hooks';
import { countActivityForAds, interstitialAllowed } from '@/services/ads';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { createHabit, updateHabit } from '@/services/habitService';
import { useIsPremium } from '@/store/session';
import { cleanText } from '@/utils';

const EMPTY: HabitDraft = {
  name: '', description: '', icon: 'star', color: HABIT_COLORS[0], category: 'custom', frequency: { type: 'daily' },
  tracking: { mode: 'check', target: 1, unit: null }, durationMin: null, notes: '', templateId: null,
};

/** Create (optionally from a template) or edit a habit. */
export default function HabitEditScreen() {
  const { t } = useTranslation();
  const today = useToday();
  const premium = useIsPremium();
  const { id, templateId } = useLocalSearchParams<{ id?: string; templateId?: string }>();
  // New habits start from the chosen template (or empty); existing ones load asynchronously below.
  const [draft, setDraft] = useState<HabitDraft | null>(() => {
    if (id) return null;
    const tpl = templateId ? templateById(templateId) : undefined;
    if (!tpl) return EMPTY;
    return {
      ...EMPTY,
      name: t(`templates.items.${tpl.id}.name`),
      description: t(`templates.items.${tpl.id}.desc`),
      icon: tpl.icon, color: tpl.color, category: tpl.category, frequency: tpl.frequency, tracking: tpl.tracking, durationMin: tpl.durationMin, templateId: tpl.id,
    };
  });
  const [startDate, setStartDate] = useState(today);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const interstitial = useInterstitial(!id && interstitialAllowed({ adsDisabled: premium, now: clock.now().getTime() }));

  useEffect(() => {
    if (!id) return;
    void repos()
      .habits.get(id)
      .then((h) => {
        if (!h) return router.back();
        const s = scheduleOn(h, today < h.startDate ? h.startDate : today) ?? h.schedules.at(-1)!;
        setStartDate(h.startDate);
        setDraft({ name: h.name, description: h.description ?? '', icon: h.icon, color: h.color, category: h.category, frequency: s.frequency, tracking: s.tracking, durationMin: h.durationMin, notes: h.notes ?? '', templateId: h.templateId });
      });
  }, [id, today]);

  if (!draft) return null;
  const errors = submitted ? validateDraft(draft) : {};

  const save = async () => {
    setSubmitted(true);
    if (Object.keys(validateDraft(draft)).length) return;
    setSaving(true);
    try {
      const input = {
        name: draft.name.trim().slice(0, 60), description: cleanText(draft.description, 160), icon: draft.icon, color: draft.color, category: draft.category,
        startDate, durationMin: draft.durationMin, notes: cleanText(draft.notes), templateId: draft.templateId, frequency: draft.frequency, tracking: draft.tracking,
      };
      if (id) {
        await updateHabit(id, input, t);
        router.back();
      } else {
        if (!premium && (await repos().habits.countActive()) >= FREE_LIMITS.activeHabits) {
          router.replace({ pathname: '/paywall', params: { source: 'habit_limit' } });
          return;
        }
        await createHabit(input, t);
        countActivityForAds();
        // Natural transition: the habit is saved; an (optional, capped) interstitial may show before leaving.
        void interstitial.showThen(() => router.dismissTo('/(tabs)'));
      }
    } catch (e) {
      recordError(e, 'habit_save');
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <RouterStack.Screen options={{ title: id ? t('editor.editTitle') : t('editor.newTitle') }} />
      <Screen edges={[]} footer={<Button label={id ? t('common.save') : t('editor.create')} icon="checkmark" onPress={() => void save()} loading={saving} testID="save-habit" />}>
        {templateId && !id ? (
          <Text variant="bodySmall" tone="muted">
            {t('editor.fromTemplate')}
          </Text>
        ) : null}
        <HabitEditor draft={draft} onChange={setDraft} errors={errors} isEdit={!!id} />
      </Screen>
    </>
  );
}
