import { Button, Chip, OptionCard, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChipSelect, SelectField, SwitchRow, TextField } from '@/components/forms';
import { IconTile, Notice } from '@/components/ui';
import { HOME_TYPE_ICONS, ROOM_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { COMMON_CURRENCIES, currencyForRegion } from '@/domain/money';
import { HOME_TYPES, ROOM_KINDS, type HomeType, type RoomKind } from '@/domain/types';
import { defaultUnitSystem, type UnitSystem } from '@/domain/units';
import { currentLanguage } from '@/i18n';
import { initAds } from '@/services/ads';
import { recordError, setAnalyticsConsent, track } from '@/services/analytics';
import { mutate } from '@/services/mutations';
import { requestNotificationPermission } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';

const DEFAULT_ROOMS: RoomKind[] = ['living', 'kitchen', 'bedroom', 'bathroom'];

/** Three short steps: value proposition → first home → reminders & privacy. No account. */
export default function Onboarding() {
  const { t } = useTranslation();
  const theme = useTheme();
  const prefs = usePreferences();
  const region = getLocales()[0]?.regionCode ?? null;
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [type, setType] = useState<HomeType>('apartment');
  const [currency, setCurrency] = useState(currencyForRegion(region, prefs.currency));
  const [units, setUnits] = useState<UnitSystem>(defaultUnitSystem(region));
  const [rooms, setRooms] = useState<RoomKind[]>(DEFAULT_ROOMS);
  const [notify, setNotify] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      const home = await mutate(
        () =>
          repos().homes.create(
            { name: name.trim() || t('onboarding.defaultHomeName'), type, currency },
            rooms.map((kind) => ({ kind, name: t(`roomKinds.${kind}`) })),
          ),
        { homes: true },
      );
      prefs.set({ onboardingCompleted: true, activeHomeId: home.id, currency, units, analyticsConsent: analytics });
      setAnalyticsConsent(analytics);
      track('onboarding_completed', { home_type: type, ui_language: currentLanguage() });
      if (notify) await requestNotificationPermission(t).catch(() => undefined);
      initAds().catch((e) => recordError(e, 'onboarding_ads'));
      router.replace('/(tabs)');
    } catch (e) {
      recordError(e, 'onboarding');
      setSaving(false);
    }
  };

  const dots = (
    <Row gap={2} style={{ justifyContent: 'center' }} accessibilityLabel={t('onboarding.step', { current: step + 1, total: 3 })}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? theme.colors.primary : theme.colors.border }} />
      ))}
    </Row>
  );

  if (step === 0) {
    return (
      <Screen footer={<Stack gap={3}>{dots}<Button label={t('onboarding.start')} onPress={() => setStep(1)} testID="onboarding-start" /></Stack>}>
        <Stack gap={5} style={{ paddingTop: 24 }}>
          <IconTile icon="home" size={72} />
          <Text variant="display">{t('onboarding.title')}</Text>
          <Text tone="muted">{t('onboarding.subtitle')}</Text>
          {(['maintenance', 'assets', 'documents', 'expenses'] as const).map((k) => (
            <Row key={k} gap={3}>
              <IconTile icon={({ maintenance: 'construct-outline', assets: 'cube-outline', documents: 'folder-open-outline', expenses: 'wallet-outline' } as const)[k]} />
              <View style={{ flex: 1 }}>
                <Text variant="subheading">{t(`onboarding.points.${k}.title`)}</Text>
                <Text variant="bodySmall" tone="muted">
                  {t(`onboarding.points.${k}.body`)}
                </Text>
              </View>
            </Row>
          ))}
          <Notice icon="lock-closed-outline">{t('onboarding.privacy')}</Notice>
        </Stack>
      </Screen>
    );
  }

  if (step === 1) {
    return (
      <Screen
        footer={
          <Stack gap={3}>
            {dots}
            <Row gap={3}>
              <View style={{ flex: 1 }}>
                <Button label={t('common.back')} variant="secondary" onPress={() => setStep(0)} />
              </View>
              <View style={{ flex: 2 }}>
                <Button label={t('common.continue')} onPress={() => setStep(2)} testID="onboarding-next" />
              </View>
            </Row>
          </Stack>
        }
      >
        <Text variant="title">{t('onboarding.homeTitle')}</Text>
        <TextField label={t('fields.homeName')} value={name} onChangeText={setName} placeholder={t('onboarding.defaultHomeName')} testID="onboarding-name" />
        <Text variant="bodySmall" tone="muted" style={{ fontWeight: '600' }}>
          {t('fields.homeType')}
        </Text>
        <Stack gap={2}>
          {HOME_TYPES.map((ht) => (
            <OptionCard key={ht} title={t(`homeTypes.${ht}`)} icon={HOME_TYPE_ICONS[ht]} selected={type === ht} onPress={() => setType(ht)} />
          ))}
        </Stack>
        <Text variant="bodySmall" tone="muted" style={{ fontWeight: '600' }}>
          {t('onboarding.spaces')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ROOM_KINDS.map((k) => (
            <Chip key={k} label={t(`roomKinds.${k}`)} icon={ROOM_ICONS[k]} selected={rooms.includes(k)} onPress={() => setRooms((r) => (r.includes(k) ? r.filter((x) => x !== k) : [...r, k]))} />
          ))}
        </View>
        <SelectField label={t('fields.currency')} options={COMMON_CURRENCIES.includes(currency as never) ? COMMON_CURRENCIES : [currency, ...COMMON_CURRENCIES]} value={currency} renderLabel={(c) => c} onChange={(c) => c && setCurrency(c)} icon="cash-outline" />
        <ChipSelect label={t('fields.units')} options={['metric', 'imperial'] as const} value={units} onChange={(u) => u && setUnits(u)} renderLabel={(u) => t(`units.${u}`)} />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Stack gap={3}>
          {dots}
          <Row gap={3}>
            <View style={{ flex: 1 }}>
              <Button label={t('common.back')} variant="secondary" onPress={() => setStep(1)} />
            </View>
            <View style={{ flex: 2 }}>
              <Button label={t('onboarding.finish')} onPress={finish} loading={saving} testID="onboarding-finish" />
            </View>
          </Row>
        </Stack>
      }
    >
      <Text variant="title">{t('onboarding.lastTitle')}</Text>
      <SwitchRow label={t('onboarding.notifications')} subtitle={t('onboarding.notificationsHint')} value={notify} onValueChange={setNotify} />
      <SwitchRow label={t('onboarding.analytics')} subtitle={t('onboarding.analyticsHint')} value={analytics} onValueChange={setAnalytics} />
      <Notice icon="shield-checkmark-outline">{t('onboarding.dataPromise')}</Notice>
    </Screen>
  );
}
