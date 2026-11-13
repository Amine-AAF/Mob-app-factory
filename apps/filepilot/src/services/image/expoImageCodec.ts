import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { FilePilotNative } from 'filepilot-native';

import { SAFETY_LIMITS } from '@/config/limits';

import { ProcessingError } from '../files/errors';
import type { FileStore } from '../files/fileStore';
import type { ImageFormat } from '../files/formats';
import type { ImageCodec, TranscodeOptions } from './imageEngine';

const SAVE_FORMAT: Record<ImageFormat, SaveFormat> = { jpeg: SaveFormat.JPEG, png: SaveFormat.PNG, webp: SaveFormat.WEBP };

/**
 * ImageCodec backed by expo-image-manipulator on Android:
 * - decoding goes through Glide, which applies the EXIF orientation to the pixels and,
 *   with maxWidth/maxHeight, downsamples while decoding (no full-size bitmap for huge photos);
 * - encoding uses Android's Bitmap.compress (JPEG / PNG / WebP).
 * Output files carry no EXIF metadata (location, camera, dates are not copied).
 *
 * The manipulator writes into <cache>/ImageManipulator; the result is moved into the
 * job's temp folder right away (and that folder is swept at start-up).
 */
export function createExpoImageCodec(fs: FileStore): ImageCodec {
  return {
    name: 'expo-image-manipulator',
    supportsFlatten: FilePilotNative !== null,
    async transcode(inputUri: string, options: TranscodeOptions, destUri: string) {
      const context = ImageManipulator.manipulate(
        inputUri,
        options.maxDecode ? { maxWidth: options.maxDecode.width, maxHeight: options.maxDecode.height } : undefined,
      );
      if (options.resize) context.resize({ width: options.resize.width, height: options.resize.height });
      const image = await context.renderAsync();
      const flatten = Boolean(options.flattenBackground) && options.format === 'jpeg';
      try {
        // Transparent -> JPEG: encode losslessly first, then composite on the background natively.
        const saved = await image.saveAsync({ format: flatten ? SaveFormat.PNG : SAVE_FORMAT[options.format], compress: options.quality });
        if (flatten) {
          if (!FilePilotNative) throw new ProcessingError('transparency_unsupported');
          try {
            await FilePilotNative.flattenImage({
              inputUri: saved.uri,
              outputUri: destUri,
              quality: options.quality,
              background: options.flattenBackground ?? '#FFFFFF',
              maxPixels: SAFETY_LIMITS.maxDecodePixels,
            });
          } finally {
            await fs.delete(saved.uri);
          }
        } else {
          await fs.move(saved.uri, destUri);
        }
        return { width: saved.width, height: saved.height };
      } finally {
        image.release();
        context.release();
      }
    },
  };
}
