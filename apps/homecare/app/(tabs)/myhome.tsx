import { Card, Chip, EmptyState, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AdBanner, PhotoStrip } from '@/components/media';
import { IconTile, InfoLine, ItemRow, ScreenHeader } from '@/components/ui';
import { HOME_TYPE_ICONS, ROOM_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { useData } from '@/hooks/useData';
import { useActiveHome } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

const SECTIONS: { key: string; icon: IconName; route: string }[] = [
  { key: 'assets', icon: 'cube-outline', route: '/assets' },
  { key: 'inventory', icon: 'albums-outline', route: '/inventory' },
  { key: 'expenses', icon: 'wallet-outline', route: '/expenses' },
  { key: 'repairs', icon: 'hammer-outline', route: '/repairs' },
  { key: 'history', icon: 'time-outline', route: '/history' },
];

export default function MyHome() {
  const { t } = useTranslation();
  const theme = useTheme();
  const home = useActiveHome();
  const homes = useSession((s) => s.homes);
  const units = usePreferences((s) => s.units);
  const setPrefs = usePreferences((s) => s.set);
  const { data } = useData(async () => {
    if (!home) return null;
    const r = repos();
    const [rooms, counts, assets, inventory, openRepairs] = await Promise.all([r.homes.listRooms(home.id), r.homes.roomCounts(home.id), r.assets.count(home.id), r.inventory.count(home.id), r.repairs.countOpen(home.id)]);
    return { rooms, counts, totals: { assets, inventory, repairs: openRepairs } as Record<string, number> };
  }, [home?.id]);

  if (!home) {
    return (
      <Screen>
        <EmptyState icon="home-outline" title={t('dashboard.noHome')} />
      </Screen>
    );
  }

  return (
    <Screen testID="my-home">
      <ScreenHeader
        title={t('myHome.title')}
        right={
          <>
            <IconButton icon="swap-horizontal" label={t('homes.manage')} onPress={() => router.push('/homes')} />
            <IconButton icon="create-outline" label={t('homes.edit')} onPress={() => router.push({ pathname: '/homes/edit', params: { id: home.id } })} />
          </>
        }
      />

      {homes.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {homes.map((h) => (
            <Chip key={h.id} label={h.name} icon={HOME_TYPE_ICONS[h.type]} selected={h.id === home.id} onPress={() => setPrefs({ activeHomeId: h.id })} />
          ))}
        </ScrollView>
      ) : null}

      <Card>
        <Row gap={3}>
          <IconTile icon={HOME_TYPE_ICONS[home.type]} size={52} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">{home.name}</Text>
            <Text variant="bodySmall" tone="muted">
              {[t(`homeTypes.${home.type}`), home.areaM2 ? fmt.area(home.areaM2, units) : null, home.roomsCount ? t('myHome.roomsCount', { count: home.roomsCount }) : null].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </Row>
        <InfoLine icon="location-outline" label={t('fields.address')} value={home.address} />
        <InfoLine icon="key-outline" label={t('fields.moveInDate')} value={home.moveInDate ? fmt.day(home.moveInDate, 'long') : null} />
        <InfoLine icon="reader-outline" label={t('fields.description')} value={home.description} />
        <PhotoStrip ownerType="home" ownerId={home.id} title={t('photos.title')} />
      </Card>

      <SectionHeader title={t('myHome.spaces')} action={t('rooms.add')} onAction={() => router.push('/rooms/edit')} />
      {data?.rooms.length === 0 ? (
        <Text variant="bodySmall" tone="muted">
          {t('rooms.empty')}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {data?.rooms.map((room) => {
          const c = data.counts[room.id];
          return (
            <Pressable
              key={room.id}
              onPress={() => router.push(`/rooms/${room.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${room.name}, ${t('rooms.summary', { assets: c?.assets ?? 0, tasks: c?.tasks ?? 0 })}`}
              style={({ pressed }) => ({ width: '47%', flexGrow: 1, gap: 8, padding: 12, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface })}
            >
              <IconTile icon={ROOM_ICONS[room.kind]} size={36} />
              <Text variant="subheading" numberOfLines={1}>
                {room.name}
              </Text>
              <Text variant="caption" tone="muted">
                {t('rooms.summary', { assets: c?.assets ?? 0, tasks: c?.tasks ?? 0 })}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title={t('myHome.manage')} />
      <Stack gap={2}>
        {SECTIONS.map((s) => (
          <ItemRow
            key={s.key}
            icon={s.icon}
            title={t(`myHome.sections.${s.key}`)}
            subtitle={data?.totals[s.key] !== undefined ? t(`myHome.counts.${s.key}`, { count: data.totals[s.key] }) : t(`myHome.hints.${s.key}`)}
            onPress={() => router.push(s.route as never)}
          />
        ))}
      </Stack>
      <AdBanner />
    </Screen>
  );
}
