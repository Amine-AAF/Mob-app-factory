import { Button, IconButton, Row, Screen, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { DASHBOARD_CARDS, usePreferences, type DashboardCard } from '@/store/preferences';

/** Personalise the Home screen: show, hide and reorder cards. */
export default function DashboardSettings() {
  const { t } = useTranslation();
  const cards = usePreferences((s) => s.dashboardCards);
  const set = usePreferences((s) => s.set);
  const hidden = DASHBOARD_CARDS.filter((c) => !cards.includes(c));
  const ordered: DashboardCard[] = [...cards, ...hidden];

  const move = (card: DashboardCard, dir: -1 | 1) => {
    const i = cards.indexOf(card);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= cards.length) return;
    const next = [...cards];
    [next[i], next[j]] = [next[j] as DashboardCard, next[i] as DashboardCard];
    set({ dashboardCards: next });
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.dashboard') }} />
      <Text variant="bodySmall" tone="muted">
        {t('settings.dashboardHelp')}
      </Text>
      {ordered.map((card) => {
        const visible = cards.includes(card);
        return (
          <Row key={card} gap={2} style={{ minHeight: 52 }}>
            <View style={{ flex: 1 }}>
              <Text>{t(`settings.cards.${card}`)}</Text>
            </View>
            <IconButton icon="arrow-up" size={18} label={t('courses.moveUp')} onPress={() => move(card, -1)} />
            <IconButton icon="arrow-down" size={18} label={t('courses.moveDown')} onPress={() => move(card, 1)} />
            <Switch value={visible} accessibilityLabel={t(`settings.cards.${card}`)} onValueChange={(v) => set({ dashboardCards: v ? [...cards, card] : cards.filter((c) => c !== card) })} />
          </Row>
        );
      })}
      <Button variant="ghost" label={t('settings.resetLayout')} onPress={() => set({ dashboardCards: DASHBOARD_CARDS })} />
    </Screen>
  );
}
