import { Button, Icon, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { Panel, ProgressRing, TextField } from '@/components/ui';
import { repos } from '@/database';
import { countdown, readiness } from '@/features/agenda/agenda';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { rescheduleAll } from '@/services/notifications';
import { useSession } from '@/store/session';

export default function AgendaDetail() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const bump = useSession((s) => s.bump);
  const { id, table } = useLocalSearchParams<{ id: string; table: 'exams' | 'deadlines' }>();
  const [label, setLabel] = useState('');
  const { data } = useAsync(async () => ({ item: await repos().agenda.get(table, id), checklist: await repos().agenda.checklist(table, id) }), [id, table]);
  if (!data?.item) return <Screen edges={[]}>{null}</Screen>;
  const item = data.item;
  const c = countdown(item.day, item.minute, clock.now());
  const ready = readiness(item);

  const add = async () => {
    if (!label.trim()) return;
    await repos().agenda.addChecklistItem(table, id, label);
    setLabel('');
    bump();
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen
        options={{
          title: t(`agenda.kinds.${item.kind}`),
          headerRight: () => (
            <Row gap={0}>
              <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push({ pathname: '/agenda/edit', params: { id, table } })} />
              <IconButton
                icon="trash-outline"
                label={t('common.delete')}
                onPress={() =>
                  Alert.alert(t('agenda.deleteTitle'), undefined, [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                      text: t('common.delete'),
                      style: 'destructive',
                      onPress: async () => {
                        await repos().agenda.remove(table, id);
                        await rescheduleAll(repos(), i18n.t);
                        bump();
                        router.back();
                      },
                    },
                  ])
                }
              />
            </Row>
          ),
        }}
      />
      <Text variant="title">{item.title}</Text>
      <Text tone="muted">
        {fmt.dayLong(item.day)}
        {item.minute != null ? ` · ${fmt.time(item.minute)}` : ''} · {t(`agenda.priority.${item.priority}`)}
      </Text>
      <Panel title={t('agenda.countdown')} icon="hourglass-outline">
        {item.done ? (
          <Text tone="success">{t('agenda.completed')}</Text>
        ) : c.state === 'past' ? (
          <Text tone="muted">{t('agenda.passed')}</Text>
        ) : (
          <Row gap={4} style={{ justifyContent: 'center' }}>
            {[
              { v: c.days, k: 'days' },
              { v: c.hours, k: 'hours' },
              { v: c.minutes, k: 'minutes' },
            ].map((x) => (
              <View key={x.k} style={{ alignItems: 'center', minWidth: 64 }}>
                <Text variant="display" tone="primary">
                  {fmt.number(x.v)}
                </Text>
                <Text variant="caption" tone="subtle">
                  {t(`agenda.units.${x.k}`, { count: x.v })}
                </Text>
              </View>
            ))}
          </Row>
        )}
        {table === 'deadlines' ? (
          <Button
            size="md"
            variant={item.done ? 'secondary' : 'primary'}
            icon={item.done ? 'refresh' : 'checkmark'}
            label={item.done ? t('agenda.reopen') : t('agenda.markDone')}
            onPress={async () => {
              await repos().agenda.setDeadlineDone(id, !item.done);
              await rescheduleAll(repos(), i18n.t);
              bump();
            }}
          />
        ) : null}
      </Panel>
      <Panel title={t('agenda.checklist')} icon="list-outline">
        {ready != null ? (
          <Row gap={3}>
            <ProgressRing progress={ready} size={64} label={fmt.percent(ready)} color={theme.colors.success} />
            <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
              {t('agenda.readinessText', { done: item.checklistDone, total: item.checklistTotal })}
            </Text>
          </Row>
        ) : null}
        {data.checklist.map((ci) => (
          <Row key={ci.id} gap={2}>
            <Pressable
              onPress={async () => {
                await repos().agenda.toggleChecklistItem(ci.id, !ci.done);
                bump();
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: ci.done }}
              accessibilityLabel={ci.label}
              style={{ flex: 1, flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 44 }}
            >
              <Icon name={ci.done ? 'checkbox' : 'square-outline'} size={22} color={ci.done ? theme.colors.success : theme.colors.textSubtle} />
              <Text style={{ flex: 1, textDecorationLine: ci.done ? 'line-through' : 'none' }}>{ci.label}</Text>
            </Pressable>
            <IconButton
              icon="close"
              size={16}
              label={t('common.delete')}
              onPress={async () => {
                await repos().agenda.removeChecklistItem(ci.id);
                bump();
              }}
            />
          </Row>
        ))}
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <TextField placeholder={t('agenda.addStep')} value={label} onChangeText={setLabel} onSubmitEditing={add} maxLength={120} />
          </View>
          <IconButton icon="add-circle" tone="primary" label={t('agenda.addStep')} onPress={add} size={30} />
        </Row>
      </Panel>
      {item.notes ? (
        <Panel title={t('agenda.notes')} icon="document-text-outline">
          <Text>{item.notes}</Text>
        </Panel>
      ) : null}
      <Stack gap={2}>
        <Button size="md" variant="secondary" icon="calendar-outline" label={t('agenda.planRevision')} onPress={() => router.push({ pathname: '/planner/session', params: { subjectId: item.subjectId ?? '' } })} />
      </Stack>
    </Screen>
  );
}
