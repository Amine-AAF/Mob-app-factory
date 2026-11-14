import type { IconName } from '@factory/design-system';

import type { AdjustmentKey, Adjustments } from '@/types/image';

/**
 * One-tap looks. A preset is just a set of slider offsets: the user's own sliders are
 * added on top (combineAdjustments), so presets stay editable and the export uses the
 * exact same numbers as the preview.
 */
export interface FilterPreset {
  /** Also the i18n key suffix: filters.presets.<id> */
  id: string;
  premium: boolean;
  values: Partial<Adjustments>;
}

export const FILTER_PRESETS: readonly FilterPreset[] = [
  { id: 'original', premium: false, values: {} },
  { id: 'vivid', premium: false, values: { saturation: 35, contrast: 15 } },
  { id: 'mono', premium: false, values: { grayscale: 100, contrast: 10 } },
  { id: 'warm', premium: false, values: { warmth: 40, saturation: 10 } },
  { id: 'cool', premium: false, values: { warmth: -40, brightness: 5 } },
  { id: 'vintage', premium: true, values: { sepia: 55, contrast: -15, vignette: 35 } },
  { id: 'fade', premium: true, values: { contrast: -30, brightness: 12, saturation: -20 } },
  { id: 'dramatic', premium: true, values: { contrast: 45, saturation: -15, vignette: 45 } },
  { id: 'noir', premium: true, values: { grayscale: 100, contrast: 50, vignette: 40 } },
  { id: 'sunny', premium: true, values: { exposure: 20, warmth: 30, saturation: 15 } },
  { id: 'matte', premium: true, values: { contrast: -25, saturation: -10, brightness: 8 } },
  { id: 'punch', premium: true, values: { contrast: 30, saturation: 50, sharpness: 30 } },
  { id: 'soft', premium: true, values: { blur: 8, brightness: 10, contrast: -10 } },
];

export function findFilter(id: string): FilterPreset {
  return FILTER_PRESETS.find((f) => f.id === id) ?? (FILTER_PRESETS[0] as FilterPreset);
}

export interface AdjustmentDef {
  key: AdjustmentKey;
  icon: IconName;
  min: number;
  max: number;
  premium: boolean;
}

/** Slider catalogue, in display order. Advanced effects are Premium. */
export const ADJUSTMENTS: readonly AdjustmentDef[] = [
  { key: 'brightness', icon: 'sunny-outline', min: -100, max: 100, premium: false },
  { key: 'contrast', icon: 'contrast-outline', min: -100, max: 100, premium: false },
  { key: 'saturation', icon: 'color-palette-outline', min: -100, max: 100, premium: false },
  { key: 'exposure', icon: 'aperture-outline', min: -100, max: 100, premium: false },
  { key: 'warmth', icon: 'thermometer-outline', min: -100, max: 100, premium: false },
  { key: 'grayscale', icon: 'invert-mode-outline', min: 0, max: 100, premium: false },
  { key: 'sepia', icon: 'cafe-outline', min: 0, max: 100, premium: false },
  { key: 'sharpness', icon: 'triangle-outline', min: 0, max: 100, premium: true },
  { key: 'blur', icon: 'water-outline', min: 0, max: 100, premium: true },
  { key: 'vignette', icon: 'ellipse-outline', min: 0, max: 100, premium: true },
];

export const PREMIUM_ADJUSTMENTS: ReadonlySet<AdjustmentKey> = new Set(ADJUSTMENTS.filter((a) => a.premium).map((a) => a.key));
