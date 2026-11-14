import { requireOptionalNativeModule } from 'expo';

/**
 * JS binding of ImageCraft's local native module (android/…/ImageCraftNativeModule.kt).
 * `null` when the native code is not part of the binary (Jest, Expo Go, web): callers
 * fall back to expo-image-manipulator for geometry/resize/format, and disable the
 * features that need the native renderer (filters, text, watermark, collage, gallery).
 */
export interface NativeSize {
  width: number;
  height: number;
}
export interface NativeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface NativeEncode {
  format: 'jpeg' | 'png' | 'webp';
  /** 1..100 */
  quality: number;
  flattenBackground: string;
}
export interface NativeText {
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
  bold: boolean;
  align: 'left' | 'center' | 'right';
  rotation: number;
  opacity: number;
  shadow: boolean;
}
export interface NativeWatermark {
  kind: 'text' | 'logo';
  text: string;
  logoUri: string | null;
  anchor: string;
  size: number;
  opacity: number;
  color: string;
  tiled: boolean;
}
export interface NativeRenderRecipe {
  jobId: string;
  inputUri: string;
  outputUri: string;
  geometry: { rotation: number; flipH: boolean; flipV: boolean; crop: NativeRect | null };
  size: NativeSize;
  colorMatrix: number[] | null;
  sharpness: number;
  blur: number;
  vignette: number;
  canvas: { width: number; height: number; background: string; image: NativeRect } | null;
  texts: NativeText[];
  watermark: NativeWatermark | null;
  encode: NativeEncode;
  maxDecodePixels: number;
}
export interface NativeCollageSpec {
  jobId: string;
  outputUri: string;
  width: number;
  height: number;
  background: string;
  placeholder: string;
  radius: number;
  cells: { x: number; y: number; width: number; height: number; uri: string | null; image: NativeRect }[];
  encode: NativeEncode;
  maxDecodePixels: number;
}
export interface NativeRenderResult {
  uri: string;
  width: number;
  height: number;
  bytes: number;
  format: 'jpeg' | 'png' | 'webp';
  lossless: boolean;
}

export interface ImageCraftNativeModule {
  render(recipe: NativeRenderRecipe): Promise<NativeRenderResult>;
  renderCollage(spec: NativeCollageSpec): Promise<NativeRenderResult>;
  /** Adds a copy to Pictures/ImageCraft (Android 10+). Returns the new content:// URI. */
  saveToGallery(uri: string, displayName: string, mimeType: string): Promise<string>;
  /** Requests cancellation of a running job (checked between rendering stages). */
  cancel(jobId: string): void;
}

export const ImageCraftNative: ImageCraftNativeModule | null = requireOptionalNativeModule<ImageCraftNativeModule>('ImageCraftNative');

/** Native error codes thrown by the module. */
export const NATIVE_ERRORS = {
  invalidUri: 'ERR_INVALID_URI',
  missing: 'ERR_FILE_MISSING',
  exists: 'ERR_OUTPUT_EXISTS',
  encode: 'ERR_ENCODE',
  decode: 'ERR_DECODE',
  memory: 'ERR_OUT_OF_MEMORY',
  storage: 'ERR_STORAGE_FULL',
  cancelled: 'ERR_CANCELLED',
  galleryUnsupported: 'ERR_GALLERY_UNSUPPORTED',
  galleryWrite: 'ERR_GALLERY_WRITE',
} as const;
