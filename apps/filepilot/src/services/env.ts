import { createExpoFileStore } from './files/expoFileStore';
import type { FileStore } from './files/fileStore';
import { createWorkspace, type Workspace } from './files/workspace';
import { createExpoImageCodec } from './image/expoImageCodec';
import type { ToolEnv } from './operations/tools';
import { createNativePdfRenderer } from './pdf/pdfRenderer';

/**
 * Lazily-built processing environment (filesystem, workspace, codecs). Kept out of
 * module scope so importing services in tests never touches native modules.
 */
let env: (ToolEnv & { workspace: Workspace }) | null = null;

export function processingEnv(): ToolEnv & { workspace: Workspace; fs: FileStore } {
  if (!env) {
    const fs = createExpoFileStore();
    env = { fs, workspace: createWorkspace(fs), codec: createExpoImageCodec(fs), renderer: createNativePdfRenderer() };
  }
  return env;
}

/** Tests can inject an in-memory environment. */
export function setProcessingEnv(next: ToolEnv & { workspace: Workspace }): void {
  env = next;
}
