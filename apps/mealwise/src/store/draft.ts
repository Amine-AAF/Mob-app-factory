import { create } from 'zustand';

import type { ImportedDraft } from '@/domain/recipeImport';

/** Hands an imported draft to the editor (too large for route params). */
export const useImportDraft = create<{ draft: ImportedDraft | null; set: (d: ImportedDraft | null) => void }>()((set) => ({
  draft: null,
  set: (draft) => set({ draft }),
}));
