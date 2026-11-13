import { Button, Card, Chip, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { TextField } from '@/components/forms';
import { PlantPhoto } from '@/components/PlantPhoto';
import { HEALTH_GUIDE } from '@/content/healthGuide';
import { HEALTH_STATUSES, type HealthStatus } from '@/domain/types';
import { useData, useMutation } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { deletePhotos, pickFromLibrary, takePhoto } from '@/services/photos';

/** Follow-up of one health problem: actions taken, status, photos over time. */
export default function HealthDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutate = useMutation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [action, setAction] = useState('');
  const { data } = useData(async (r) => {
    const rec = await r.health.get(id);
    return { rec, plant: rec ? await r.plants.get(rec.plantId) : null };
  }, [id]);
  const rec = data?.rec;
  if (!rec) return <Screen edges={[]}>{null}</Screen>;

  const setStatus = (status: HealthStatus) =>
    void mutate((r) => r.health.update(rec.id, { status, resolvedOn: status === 'resolved' ? clock.today() : null }), { reminders: false });

  const addAction = () => {
    if (!action.trim()) return;
    void mutate((r) => r.health.addAction(rec.id, clock.today(), action.trim()), { reminders: false }).then(() => setAction(''));
  };

  const addPhoto = (source: 'library' | 'camera') =>
    void (source === 'library' ? pickFromLibrary() : takePhoto()).then((res) => {
      if (res.status === 'ok') void mutate((r) => r.health.update(rec.id, { photoPaths: [...rec.photoPaths, res.path] }), { reminders: false });
      else if (res.status === 'denied') Alert.alert(t('photos.deniedTitle'), t('photos.deniedBody'));
    });

  const remove = () =>
    Alert.alert(t('health.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          void mutate((r) => r.health.remove(rec.id), { reminders: false }).then((p) => {
            deletePhotos(p);
            router.back();
          }),
      },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t(`healthCategories.${rec.category}`) }} />
      <Text variant="subheading">{data?.plant?.nickname}</Text>
      <Text tone="muted">{t('health.observedOnDate', { date: fmt.day(rec.observedOn) })}</Text>
      {rec.description ? <Text>{rec.description}</Text> : null}
      <Row wrap gap={2}>
        {HEALTH_STATUSES.map((s) => (
          <Chip key={s} label={t(`healthStatus.${s}`)} selected={rec.status === s} onPress={() => setStatus(s)} />
        ))}
      </Row>
      {rec.resolvedOn ? <Text variant="caption" tone="success">{t('health.resolvedOn', { date: fmt.day(rec.resolvedOn) })}</Text> : null}

      <SectionHeader title={t('health.actions')} />
      {rec.actions.length === 0 ? <Text tone="muted">{t('health.noActions')}</Text> : null}
      <Stack gap={1}>
        {rec.actions.map((a, i) => (
          <Text key={i} variant="bodySmall">{`${fmt.shortDay(a.date)} — ${a.text}`}</Text>
        ))}
      </Stack>
      <TextField label={t('health.newAction')} value={action} onChangeText={setAction} placeholder={t('health.newActionPlaceholder')} maxLength={300} />
      <Button size="md" variant="secondary" icon="add" label={t('health.addAction')} onPress={addAction} disabled={!action.trim()} />

      <SectionHeader title={t('health.photos')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {rec.photoPaths.map((p) => (
          <PlantPhoto key={p} path={p} size={100} />
        ))}
      </View>
      <Row wrap gap={2}>
        <Button size="md" variant="secondary" icon="images-outline" label={t('photos.gallery')} onPress={() => addPhoto('library')} />
        <Button size="md" variant="secondary" icon="camera-outline" label={t('photos.camera')} onPress={() => addPhoto('camera')} />
      </Row>

      <SectionHeader title={t('health.possibleCauses')} action={t('common.seeMore')} onAction={() => router.push({ pathname: '/health-guide', params: { category: rec.category } })} />
      <Card tone="alt">
        {HEALTH_GUIDE[rec.category].causes.map((c) => (
          <Text key={c} variant="bodySmall">{`• ${t(`healthGuide.causes.${c}.title`)}`}</Text>
        ))}
        <Text variant="caption" tone="muted">
          {t('health.disclaimer')}
        </Text>
      </Card>
      <Button variant="danger" icon="trash-outline" label={t('common.delete')} onPress={remove} />
    </Screen>
  );
}
