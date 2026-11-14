/**
 * Resource limits. Pixel budgets protect memory on every device class:
 * an ARGB bitmap costs 4 bytes per pixel (24 MP = 96 MB).
 */
export const SAFETY_LIMITS = {
  /** Picked files larger than this are refused (corrupted or not a photo). */
  maxSourceBytes: 80 * 1024 * 1024,
  /** Declared header dimensions above this are refused before any decoding. */
  maxSourcePixels: 150_000_000,
  /** Decode budget: bigger photos are downsampled while decoding (never fully loaded). */
  maxDecodePixels: 24_000_000,
  /** Editor previews are rendered small, then displayed scaled. */
  previewMaxEdge: 1440,
  previewMaxPixels: 2_100_000,
  /** Size-estimation proxy renders. */
  estimateMaxEdge: 640,
  /** Collage: per-cell decode budget. */
  collageCellDecodePixels: 8_000_000,
  undoDepth: 40,
} as const;

export const FREE_LIMITS = {
  /** Exports above this are downscaled (the Premium high-quality export lifts it). */
  maxExportPixels: 12_000_000,
  batchImages: 3,
  /** Basic compression: quality range offered to free users. */
  minQuality: 30,
  maxQuality: 95,
  /** Optional rewarded ads: each one unlocks one Premium export, a few times per day. */
  rewardedUnlocksPerDay: 3,
  collageMaxEdge: 2048,
} as const;

export const PREMIUM_LIMITS = {
  maxExportPixels: 24_000_000,
  batchImages: 100,
  minQuality: 1,
  maxQuality: 100,
  collageMaxEdge: 4096,
} as const;
