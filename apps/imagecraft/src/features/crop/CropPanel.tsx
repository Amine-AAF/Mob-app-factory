import { CropControls } from '@/components/CropControls';
import { track } from '@/services/analytics';
import type { EditState, SourceImage } from '@/types/image';
import { centeredCropForAspect, normalizeTurns, rotatedSize } from '@/utils/geometry';

/**
 * Crop & rotate panel. Rotation/flip invalidate the crop's meaning, so they reset it
 * (the user re-crops on the rotated picture).
 */
export function CropPanel({
  source,
  edit,
  ratioId,
  onRatioId,
  apply,
}: {
  source: SourceImage;
  edit: EditState;
  ratioId: string;
  onRatioId: (id: string) => void;
  apply: (next: EditState) => void;
}) {
  const turned = rotatedSize(source, edit.geometry.rotation);
  const setGeometry = (g: Partial<EditState['geometry']>) => apply({ ...edit, geometry: { ...edit.geometry, ...g } });

  return (
    <CropControls
      ratioId={ratioId}
      onRatio={(id, value) => {
        onRatioId(id);
        if (value === null) return; // free: keep the current rectangle, handles become free
        const aspect = value === -1 ? source.width / source.height : value;
        setGeometry({ crop: centeredCropForAspect(turned, aspect) });
        track('image_cropped', { ratio: id });
      }}
      onRotateLeft={() => setGeometry({ rotation: normalizeTurns(edit.geometry.rotation - 1), crop: null })}
      onRotateRight={() => setGeometry({ rotation: normalizeTurns(edit.geometry.rotation + 1), crop: null })}
      onFlipH={() => setGeometry({ flipH: !edit.geometry.flipH, crop: null })}
      onFlipV={() => setGeometry({ flipV: !edit.geometry.flipV, crop: null })}
      onResetCrop={() => {
        onRatioId('free');
        setGeometry({ crop: null });
      }}
    />
  );
}

/** Aspect ratio value (pixel width/height) of a crop ratio id, or null for free. */
export function ratioValue(id: string, source: SourceImage): number | null {
  if (id === 'free') return null;
  if (id === 'original') return source.width / source.height;
  const [w, h] = id.split(':').map(Number);
  return w && h ? w / h : null;
}
