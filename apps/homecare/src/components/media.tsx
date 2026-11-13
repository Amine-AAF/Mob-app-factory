import { Button, Icon, Row, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, Pressable, ScrollView, View } from 'react-native';

import { repos } from '@/database';
import type { Photo, PhotoOwner } from '@/domain/types';
import { adsSdk, adUnits, bannerAllowed, onAdsStateChange } from '@/services/ads';
import { deleteStoredFile, fileExists, fileUri, pickPhoto } from '@/services/files';
import { mutate } from '@/services/mutations';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/* ----------------------------------------------------------------- Photos */

/** Thumbnail for a stored photo path; shows a placeholder when the file is gone. */
export function Thumb({ path, size = 40, icon = 'image-outline' }: { path: string | null | undefined; size?: number; icon?: 'image-outline' | 'home-outline' }) {
  const theme = useTheme();
  const uri = path && fileExists(path) ? fileUri(path) : null;
  if (!uri) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 3.2, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={size * 0.45} color={theme.colors.textSubtle} />
      </View>
    );
  }
  return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 3.2 }} accessibilityIgnoresInvertColors />;
}

/** Ask camera vs gallery, then store the photo privately. */
export function usePhotoPicker() {
  const { t } = useTranslation();
  return (onPicked: (path: string) => void) => {
    const run = async (source: 'camera' | 'library') => {
      const res = await pickPhoto(source);
      if (res.status === 'ok') onPicked(res.value.path);
      else if (res.status === 'denied') Alert.alert(t('photos.cameraDeniedTitle'), t('photos.cameraDenied'));
      else if (res.status === 'error') Alert.alert(t('common.error'), t('photos.error'));
    };
    Alert.alert(t('photos.add'), undefined, [
      { text: t('photos.camera'), onPress: () => void run('camera') },
      { text: t('photos.gallery'), onPress: () => void run('library') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };
}

/**
 * Horizontal photo strip bound to an existing owner (home, room, asset, repair, inventory item).
 * Shown on detail screens, so photos are attached once the record is saved.
 */
export function PhotoStrip({ ownerType, ownerId, kind = 'photo', title, editable = true, max = 8 }: { ownerType: PhotoOwner; ownerId: string; kind?: Photo['kind']; title?: string; editable?: boolean; max?: number }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewer, setViewer] = useState<Photo | null>(null);
  const pick = usePhotoPicker();
  const load = () => repos().photos.list(ownerType, ownerId).then((list) => setPhotos(list.filter((p) => p.kind === kind)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void load(), [ownerType, ownerId, kind]);

  const add = () =>
    pick(async (path) => {
      await mutate(() => repos().photos.add(ownerType, ownerId, path, kind));
      await load();
    });

  const remove = (p: Photo) =>
    Alert.alert(t('photos.deleteTitle'), t('photos.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await mutate(() => repos().photos.remove(p.id));
          deleteStoredFile(p.filePath);
          setViewer(null);
          await load();
        },
      },
    ]);

  return (
    <View style={{ gap: 8 }}>
      {title ? (
        <Text variant="label" tone="subtle">
          {title}
        </Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {photos.map((p) => (
          <Pressable key={p.id} onPress={() => setViewer(p)} accessibilityRole="imagebutton" accessibilityLabel={t('photos.open')}>
            <Thumb path={p.filePath} size={84} />
          </Pressable>
        ))}
        {editable && photos.length < max ? (
          <Pressable
            onPress={add}
            accessibilityRole="button"
            accessibilityLabel={t('photos.add')}
            style={{ width: 84, height: 84, borderRadius: 26, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', gap: 2 }}
          >
            <Icon name="camera-outline" size={22} color={theme.colors.primary} />
            <Text variant="caption" tone="primary">
              {t('photos.addShort')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
          {viewer && fileExists(viewer.filePath) ? (
            <Image source={{ uri: fileUri(viewer.filePath) ?? undefined }} style={{ flex: 1 }} resizeMode="contain" accessibilityLabel={t('photos.open')} />
          ) : (
            <Text center style={{ color: '#fff' }}>
              {t('files.missing')}
            </Text>
          )}
          <Row style={{ position: 'absolute', top: 40, left: 16, right: 16, justifyContent: 'space-between' }}>
            <Button label={t('common.close')} variant="secondary" size="md" onPress={() => setViewer(null)} />
            {editable && viewer ? <Button label={t('common.delete')} variant="danger" size="md" icon="trash-outline" onPress={() => remove(viewer)} /> : null}
          </Row>
        </View>
      </Modal>
    </View>
  );
}

/* ----------------------------------------------------------------- Ads */

/**
 * Anchored adaptive banner, labelled and separated from content. Only placed at the
 * bottom of browse screens (dashboard, lists) — never on document viewers, forms or
 * while completing a task.
 */
export function AdBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const sessionCount = usePreferences((s) => s.sessionCount);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => onAdsStateChange(() => force((n) => n + 1)), []);

  const sdk = adsSdk();
  if (!sdk || failed || !adUnits.banner || !bannerAllowed({ isPremium, sessionCount, screenAllowsAds: true })) return null;
  const { BannerAd, BannerAdSize } = sdk;
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12 }}>
      <Text variant="caption" tone="subtle" style={{ marginBottom: 4 }}>
        {t('ads.label')}
      </Text>
      <BannerAd unitId={adUnits.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: false }} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}

/* ----------------------------------------------------------------- Premium */

export function PremiumLock({ feature, message }: { feature: string; message: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/paywall', params: { source: feature } })}
      accessibilityRole="button"
      accessibilityLabel={`${message}. ${t('premium.unlock')}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.accentSoft }}
    >
      <Icon name="diamond-outline" size={20} color={theme.colors.accent} />
      <Text variant="bodySmall" style={{ flex: 1 }}>
        {message}
      </Text>
      <Text variant="bodySmall" tone="accent" style={{ fontWeight: '700' }}>
        {t('premium.unlock')}
      </Text>
    </Pressable>
  );
}

export function openPaywall(source: string): void {
  router.push({ pathname: '/paywall', params: { source } });
}
