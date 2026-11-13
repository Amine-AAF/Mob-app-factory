import { Badge, Button, Card, Divider, EmptyState, Icon, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, View } from 'react-native';

import { Notice } from '@/components/controls';
import { repos } from '@/database';
import type { FileOperation, OperationOutput } from '@/database/repositories/operationsRepository';
import { currentLanguage, fmt } from '@/i18n';
import { maybeShowInterstitial, prepareInterstitial } from '@/services/ads';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { outputExists, saveToDevice, shareFile } from '@/services/files/share';
import { deleteOperation } from '@/services/settingsActions';
import { useResults } from '@/store/results';
import { useIsPremium, useSession } from '@/store/session';
import { formatDimensions, savedRatio } from '@/utils/format';

interface ViewModel {
  op: FileOperation;
  outputs: (OperationOutput & { exists: boolean; width?: number; height?: number })[];
  originalPreviewUri?: string;
  originalWidth?: number;
  originalHeight?: number;
  results?: { reachedTarget: boolean | null; noGain: boolean; downscaled: boolean }[];
  pageCount?: number;
}

function useResultModel(id: string): ViewModel | null | 'missing' {
  const live = useResults((s) => s.byId[id]);
  const [model, setModel] = useState<ViewModel | null | 'missing'>(null);
  useEffect(() => {
    let active = true;
    repos()
      .operations.get(id)
      .then((row) => {
        if (!active) return;
        if (!row) return setModel('missing');
        const details = (live?.details ?? {}) as { results?: ViewModel['results']; pageCount?: number };
        setModel({
          op: row,
          outputs: row.outputs.map((o, i) => ({ ...o, exists: outputExists(o.uri), ...(live?.outputs[i]?.width ? { width: live.outputs[i]?.width, height: live.outputs[i]?.height } : {}) })),
          ...(live?.extras.originalPreviewUri ? { originalPreviewUri: live.extras.originalPreviewUri, originalWidth: live.extras.originalWidth, originalHeight: live.extras.originalHeight } : {}),
          ...(details.results ? { results: details.results } : {}),
          ...(details.pageCount ? { pageCount: details.pageCount } : {}),
        });
      })
      .catch((e) => {
        recordError(e, 'result_load');
        if (active) setModel('missing');
      });
    return () => {
      active = false;
    };
  }, [id, live]);
  return model;
}

function Preview({ uri, label, size, width, height }: { uri?: string; label: string; size: number; width?: number; height?: number }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <View style={{ aspectRatio: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        {uri && !failed ? (
          <Image source={{ uri }} resizeMethod="resize" resizeMode="contain" style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} accessibilityLabel={label} />
        ) : (
          <Icon name="image-outline" size={28} color={theme.colors.textSubtle} />
        )}
      </View>
      <Text variant="subheading">{fmt.size(size)}</Text>
      {width && height ? (
        <Text variant="caption" tone="muted">
          {formatDimensions(width, height, currentLanguage())}
        </Text>
      ) : null}
    </View>
  );
}

export default function ResultScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isPremium = useIsPremium();
  const model = useResultModel(id ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<'save' | 'share' | null>(null);

  useEffect(() => prepareInterstitial(isPremium), [isPremium]);

  if (model === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }
  if (model === 'missing') {
    return (
      <Screen edges={[]}>
        <EmptyState icon="help-circle-outline" title={t('result.missingTitle')} message={t('result.missingBody')} action={<Button label={t('common.back')} size="md" onPress={() => router.back()} />} />
      </Screen>
    );
  }

  const { op, outputs } = model;
  const available = outputs.filter((o) => o.exists);
  const isImageOp = op.operationType.startsWith('image_') && op.operationType !== 'image_to_pdf';
  const ratio = op.outputSize !== null ? savedRatio(op.originalSize, op.outputSize) : null;
  const firstOut = outputs[0];
  const notes = model.results ?? [];
  const failedTarget = notes.some((r) => r.reachedTarget === false);
  const noGain = notes.some((r) => r.noGain);
  const downscaled = notes.some((r) => r.downscaled);

  const done = async () => {
    try {
      const settings = await repos().settings.all();
      const shown = await maybeShowInterstitial({
        isPremium,
        sessionCount: useSession.getState().sessionCount,
        operationsSinceLast: settings.operationsSinceInterstitial,
        lastShownAt: settings.lastInterstitialAt,
      });
      if (shown) {
        await repos().settings.set('lastInterstitialAt', clock.now().getTime());
        await repos().settings.set('operationsSinceInterstitial', 0);
      }
    } catch (e) {
      recordError(e, 'result_done');
    }
    router.dismissAll();
  };

  const share = async (o: OperationOutput) => {
    setBusy('share');
    setMessage(null);
    try {
      const r = await shareFile(o.uri, o.mimeType, t('result.shareTitle'));
      if (r === 'unavailable') setMessage(t('result.shareUnavailable'));
    } catch (e) {
      recordError(e, 'share');
      setMessage(t('result.shareFailed'));
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setBusy('save');
    setMessage(null);
    try {
      const r = await saveToDevice(available.map((o) => ({ uri: o.uri, fileName: o.fileName, mimeType: o.mimeType })));
      if (r) setMessage(r.failed ? t('result.savePartial', { saved: r.saved, failed: r.failed }) : t('result.saved', { count: r.saved }));
    } catch (e) {
      recordError(e, 'save_to_device');
      setMessage(t('errors.write_failed'));
    } finally {
      setBusy(null);
    }
  };

  const remove = () =>
    Alert.alert(t('result.deleteTitle'), t('result.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          void deleteOperation(op.id, true)
            .then(() => router.back())
            .catch((e) => recordError(e, 'delete_operation')),
      },
    ]);

  const footer =
    op.status === 'completed' && available.length ? (
      <Stack gap={2}>
        <Row gap={2}>
          {available.length === 1 && available[0] ? (
            <View style={{ flex: 1 }}>
              <Button label={t('result.share')} icon="share-social-outline" onPress={() => void share(available[0] as OperationOutput)} loading={busy === 'share'} disabled={busy !== null} testID="share" />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <Button
              label={available.length > 1 ? t('result.saveAll', { count: available.length }) : t('result.save')}
              variant={available.length === 1 ? 'secondary' : 'primary'}
              icon="download-outline"
              onPress={() => void save()}
              loading={busy === 'save'}
              disabled={busy !== null}
              testID="save"
            />
          </View>
        </Row>
        <Button label={t('result.done')} variant="ghost" onPress={() => void done()} testID="done" />
      </Stack>
    ) : (
      <Button label={t('result.done')} variant="secondary" onPress={() => void done()} testID="done" />
    );

  return (
    <Screen edges={[]} footer={footer} testID="result-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={3} style={{ flex: 1 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: op.status === 'completed' ? theme.colors.successSoft : theme.colors.dangerSoft }}>
            <Icon name={op.status === 'completed' ? 'checkmark-done' : 'alert'} size={24} color={op.status === 'completed' ? theme.colors.success : theme.colors.danger} />
          </View>
          <Stack gap={0} style={{ flex: 1 }}>
            <Text variant="heading" accessibilityRole="header">
              {op.status === 'completed' ? t(`result.headline.${op.operationType}`) : t(`status.${op.status}`)}
            </Text>
            <Text variant="caption" tone="muted">
              {t(`operations.${op.operationType}`)} · {fmt.date(new Date(op.createdAt))}
            </Text>
          </Stack>
        </Row>
        <IconButton icon="trash-outline" tone="danger" label={t('result.deleteTitle')} onPress={remove} />
      </Row>

      {op.status !== 'completed' ? <Notice tone={op.status === 'interrupted' ? 'warning' : 'danger'}>{op.errorCode ? t(`errors.${op.errorCode}`, { defaultValue: t('errors.unknown') }) : t(`result.statusExplain.${op.status}`)}</Notice> : null}

      {op.status === 'completed' && isImageOp && op.inputCount === 1 && firstOut ? (
        <Card testID="before-after">
          <Row gap={3} style={{ alignItems: 'flex-start' }}>
            <Preview uri={model.originalPreviewUri} label={t('result.before')} size={op.originalSize} width={model.originalWidth} height={model.originalHeight} />
            <Preview uri={firstOut.exists ? firstOut.uri : undefined} label={t('result.after')} size={firstOut.size} width={firstOut.width} height={firstOut.height} />
          </Row>
          {!model.originalPreviewUri ? (
            <Text variant="caption" tone="subtle">
              {t('result.originalNotKept')}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {op.status === 'completed' && op.outputSize !== null ? (
        <Card tone="alt">
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="bodySmall" tone="muted">
              {t('result.original')}
            </Text>
            <Text variant="bodySmall" style={{ fontWeight: '700' }}>
              {fmt.size(op.originalSize)}
            </Text>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="bodySmall" tone="muted">
              {t('result.output', { count: op.outputCount })}
            </Text>
            <Text variant="bodySmall" style={{ fontWeight: '700' }}>
              {fmt.size(op.outputSize)}
            </Text>
          </Row>
          {isImageOp && ratio !== null ? (
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall" tone="muted">
                {ratio >= 0 ? t('result.saved_label') : t('result.larger_label')}
              </Text>
              <Badge label={fmt.percent(Math.abs(ratio))} tone={ratio > 0 ? 'success' : 'warning'} />
            </Row>
          ) : null}
          {model.pageCount ? (
            <Text variant="caption" tone="muted">
              {t('common.pages', { count: model.pageCount })}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {noGain ? <Notice tone="warning">{t('result.noGain')}</Notice> : null}
      {failedTarget ? <Notice tone="warning">{t('result.targetNotReached')}</Notice> : null}
      {downscaled ? <Notice tone="info">{t('result.downscaled')}</Notice> : null}

      {outputs.length ? (
        <Card style={{ paddingVertical: 4 }}>
          {outputs.map((o, i) => (
            <View key={o.position}>
              {i > 0 ? <Divider /> : null}
              <Row gap={3} style={{ paddingVertical: 8 }}>
                <Icon name={o.mimeType === 'application/pdf' ? 'document-text-outline' : 'image-outline'} size={20} color={theme.colors.textMuted} />
                <Stack gap={0} style={{ flex: 1 }}>
                  <Text variant="bodySmall" style={{ fontWeight: '700' }} numberOfLines={1} ellipsizeMode="middle">
                    {o.fileName}
                  </Text>
                  <Text variant="caption" tone={o.exists ? 'muted' : 'danger'}>
                    {o.exists ? fmt.size(o.size) : t('result.fileGone')}
                  </Text>
                </Stack>
                {o.exists && outputs.length > 1 ? <IconButton icon="share-social-outline" size={18} label={t('result.shareFile', { name: o.fileName })} onPress={() => void share(o)} /> : null}
              </Row>
            </View>
          ))}
        </Card>
      ) : null}

      {message ? (
        <Text variant="bodySmall" tone="primary" center accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
      {op.status === 'completed' ? (
        <Text variant="caption" tone="subtle">
          {t('result.storedPrivately')}
        </Text>
      ) : null}
    </Screen>
  );
}
