import { createTestDatabase } from '@factory/testing';

import { initDatabase, type Repositories } from '@/database';
import type { WardrobeItemInput } from '@/domain/types';

export async function freshRepos(): Promise<Repositories> {
  return initDatabase(await createTestDatabase());
}

export function itemInput(patch: Partial<WardrobeItemInput> = {}): WardrobeItemInput {
  return {
    name: 'White shirt',
    categoryId: 'cat_shirts',
    subcategory: null,
    primaryColor: 'white',
    secondaryColors: [],
    brandName: null,
    size: 'M',
    sizeSystem: 'intl',
    seasons: 0,
    styleId: null,
    occasionIds: [],
    purchaseDate: null,
    purchasePrice: null,
    currency: null,
    condition: null,
    notes: null,
    photoPath: null,
    thumbPath: null,
    favorite: false,
    archived: false,
    careStatus: 'clean',
    ...patch,
  };
}
