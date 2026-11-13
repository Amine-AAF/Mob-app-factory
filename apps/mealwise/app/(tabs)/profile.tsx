import { Badge, Card, Chip, Divider, Icon, ListRow, Row, Screen, SectionHeader, Text, useTheme } from '@factory/design-system';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { View } from 'react-native';

import { AdBanner } from '@/components/cards';
import { useLang } from '@/hooks/useLang';
import { useIsPremium, useSession } from '@/store/session';
import { usePreferences } from '@/store/preferences';

export default function Profile() {
  const { t } = useLang();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const entitlement = useSession((s) => s.entitlement);
  const themePref = usePreferences((s) => s.theme);
  const set = usePreferences((s) => s.set);

  const rows: { icon: Parameters<typeof ListRow>[0]['icon']; title: string; subtitle?: string; href: Parameters<typeof router.push>[0]; testID: string }[] = [
    { icon: 'file-tray-full-outline', title: t('pantry.title'), subtitle: t('profile.pantryHint'), href: '/pantry', testID: 'row-pantry' },
    { icon: 'nutrition-outline', title: t('nutrition.title'), subtitle: t('profile.nutritionHint'), href: '/nutrition', testID: 'row-nutrition' },
    { icon: 'wallet-outline', title: t('budget.title'), subtitle: t('profile.budgetHint'), href: '/budget', testID: 'row-budget' },
    { icon: 'albums-outline', title: t('templates.title'), subtitle: t('profile.templatesHint'), href: '/templates', testID: 'row-templates' },
    { icon: 'time-outline', title: t('history.title'), href: '/history', testID: 'row-history' },
  ];
  const settings: typeof rows = [
    { icon: 'globe-outline', title: t('settings.region'), subtitle: t('settings.regionHint'), href: '/settings/region', testID: 'row-region' },
    { icon: 'notifications-outline', title: t('settings.notifications'), href: '/settings/notifications', testID: 'row-notifications' },
    { icon: 'server-outline', title: t('settings.data'), subtitle: t('settings.dataHint'), href: '/settings/data', testID: 'row-data' },
    { icon: 'shield-checkmark-outline', title: t('settings.privacy'), href: '/settings/privacy', testID: 'row-privacy' },
  ];

  return (
    <Screen testID="profile-screen">
      <Text variant="title" accessibilityRole="header">
        {t('profile.title')}
      </Text>
      <Card tone={isPremium ? 'accent' : 'primary'} onPress={() => router.push({ pathname: '/paywall', params: { source: 'profile' } })} accessibilityLabel={isPremium ? t('profile.premiumActive') : t('profile.goPremium')}>
        <Row gap={3}>
          <Icon name="sparkles" size={24} color={isPremium ? theme.colors.accent : theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{isPremium ? t('profile.premiumActive') : t('profile.goPremium')}</Text>
            <Text variant="bodySmall" tone="muted">
              {isPremium ? (entitlement.expiresAt ? t('profile.renews', { date: new Date(entitlement.expiresAt).toLocaleDateString() }) : t('profile.lifetime')) : t('profile.premiumPitch')}
            </Text>
          </View>
          {isPremium ? <Badge label={t('premium.badge')} tone="success" /> : <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />}
        </Row>
      </Card>

      <SectionHeader title={t('profile.kitchen')} />
      <Card>
        {rows.map((r, i) => (
          <View key={r.testID}>
            {i > 0 ? <Divider /> : null}
            <ListRow icon={r.icon} title={r.title} subtitle={r.subtitle} onPress={() => router.push(r.href)} testID={r.testID} />
          </View>
        ))}
      </Card>

      <SectionHeader title={t('settings.appearance')} />
      <Row gap={2} wrap>
        {(['system', 'light', 'dark'] as const).map((p) => (
          <Chip key={p} label={t(`settings.theme.${p}`)} selected={themePref === p} onPress={() => set({ theme: p })} icon={p === 'dark' ? 'moon-outline' : p === 'light' ? 'sunny-outline' : 'phone-portrait-outline'} />
        ))}
      </Row>

      <SectionHeader title={t('profile.settings')} />
      <Card>
        {settings.map((r, i) => (
          <View key={r.testID}>
            {i > 0 ? <Divider /> : null}
            <ListRow icon={r.icon} title={r.title} subtitle={r.subtitle} onPress={() => router.push(r.href)} testID={r.testID} />
          </View>
        ))}
      </Card>
      <Text variant="caption" tone="subtle" center>
        MealWise {Constants.expoConfig?.version ?? ''} · {t('profile.offline')}
      </Text>
      <AdBanner screen="profile" />
    </Screen>
  );
}
