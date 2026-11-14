import * as ImagePicker from 'expo-image-picker';

import { ProcessingError } from './files/errors';
import type { PickedAsset } from './image/engine';

/**
 * Picture selection through the Android Photo Picker (expo-image-picker).
 * - No storage or media permission is requested: the user grants access to the chosen
 *   pictures only, at the moment they pick them.
 * - The picker hands ImageCraft a private temporary COPY; the original in the gallery is
 *   never opened for writing.
 * - EXIF is not requested (location and camera data are not read).
 */
export async function pickImages(options: { multiple: boolean; limit?: number }): Promise<PickedAsset[]> {
  let result: ImagePicker.ImagePickerResult;
  try {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: options.multiple,
      selectionLimit: options.multiple ? (options.limit ?? 0) : 1,
      allowsEditing: false,
      exif: false,
      quality: 1,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (/permission/i.test(message)) throw new ProcessingError('permission_denied');
    throw e;
  }
  if (result.canceled) return [];
  return result.assets.map((a) => ({ uri: a.uri, name: a.fileName ?? null }));
}
