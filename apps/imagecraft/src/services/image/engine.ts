import { SAFETY_LIMITS } from '@/constants/limits';
import type { RenderRecipe, RenderResult, SourceImage } from '@/types/image';
import { estimateFromSample, estimateHeuristic, type SizeEstimate } from '@/utils/estimate';
import { newId } from '@/utils/format';

import { ProcessingError, toErrorCode } from '../files/errors';
import type { FileStore } from '../files/fileStore';
import { detectFormat, extensionOf, isImageFormat } from '../files/formats';
import { HEADER_BYTES, readImageHeader } from '../files/imageHeader';
import type { Workspace } from '../files/workspace';
import { scaleRecipe } from './recipe';
import type { ImageRenderer } from './renderer';

export interface ProcessingEnv {
  fs: FileStore;
  workspace: Workspace;
  renderer: ImageRenderer;
}

/**
 * Validates a picture from its real content (never its name or extension) and reads its
 * header without decoding pixels, so memory can be planned before anything is loaded.
 */
export async function inspectImage(fs: FileStore, uri: string, name: string): Promise<SourceImage> {
  const bytes = await fs.size(uri);
  if (bytes === null) throw new ProcessingError('source_expired');
  if (bytes === 0) throw new ProcessingError('corrupted_file');
  if (bytes > SAFETY_LIMITS.maxSourceBytes) throw new ProcessingError('file_too_large');
  const head = await fs.readHead(uri, HEADER_BYTES);
  const format = detectFormat(head);
  if (!isImageFormat(format)) throw new ProcessingError('unsupported_format', format);
  const header = readImageHeader(head);
  if (!header || header.width <= 0 || header.height <= 0) throw new ProcessingError('corrupted_file');
  if (header.width * header.height > SAFETY_LIMITS.maxSourcePixels) throw new ProcessingError('image_too_large');
  return { uri, name, bytes, format, width: header.displayWidth, height: header.displayHeight, hasAlpha: header.hasAlpha };
}

export interface JobHandle {
  id: string;
  cancelled: boolean;
}

export function createJob(prefix = 'job'): JobHandle {
  return { id: newId(`${prefix}_`), cancelled: false };
}

export function cancelJob(env: ProcessingEnv, job: JobHandle): void {
  job.cancelled = true;
  env.renderer.cancel(job.id);
}

/**
 * Renders one recipe into a private temp folder and verifies the result really is the
 * requested container. The caller commits it (exportResult) or discards it.
 */
export async function renderToTemp(env: ProcessingEnv, job: JobHandle, recipe: RenderRecipe, source: SourceImage): Promise<RenderResult> {
  if (job.cancelled) throw new ProcessingError('cancelled');
  const dir = await env.workspace.createJobDir(job.id);
  const outputUri = env.fs.join(dir, `${newId('r')}.${extensionOf(recipe.encode.format)}`);
  try {
    const result = await env.renderer.render({ ...recipe, outputUri }, { jobId: job.id, sourceSize: { width: source.width, height: source.height } });
    if (job.cancelled) throw new ProcessingError('cancelled');
    const written = detectFormat(await env.fs.readHead(outputUri, 32));
    if (written !== recipe.encode.format) throw new ProcessingError('write_failed', `expected ${recipe.encode.format}, got ${written}`);
    const bytes = (await env.fs.size(outputUri)) ?? 0;
    if (bytes === 0) throw new ProcessingError('write_failed');
    return { ...result, uri: outputUri, bytes };
  } catch (e) {
    await env.fs.delete(outputUri).catch(() => undefined);
    const code = job.cancelled ? 'cancelled' : toErrorCode(e);
    throw e instanceof ProcessingError ? e : new ProcessingError(code);
  }
}

/** Moves a rendered temp file into the user's outputs under a safe, unique name. */
export async function exportResult(env: ProcessingEnv, job: JobHandle, result: RenderResult, desiredName: string): Promise<RenderResult & { name: string }> {
  const committed = await env.workspace.commitOutput(result.uri, desiredName);
  await env.workspace.deleteJobDir(job.id);
  return { ...result, uri: committed.uri, name: committed.name };
}

export async function discardJob(env: ProcessingEnv, job: JobHandle): Promise<void> {
  await env.workspace.deleteJobDir(job.id).catch(() => undefined);
}

/* ------------------------------------------------------------------ preview */

let previewCounter = 0;

/** Each screen renders its previews in its own folder, deleted when the screen closes. */
export function previewScopeDir(env: ProcessingEnv, scope: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(scope)) throw new Error('invalid preview scope');
  return env.fs.join(env.workspace.previewDir(), scope);
}

/**
 * Renders the editor preview through the SAME pipeline as the export, at a small size.
 * Only the latest preview file is kept.
 */
export async function renderPreview(
  env: ProcessingEnv,
  recipe: RenderRecipe,
  source: SourceImage,
  previous: string | null,
  encode: RenderRecipe['encode'],
  scope: string,
): Promise<RenderResult> {
  const dir = previewScopeDir(env, scope);
  await env.fs.ensureDir(dir);
  previewCounter = (previewCounter + 1) % 1_000_000;
  const uri = env.fs.join(dir, `p${Date.now()}_${previewCounter}.${extensionOf(encode.format)}`);
  const scaled = scaleRecipe(recipe, SAFETY_LIMITS.previewMaxEdge, SAFETY_LIMITS.previewMaxPixels, uri, encode);
  const result = await env.renderer.render(scaled, { jobId: `preview_${previewCounter}`, sourceSize: { width: source.width, height: source.height } });
  if (previous) await env.fs.delete(previous).catch(() => undefined);
  return result;
}

/* ------------------------------------------------------------------ estimation */

/**
 * Output size estimate. With the native renderer, a small proxy of the real picture is
 * encoded with the same settings and extrapolated; otherwise a bits-per-pixel model is used.
 * Always presented as an estimate.
 */
export async function estimateOutput(env: ProcessingEnv, recipe: RenderRecipe, source: SourceImage): Promise<SizeEstimate> {
  const output = recipe.canvas ? { width: recipe.canvas.width, height: recipe.canvas.height } : recipe.size;
  const heuristic = estimateHeuristic(output, recipe.encode.format, recipe.encode.quality, source.hasAlpha && recipe.encode.format !== 'jpeg');
  if (env.renderer.name !== 'native') return heuristic;
  const job = createJob('est');
  try {
    const dir = await env.workspace.createJobDir(job.id);
    const proxyUri = env.fs.join(dir, `proxy.${extensionOf(recipe.encode.format)}`);
    const proxy = scaleRecipe(recipe, SAFETY_LIMITS.estimateMaxEdge, SAFETY_LIMITS.estimateMaxEdge ** 2, proxyUri);
    const result = await env.renderer.render(proxy, { jobId: job.id, sourceSize: { width: source.width, height: source.height } });
    return estimateFromSample(output, { width: result.width, height: result.height }, result.bytes);
  } catch {
    return heuristic;
  } finally {
    await discardJob(env, job);
  }
}

/* ------------------------------------------------------------------ import */

export interface PickedAsset {
  uri: string;
  name: string | null;
}

/**
 * Imports a picked file: moves the picker's temporary copy into the private sources
 * folder (the user's original is never touched), then validates it.
 */
export async function importPicked(env: ProcessingEnv, asset: PickedAsset): Promise<SourceImage> {
  const head = await env.fs.readHead(asset.uri, HEADER_BYTES).catch(() => {
    throw new ProcessingError('source_expired');
  });
  const format = detectFormat(head);
  if (!isImageFormat(format)) {
    await env.workspace.discardTemporary(asset.uri);
    throw new ProcessingError('unsupported_format', format);
  }
  const id = newId('src_');
  let uri: string;
  if (env.workspace.isInside(asset.uri, env.fs.cacheRoot)) {
    uri = await env.workspace.adoptSource(asset.uri, id, extensionOf(format));
  } else {
    // Not a picker temp copy (e.g. a provider URI): copy it, never reference the original.
    await env.fs.ensureDir(env.workspace.sourcesDir());
    uri = env.fs.join(env.workspace.sourcesDir(), `${id}.${extensionOf(format)}`);
    await env.fs.writeBytes(uri, await env.fs.readBytes(asset.uri));
  }
  try {
    return await inspectImage(env.fs, uri, asset.name?.trim() || `image.${extensionOf(format)}`);
  } catch (e) {
    await env.workspace.deleteOwned(uri);
    throw e;
  }
}
