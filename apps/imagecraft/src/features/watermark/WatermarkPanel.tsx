import { Button, Chip, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AdjustmentSlider } from '@/components/AdjustmentSlider';
import { ErrorNotice } from '@/components/common';
import { ColorSwatches, LockMark, TextField, ToggleRow } from '@/components/controls';
import { useImport } from '@/hooks/useImport';
import type { ProcessingErrorCode } from '@/services/files/errors';
import type { Anchor, EditState, Watermark } from '@/types/image';

const ANCHORS: Anchor[] = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];

export function defaultWatermark(text: string): Watermark {
  return { kind: 'text', text, logoUri: null, anchor: 'bottom-right', size: 0.05, opacity: 0.6, color: '#FFFFFF', tiled: false };
}

/** Custom watermark (Premium): text or imported logo, position, size, opacity, optional tiling. */
export function WatermarkPanel({ edit, apply }: { edit: EditState; apply: (next: EditState, key?: string) => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const { pick, busy } = useImport('watermark_logo');
  const [error, setError] = useState<ProcessingErrorCode | null>(null);
  const wm = edit.watermark;
  const update = (patch: Partial<Watermark>, key?: string) => wm && apply({ ...edit, watermark: { ...wm, ...patch } }, key ? `wm-${key}` : undefined);

  const importLogo = async () => {
    setError(null);
    const outcome = await pick({ multiple: false });
    const logo = outcome?.images[0];
    if (logo) update({ kind: 'logo', logoUri: logo.uri, size: 0.2 });
    else if (outcome?.errors[0]) setError(outcome.errors[0]);
  };

  return (
    <Stack gap={3}>
      <Row gap={2}>
        <LockMark />
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>
          {tr('watermark.premiumHint')}
        </Text>
      </Row>
      {!wm ? (
        <Button icon="water-outline" label={tr('watermark.add')} onPress={() => apply({ ...edit, watermark: defaultWatermark(tr('watermark.defaultText')) })} testID="add-watermark" />
      ) : (
        <Stack gap={3}>
          <Row gap={2}>
            <Chip label={tr('watermark.kinds.text')} selected={wm.kind === 'text'} onPress={() => update({ kind: 'text', size: 0.05 })} icon="text-outline" />
            <Chip label={tr('watermark.kinds.logo')} selected={wm.kind === 'logo'} onPress={() => (wm.logoUri ? update({ kind: 'logo', size: 0.2 }) : void importLogo())} icon="image-outline" />
          </Row>
          {wm.kind === 'text' ? (
            <>
              <TextField label={tr('watermark.text')} value={wm.text} onChangeText={(s) => update({ text: s }, 'text')} maxLength={80} testID="watermark-text" />
              <ColorSwatches label={tr('text.color')} value={wm.color} onChange={(c) => update({ color: c })} />
            </>
          ) : (
            <Button size="md" variant="secondary" icon="image-outline" label={wm.logoUri ? tr('watermark.replaceLogo') : tr('watermark.importLogo')} onPress={() => void importLogo()} loading={busy} />
          )}
          {error ? <ErrorNotice code={error} /> : null}
          <ToggleRow label={tr('watermark.tiled')} hint={tr('watermark.tiledHint')} value={wm.tiled} onChange={(v) => update({ tiled: v })} />
          {!wm.tiled ? (
            <Stack gap={2}>
              <Text variant="label" tone="muted">
                {tr('watermark.position')}
              </Text>
              <View style={{ width: 156, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }} accessibilityRole="radiogroup">
                {ANCHORS.map((a) => {
                  const selected = wm.anchor === a;
                  return (
                    <Pressable
                      key={a}
                      onPress={() => update({ anchor: a })}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={tr(`watermark.anchors.${a.replace('-', '_')}`)}
                      style={{ width: 48, height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: selected ? t.colors.primary : t.colors.border, backgroundColor: selected ? t.colors.primarySoft : t.colors.surface, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: selected ? t.colors.primary : t.colors.textSubtle }} />
                    </Pressable>
                  );
                })}
              </View>
            </Stack>
          ) : null}
          <AdjustmentSlider label={tr('watermark.size')} value={Math.round(wm.size * 100)} min={2} max={60} neutral={wm.kind === 'logo' ? 20 : 5} onChange={(v) => update({ size: v / 100 }, 'size')} format={(v) => `${Math.round(v)} %`} />
          <AdjustmentSlider label={tr('watermark.opacity')} value={Math.round(wm.opacity * 100)} min={5} max={100} neutral={60} onChange={(v) => update({ opacity: v / 100 }, 'opacity')} format={(v) => `${Math.round(v)} %`} />
          <Button size="md" variant="danger" icon="trash-outline" label={tr('watermark.remove')} onPress={() => apply({ ...edit, watermark: null })} />
        </Stack>
      )}
    </Stack>
  );
}
