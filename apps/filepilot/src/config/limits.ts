/**
 * Safety and plan limits. Memory limits protect mid-range devices from crashes;
 * plan limits define the free tier. All values are deliberate, documented in
 * apps/filepilot/docs/file-processing.md.
 */
const MB = 1024 * 1024;

export const SAFETY_LIMITS = {
  /** Largest image file accepted. */
  maxImageBytes: 60 * MB,
  /** Largest image accepted by pixel count (header-checked before decoding). */
  maxImagePixels: 120_000_000,
  /** Images are decoded down to at most this many pixels (bounded native decode). */
  maxDecodePixels: 40_000_000,
  /** Largest single PDF accepted (pdf-lib holds the document in memory). */
  maxPdfBytes: 80 * MB,
  /** Total input size for one PDF merge. */
  maxMergeBytes: 150 * MB,
  /** Longest edge of an image embedded into a PDF, per quality preset. */
  pdfImageMaxEdge: { standard: 2000, high: 3508 },
  /** Rendering bounds for PDF -> image (per page bitmap). */
  maxRenderEdge: 4096,
  maxRenderPixels: 16_000_000,
} as const;

export const FREE_LIMITS = {
  /** Successful operations per local day. */
  dailyOperations: 10,
  /** Operations granted by one rewarded ad (user-initiated, optional). */
  rewardedBonus: 3,
  /** Max rewarded bonuses per day. */
  maxRewardedPerDay: 2,
  mergeFiles: 3,
  imagesPerPdf: 5,
  pdfToImagesPages: 5,
  /** Visible entries in operation history. */
  historyEntries: 20,
} as const;

export const PREMIUM_LIMITS = {
  mergeFiles: 50,
  imagesPerPdf: 100,
  pdfToImagesPages: 500,
  batchImages: 50,
} as const;
