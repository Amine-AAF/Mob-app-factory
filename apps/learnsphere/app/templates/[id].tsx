import { Button, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { DayField, TimeField } from '@/components/pickers';
import { ColorPicker, Panel, Stepper, TextField, ToggleRow, WeekdayPicker } from '@/components/ui';
import { canCreate } from '@/config/limits';
import type { LabelSpec, TemplateDef } from '@/content/templates';
import { repos } from '@/database';
import { applyTemplate, defaultCustomization, targetDay, type TemplateCustomization } from '@/features/courses/applyTemplate';
import { weekDays } from '@/features/planner/planner';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { rescheduleAll } from '@/services/notifications';
import { afterLearningWrite } from '@/services/progress';
import { useIsPremium } from '@/store/session';

/** Preview + customise + apply a template. */
export default function TemplateApply() {
  const { t, i18n } = useTranslation();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tpl, setTpl] = useState<TemplateDef | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [c, setC] = useState<TemplateCustomization | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void repos()
      .templates.get(id)
      .then((stored) => {
        if (!stored) return;
        setTpl(stored.def);
        setUserName(stored.name);
        setC(defaultCustomization(stored.def, stored.name ?? t(`templates.items.${stored.def.id}.name`), clock.today()));
      });
  }, [id, t]);

  if (!tpl || !c) return <Screen edges={[]}>{null}</Screen>;
  const label = (spec: LabelSpec) => t(`templateLabels.${spec.key}`, { n: spec.n ?? '' }).trim();
  const set = (patch: Partial<TemplateCustomization>) => setC({ ...c, ...patch });

  const apply = async () => {
    if (!c.subjectName.trim()) return;
    if (!canCreate('subjects', await repos().subjects.countActive(), isPremium)) return router.push({ pathname: '/paywall', params: { source: 'subjects_limit' } });
    setBusy(true);
    try {
      const subjectId = await applyTemplate(repos(), tpl, c, label);
      track('template_applied', { template_id: userName ? 'custom' : tpl.id });
      await rescheduleAll(repos(), i18n.t);
      await afterLearningWrite(repos());
      router.dismissAll();
      router.push({ pathname: '/subject/[id]', params: { id: subjectId } });
    } catch {
      setBusy(false);
      Alert.alert(t('common.error'));
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('templates.apply')} onPress={apply} loading={busy} testID="template-apply" />}>
      <RouterStack.Screen options={{ title: userName ?? t(`templates.items.${tpl.id}.name`) }} />
      {!userName ? <Text tone="muted">{t(`templates.items.${tpl.id}.desc`)}</Text> : null}
      <Panel title={t('templates.customize')} icon="color-palette-outline">
        <TextField label={t('templates.subjectName')} value={c.subjectName} onChangeText={(v) => set({ subjectName: v })} maxLength={60} />
        <ColorPicker label={t('courses.fields.color')} value={c.color} onChange={(v) => set({ color: v })} />
        <DayField label={t('templates.startDay')} value={c.startDay} onChange={(d) => d && set({ startDay: d })} />
        <Stepper label={t('templates.duration')} value={c.weeks} onChange={(v) => set({ weeks: v })} min={1} max={52} format={(v) => t('templates.weeks', { count: v })} />
        <Text variant="caption" tone="subtle">
          {t('templates.endsOn', { date: fmt.dayLong(targetDay(c)) })}
        </Text>
      </Panel>
      <Panel title={t('templates.rhythmTitle')} icon="repeat-outline">
        <ToggleRow title={t('templates.createSessions')} value={c.createSessions} onChange={(v) => set({ createSessions: v })} />
        {c.createSessions ? (
          <Stack gap={3}>
            <WeekdayPicker value={c.days} onChange={(days) => set({ days })} labels={weekDays(clock.today()).map((d) => fmt.weekdayShort(d))} />
            <TimeField label={t('planner.fields.start')} value={c.startMinute} onChange={(v) => set({ startMinute: v })} />
            <Stepper label={t('planner.fields.duration')} value={c.minutes} onChange={(v) => set({ minutes: v })} min={10} max={240} step={5} format={fmt.duration} />
          </Stack>
        ) : null}
        <ToggleRow title={t('templates.createGoals')} subtitle={tpl.goals.map((g) => `${t(`goals.periods.${g.period}`)}: ${g.metric === 'minutes' ? fmt.duration(g.target) : `${g.target} ${t(`goals.metrics.${g.metric}`)}`}`).join(' · ')} value={c.createGoals} onChange={(v) => set({ createGoals: v })} />
      </Panel>
      <Panel title={t('templates.structure')} icon="git-branch-outline">
        {tpl.courses.map((course, i) => (
          <Stack key={i} gap={1}>
            <Text variant="subheading">{label(course.label)}</Text>
            <Text variant="bodySmall" tone="muted">
              {course.chapters.slice(0, 6).map(label).join(' · ')}
              {course.chapters.length > 6 ? ` · +${course.chapters.length - 6}` : ''}
            </Text>
          </Stack>
        ))}
        {tpl.exam ? (
          <Row gap={2}>
            <Text variant="bodySmall" tone="danger">
              {t('templates.examOnTarget', { kind: t(`agenda.kinds.${tpl.exam.kind}`) })}
            </Text>
          </Row>
        ) : null}
      </Panel>
    </Screen>
  );
}
