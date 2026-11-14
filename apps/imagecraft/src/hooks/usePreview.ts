import { useEffect, useRef, useState } from 'react';

import { recordError } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { toErrorCode, type ProcessingErrorCode } from '@/services/files/errors';
import { previewScopeDir, renderPreview } from '@/services/image/engine';
import { previewEncode } from '@/services/image/recipe';
import type { RenderRecipe, SourceImage } from '@/types/image';
import { newId } from '@/utils/format';

export interface PreviewState {
  uri: string | null;
  width: number;
  height: number;
  rendering: boolean;
  error: ProcessingErrorCode | null;
  /** False when the native renderer is absent (Expo Go): previews show the untouched source. */
  supported: boolean;
}

/**
 * Live preview rendered by the SAME native pipeline as the export (small pixel budget),
 * debounced while sliders move. Only the latest render is kept; stale results are dropped.
 */
export function usePreview(source: SourceImage | null, recipe: RenderRecipe | null, debounceMs = 120): PreviewState {
  const supported = processingEnv().renderer.name === 'native';
  const [state, setState] = useState<PreviewState>({ uri: null, width: 0, height: 0, rendering: false, error: null, supported });
  const seq = useRef(0);
  const last = useRef<string | null>(null);
  const [scope] = useState(() => newId('pv'));
  const key = recipe ? JSON.stringify({ ...recipe, outputUri: '' }) : null;

  useEffect(() => {
    if (!source || !recipe || !supported) return undefined;
    const id = ++seq.current;
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, rendering: true }));
      renderPreview(processingEnv(), recipe, source, last.current, previewEncode(recipe, source.hasAlpha), scope)
        .then((r) => {
          if (id !== seq.current) {
            void processingEnv().fs.delete(r.uri);
            return;
          }
          last.current = r.uri;
          setState({ uri: r.uri, width: r.width, height: r.height, rendering: false, error: null, supported });
        })
        .catch((e) => {
          if (id !== seq.current) return;
          recordError(e, 'preview');
          setState((s) => ({ ...s, rendering: false, error: toErrorCode(e) }));
        });
    }, debounceMs);
    return () => clearTimeout(timer);
    // `key` captures every recipe field; the recipe object identity changes on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, source?.uri, supported, debounceMs, scope]);

  useEffect(
    () => () => {
      const env = processingEnv();
      void env.fs.delete(previewScopeDir(env, scope)).catch(() => undefined);
    },
    [scope],
  );

  return state;
}
