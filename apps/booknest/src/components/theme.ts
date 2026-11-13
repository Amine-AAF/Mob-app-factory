import { useTheme, type Theme } from '@factory/design-system';
import { useMemo } from 'react';

import { paper, SERIF, SPINE_COLORS } from '@/config/brand';

/**
 * BookNest layers warm "paper" surfaces over the shared factory theme. The shared
 * ThemeProvider does not accept surface overrides yet, so the override lives here
 * (candidate for @factory/design-system — see factory/tracking/booknest.md).
 */
export interface BookTheme extends Theme {
  serif: string | undefined;
}

export function useBookTheme(): BookTheme {
  const base = useTheme();
  return useMemo(() => {
    const p = paper[base.scheme];
    return { ...base, colors: { ...base.colors, ...p }, serif: SERIF };
  }, [base]);
}

/** Stable spine color for a title (generated covers). */
export function spineColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return SPINE_COLORS[h % SPINE_COLORS.length]!;
}
