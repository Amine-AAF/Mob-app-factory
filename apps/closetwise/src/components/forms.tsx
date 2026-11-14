import { addDays, toDayKey } from '@factory/app-core';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { CURRENCIES } from '@/domain/catalog';
import { monthGrid, monthKeyOf, shiftMonth } from '@/domain/planner';
import type { DayKey } from '@/domain/types';
import { fmt } from '@/i18n';
import { pickPhoto, type StoredPhoto } from '@/services/photos';
import { clock } from '@/services/clock';
import { Button, Card, ChoiceChips, Field, FieldLabel, Icon, IconButton, Row, Sheet, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

import { ItemPhoto } from './ItemPhoto';

/** Native confirm dialog for destructive actions. */
export function confirmDelete(t: (k: string) => string, onConfirm: () => void, title?: string, message?: string): void {
  Alert.alert(title ?? t('common.confirmDeleteTitle'), message ?? t('common.confirmDeleteMessage'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), style: 'destructive', onPress: onConfirm },
  ]);
}

/**
 * Photo picker field: camera or gallery, with permission-denied and error handling.
 * The previous photo files are NOT deleted here: the caller removes them after saving,
 * so cancelling an edit never loses the original photo.
 */
export function PhotoField({
  photo,
  onChange,
  categoryKey,
  idPrefix = 'ph',
}: {
  photo: { photoPath: string | null; thumbPath: string | null };
  onChange: (p: StoredPhoto | null) => void;
  categoryKey?: Parameters<typeof ItemPhoto>[0]['categoryKey'];
  idPrefix?: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [busy, setBusy] = useState(false);
  const pick = async (source: 'camera' | 'library') => {
    setBusy(true);
    const res = await pickPhoto(source, idPrefix);
    setBusy(false);
    if (res.status === 'ok') onChange(res.photo);
    else if (res.status === 'denied') Alert.alert(t('common.photo.deniedTitle'), t('common.photo.deniedMessage'));
    else if (res.status === 'error') Alert.alert(t('common.photo.error'));
  };
  const has = !!(photo.photoPath || photo.thumbPath);
  return (
    <Stack gap={2}>
      <View style={{ alignSelf: 'center', width: 200 }}>
        <ItemPhoto photoPath={photo.photoPath} thumbPath={photo.thumbPath} categoryKey={categoryKey} size="full" accessibilityLabel={has ? t('common.photo.change') : t('common.photo.add')} />
        {has ? (
          <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: theme.colors.surface, borderRadius: 21 }}>
            <IconButton icon="close" label={t('common.photo.remove')} onPress={() => onChange(null)} size={18} />
          </View>
        ) : null}
      </View>
      <Row gap={2} style={{ justifyContent: 'center' }}>
        <Button small variant="secondary" icon="camera-outline" label={t('common.photo.camera')} onPress={() => pick('camera')} loading={busy} testID="photo-camera" />
        <Button small variant="secondary" icon="images-outline" label={t('common.photo.library')} onPress={() => pick('library')} disabled={busy} testID="photo-library" />
      </Row>
      <Text variant="caption" tone="subtle" center>
        {t('common.photo.privacy')}
      </Text>
    </Stack>
  );
}

/** Day picker: field showing the formatted date + a month-grid sheet. */
export function DateField({ label, value, onChange, allowClear, testID }: { label: string; value: DayKey | null; onChange: (d: DayKey | null) => void; allowClear?: boolean; testID?: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(monthKeyOf(value ?? clock.today()));
  const today = clock.today();
  const grid = monthGrid(month);
  return (
    <Stack gap={1.5}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        onPress={() => {
          setMonth(monthKeyOf(value ?? today));
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? fmt.day(value) : t('common.date.pick')}`}
        testID={testID}
        style={{ minHeight: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.surface }}
      >
        <Icon name="calendar-outline" size={18} color={theme.colors.textMuted} />
        <Text style={{ flex: 1 }} tone={value ? 'default' : 'subtle'}>
          {value ? fmt.day(value, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : t('common.date.pick')}
        </Text>
        {allowClear && value ? <IconButton icon="close-circle" size={18} label={t('common.clear')} onPress={() => onChange(null)} /> : null}
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton icon="chevron-back" label={t('common.date.previousMonth')} onPress={() => setMonth(shiftMonth(month, -1))} />
          <Text variant="heading">{fmt.monthYear(month)}</Text>
          <IconButton icon="chevron-forward" label={t('common.date.nextMonth')} onPress={() => setMonth(shiftMonth(month, 1))} />
        </Row>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {grid.slice(0, 7).map((c) => (
            <Text key={`h${c.day}`} variant="caption" tone="subtle" center style={{ width: `${100 / 7}%`, paddingVertical: 4 }}>
              {fmt.weekdayShort(c.day)}
            </Text>
          ))}
          {grid.map((c) => {
            const selected = c.day === value;
            return (
              <Pressable
                key={c.day}
                onPress={() => {
                  onChange(c.day);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={fmt.day(c.day)}
                accessibilityState={{ selected }}
                style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? theme.colors.primary : 'transparent', borderWidth: c.day === today ? 1 : 0, borderColor: theme.colors.accent }}>
                  <Text style={{ color: selected ? theme.colors.onPrimary : c.inMonth ? theme.colors.text : theme.colors.textSubtle, opacity: c.inMonth ? 1 : 0.5 }}>{Number(c.day.slice(8))}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Row gap={2}>
          <Button small variant="secondary" label={t('common.today')} onPress={() => (onChange(today), setOpen(false))} />
          <Button small variant="secondary" label={t('common.tomorrow')} onPress={() => (onChange(addDays(today, 1)), setOpen(false))} />
        </Row>
      </Sheet>
    </Stack>
  );
}

/** Amount + currency. The currency defaults to the user's currency but can differ per entry. */
export function MoneyField({ label, amount, currency, onAmount, onCurrency, error, testID }: { label: string; amount: string; currency: string; onAmount: (s: string) => void; onCurrency: (c: string) => void; error?: string | null; testID?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={1.5}>
      <Row gap={2} style={{ alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Field label={label} value={amount} onChangeText={onAmount} keyboardType="decimal-pad" placeholder="0" error={error} testID={testID} />
        </View>
        <Button small variant="secondary" label={currency} icon="cash-outline" onPress={() => setOpen(true)} style={{ marginBottom: error ? 22 : 4 }} />
      </Row>
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('common.money.currency')}>
        <ChoiceChips
          options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          value={currency as (typeof CURRENCIES)[number]}
          onChange={(c) => {
            if (c) onCurrency(c);
            setOpen(false);
          }}
        />
      </Sheet>
    </Stack>
  );
}

/** Card nudging to Premium when a free limit or a Premium feature is hit. */
export function PremiumCard({ message, source }: { message: string; source: string }) {
  const { t } = useTranslation();
  return (
    <Card tone="accent">
      <Row gap={2}>
        <Icon name="sparkles-outline" size={18} />
        <Text variant="heading" style={{ flex: 1 }}>
          {t('common.premium.badge')}
        </Text>
      </Row>
      <Text tone="muted">{message}</Text>
      <Button small label={t('common.premium.seePlans')} onPress={() => router.push({ pathname: '/paywall', params: { source } })} style={{ alignSelf: 'flex-start' }} />
    </Card>
  );
}

export function todayKey(): DayKey {
  return toDayKey(clock.now());
}
