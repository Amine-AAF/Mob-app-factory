import { Button, Card, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

import { Notice, NumberField, SegmentedControl } from '@/components/controls';
import { FileRow, PickArea, SelectionIssues } from '@/components/files';
import { ToolScaffold } from '@/components/ToolScaffold';
import { useOperation } from '@/hooks/useOperation';
import { usePdfSelection } from '@/hooks/useSelection';
import { fmt } from '@/i18n';
import { countBucket, recordError, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { chunkPages, everyPage, formatPageRanges, parsePageRanges } from '@/services/pdf/pageRanges';
import { inspectPdf, type PdfInfo } from '@/services/pdf/pdfEngine';
import { extractSpec, splitSpec } from '@/services/operations/tools';
import { featureCap } from '@/services/quota';
import { useIsPremium } from '@/store/session';

type Mode = 'extract' | 'ranges' | 'every' | 'chunks';

/** Points -> millimetres, for the page size display. */
const mm = (pt: number) => Math.round((pt / 72) * 25.4);

export default function SplitScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isPremium = useIsPremium();
  const maxParts = featureCap(isPremium, 'splitParts');
  const selection = usePdfSelection('pdf_split', false, 1);
  const op = useOperation();
  const pdf = selection.items[0];
  const [mode, setMode] = useState<Mode>(params.mode === 'extract' ? 'extract' : 'ranges');
  const [ranges, setRanges] = useState('');
  const [chunk, setChunk] = useState(2);
  const [info, setInfo] = useState<PdfInfo | null>(null);

  // Document metadata (page count + page sizes), read locally.
  useEffect(() => {
    let active = true;
    if (!pdf) return undefined;
    const { fs } = processingEnv();
    fs.readBytes(pdf.uri)
      .then((bytes) => inspectPdf(bytes, 3))
      .then((i) => active && setInfo(i))
      .catch((e) => recordError(e, 'pdf_info'));
    return () => {
      active = false;
      setInfo(null);
    };
  }, [pdf]);

  const parsed = useMemo(() => (pdf && (mode === 'extract' || mode === 'ranges') ? parsePageRanges(ranges, pdf.pageCount) : null), [mode, pdf, ranges]);
  const groups: number[][] | null = useMemo(() => {
    if (!pdf) return null;
    if (mode === 'every') return everyPage(pdf.pageCount);
    if (mode === 'chunks') return Number.isInteger(chunk) && chunk >= 1 ? chunkPages(pdf.pageCount, chunk) : null;
    if (parsed?.ok) return mode === 'extract' ? [parsed.pages] : parsed.groups;
    return null;
  }, [chunk, mode, parsed, pdf]);
  const tooManyParts = mode !== 'extract' && groups !== null && groups.length > maxParts;

  const start = async () => {
    if (!pdf || !groups || tooManyParts) return;
    if (mode === 'extract') {
      const pages = groups[0] ?? [];
      await op.run(extractSpec(processingEnv(), pdf, pages), undefined, () => track('pdf_extract_completed', { pages: countBucket(pages.length) }));
    } else {
      await op.run(splitSpec(processingEnv(), pdf, groups), undefined, () => track('pdf_split_completed', { mode, parts: countBucket(groups.length) }));
    }
  };

  const first = info?.pageSizes[0];

  return (
    <ToolScaffold
      state={op.state}
      processingTitle={mode === 'extract' ? t('pdf.split.processingExtract') : t('pdf.split.processing')}
      unit={mode === 'extract' ? 'step' : 'file'}
      onCancel={op.cancel}
      actionLabel={pdf ? (mode === 'extract' ? t('pdf.split.actionExtract', { count: groups?.[0]?.length ?? 0 }) : t('pdf.split.action', { count: groups?.length ?? 0 })) : undefined}
      actionIcon={mode === 'extract' ? 'copy-outline' : 'cut-outline'}
      onAction={() => void start()}
      actionDisabled={!groups || tooManyParts}
      onRetry={() => void start()}
      testID="split-screen"
    >
      <SelectionIssues issues={selection.issues} onDismiss={selection.dismissIssues} />
      {!pdf ? (
        <PickArea icon="document-outline" title={t('pdf.split.pickTitle')} hint={t('selection.pdfHint')} actionLabel={t('selection.choosePdf')} onPick={() => void selection.pick('replace')} loading={selection.loading} testID="pick-pdf" />
      ) : (
        <Stack gap={2}>
          <FileRow index={0} count={1} file={{ key: pdf.uri, name: pdf.name, size: pdf.size, pageCount: pdf.pageCount }} onRemove={() => selection.remove(0)} />
          <Card tone="alt" testID="pdf-info">
            <Text variant="label" tone="muted">
              {t('pdf.info.title')}
            </Text>
            <Text variant="bodySmall">{t('pdf.info.pages', { count: pdf.pageCount })}</Text>
            <Text variant="bodySmall">{t('pdf.info.size', { size: fmt.size(pdf.size) })}</Text>
            {first ? (
              <Text variant="bodySmall">
                {t(info?.uniformSize ? 'pdf.info.pageSize' : 'pdf.info.firstPageSize', { width: mm(first.width), height: mm(first.height) })}
              </Text>
            ) : null}
          </Card>
          <Button size="md" variant="secondary" icon="swap-horizontal" label={t('selection.replace')} onPress={() => void selection.pick('replace')} />
        </Stack>
      )}

      <Card>
        <SegmentedControl<Mode>
          label={t('pdf.split.mode')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'extract', label: t('pdf.split.modes.extract') },
            { value: 'ranges', label: t('pdf.split.modes.ranges') },
            { value: 'every', label: t('pdf.split.modes.every') },
            { value: 'chunks', label: t('pdf.split.modes.chunks') },
          ]}
          testID="split-mode"
        />
        <Text variant="caption" tone="muted">
          {t(`pdf.split.explain.${mode}`)}
        </Text>
        {mode === 'extract' || mode === 'ranges' ? (
          <Stack gap={1}>
            <Text variant="label" tone="muted">
              {t('pdf.split.pages')}
            </Text>
            <TextInput
              value={ranges}
              onChangeText={setRanges}
              placeholder={t('pdf.split.placeholder')}
              placeholderTextColor={theme.colors.textSubtle}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              accessibilityLabel={t('pdf.split.pages')}
              style={{ minHeight: 48, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: parsed && !parsed.ok && ranges ? theme.colors.danger : theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, paddingHorizontal: 12, fontSize: 16 }}
              testID="page-ranges"
            />
            {parsed && !parsed.ok && ranges ? (
              <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
                {t(`pdf.split.rangeError.${parsed.error}`, { count: pdf?.pageCount ?? 0 })}
              </Text>
            ) : parsed?.ok ? (
              <Text variant="caption" tone="success">
                {mode === 'extract' ? t('pdf.split.willExtract', { pages: formatPageRanges(parsed.pages), count: parsed.pages.length }) : t('pdf.split.willCreate', { count: parsed.groups.length })}
              </Text>
            ) : null}
            {pdf ? (
              <Row gap={2} wrap>
                <Button size="md" variant="ghost" label={t('pdf.split.firstPage')} onPress={() => setRanges('1')} />
                {pdf.pageCount > 1 ? <Button size="md" variant="ghost" label={t('pdf.split.lastPage')} onPress={() => setRanges(String(pdf.pageCount))} /> : null}
                {pdf.pageCount > 2 ? <Button size="md" variant="ghost" label={t('pdf.split.oddPages')} onPress={() => setRanges(Array.from({ length: Math.ceil(pdf.pageCount / 2) }, (_, i) => 2 * i + 1).join(', '))} /> : null}
              </Row>
            ) : null}
          </Stack>
        ) : null}
        {mode === 'chunks' ? (
          <NumberField label={t('pdf.split.chunkSize')} value={Number.isFinite(chunk) ? String(chunk) : ''} onChangeText={(v) => setChunk(v ? Number(v.replace(/\D/g, '')) : Number.NaN)} error={!Number.isInteger(chunk) || chunk < 1 ? t('pdf.split.chunkError') : undefined} />
        ) : null}
        {groups && mode !== 'extract' && (mode === 'every' || mode === 'chunks') ? (
          <Text variant="caption" tone="success">
            {t('pdf.split.willCreate', { count: groups.length })}
          </Text>
        ) : null}
        {tooManyParts ? (
          <Notice tone="warning">
            <Stack gap={2}>
              <Text variant="bodySmall">{t('pdf.split.tooManyParts', { count: maxParts })}</Text>
              {!isPremium ? <Button size="md" variant="accent" icon="diamond" label={t('premium.unlock')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'split_limit' } })} /> : null}
            </Stack>
          </Notice>
        ) : null}
      </Card>
      <Text variant="caption" tone="subtle">
        {t('pdf.split.quality')}
      </Text>
    </ToolScaffold>
  );
}
