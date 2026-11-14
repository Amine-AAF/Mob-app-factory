import { addDays, fromDayKey } from '@factory/app-core';
import { Button, Card, Chip, IconButton, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { repos } from '@/database';
import { useAsync } from '@/hooks';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { ensurePermission, syncNotifications } from '@/services/reminders';
import { useSession } from '@/store/session';
import type { Reminder, Weekday } from '@/types';
import { formatTime } from '@/utils';

import { Stepper } from './ui';

const WEEK: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
const MAX_REMINDERS_PER_HABIT = 3;

/**
 * Edits the local reminders of one habit (or the general daily check-in when
 * `habitId` is null): time, days, on/off, several reminders if needed. Every
 * change re-syncs the scheduled notifications.
 */
export function ReminderSettings({ habitId }: { habitId: string | null }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [message, setMessage] = useState<string | null>(null);
  const { data: reminders = [] } = useAsync(() => repos().reminders.forHabit(habitId), [habitId]);
  const monday = '2026-11-02';
  const dayLabel = (d: Weekday) => fmt.weekdayShort(fromDayKey(addDays(monday, (d + 6) % 7)));

  const save = async (r: Partial<Reminder> & { id?: string }, base?: Reminder) => {
    setMessage(null);
    try {
      const next = { habitId, hour: 8, minute: 0, days: [] as Weekday[], enabled: true, ...base, ...r };
      if (next.enabled) {
        const permission = await ensurePermission(t);
        if (permission !== 'granted') {
          next.enabled = false;
          setMessage(t('reminders.permissionDenied'));
        }
      }
      await repos().reminders.save(next, clock.now());
      await syncNotifications(repos(), t);
      useSession.getState().bump();
    } catch (e) {
      recordError(e, 'reminder_save');
      setMessage(t('common.error'));
    }
  };

  const remove = async (id: string) => {
    await repos().reminders.remove(id);
    await syncNotifications(repos(), t);
    useSession.getState().bump();
  };

  return (
    <View style={{ gap: 12 }}>
      {reminders.length === 0 ? (
        <Text variant="bodySmall" tone="muted">
          {t('reminders.none')}
        </Text>
      ) : null}
      {reminders.map((r) => (
        <Card key={r.id} testID={`reminder-${r.id}`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="heading">{formatTime(r.hour, r.minute)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Switch value={r.enabled} onValueChange={(enabled) => void save({ enabled }, r)} accessibilityLabel={t('reminders.enabled')} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />
              <IconButton icon="trash-outline" label={t('reminders.delete')} tone="danger" onPress={() => void remove(r.id)} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <View style={{ gap: 4 }}>
              <Text variant="caption" tone="muted">
                {t('reminders.hour')}
              </Text>
              <Stepper label={t('reminders.hour')} value={r.hour} min={0} max={23} onChange={(hour) => void save({ hour }, r)} />
            </View>
            <View style={{ gap: 4 }}>
              <Text variant="caption" tone="muted">
                {t('reminders.minute')}
              </Text>
              <Stepper label={t('reminders.minute')} value={r.minute} min={0} max={55} step={5} onChange={(minute) => void save({ minute }, r)} format={(v) => formatTime(0, v).slice(3)} />
            </View>
          </View>
          <Text variant="caption" tone="muted">
            {r.days.length ? t('reminders.someDays') : t('reminders.everyDay')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {WEEK.map((d) => (
              <Chip
                key={d}
                label={dayLabel(d)}
                selected={r.days.length === 0 || r.days.includes(d)}
                onPress={() => {
                  const current = r.days.length ? r.days : WEEK;
                  const next = current.includes(d) ? current.filter((x) => x !== d) : [...current, d];
                  void save({ days: next.length === 7 || next.length === 0 ? [] : next }, r);
                }}
              />
            ))}
          </View>
        </Card>
      ))}
      {reminders.length < MAX_REMINDERS_PER_HABIT ? (
        <Button label={t('reminders.add')} icon="alarm-outline" variant="secondary" size="md" onPress={() => void save({ hour: habitId ? 8 : 20, minute: 0 })} testID="add-reminder" />
      ) : null}
      {message ? (
        <Text variant="bodySmall" tone="warning" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
