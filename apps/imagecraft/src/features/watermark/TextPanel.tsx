import { Button, Chip, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { AdjustmentSlider } from '@/components/AdjustmentSlider';
import { ColorSwatches, TextField, ToggleRow } from '@/components/controls';
import { FONT_FAMILIES, type EditState, type TextAlign, type TextLayer } from '@/types/image';
import { newId } from '@/utils/format';

export const MAX_TEXT_LAYERS = 5;

export function newTextLayer(text: string): TextLayer {
  return { id: newId('txt'), text, x: 0.5, y: 0.5, size: 0.08, color: '#FFFFFF', font: 'sans-serif', bold: true, align: 'center', rotation: 0, opacity: 1, shadow: true };
}

/**
 * Text layers: content, size, colour, built-in font, bold, alignment, position, rotation,
 * opacity and shadow. Rendered by the native pipeline, so the preview equals the export.
 * Position can also be set by dragging the marker on the preview.
 */
export function TextPanel({
  edit,
  apply,
  selectedId,
  onSelect,
}: {
  edit: EditState;
  apply: (next: EditState, key?: string) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const layer = edit.texts.find((l) => l.id === selectedId) ?? null;
  const update = (patch: Partial<TextLayer>, key?: string) => {
    if (!layer) return;
    apply({ ...edit, texts: edit.texts.map((l) => (l.id === layer.id ? { ...l, ...patch } : l)) }, key ? `txt-${layer.id}-${key}` : undefined);
  };
  const add = () => {
    const l = newTextLayer(tr('text.defaultText'));
    apply({ ...edit, texts: [...edit.texts, l] });
    onSelect(l.id);
  };
  const remove = () => {
    if (!layer) return;
    apply({ ...edit, texts: edit.texts.filter((l) => l.id !== layer.id) });
    onSelect(null);
  };

  return (
    <Stack gap={3}>
      <Row gap={2} wrap>
        {edit.texts.map((l, i) => (
          <Chip key={l.id} label={l.text.trim() ? l.text.slice(0, 16) : tr('text.layer', { index: i + 1 })} selected={l.id === selectedId} onPress={() => onSelect(l.id)} />
        ))}
        {edit.texts.length < MAX_TEXT_LAYERS ? <Button size="md" variant="secondary" icon="add" label={tr('text.add')} onPress={add} testID="add-text" /> : null}
      </Row>
      {!layer ? (
        <Text variant="bodySmall" tone="muted">
          {edit.texts.length ? tr('text.selectHint') : tr('text.emptyHint')}
        </Text>
      ) : (
        <Stack gap={3}>
          <TextField label={tr('text.content')} value={layer.text} onChangeText={(s) => update({ text: s }, 'text')} multiline maxLength={200} testID="text-input" />
          <AdjustmentSlider label={tr('text.size')} value={Math.round(layer.size * 1000) / 10} min={1} max={30} step={0.5} neutral={8} onChange={(v) => update({ size: v / 100 }, 'size')} format={(v) => `${v.toFixed(1)} %`} />
          <ColorSwatches label={tr('text.color')} value={layer.color} onChange={(c) => update({ color: c })} />
          <Stack gap={2}>
            <Text variant="label" tone="muted">
              {tr('text.font')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing(2) }}>
              {FONT_FAMILIES.map((f) => (
                <Chip key={f} label={tr(`text.fonts.${f.replace(/-/g, '_')}`)} selected={layer.font === f} onPress={() => update({ font: f })} />
              ))}
            </ScrollView>
          </Stack>
          <Stack gap={2}>
            <Text variant="label" tone="muted">
              {tr('text.align')}
            </Text>
            <Row gap={2}>
              {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
                <Chip key={a} label={tr(`text.aligns.${a}`)} selected={layer.align === a} onPress={() => update({ align: a })} icon={a === 'left' ? 'reorder-two-outline' : a === 'center' ? 'menu-outline' : 'reorder-three-outline'} />
              ))}
            </Row>
          </Stack>
          <ToggleRow label={tr('text.bold')} value={layer.bold} onChange={(v) => update({ bold: v })} />
          <ToggleRow label={tr('text.shadow')} value={layer.shadow} onChange={(v) => update({ shadow: v })} />
          <AdjustmentSlider label={tr('text.opacity')} value={Math.round(layer.opacity * 100)} min={5} max={100} neutral={100} onChange={(v) => update({ opacity: v / 100 }, 'opacity')} format={(v) => `${Math.round(v)} %`} />
          <AdjustmentSlider label={tr('text.rotation')} value={layer.rotation} min={-180} max={180} neutral={0} onChange={(v) => update({ rotation: Math.round(v) }, 'rotation')} format={(v) => `${Math.round(v)}°`} />
          <AdjustmentSlider label={tr('text.positionX')} value={Math.round(layer.x * 100)} min={0} max={100} neutral={50} onChange={(v) => update({ x: v / 100 }, 'x')} format={(v) => `${Math.round(v)} %`} />
          <AdjustmentSlider label={tr('text.positionY')} value={Math.round(layer.y * 100)} min={0} max={100} neutral={50} onChange={(v) => update({ y: v / 100 }, 'y')} format={(v) => `${Math.round(v)} %`} />
          <Button size="md" variant="danger" icon="trash-outline" label={tr('text.remove')} onPress={remove} />
        </Stack>
      )}
    </Stack>
  );
}
