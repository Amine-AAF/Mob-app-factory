import type { IconName } from '@factory/design-system';

import type { HealthCategory, JournalKind, LocationType, PlantCategory, TaskType } from '@/domain/types';

/** Botanical icon vocabulary (Ionicons) used consistently across the app. */
export const CATEGORY_ICON: Record<PlantCategory, IconName> = {
  indoor: 'home-outline',
  outdoor: 'sunny-outline',
  succulent: 'flower-outline',
  cactus: 'triangle-outline',
  flower: 'rose-outline',
  herb: 'leaf-outline',
  vegetable: 'nutrition-outline',
  tree: 'git-branch-outline',
  tropical: 'leaf',
  other: 'ellipse-outline',
};

export const TASK_ICON: Record<TaskType, IconName> = {
  watering: 'water',
  fertilizing: 'flask-outline',
  pruning: 'cut-outline',
  repotting: 'cube-outline',
  leaf_cleaning: 'sparkles-outline',
  pest_check: 'bug-outline',
  rotation: 'sync-outline',
  seasonal: 'partly-sunny-outline',
  health_check: 'medkit-outline',
};

export const LOCATION_ICON: Record<LocationType, IconName> = {
  living_room: 'tv-outline',
  balcony: 'business-outline',
  terrace: 'grid-outline',
  garden: 'flower-outline',
  greenhouse: 'home-outline',
  office: 'briefcase-outline',
  kitchen: 'restaurant-outline',
  bedroom: 'bed-outline',
  custom: 'location-outline',
};

export const JOURNAL_ICON: Record<JournalKind, IconName> = {
  observation: 'eye-outline',
  change: 'swap-horizontal-outline',
  new_leaf: 'leaf-outline',
  flowering: 'flower-outline',
  repotting: 'cube-outline',
  problem: 'alert-circle-outline',
  treatment: 'medkit-outline',
  comment: 'chatbubble-outline',
};

export const HEALTH_ICON: Record<HealthCategory, IconName> = {
  yellow_leaves: 'color-fill-outline',
  brown_leaves: 'leaf-outline',
  wilting: 'trending-down-outline',
  root_problems: 'git-network-outline',
  pests: 'bug-outline',
  fungal: 'cloud-outline',
  growth: 'resize-outline',
  other: 'help-circle-outline',
};
