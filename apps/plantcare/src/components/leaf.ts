import { useTheme } from '@factory/design-system';

import { leaf } from '@/config/brand';

/** PlantCare tokens for the current scheme. */
export function useLeaf() {
  const theme = useTheme();
  return theme.scheme === 'dark' ? leaf.dark : leaf.light;
}
