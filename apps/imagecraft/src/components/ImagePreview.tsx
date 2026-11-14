import { Icon, Text, useTheme } from '@factory/design-system';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Pressable, View, type LayoutChangeEvent } from 'react-native';

import { useDrag } from '@/hooks/useDrag';
import { clamp } from '@/utils/geometry';

/**
 * Large, image-first preview. Fits the picture in the available box without distortion.
 * - Double-tap toggles a 2.5x zoom; drag pans while zoomed.
 * - Press and hold the compare button to see the original (before/after).
 * - `overlay` renders on top of the picture's exact on-screen rectangle (crop handles, text guides).
 */
export interface PreviewFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImagePreview({
  uri,
  aspect,
  originalUri,
  rendering,
  label,
  height = 360,
  zoomable = true,
  overlay,
  testID,
}: {
  uri: string | null;
  /** width / height of the displayed picture. */
  aspect: number;
  originalUri?: string | null;
  rendering?: boolean;
  label: string;
  height?: number;
  zoomable?: boolean;
  overlay?: (frame: PreviewFrame) => ReactNode;
  testID?: string;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [comparing, setComparing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);

  const frame = useMemo<PreviewFrame>(() => {
    if (!box.width || !box.height || !(aspect > 0)) return { x: 0, y: 0, width: 0, height: 0 };
    const width = Math.min(box.width, box.height * aspect);
    const h = width / aspect;
    return { x: (box.width - width) / 2, y: (box.height - h) / 2, width, height: h };
  }, [box, aspect]);

  const responder = useDrag({
    enabled: zoomable && !overlay,
    capture: () => pan,
    onGrant: () => {
      const now = Date.now();
      if (now - lastTap < 280) {
        setZoom((z) => (z > 1 ? 1 : 2.5));
        setPan({ x: 0, y: 0 });
      }
      setLastTap(now);
    },
    onMove: (dx, dy, start) => {
      if (zoom <= 1) return;
      const maxX = (frame.width * (zoom - 1)) / 2;
      const maxY = (frame.height * (zoom - 1)) / 2;
      setPan({ x: clamp(start.x + dx, -maxX, maxX), y: clamp(start.y + dy, -maxY, maxY) });
    },
  });

  const shown = comparing && originalUri ? originalUri : uri;
  const onLayout = (e: LayoutChangeEvent) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      style={{ height, borderRadius: t.radius.lg, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}
      accessible={!overlay}
      accessibilityRole="image"
      accessibilityLabel={label}
      accessibilityHint={zoomable ? tr('a11y.previewHint') : undefined}
      {...responder}
    >
      {shown ? (
        <Image
          source={{ uri: shown }}
          resizeMode="contain"
          style={{
            position: 'absolute',
            left: frame.x,
            top: frame.y,
            width: frame.width,
            height: frame.height,
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: zoom }],
          }}
        />
      ) : null}
      {overlay && frame.width > 0 ? overlay(frame) : null}
      {rendering ? (
        <View style={{ position: 'absolute', top: 12, right: 12, padding: 6, borderRadius: 16, backgroundColor: t.colors.surface }}>
          <ActivityIndicator size="small" color={t.colors.primary} accessibilityLabel={tr('a11y.rendering')} />
        </View>
      ) : null}
      {originalUri && uri ? (
        <Pressable
          onPressIn={() => setComparing(true)}
          onPressOut={() => setComparing(false)}
          accessibilityRole="button"
          accessibilityLabel={tr('editor.compare')}
          accessibilityHint={tr('a11y.compareHint')}
          style={{ position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 36, borderRadius: 18, backgroundColor: t.colors.surface }}
        >
          <Icon name="git-compare-outline" size={16} color={t.colors.text} />
          <Text variant="caption">{comparing ? tr('editor.original') : tr('editor.compare')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
