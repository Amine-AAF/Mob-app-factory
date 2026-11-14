import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { premiumPlanKind } from '@/features/settings/premium';
import { fmt } from '@/i18n';
import { useSession } from '@/store/session';
import { Button, Card, Divider, Icon, ListRow, PageHeader, Row, Screen, SectionHeader, Stack, Text, useTheme, type IconName } from '@/ui';

interface Link {
  title: string;
  icon: IconName;
  path: string;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const groups: { title: string; links: Link[] }[] = [
    {
      title: t('profile.groups.wardrobe'),
      links: [
        { title: t('profile.links.insights'), icon: 'stats-chart-outline', path: '/insights' },
        { title: t('profile.links.care'), icon: 'water-outline', path: '/care' },
        { title: t('profile.links.archived'), icon: 'archive-outline', path: '/archived' },
      ],
    },
    {
      title: t('profile.groups.planning'),
      links: [
        { title: t('profile.links.trips'), icon: 'airplane-outline', path: '/trips' },
        { title: t('profile.links.history'), icon: 'time-outline', path: '/history' },
        { title: t('profile.links.goals'), icon: 'flag-outline', path: '/goals' },
      ],
    },
    {
      title: t('profile.groups.shopping'),
      links: [
        { title: t('profile.links.shopping'), icon: 'bag-handle-outline', path: '/shopping' },
        { title: t('profile.links.wishlist'), icon: 'heart-outline', path: '/wishlist' },
      ],
    },
    {
      title: t('profile.groups.app'),
      links: [
        { title: t('profile.links.settings'), icon: 'settings-outline', path: '/settings' },
        { title: t('profile.links.notifications'), icon: 'notifications-outline', path: '/settings/notifications' },
        { title: t('profile.links.taxonomy'), icon: 'pricetags-outline', path: '/settings/taxonomy' },
        { title: t('profile.links.data'), icon: 'cloud-download-outline', path: '/settings/data' },
        { title: t('profile.links.privacy'), icon: 'shield-checkmark-outline', path: '/settings/privacy' },
      ],
    },
  ];
  const version = Constants.expoConfig?.version ?? '';

  return (
    <Screen>
      <PageHeader eyebrow={t('profile.eyebrow')} title={t('profile.title')} />
      <PremiumStatus />
      {groups.map((g) => (
        <Stack key={g.title} gap={1}>
          <SectionHeader title={g.title} />
          <Card style={{ paddingVertical: 0, gap: 0 }}>
            {g.links.map((l, i) => (
              <Stack key={l.path} gap={0}>
                {i > 0 ? <Divider /> : null}
                <ListRow title={l.title} icon={l.icon} onPress={() => router.push(l.path as never)} />
              </Stack>
            ))}
          </Card>
        </Stack>
      ))}
      <Text variant="caption" tone="subtle" center>
        {t('profile.version', { version })}
      </Text>
    </Screen>
  );
}

function PremiumStatus() {
  const { t } = useTranslation();
  const theme = useTheme();
  const entitlement = useSession((s) => s.entitlement);
  if (entitlement.isPremium) {
    const kind = premiumPlanKind(entitlement.productId);
    const plan = kind === 'monthly' ? t('profile.premium.monthly') : kind === 'annual' ? t('profile.premium.annual') : kind === 'lifetime' ? t('profile.premium.lifetime') : null;
    const expiry = entitlement.expiresAt ? fmt.date(new Date(entitlement.expiresAt), { dateStyle: 'medium' }) : null;
    return (
      <Card tone="primary">
        <Row gap={2}>
          <Icon name="sparkles" size={18} color={theme.colors.primary} />
          <Text variant="heading" style={{ flex: 1 }}>
            {t('profile.premium.activeTitle')}
          </Text>
        </Row>
        {plan ? <Text tone="muted">{plan}</Text> : null}
        {expiry ? (
          <Text variant="bodySmall" tone="muted">
            {entitlement.willRenew ? t('profile.premium.renews', { date: expiry }) : t('profile.premium.expires', { date: expiry })}
          </Text>
        ) : null}
        <Text variant="caption" tone="subtle">
          {t('profile.premium.manage')}
        </Text>
      </Card>
    );
  }
  return (
    <Card tone="accent">
      <Row gap={2}>
        <Icon name="sparkles-outline" size={18} color={theme.colors.text} />
        <Text variant="heading" style={{ flex: 1 }}>
          {t('profile.premium.upsellTitle')}
        </Text>
      </Row>
      <Text tone="muted">{t('profile.premium.upsellMessage')}</Text>
      <Button small label={t('common.premium.seePlans')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'profile' } })} style={{ alignSelf: 'flex-start' }} />
    </Card>
  );
}
