import type { HealthCategory } from '@/domain/types';

/**
 * Informative knowledge base about common plant problems (texts in i18n under `healthGuide`).
 * It lists *possible* causes and what to check — it is NOT a diagnosis tool and never
 * analyses photos. Every screen showing it repeats that one symptom can have several causes.
 * Sources: see CONTENT_SOURCES.md (RHS advice pages, university extension services).
 */
export interface GuideEntry {
  /** i18n keys under healthGuide.causes.* */
  causes: string[];
  /** i18n keys under healthGuide.checks.* */
  checks: string[];
}

export const HEALTH_GUIDE: Record<HealthCategory, GuideEntry> = {
  yellow_leaves: {
    causes: ['overwatering', 'underwatering', 'natural_ageing', 'low_light', 'nutrient_deficiency', 'sudden_change'],
    checks: ['soil_moisture', 'drainage', 'which_leaves', 'recent_changes'],
  },
  brown_leaves: {
    causes: ['low_humidity', 'underwatering', 'sunburn', 'salt_buildup', 'cold_damage'],
    checks: ['soil_moisture', 'light_exposure', 'heat_sources', 'water_quality'],
  },
  wilting: {
    causes: ['underwatering', 'root_rot', 'heat_stress', 'transplant_shock'],
    checks: ['soil_moisture', 'roots', 'temperature'],
  },
  root_problems: {
    causes: ['root_rot', 'pot_bound', 'poor_drainage'],
    checks: ['roots', 'drainage', 'pot_size'],
  },
  pests: {
    causes: ['spider_mites', 'mealybugs', 'scale', 'aphids', 'fungus_gnats', 'thrips'],
    checks: ['leaf_undersides', 'isolate', 'neighbours'],
  },
  fungal: {
    causes: ['powdery_mildew', 'leaf_spot', 'grey_mould', 'root_rot'],
    checks: ['air_flow', 'wet_leaves', 'remove_affected'],
  },
  growth: {
    causes: ['low_light', 'dormancy', 'pot_bound', 'nutrient_deficiency'],
    checks: ['light_exposure', 'season', 'roots'],
  },
  other: {
    causes: ['many_factors'],
    checks: ['recent_changes', 'ask_expert'],
  },
};
