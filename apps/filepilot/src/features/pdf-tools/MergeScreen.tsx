import { Button, Row, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Notice } from '@/components/controls';
import { FileRow, PickArea, SelectionIssues } from '@/components/files';
import { ToolScaffold } from '@/components/ToolScaffold';
import { useOperation } from '@/hooks/useOperation';
import { usePdfSelection } from '@/hooks/useSelection';
import { fmt } from '@/i18n';
import { countBucket, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { mergeSpec } from '@/services/operations/tools';
import { featureCap } from '@/services/quota';
import { useIsPremium } from '@/store/session';

export default function MergeScreen() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const max = featureCap(isPremium, 'mergeFiles');
  const selection = usePdfSelection('pdf_merge', true, max);
  const op = useOperation();
  const files = selection.items;
  const pages = files.reduce((n, f) => n + f.pageCount, 0);

  const start = async () => {
    if (files.length < 2) return;
    await op.run(mergeSpec(processingEnv(), files), undefined, () => track('pdf_merge_completed', { files: countBucket(files.length) }));
  };

  return (
    <ToolScaffold
      state={op.state}
      processingTitle={t('pdf.merge.processing', { count: files.length })}
      unit="file"
      onCancel={op.cancel}
      actionLabel={files.length ? t('pdf.merge.action', { count: files.length }) : undefined}
      actionIcon="git-merge-outline"
      onAction={() => void start()}
      actionDisabled={files.length < 2}
      onRetry={() => void start()}
      testID="merge-screen"
    >
      <SelectionIssues issues={selection.issues} onDismiss={selection.dismissIssues} />
      {files.length === 0 ? (
        <PickArea icon="documents-outline" title={t('pdf.merge.pickTitle')} hint={t('pdf.merge.pickHint', { count: max })} actionLabel={t('selection.choosePdfs')} onPick={() => void selection.pick('add')} loading={selection.loading} testID="pick-pdfs" />
      ) : (
        <Stack gap={2}>
          <Text variant="label" tone="muted">
            {t('pdf.merge.order')}
          </Text>
          {files.map((f, i) => (
            <FileRow key={f.uri} index={i} count={files.length} file={{ key: f.uri, name: f.name, size: f.size, pageCount: f.pageCount }} onRemove={() => selection.remove(i)} onMove={(d) => selection.move(i, d)} />
          ))}
          <Text variant="caption" tone="muted">
            {t('pdf.merge.summary', { count: pages, size: fmt.size(files.reduce((n, f) => n + f.size, 0)) })}
          </Text>
          <Row gap={2} wrap>
            {files.length < max ? <Button size="md" variant="secondary" icon="add" label={t('selection.addPdfs')} onPress={() => void selection.pick('add')} loading={selection.loading} /> : null}
          </Row>
          {files.length === 1 ? <Notice tone="info">{t('pdf.merge.needTwo')}</Notice> : null}
          {files.length >= max && !isPremium ? (
            <Notice tone="info">
              <Stack gap={2}>
                <Text variant="bodySmall">{t('pdf.merge.freeLimit', { count: max })}</Text>
                <Button size="md" variant="accent" icon="diamond" label={t('premium.unlock')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'merge_limit' } })} />
              </Stack>
            </Notice>
          ) : null}
        </Stack>
      )}
      <Text variant="caption" tone="subtle">
        {t('pdf.merge.quality')}
      </Text>
    </ToolScaffold>
  );
}
