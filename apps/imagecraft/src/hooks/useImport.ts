import { useCallback, useState } from 'react';

import { countBucket, recordError, sizeBucket, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { toErrorCode, type ProcessingErrorCode } from '@/services/files/errors';
import { importPicked } from '@/services/image/engine';
import { pickImages } from '@/services/picker';
import type { SourceImage } from '@/types/image';

export interface ImportOutcome {
  images: SourceImage[];
  /** One code per rejected file (unsupported format, corrupted…). */
  errors: ProcessingErrorCode[];
}

/**
 * Opens the system photo picker and imports the chosen pictures (private copies, validated
 * from their content). Each rejected file reports its own error; valid ones still import.
 */
export function useImport(entry: string) {
  const [busy, setBusy] = useState(false);
  const pick = useCallback(
    async (opts: { multiple: boolean; limit?: number } = { multiple: false }): Promise<ImportOutcome | null> => {
      setBusy(true);
      try {
        const assets = await pickImages(opts);
        if (assets.length === 0) return null;
        const env = processingEnv();
        const images: SourceImage[] = [];
        const errors: ProcessingErrorCode[] = [];
        for (const asset of assets) {
          try {
            images.push(await importPicked(env, asset));
          } catch (e) {
            errors.push(toErrorCode(e));
          }
        }
        const first = images[0];
        if (first) track('image_imported', { source: entry, format: first.format, size_bucket: sizeBucket(first.bytes), count: countBucket(images.length) });
        return { images, errors };
      } catch (e) {
        recordError(e, 'import');
        return { images: [], errors: [toErrorCode(e)] };
      } finally {
        setBusy(false);
      }
    },
    [entry],
  );
  return { pick, busy };
}
