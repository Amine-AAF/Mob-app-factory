import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { findTool, type ToolId } from '@/constants/tools';
import { recordToolUse } from '@/features/projects/projectsService';
import { useImport } from '@/hooks/useImport';
import { track } from '@/services/analytics';
import type { ProcessingErrorCode } from '@/services/files/errors';
import { useEditor, type EditorPanel } from '@/store/editor';

/**
 * Opens a tool. Editor tools (crop, filters, text, watermark) open the Edit tab on the right
 * panel; when no picture is open yet, the photo picker opens first (one gesture from Home).
 */
export function useOpenTool(entry: string) {
  const { pick, busy } = useImport(entry);
  const [error, setError] = useState<ProcessingErrorCode | null>(null);

  const openEditor = useCallback(
    async (panel: EditorPanel) => {
      setError(null);
      const editor = useEditor.getState();
      if (!editor.source) {
        const outcome = await pick({ multiple: false });
        const image = outcome?.images[0];
        if (!image) {
          if (outcome?.errors[0]) setError(outcome.errors[0]);
          return;
        }
        editor.open(image, { panel });
      } else editor.setPanel(panel);
      track('editor_opened', { entry });
      router.navigate('/(tabs)/edit');
    },
    [pick, entry],
  );

  const open = useCallback(
    async (id: ToolId) => {
      const tool = findTool(id);
      if (!tool) return;
      void recordToolUse(id);
      if (tool.route === '/(tabs)/edit') {
        await openEditor(tool.editorPanel ?? 'crop');
        return;
      }
      router.push(tool.route);
    },
    [openEditor],
  );

  /** Home's main action: pick a photo and open the editor. */
  const importAndEdit = useCallback(() => {
    useEditor.getState().close();
    return openEditor('crop');
  }, [openEditor]);

  return { open, importAndEdit, busy, error };
}
