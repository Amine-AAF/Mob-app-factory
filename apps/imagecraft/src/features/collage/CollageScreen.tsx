import { Button, Card, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { AdjustmentSlider } from '@/components/AdjustmentSlider';
import { CollageGrid } from '@/components/CollageGrid';
import { ErrorNotice, NativeRequiredNotice } from '@/components/common';
import { ColorSwatches, LockMark } from '@/components/controls';
import { ExportDialog, type ExportedFile } from '@/components/ExportDialog';
import { FormatSelector } from '@/components/FormatSelector';
import { PremiumGate } from '@/components/monetization';
import { ProcessingProgress } from '@/components/ProcessingProgress';
import { BACKGROUND_SWATCHES } from '@/constants/socialPresets';
import { COLLAGE_TEMPLATES, type CollageTemplate } from '@/constants/collageTemplates';
import { ensureExportAllowed } from '@/features/editor/exportFlow';
import { collageMaxEdge, type PremiumReason } from '@/features/premium/gating';
import { recordProject } from '@/features/projects/projectsService';
import { useImport } from '@/hooks/useImport';
import { useJob } from '@/hooks/useJob';
import { countBucket, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { onResultDone, onResultShown } from '@/services/finish';
import { ProcessingError, type ProcessingErrorCode } from '@/services/files/errors';
import { detectFormat, extensionOf } from '@/services/files/formats';
import { exportResult } from '@/services/image/engine';
import { useIsPremium } from '@/store/session';
import type { OutputFormat } from '@/types/image';
import { newId } from '@/utils/format';

import { buildCollageInput, emptyCells, filledCount, type CollageCell } from './collageBuilder';

/** Collage maker: 18 original layouts, spacing, corner radius, background, per-photo framing. */
export default function CollageScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const isPremium = useIsPremium();
  const { pick, busy } = useImport('collage');
  const [template, setTemplate] = useState<CollageTemplate>(COLLAGE_TEMPLATES[0] as CollageTemplate);
  const [cells, setCells] = useState<CollageCell[]>(() => emptyCells(COLLAGE_TEMPLATES[0] as CollageTemplate));
  const [selected, setSelected] = useState<number | null>(null);
  const [spacing, setSpacing] = useState(12);
  const [radius, setRadius] = useState(0);
  const [background, setBackground] = useState('#FFFFFF');
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [importError, setImportError] = useState<ProcessingErrorCode | null>(null);
  const [result, setResult] = useState<ExportedFile | null>(null);
  const job = useJob<{ file: ExportedFile }>('collage');
  const nativeMissing = processingEnv().renderer.name !== 'native';
  const reasons: PremiumReason[] = template.premium ? ['collage_template'] : [];
  const width = Math.min(screenWidth - 40, 420);
  const longEdge = collageMaxEdge(isPremium);

  const chooseTemplate = (tpl: CollageTemplate) => {
    setTemplate(tpl);
    setCells((prev) => emptyCells(tpl, prev));
    setSelected(null);
  };

  /** Fills the empty cells in order (or replaces the selected one). */
  const addPhotos = async (replaceIndex: number | null) => {
    setImportError(null);
    const free = replaceIndex !== null ? 1 : cells.filter((c) => !c.image).length;
    if (free === 0) return;
    const outcome = await pick({ multiple: free > 1, limit: free });
    if (!outcome) return;
    if (outcome.errors[0]) setImportError(outcome.errors[0]);
    setCells((prev) => {
      const next = [...prev];
      const queue = [...outcome.images];
      if (replaceIndex !== null) {
        const img = queue.shift();
        if (img) next[replaceIndex] = { image: img, zoom: 1, offset: { x: 0, y: 0 } };
        return next;
      }
      for (let i = 0; i < next.length && queue.length; i++) if (!next[i]?.image) next[i] = { image: queue.shift() ?? null, zoom: 1, offset: { x: 0, y: 0 } };
      return next;
    });
  };

  const updateCell = (i: number, patch: Partial<CollageCell>) => setCells((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const sel = selected !== null ? cells[selected] : undefined;

  const run = async () => {
    const value = await job.run(async (j, progress) => {
      await ensureExportAllowed(reasons);
      const env = processingEnv();
      progress(0, 2);
      const dir = await env.workspace.createJobDir(j.id);
      const input = buildCollageInput({ template, cells, longEdge, spacing, radius, background, format, quality: 90 }, env.fs.join(dir, `${newId('c')}.${extensionOf(format)}`));
      const rendered = await env.renderer.renderCollage(input, j.id);
      if (detectFormat(await env.fs.readHead(rendered.uri, 32)) !== format) throw new ProcessingError('write_failed');
      progress(1, 2);
      const file = await exportResult(env, j, rendered, `collage-${template.id.replace(/_/g, '-')}.${extensionOf(format)}`);
      await recordProject({ kind: 'collage', output: file, operations: ['collage'], inputBytes: null, itemCount: filledCount(cells) });
      progress(2, 2);
      return { file };
    });
    if (value) {
      track('collage_created', { template: template.id, images: countBucket(filledCount(cells)) });
      setResult(value.file);
      void onResultShown();
    }
  };

  return (
    <Screen edges={[]} testID="tool-collage">
      {nativeMissing ? <NativeRequiredNotice /> : null}
      <CollageGrid template={template} cells={cells} width={width} spacing={spacing} radius={radius} background={background} selected={selected} onSelectCell={(i) => (cells[i]?.image ? setSelected(i === selected ? null : i) : void addPhotos(i))} />
      <Text variant="caption" tone="muted" center>
        {t('collage.tapHint', { filled: filledCount(cells), total: cells.length })}
      </Text>
      {importError ? <ErrorNotice code={importError} /> : null}
      <Button variant="secondary" icon="images-outline" label={busy ? t('home.importing') : t('collage.addPhotos')} onPress={() => void addPhotos(null)} disabled={busy || filledCount(cells) === cells.length} testID="collage-add" />

      {sel?.image && selected !== null ? (
        <Card testID="collage-cell-panel">
          <Text variant="subheading">{t('collage.cellTitle', { index: selected + 1 })}</Text>
          <AdjustmentSlider label={t('social.zoom')} value={sel.zoom} min={1} max={3} step={0.05} neutral={1} onChange={(v) => updateCell(selected, { zoom: v })} format={(v) => `${v.toFixed(2)}×`} />
          <AdjustmentSlider label={t('collage.panX')} value={Math.round(sel.offset.x * 100)} min={-100} max={100} onChange={(v) => updateCell(selected, { offset: { ...sel.offset, x: v / 100 } })} />
          <AdjustmentSlider label={t('collage.panY')} value={Math.round(sel.offset.y * 100)} min={-100} max={100} onChange={(v) => updateCell(selected, { offset: { ...sel.offset, y: v / 100 } })} />
          <Row gap={2} wrap>
            <Button size="md" variant="secondary" icon="swap-horizontal-outline" label={t('collage.replace')} onPress={() => void addPhotos(selected)} />
            <Button size="md" variant="danger" icon="trash-outline" label={t('collage.removePhoto')} onPress={() => updateCell(selected, { image: null, zoom: 1, offset: { x: 0, y: 0 } })} />
          </Row>
        </Card>
      ) : null}

      <Stack gap={2}>
        <Text variant="label" tone="muted">
          {t('collage.layouts', { count: COLLAGE_TEMPLATES.length })}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing(3) }}>
          {COLLAGE_TEMPLATES.map((tpl) => (
            <Pressable
              key={tpl.id}
              onPress={() => chooseTemplate(tpl)}
              accessibilityRole="radio"
              accessibilityState={{ selected: tpl.id === template.id, checked: tpl.id === template.id }}
              accessibilityLabel={tpl.premium ? `${t(`collage.templates.${tpl.id}`)}, ${t('premium.badge')}` : t(`collage.templates.${tpl.id}`)}
              testID={`template-${tpl.id}`}
              style={{ padding: 6, borderRadius: theme.radius.md, borderWidth: 2, borderColor: tpl.id === template.id ? theme.colors.primary : 'transparent', gap: 4, alignItems: 'center' }}
            >
              <View pointerEvents="none">
                <CollageGrid template={tpl} cells={emptyCells(tpl)} width={64} spacing={30} radius={0} background={theme.colors.border} compact />
              </View>
              {tpl.premium ? <LockMark /> : <View style={{ height: 12 }} />}
            </Pressable>
          ))}
        </ScrollView>
      </Stack>

      <Card>
        <AdjustmentSlider label={t('collage.spacing')} value={spacing} min={0} max={40} neutral={12} onChange={(v) => setSpacing(Math.round(v))} />
        <AdjustmentSlider label={t('collage.radius')} value={radius} min={0} max={60} neutral={0} onChange={(v) => setRadius(Math.round(v))} />
        <ColorSwatches label={t('social.background')} value={background} onChange={setBackground} colors={BACKGROUND_SWATCHES} />
        <FormatSelector value={format} onChange={setFormat} />
        <Text variant="caption" tone="muted">
          {t('collage.output', { edge: longEdge })}
        </Text>
      </Card>
      <PremiumGate source="collage" reasons={reasons} />
      {job.state.status === 'running' ? <ProcessingProgress done={job.state.done} total={job.state.total} onCancel={job.cancel} /> : null}
      {job.state.status === 'error' ? <ErrorNotice code={job.state.code} onRetry={() => void run()} /> : null}
      <Button label={t('tools.collage.action')} icon="flash-outline" onPress={() => void run()} disabled={job.running || nativeMissing || filledCount(cells) === 0} testID="collage-export" />
      {result ? (
        <ExportDialog
          visible
          files={[result]}
          inputBytes={null}
          tool="collage"
          onDone={() => {
            setResult(null);
            job.reset();
            void onResultDone();
          }}
        />
      ) : null}
    </Screen>
  );
}
