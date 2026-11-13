import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Switch } from 'react-native';
import { z } from 'zod';

import { NumberField, Notice, QualitySlider, SegmentedControl } from '@/components/controls';
import { FileRow, PickArea, SelectionIssues } from '@/components/files';
import { ToolScaffold } from '@/components/ToolScaffold';
import { useOperation } from '@/hooks/useOperation';
import { useImageSelection } from '@/hooks/useSelection';
import { currentLanguage } from '@/i18n';
import { track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { heightForWidth, MAX_OUTPUT_EDGE, planResize, widthForHeight, type ResizePreset, type ResizeRequest } from '@/services/image/resizeMath';
import { resizeSpec, resolveOutputFormat, type OutputFormatChoice } from '@/services/operations/tools';
import { useSession } from '@/store/session';
import { formatDimensions } from '@/utils/format';

type Mode = 'preset' | 'percent' | 'custom';
const PERCENTS = [25, 50, 75] as const;

const dimension = z.number({ message: 'invalid' }).int('invalid').min(1, 'min').max(MAX_OUTPUT_EDGE, 'max');
const customSchema = z.object({ width: dimension, height: dimension });
type CustomForm = z.infer<typeof customSchema>;

export default function ResizerScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const defaults = useSession((s) => s.preferences);
  const selection = useImageSelection('resize', false, 1);
  const op = useOperation();
  const source = selection.items[0];
  const [mode, setMode] = useState<Mode>('preset');
  const [preset, setPreset] = useState<ResizePreset>('medium');
  const [percent, setPercent] = useState<number>(50);
  const [lock, setLock] = useState(true);
  const [allowUpscale, setAllowUpscale] = useState(false);
  const [format, setFormat] = useState<OutputFormatChoice>('original');
  const [quality, setQuality] = useState(Math.max(defaults.defaultImageQuality, 85));
  const form = useForm<CustomForm>({ resolver: zodResolver(customSchema), defaultValues: { width: 1280, height: 960 }, mode: 'onChange' });
  const width = useWatch({ control: form.control, name: 'width' });
  const height = useWatch({ control: form.control, name: 'height' });

  const display = source ? { width: source.header.displayWidth, height: source.header.displayHeight } : null;
  const request: ResizeRequest = mode === 'preset' ? { mode, preset } : mode === 'percent' ? { mode, percent } : { mode, width: width || null, height: height || null, lockAspect: lock };
  const plan = display ? planResize(display, request, allowUpscale) : null;
  const outFormat = source ? resolveOutputFormat(format, source) : 'jpeg';

  const onPicked = () => {
    void selection.pick('replace');
  };

  const setWidth = (w: number) => {
    form.setValue('width', w, { shouldValidate: true });
    if (lock && display && Number.isFinite(w) && w > 0) form.setValue('height', heightForWidth(display, w), { shouldValidate: true });
  };
  const setHeight = (h: number) => {
    form.setValue('height', h, { shouldValidate: true });
    if (lock && display && Number.isFinite(h) && h > 0) form.setValue('width', widthForHeight(display, h), { shouldValidate: true });
  };

  const start = async () => {
    if (!source || !plan) return;
    if (mode === 'custom' && !(await form.trigger())) return;
    await op.run(
      resizeSpec(processingEnv(), source, { size: { width: plan.width, height: plan.height }, format: outFormat, quality: quality / 100 }),
      { originalPreviewUri: source.uri, originalWidth: display?.width, originalHeight: display?.height },
      () => track('resize_completed', { format: outFormat, mode }),
    );
  };

  const lng = currentLanguage();
  const customError = (key: 'width' | 'height') => {
    const e = form.formState.errors[key]?.message;
    return e ? t(`resize.error.${e === 'max' ? 'max' : 'min'}`, { max: MAX_OUTPUT_EDGE }) : undefined;
  };

  return (
    <ToolScaffold
      state={op.state}
      processingTitle={t('resize.processing')}
      onCancel={op.cancel}
      actionLabel={source ? t('resize.action') : undefined}
      actionIcon="resize-outline"
      onAction={() => void start()}
      actionDisabled={!plan || plan.unchanged && outFormat === source?.header.format}
      onRetry={() => void start()}
      testID="resize-screen"
    >
      <SelectionIssues issues={selection.issues} onDismiss={selection.dismissIssues} />
      {!source ? (
        <PickArea icon="resize-outline" title={t('resize.pickTitle')} hint={t('selection.imageHint')} actionLabel={t('selection.chooseImage')} onPick={onPicked} loading={selection.loading} testID="pick-images" />
      ) : (
        <Stack gap={2}>
          <FileRow index={0} count={1} file={{ key: source.uri, name: source.name, size: source.size, thumbnailUri: source.uri, width: display?.width, height: display?.height }} onRemove={() => selection.remove(0)} />
          <Button size="md" variant="secondary" icon="swap-horizontal" label={t('selection.replace')} onPress={onPicked} />
        </Stack>
      )}

      <Card>
        <SegmentedControl<Mode>
          label={t('resize.mode')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'preset', label: t('resize.presets') },
            { value: 'percent', label: t('resize.percentage') },
            { value: 'custom', label: t('resize.custom') },
          ]}
          testID="resize-mode"
        />
        {mode === 'preset' ? (
          <SegmentedControl<ResizePreset>
            value={preset}
            onChange={setPreset}
            options={(['small', 'medium', 'large'] as const).map((p) => ({ value: p, label: t(`resize.preset.${p}`) }))}
            testID="preset"
          />
        ) : null}
        {mode === 'percent' ? (
          <SegmentedControl<string> value={String(percent)} onChange={(v) => setPercent(Number(v))} options={PERCENTS.map((p) => ({ value: String(p), label: `${p} %` }))} testID="percent" />
        ) : null}
        {mode === 'custom' ? (
          <Stack gap={3}>
            <Row gap={3} style={{ alignItems: 'flex-start' }}>
              <Controller
                control={form.control}
                name="width"
                render={({ field }) => (
                  <NumberField label={t('resize.width')} suffix="px" value={Number.isFinite(field.value) ? String(field.value) : ''} onChangeText={(v) => setWidth(v ? Number(v.replace(/\D/g, '')) : Number.NaN)} error={customError('width')} testID="width" />
                )}
              />
              <Pressable
                onPress={() => setLock(!lock)}
                accessibilityRole="switch"
                accessibilityState={{ checked: lock }}
                accessibilityLabel={t('resize.lockAspect')}
                style={{ marginTop: 26, width: 44, height: 48, alignItems: 'center', justifyContent: 'center' }}
                testID="lock-aspect"
              >
                <Icon name={lock ? 'link' : 'unlink'} size={22} color={lock ? theme.colors.primary : theme.colors.textSubtle} />
              </Pressable>
              <Controller
                control={form.control}
                name="height"
                render={({ field }) => (
                  <NumberField label={t('resize.height')} suffix="px" value={Number.isFinite(field.value) ? String(field.value) : ''} onChangeText={(v) => setHeight(v ? Number(v.replace(/\D/g, '')) : Number.NaN)} error={customError('height')} testID="height" />
                )}
              />
            </Row>
            <Text variant="caption" tone="muted">
              {lock ? t('resize.lockedHint') : t('resize.unlockedHint')}
            </Text>
          </Stack>
        ) : null}
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="bodySmall" style={{ flex: 1 }}>
            {t('resize.allowUpscale')}
          </Text>
          <Switch value={allowUpscale} onValueChange={setAllowUpscale} accessibilityLabel={t('resize.allowUpscale')} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />
        </Row>
      </Card>

      {plan && display ? (
        <Card tone="alt" testID="resize-plan">
          <Text variant="label" tone="muted">
            {t('resize.result')}
          </Text>
          <Text variant="heading">
            {formatDimensions(display.width, display.height, lng)} → {formatDimensions(plan.width, plan.height, lng)}
          </Text>
          {plan.limitedToOriginal ? <Notice tone="info">{t('resize.warn.noUpscale')}</Notice> : null}
          {plan.upscaled ? <Notice tone="warning">{t('resize.warn.upscale')}</Notice> : null}
          {plan.distorted ? <Notice tone="warning">{t('resize.warn.distorted')}</Notice> : null}
          {plan.largeReduction ? <Notice tone="warning">{t('resize.warn.largeReduction')}</Notice> : null}
          {plan.unchanged ? <Notice tone="info">{t('resize.warn.unchanged')}</Notice> : null}
        </Card>
      ) : null}

      <Card>
        <SegmentedControl<OutputFormatChoice>
          label={t('common.outputFormat')}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'original', label: t('compress.keepFormat') },
            { value: 'jpeg', label: 'JPEG' },
            { value: 'png', label: 'PNG' },
            { value: 'webp', label: 'WebP' },
          ]}
        />
        {outFormat !== 'png' ? <QualitySlider value={quality} onChange={setQuality} label={t('common.quality')} /> : null}
        {source?.header.hasAlpha && outFormat === 'jpeg' ? <Notice tone="warning">{t('common.transparencyToWhite')}</Notice> : null}
      </Card>
    </ToolScaffold>
  );
}
