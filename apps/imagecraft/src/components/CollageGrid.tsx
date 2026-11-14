import { Icon, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import { collageCells, type CollageTemplate } from '@/constants/collageTemplates';
import type { SourceImage } from '@/types/image';
import { placeOnCanvas } from '@/utils/geometry';

export interface CollageCellState {
  image: SourceImage | null;
  zoom: number;
  offset: { x: number; y: number };
}

/**
 * Interactive collage layout. Uses the SAME cell and placement math as the export
 * (collageCells + placeOnCanvas), scaled to the screen, so the preview matches the file.
 */
export function CollageGrid({
  template,
  cells,
  width,
  spacing,
  radius,
  background,
  selected,
  onSelectCell,
  compact,
}: {
  template: CollageTemplate;
  cells: CollageCellState[];
  width: number;
  /** In output pixels relative to a 1000 px long edge. */
  spacing: number;
  radius: number;
  background: string;
  selected?: number | null;
  onSelectCell?: (index: number) => void;
  compact?: boolean;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const canvas = template.aspect >= 1 ? { width, height: width / template.aspect } : { width: width * template.aspect, height: width };
  const k = Math.max(canvas.width, canvas.height) / 1000;
  const rects = collageCells(template, canvas, spacing * k);
  return (
    <View
      style={{ width: canvas.width, height: canvas.height, backgroundColor: background, alignSelf: 'center', borderRadius: compact ? 6 : 0, overflow: 'hidden' }}
      accessibilityLabel={tr(`collage.templates.${template.id}`)}
    >
      {rects.map((r, i) => {
        const cell = cells[i];
        const img = cell?.image;
        const place = img ? placeOnCanvas({ width: img.width, height: img.height }, { width: r.width, height: r.height }, 'cover', cell.zoom, cell.offset) : null;
        const isSelected = selected === i;
        return (
          <Pressable
            key={i}
            disabled={!onSelectCell}
            onPress={() => onSelectCell?.(i)}
            accessibilityRole="button"
            accessibilityLabel={img ? tr('collage.cellFilled', { index: i + 1 }) : tr('collage.cellEmpty', { index: i + 1 })}
            testID={`collage-cell-${i}`}
            style={{
              position: 'absolute',
              left: r.x,
              top: r.y,
              width: r.width,
              height: r.height,
              borderRadius: radius * k,
              overflow: 'hidden',
              backgroundColor: t.colors.surfaceAlt,
              borderWidth: isSelected ? 3 : 0,
              borderColor: t.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {img && place ? (
              <Image source={{ uri: img.uri }} style={{ position: 'absolute', left: place.x, top: place.y, width: place.width, height: place.height }} />
            ) : compact ? null : (
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Icon name="add-circle-outline" size={22} color={t.colors.textMuted} />
                <Text variant="caption" tone="muted">
                  {tr('collage.addPhoto')}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
