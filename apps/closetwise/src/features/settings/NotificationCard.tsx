import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native';

import type { NotificationKind, NotificationSetting } from '@/domain/types';
import { fmt } from '@/i18n';
import { Card, Chip, FieldLabel, Icon, IconButton, Row, Stack, Text, useTheme, type IconName } from '@/ui';

import { NOTIFICATION_PARAM_OPTIONS, shiftTime, TIME_STEP_MINUTES } from './logic';

const ICONS: Record<NotificationKind, IconName> = {
  planned_outfit: 'shirt-outline',
  trip_prep: 'airplane-outline',
  checklist: 'checkbox-outline',
  budget: 'wallet-outline',
  goals: 'flag-outline',
};

export function NotificationCard({ setting, onToggle, onChange }: { setting: NotificationSetting; onToggle: (enabled: boolean) => void; onChange: (patch: Partial<Omit<NotificationSetting, 'kind'>>) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const title = t(`settings.notifications.kinds.${setting.kind}.title`);
  const params = NOTIFICATION_PARAM_OPTIONS[setting.kind];
  const step = (delta: number) => onChange(shiftTime(setting.hour, setting.minute, delta));
  const paramLabel = (v: number) =>
    params?.unit === 'percent' ? t('settings.notifications.percent', { value: v }) : v === 0 ? t('settings.notifications.dayOf') : t('settings.notifications.daysBefore', { count: v });

  return (
    <Card>
      <Row>
        <Icon name={ICONS[setting.kind]} size={20} color={theme.colors.textMuted} />
        <Stack gap={0.5} style={{ flex: 1 }}>
          <Text variant="heading">{title}</Text>
          <Text variant="bodySmall" tone="muted">
            {t(`settings.notifications.kinds.${setting.kind}.description`)}
          </Text>
        </Stack>
        <Switch
          value={setting.enabled}
          onValueChange={onToggle}
          accessibilityLabel={title}
          trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
          thumbColor={theme.colors.surface}
        />
      </Row>
      {setting.enabled ? (
        <Stack gap={3} style={{ marginTop: theme.spacing(2) }}>
          <Stack gap={1.5}>
            <FieldLabel>{setting.kind === 'budget' ? t('settings.notifications.checkInTime') : t('settings.notifications.time')}</FieldLabel>
            <Row gap={2}>
              <IconButton icon="remove" filled label={t('settings.notifications.earlier')} onPress={() => step(-TIME_STEP_MINUTES)} />
              <Text variant="number" style={{ minWidth: 96, textAlign: 'center' }} accessibilityLiveRegion="polite">
                {fmt.time(setting.hour, setting.minute)}
              </Text>
              <IconButton icon="add" filled label={t('settings.notifications.later')} onPress={() => step(TIME_STEP_MINUTES)} />
            </Row>
          </Stack>
          {params ? (
            <Stack gap={1.5}>
              <FieldLabel>{params.unit === 'percent' ? t('settings.notifications.threshold') : t('settings.notifications.when')}</FieldLabel>
              <Row gap={2} wrap>
                {params.values.map((v) => (
                  <Chip key={v} label={paramLabel(v)} selected={setting.param === v} onPress={() => onChange({ param: v })} />
                ))}
              </Row>
            </Stack>
          ) : null}
          {setting.kind === 'trip_prep' || setting.kind === 'budget' || setting.kind === 'goals' ? (
            <Text variant="caption" tone="subtle">
              {t(`settings.notifications.kinds.${setting.kind}.hint`)}
            </Text>
          ) : null}
        </Stack>
      ) : null}
    </Card>
  );
}
