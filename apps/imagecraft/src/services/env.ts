import { createExpoFileStore } from './files/expoFileStore';
import { createWorkspace } from './files/workspace';
import type { ProcessingEnv } from './image/engine';
import { createFallbackRenderer, createNativeRenderer } from './image/renderer';

/**
 * Lazily-built processing environment (filesystem, workspace, renderer). Kept out of
 * module scope so importing services in tests never touches native modules.
 */
let env: ProcessingEnv | null = null;

export function processingEnv(): ProcessingEnv {
  if (!env) {
    const fs = createExpoFileStore();
    env = { fs, workspace: createWorkspace(fs), renderer: createNativeRenderer() ?? createFallbackRenderer(fs) };
  }
  return env;
}

/** Tests inject an in-memory environment with a fake renderer. */
export function setProcessingEnv(next: ProcessingEnv | null): void {
  env = next;
}
