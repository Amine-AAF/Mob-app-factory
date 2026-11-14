import { buildRecipe } from '@/services/image/recipe';
import { exportResult, discardJob, renderToTemp, type JobHandle, type ProcessingEnv } from '@/services/image/engine';
import { ProcessingError, toErrorCode, type ProcessingErrorCode } from '@/services/files/errors';
import { extensionOf } from '@/services/files/formats';
import { outputFileName } from '@/services/files/naming';
import { initialEditState, type OutputFormat, type RenderResult, type SourceImage, type Watermark } from '@/types/image';
import { geometrySize, resolveResize, type ResizeRequest } from '@/utils/geometry';

/**
 * Batch processing: the same settings applied to many pictures.
 * - Strictly sequential: only one picture is decoded at a time, whatever the device.
 * - Cancellable between (and, with the native renderer, inside) files.
 * - A failure on one file never stops the batch: each file gets its own status.
 */
export interface BatchSettings {
  format: OutputFormat;
  quality: number;
  resize: ResizeRequest | null;
  watermark: Watermark | null;
  maxOutputPixels: number;
  /** File name suffix, e.g. "compressed". */
  suffix: string;
}

export type BatchItemResult =
  | { index: number; name: string; status: 'done'; inputBytes: number; output: RenderResult & { name: string } }
  | { index: number; name: string; status: 'failed'; inputBytes: number; code: ProcessingErrorCode }
  | { index: number; name: string; status: 'cancelled'; inputBytes: number };

export interface BatchSummary {
  items: BatchItemResult[];
  done: number;
  failed: number;
  cancelled: number;
  inputBytes: number;
  outputBytes: number;
}

export interface BatchInput {
  /** Loads (imports / validates) the picture lazily, so a bad file fails on its own. */
  load: () => Promise<SourceImage>;
  name: string;
  bytes: number;
}

export async function runBatch(
  env: ProcessingEnv,
  job: JobHandle,
  inputs: BatchInput[],
  settings: BatchSettings,
  onProgress?: (done: number, total: number) => void,
): Promise<BatchSummary> {
  const items: BatchItemResult[] = [];
  onProgress?.(0, inputs.length);
  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index] as BatchInput;
    if (job.cancelled) {
      items.push({ index, name: input.name, status: 'cancelled', inputBytes: input.bytes });
      continue;
    }
    try {
      const source = await input.load();
      const edit = initialEditState();
      const base = geometrySize(source, edit.geometry);
      const size = settings.resize ? resolveResize(base, settings.resize) : base;
      if (!size) throw new ProcessingError('image_too_large');
      const { recipe } = buildRecipe(source, edit, {
        outputUri: '',
        encode: { format: settings.format, quality: settings.quality, flattenBackground: '#FFFFFF' },
        size,
        maxOutputPixels: settings.maxOutputPixels,
        watermark: settings.watermark,
      });
      const temp = await renderToTemp(env, job, recipe, source);
      const output = await exportResult(env, job, temp, outputFileName(source.name, settings.suffix, extensionOf(settings.format)));
      items.push({ index, name: input.name, status: 'done', inputBytes: source.bytes, output });
    } catch (e) {
      const code = toErrorCode(e);
      if (code === 'cancelled' || job.cancelled) items.push({ index, name: input.name, status: 'cancelled', inputBytes: input.bytes });
      else items.push({ index, name: input.name, status: 'failed', inputBytes: input.bytes, code });
    }
    onProgress?.(index + 1, inputs.length);
  }
  await discardJob(env, job);
  return summarize(items);
}

export function summarize(items: BatchItemResult[]): BatchSummary {
  let inputBytes = 0;
  let outputBytes = 0;
  for (const i of items) {
    if (i.status === 'done') {
      inputBytes += i.inputBytes;
      outputBytes += i.output.bytes;
    }
  }
  return {
    items,
    done: items.filter((i) => i.status === 'done').length,
    failed: items.filter((i) => i.status === 'failed').length,
    cancelled: items.filter((i) => i.status === 'cancelled').length,
    inputBytes,
    outputBytes,
  };
}
