import type { ExportedFile } from '@/components/ExportDialog';
import type { OperationId, ProjectKind } from '@/database/repositories/projectsRepository';
import { recordProject } from '@/features/projects/projectsService';
import { exportDecision, type PremiumReason } from '@/features/premium/gating';
import { processingEnv } from '@/services/env';
import { ProcessingError } from '@/services/files/errors';
import { extensionOf } from '@/services/files/formats';
import { outputFileName } from '@/services/files/naming';
import { exportResult, renderToTemp, type JobHandle } from '@/services/image/engine';
import { consumeUnlock } from '@/services/usageActions';
import { useSession } from '@/store/session';
import type { EditState, RenderRecipe, SourceImage } from '@/types/image';

/**
 * Shared "process → save result → record project" flow of every single-image tool.
 * Premium items are checked HERE (at export time) as well as in the UI.
 */
export interface ExportParams {
  job: JobHandle;
  recipe: RenderRecipe;
  source: SourceImage;
  suffix: string;
  kind: ProjectKind;
  operations: OperationId[];
  premiumReasons: PremiumReason[];
  editState?: EditState | null;
  projectId?: string | null;
  progress: (done: number, total: number) => void;
}

export async function ensureExportAllowed(reasons: PremiumReason[]): Promise<void> {
  const { entitlement, usage } = useSession.getState();
  const decision = exportDecision(entitlement.isPremium, reasons, usage);
  if (decision === 'premium_required') throw new ProcessingError('premium_required');
  if (decision === 'use_unlock' && !(await consumeUnlock())) throw new ProcessingError('premium_required');
}

export async function processAndExport(p: ExportParams): Promise<{ file: ExportedFile; projectId: string }> {
  await ensureExportAllowed(p.premiumReasons);
  const env = processingEnv();
  p.progress(0, 2);
  const temp = await renderToTemp(env, p.job, p.recipe, p.source);
  p.progress(1, 2);
  const file = await exportResult(env, p.job, temp, outputFileName(p.source.name, p.suffix, extensionOf(p.recipe.encode.format)));
  const project = await recordProject({
    kind: p.kind,
    output: file,
    operations: p.operations,
    inputBytes: p.source.bytes,
    source: { uri: p.source.uri, name: p.source.name },
    editState: p.editState ?? null,
    projectId: p.projectId ?? null,
  });
  p.progress(2, 2);
  return { file, projectId: project.id };
}

/** Operations actually applied by an edit state (stored with the project). */
export function operationsOf(edit: EditState): OperationId[] {
  const ops: OperationId[] = [];
  if (edit.geometry.crop) ops.push('crop');
  if (edit.geometry.rotation) ops.push('rotate');
  if (edit.geometry.flipH || edit.geometry.flipV) ops.push('flip');
  if (edit.filterId !== 'original') ops.push('filter');
  if (Object.values(edit.adjustments).some((v) => v !== 0)) ops.push('adjust');
  if (edit.texts.some((t) => t.text.trim())) ops.push('text');
  if (edit.watermark) ops.push('watermark');
  return ops;
}
