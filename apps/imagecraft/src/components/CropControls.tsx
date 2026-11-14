import { Button, Chip, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { CROP_RATIOS } from '@/constants/tools';
import { useDrag } from '@/hooks/useDrag';
import type { NormRect } from '@/types/image';
import { dragCrop, type CropHandle } from '@/utils/geometry';

import type { PreviewFrame } from './ImagePreview';

const HANDLE = 28;

/**
 * Crop rectangle drawn over the picture's on-screen frame. Drag inside to move, drag a
 * corner to resize (keeping the selected ratio). Geometry math lives in utils/geometry.
 */
export function CropOverlay({
  frame,
  rect,
  aspect,
  imageAspect,
  onChange,
  onCommit,
}: {
  frame: PreviewFrame;
  rect: NormRect;
  aspect: number | null;
  imageAspect: number;
  onChange: (r: NormRect) => void;
  onCommit: (r: NormRect) => void;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  // Handlers are read from the latest props when the event fires, so `rect` is always current.
  const handlers = (handle: CropHandle) => ({
    capture: () => rect,
    onMove: (dx: number, dy: number, start: NormRect) => onChange(dragCrop(start, handle, dx / frame.width, dy / frame.height, aspect, imageAspect)),
    onRelease: () => onCommit(rect),
  });
  const responders = {
    move: useDrag(handlers('move')),
    tl: useDrag(handlers('tl')),
    tr: useDrag(handlers('tr')),
    bl: useDrag(handlers('bl')),
    br: useDrag(handlers('br')),
  };

  const left = frame.x + rect.x * frame.width;
  const top = frame.y + rect.y * frame.height;
  const width = rect.width * frame.width;
  const height = rect.height * frame.height;
  const shade = t.colors.overlay;

  const corner = (h: 'tl' | 'tr' | 'bl' | 'br') => (
    <View
      key={h}
      {...responders[h]}
      accessibilityLabel={tr(`crop.handles.${h}`)}
      style={{
        position: 'absolute',
        width: HANDLE,
        height: HANDLE,
        left: h.endsWith('l') ? left - HANDLE / 2 : left + width - HANDLE / 2,
        top: h.startsWith('t') ? top - HANDLE / 2 : top + height - HANDLE / 2,
        borderRadius: HANDLE / 2,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: t.colors.primary,
      }}
    />
  );

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
      {/* Shaded area outside the crop */}
      <View pointerEvents="none" style={{ position: 'absolute', left: frame.x, top: frame.y, width: frame.width, height: top - frame.y, backgroundColor: shade }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: frame.x, top: top + height, width: frame.width, height: frame.y + frame.height - top - height, backgroundColor: shade }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: frame.x, top, width: left - frame.x, height, backgroundColor: shade }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: left + width, top, width: frame.x + frame.width - left - width, height, backgroundColor: shade }} />
      <View
        {...responders.move}
        accessibilityLabel={tr('crop.area')}
        style={{ position: 'absolute', left, top, width, height, borderWidth: 2, borderColor: '#FFFFFF' }}
      >
        {/* Rule-of-thirds guides */}
        {[1, 2].map((i) => (
          <View key={`v${i}`} pointerEvents="none" style={{ position: 'absolute', left: (width * i) / 3, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.5)' }} />
        ))}
        {[1, 2].map((i) => (
          <View key={`h${i}`} pointerEvents="none" style={{ position: 'absolute', top: (height * i) / 3, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.5)' }} />
        ))}
      </View>
      {(['tl', 'tr', 'bl', 'br'] as const).map(corner)}
    </View>
  );
}

/** Ratio chips + rotate / flip buttons shown under the preview in crop mode. */
export function CropControls({
  ratioId,
  onRatio,
  onRotateLeft,
  onRotateRight,
  onFlipH,
  onFlipV,
  onResetCrop,
}: {
  ratioId: string;
  onRatio: (id: string, value: number | null) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onResetCrop: () => void;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Stack gap={3}>
      <Text variant="label" tone="muted">
        {tr('crop.ratio')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing(2) }}>
        {CROP_RATIOS.map((r) => (
          <Chip key={r.id} label={r.id === 'free' || r.id === 'original' ? tr(`crop.ratios.${r.id}`) : r.id} selected={ratioId === r.id} onPress={() => onRatio(r.id, r.value)} testID={`ratio-${r.id}`} />
        ))}
      </ScrollView>
      <Row gap={2} wrap>
        <Button size="md" variant="secondary" icon="refresh-outline" label={tr('crop.rotateLeft')} onPress={onRotateLeft} testID="rotate-left" />
        <Button size="md" variant="secondary" icon="reload-outline" label={tr('crop.rotateRight')} onPress={onRotateRight} testID="rotate-right" />
      </Row>
      <Row gap={2} wrap>
        <Button size="md" variant="secondary" icon="swap-horizontal-outline" label={tr('crop.flipH')} onPress={onFlipH} testID="flip-h" />
        <Button size="md" variant="secondary" icon="swap-vertical-outline" label={tr('crop.flipV')} onPress={onFlipV} testID="flip-v" />
        <Button size="md" variant="ghost" icon="scan-outline" label={tr('crop.reset')} onPress={onResetCrop} />
      </Row>
    </Stack>
  );
}
