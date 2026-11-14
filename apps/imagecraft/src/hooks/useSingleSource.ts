import { useCallback, useState } from 'react';

import type { ProcessingErrorCode } from '@/services/files/errors';
import { useEditor } from '@/store/editor';
import type { SourceImage } from '@/types/image';

import { useImport } from './useImport';

/**
 * Source picture of a single-image tool: freshly imported, or the picture already open
 * in the editor ("use current photo"), so switching tools never forces a re-import.
 */
export function useSingleSource(entry: string) {
  const editorSource = useEditor((s) => s.source);
  const [source, setSource] = useState<SourceImage | null>(editorSource);
  const [error, setError] = useState<ProcessingErrorCode | null>(null);
  const { pick, busy } = useImport(entry);

  const choose = useCallback(async () => {
    setError(null);
    const outcome = await pick({ multiple: false });
    if (!outcome) return;
    if (outcome.images[0]) setSource(outcome.images[0]);
    else if (outcome.errors[0]) setError(outcome.errors[0]);
  }, [pick]);

  return { source, setSource, choose, busy, error, setError, editorSource };
}
