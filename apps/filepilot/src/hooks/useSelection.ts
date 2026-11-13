import { useCallback, useEffect, useRef, useState } from 'react';

import { recordError, track, countBucket } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { ProcessingError, toErrorCode, type ProcessingErrorCode } from '@/services/files/errors';
import { pickFiles, type PickKind, type PickedFile } from '@/services/files/picker';
import { SAFETY_LIMITS } from '@/config/limits';
import { inspectImage, type ImageSource } from '@/services/image/imageEngine';
import { inspectPdf } from '@/services/pdf/pdfEngine';
import type { PdfSource } from '@/services/operations/tools';

/**
 * Picks files with the system picker, validates each one from its real content and
 * owns the temporary copies: they are deleted when removed from the selection or when
 * the screen unmounts (and swept at start-up as a safety net).
 */
export interface SelectionIssue {
  name: string;
  code: ProcessingErrorCode;
}

interface Options<T> {
  kind: PickKind;
  tool: string;
  multiple: boolean;
  /** Maximum number of files kept (excess files are rejected with too_many_files). */
  max: number;
  validate: (file: PickedFile) => Promise<T>;
  uriOf: (item: T) => string;
}

function useSelection<T>({ kind, tool, multiple, max, validate, uriOf }: Options<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [issues, setIssues] = useState<SelectionIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const owned = useRef(new Set<string>());
  // Mirror of `items` so actions can compute the next list synchronously (no side effects in updaters).
  const itemsRef = useRef<T[]>([]);
  const commit = useCallback((next: T[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const discard = useCallback((uri: string) => {
    owned.current.delete(uri);
    processingEnv()
      .workspace.discardTemporary(uri)
      .catch((e) => recordError(e, 'discard_temp'));
  }, []);

  useEffect(
    () => () => {
      const uris = [...owned.current];
      owned.current.clear();
      uris.forEach((u) => void processingEnv().workspace.discardTemporary(u).catch(() => undefined));
    },
    [],
  );

  const pick = useCallback(
    async (mode: 'add' | 'replace' = multiple ? 'add' : 'replace') => {
      setLoading(true);
      try {
        const picked = await pickFiles(kind, multiple);
        if (!picked.length) return;
        picked.forEach((p) => owned.current.add(p.uri));
        const valid: T[] = [];
        const problems: SelectionIssue[] = [];
        for (const file of picked) {
          try {
            valid.push(await validate(file));
          } catch (e) {
            problems.push({ name: file.name, code: toErrorCode(e) });
            discard(file.uri);
          }
        }
        track('file_selected', { tool, kind, count: countBucket(picked.length) });
        const current = itemsRef.current;
        if (mode === 'replace') current.forEach((c) => discard(uriOf(c)));
        const base = mode === 'replace' ? [] : current;
        const room = Math.max(0, max - base.length);
        const rejected = valid.slice(room);
        rejected.forEach((v) => discard(uriOf(v)));
        if (rejected.length) problems.push({ name: '', code: 'too_many_files' });
        commit([...base, ...valid.slice(0, room)]);
        setIssues(problems);
      } catch (e) {
        recordError(e, 'pick_files');
        setIssues([{ name: '', code: 'read_failed' }]);
      } finally {
        setLoading(false);
      }
    },
    [commit, discard, kind, max, multiple, tool, uriOf, validate],
  );

  const remove = useCallback(
    (index: number) => {
      const current = itemsRef.current;
      const item = current[index];
      if (item) discard(uriOf(item));
      commit(current.filter((_, i) => i !== index));
    },
    [commit, discard, uriOf],
  );

  const move = useCallback(
    (index: number, delta: -1 | 1) => {
      const current = itemsRef.current;
      const target = index + delta;
      if (target < 0 || target >= current.length) return;
      const next = [...current];
      [next[index], next[target]] = [next[target] as T, next[index] as T];
      commit(next);
    },
    [commit],
  );

  const clear = useCallback(() => {
    itemsRef.current.forEach((c) => discard(uriOf(c)));
    commit([]);
    setIssues([]);
  }, [commit, discard, uriOf]);

  return { items, issues, loading, pick, remove, move, clear, dismissIssues: () => setIssues([]) };
}

const imageUri = (i: ImageSource) => i.uri;
const pdfUri = (p: PdfSource) => p.uri;

export function useImageSelection(tool: string, multiple: boolean, max: number) {
  const validate = useCallback((f: PickedFile) => inspectImage(processingEnv().fs, f.uri, f.name), []);
  return useSelection<ImageSource>({ kind: 'image', tool, multiple, max, validate, uriOf: imageUri });
}

export function usePdfSelection(tool: string, multiple: boolean, max: number) {
  const validate = useCallback(async (f: PickedFile): Promise<PdfSource> => {
    const { fs } = processingEnv();
    const size = await fs.size(f.uri);
    if (size === null) throw new ProcessingError('file_missing');
    if (size > SAFETY_LIMITS.maxPdfBytes) throw new ProcessingError('file_too_large');
    // pdf-lib validates the structure, detects encryption and counts pages, all locally.
    const info = await inspectPdf(await fs.readBytes(f.uri), 1);
    return { uri: f.uri, name: f.name, size, pageCount: info.pageCount };
  }, []);
  return useSelection<PdfSource>({ kind: 'pdf', tool, multiple, max, validate, uriOf: pdfUri });
}
