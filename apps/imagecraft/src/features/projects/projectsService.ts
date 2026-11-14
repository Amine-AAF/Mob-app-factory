import { repos } from '@/database';
import type { NewProject, OperationId, Project, ProjectKind } from '@/database/repositories/projectsRepository';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { processingEnv } from '@/services/env';
import { useSession } from '@/store/session';
import type { EditState, RenderResult } from '@/types/image';
import { newId } from '@/utils/format';

/**
 * Projects = local history of processed pictures. Only metadata goes to SQLite; the
 * result file stays in the private outputs folder and, for editor projects (when the user
 * keeps projects), the private source copy is kept so the project can be re-opened.
 */
export interface RecordInput {
  kind: ProjectKind;
  output: RenderResult & { name: string };
  operations: OperationId[];
  inputBytes: number | null;
  itemCount?: number;
  source?: { uri: string; name: string } | null;
  editState?: EditState | null;
  /** Update an existing project instead of creating one. */
  projectId?: string | null;
}

export async function recordProject(input: RecordInput): Promise<Project> {
  const keep = useSession.getState().preferences.keepProjects;
  const project: NewProject = {
    id: input.projectId ?? newId('prj_'),
    kind: input.kind,
    title: input.output.name,
    sourceUri: keep && input.source ? input.source.uri : null,
    sourceName: input.source?.name ?? null,
    editState: keep ? (input.editState ?? null) : null,
    operations: [...new Set(input.operations)],
    outputUri: input.output.uri,
    outputName: input.output.name,
    outputFormat: input.output.format,
    outputBytes: input.output.bytes,
    outputWidth: input.output.width,
    outputHeight: input.output.height,
    inputBytes: input.inputBytes,
    itemCount: input.itemCount ?? 1,
  };
  const saved = await repos().projects.save(project, clock.now().toISOString());
  useSession.getState().bump();
  return saved;
}

export async function recordToolUse(toolId: string): Promise<void> {
  await repos().toolUsage.record(toolId, clock.now().toISOString()).catch((e) => recordError(e, 'tool_usage'));
}

/** True when a project can be re-opened in the editor (source copy still present). */
export async function canReopen(project: Project): Promise<boolean> {
  if (!project.sourceUri || !project.editState) return false;
  return processingEnv().fs.exists(project.sourceUri);
}

/** Deletes the project row and the files ImageCraft owns for it (never anything else). */
export async function deleteProject(id: string): Promise<void> {
  const removed = await repos().projects.remove(id);
  if (!removed) return;
  const { workspace } = processingEnv();
  const stillUsed = await repos().projects.referencedFiles();
  for (const uri of [removed.outputUri, removed.sourceUri]) {
    if (uri && !stillUsed.has(uri)) await workspace.deleteOwned(uri).catch((e) => recordError(e, 'project_delete_file'));
  }
  useSession.getState().bump();
}

/** Clears the whole history and every result/source file. Gallery copies are not affected. */
export async function clearAllProjects(): Promise<void> {
  await repos().projects.clear();
  const { workspace } = processingEnv();
  await workspace.deleteAllUserFiles();
  useSession.getState().bump();
}

/** Start-up housekeeping: removes private source copies no project references. */
export async function pruneUnreferencedSources(): Promise<number> {
  const { workspace } = processingEnv();
  return workspace.pruneSources(await repos().projects.referencedFiles());
}
