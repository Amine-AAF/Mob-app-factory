import { useEffect, useState } from 'react';

import { processingEnv } from '@/services/env';
import { estimateOutput } from '@/services/image/engine';
import type { RenderRecipe, SourceImage } from '@/types/image';
import type { SizeEstimate } from '@/utils/estimate';

/** Debounced output-size estimate for the current settings (always labelled as an estimate). */
export function useEstimate(source: SourceImage | null, recipe: RenderRecipe | null, delay = 350) {
  const [state, setState] = useState<{ key: string | null; estimate: SizeEstimate | null; estimating: boolean }>({ key: null, estimate: null, estimating: false });
  const key = recipe ? JSON.stringify({ ...recipe, outputUri: '' }) : null;

  useEffect(() => {
    if (!source || !recipe || !key) return undefined;
    let alive = true;
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, key, estimating: true }));
      estimateOutput(processingEnv(), recipe, source)
        .then((estimate) => alive && setState({ key, estimate, estimating: false }))
        .catch(() => alive && setState({ key, estimate: null, estimating: false }));
    }, delay);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // `key` captures every recipe field; the recipe object identity changes on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, source?.uri, delay]);

  // A stale estimate (other settings) is never shown as current.
  const current = key !== null && state.key === key;
  return { estimate: current ? state.estimate : null, estimating: key !== null && (!current || state.estimating) };
}
