import { Button, Chip, EmptyState, Row, Screen, Text, useTheme } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, View } from 'react-native';

import { InfoNote, PremiumGate } from '@/components/ui';
import { repos } from '@/database';
import { useData } from '@/hooks';
import { fmt } from '@/i18n';
import { deletePhotoFile, photoUri, pickProgressPhoto } from '@/services/photos';
import { useIsPremium, useSession } from '@/store/session';
import type { PhotoPose, ProgressPhoto } from '@/types';

const POSES: PhotoPose[] = ['front', 'side', 'back', 'other'];

/** Private progress photos (Premium). Files stay in the app's private storage; nothing is uploaded. */
export default function Photos() {
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const today = useSession((s) => s.today);
  const { data } = useData((r) => r.body.photos());
  const [pose, setPose] = useState<PhotoPose>('front');
  const [compare, setCompare] = useState<ProgressPhoto[]>([]);

  if (!premium) return <Screen edges={[]}><Stack.Screen options={{ title: t('photos.title') }} /><PremiumGate title={t('premium.photosTitle')} message={t('premium.photosBody')} source="photos" /></Screen>;

  const add = async (source: 'camera' | 'library') => {
    const res = await pickProgressPhoto(source);
    if (res.status === 'ok') {
      await repos().body.addPhoto({ day: today, fileUri: res.name, pose, note: null });
      useSession.getState().bump();
    } else if (res.status === 'denied') Alert.alert(t('photos.deniedTitle'), t('photos.deniedBody'));
    else if (res.status === 'error') Alert.alert(t('common.error'), t('photos.error'));
  };

  const remove = (p: ProgressPhoto) =>
    Alert.alert(t('photos.deleteTitle'), t('photos.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await repos().body.removePhoto(p.id); deletePhotoFile(p.fileUri); setCompare((c) => c.filter((x) => x.id !== p.id)); useSession.getState().bump(); } },
    ]);

  const toggleCompare = (p: ProgressPhoto) => setCompare((c) => (c.some((x) => x.id === p.id) ? c.filter((x) => x.id !== p.id) : [...c.slice(-1), p]));
  const photos = (data ?? []).map((p) => ({ ...p, uri: photoUri(p.fileUri) })).filter((p) => p.uri);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t('photos.title') }} />
      <InfoNote text={t('photos.privacy')} icon="lock-closed-outline" />
      <Row wrap gap={2}>{POSES.map((p) => <Chip key={p} label={t(`photos.poses.${p}`)} selected={pose === p} onPress={() => setPose(p)} />)}</Row>
      <Row gap={2}>
        <View style={{ flex: 1 }}><Button label={t('photos.camera')} icon="camera" size="md" onPress={() => void add('camera')} /></View>
        <View style={{ flex: 1 }}><Button label={t('photos.library')} icon="images" size="md" variant="secondary" onPress={() => void add('library')} /></View>
      </Row>
      {compare.length === 2 ? (
        <Row gap={2}>
          {compare.map((p) => (
            <View key={p.id} style={{ flex: 1, gap: 4 }}>
              <Image source={{ uri: photoUri(p.fileUri) ?? undefined }} style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: 12 }} accessibilityLabel={t('photos.a11y', { date: fmt.mediumDate(fromDayKey(p.day)) })} />
              <Text variant="caption" center>{fmt.mediumDate(fromDayKey(p.day))}</Text>
            </View>
          ))}
        </Row>
      ) : photos.length >= 2 ? (
        <Text variant="caption" tone="subtle">{t('photos.compareHint')}</Text>
      ) : null}
      {photos.length === 0 ? <EmptyState icon="images-outline" title={t('photos.emptyTitle')} message={t('photos.emptyBody')} /> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {photos.map((p) => {
          const sel = compare.some((x) => x.id === p.id);
          return (
            <Pressable key={p.id} onPress={() => toggleCompare(p)} onLongPress={() => remove(p)} accessibilityRole="button" accessibilityHint={t('photos.itemHint')} accessibilityLabel={t('photos.a11y', { date: fmt.mediumDate(fromDayKey(p.day)) })} style={{ width: '31%', gap: 2 }}>
              <Image source={{ uri: p.uri! }} style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: 10, borderWidth: sel ? 3 : 0, borderColor: theme.colors.primary }} />
              <Text variant="caption" tone="muted" numberOfLines={1}>{`${fmt.shortDay(fromDayKey(p.day))} · ${t(`photos.poses.${p.pose}`)}`}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
