import type { Frequency, IntervalUnit } from '@/domain/recurrence';
import type { AssetCategory, MaintenanceCategory, Priority } from '@/domain/types';

/**
 * Pre-configured maintenance templates. Titles and descriptions live in the locale
 * files (`templates.<id>.title` / `.desc`).
 *
 * The frequencies are generic, editable starting points for organising chores —
 * NOT technical recommendations. The UI always shows a disclaimer and asks users to
 * follow the manufacturer's instructions and local regulations.
 *
 * `free: true` templates are available to everyone; the others are part of Premium.
 */
export interface MaintenanceTemplate {
  id: string;
  category: MaintenanceCategory;
  frequency: Frequency;
  intervalValue?: number;
  intervalUnit?: IntervalUnit;
  estimatedMinutes: number;
  priority: Priority;
  /** Asset categories this template is suggested for. */
  assets?: AssetCategory[];
  free: boolean;
}

const t = (
  id: string,
  category: MaintenanceCategory,
  frequency: Frequency,
  estimatedMinutes: number,
  priority: Priority,
  free: boolean,
  assets?: AssetCategory[],
  custom?: { intervalValue: number; intervalUnit: IntervalUnit },
): MaintenanceTemplate => ({ id, category, frequency, estimatedMinutes, priority, free, ...(assets ? { assets } : {}), ...(custom ?? {}) });

export const MAINTENANCE_TEMPLATES: readonly MaintenanceTemplate[] = [
  // HVAC
  t('ac_filter_clean', 'hvac', 'monthly', 20, 'medium', true, ['air_conditioner']),
  t('ac_service', 'hvac', 'annual', 90, 'medium', false, ['air_conditioner']),
  t('ac_outdoor_unit', 'hvac', 'semiannual', 30, 'low', false, ['air_conditioner']),
  t('boiler_service', 'hvac', 'annual', 60, 'high', true, ['boiler']),
  t('boiler_pressure', 'hvac', 'monthly', 5, 'medium', false, ['boiler']),
  t('radiator_bleed', 'hvac', 'annual', 30, 'low', true, ['heating']),
  t('heating_check', 'hvac', 'annual', 30, 'medium', false, ['heating']),
  t('vmc_vents_clean', 'hvac', 'quarterly', 20, 'low', false),
  t('chimney_sweep', 'hvac', 'annual', 60, 'high', false),
  t('thermostat_battery', 'hvac', 'annual', 5, 'low', false, ['heating']),
  // Plumbing
  t('water_heater_flush', 'plumbing', 'annual', 60, 'medium', true, ['water_heater']),
  t('water_heater_anode', 'plumbing', 'custom', 45, 'low', false, ['water_heater'], { intervalValue: 2, intervalUnit: 'year' }),
  t('drains_clean', 'plumbing', 'monthly', 15, 'low', true, ['plumbing']),
  t('leak_check', 'plumbing', 'quarterly', 15, 'medium', true, ['plumbing']),
  t('main_valve_test', 'plumbing', 'annual', 10, 'medium', false, ['plumbing']),
  t('faucet_aerators', 'plumbing', 'quarterly', 15, 'low', false, ['plumbing']),
  t('toilet_check', 'plumbing', 'semiannual', 15, 'low', false, ['plumbing']),
  t('shower_head_descale', 'plumbing', 'quarterly', 15, 'low', true, ['plumbing']),
  t('water_softener_salt', 'plumbing', 'monthly', 10, 'low', false, ['plumbing']),
  t('sump_pump_test', 'plumbing', 'quarterly', 10, 'medium', false, ['plumbing']),
  // Appliances
  t('fridge_clean', 'appliances', 'quarterly', 30, 'low', true, ['refrigerator']),
  t('fridge_coils', 'appliances', 'semiannual', 20, 'low', false, ['refrigerator']),
  t('freezer_defrost', 'appliances', 'semiannual', 60, 'low', false, ['refrigerator']),
  t('fridge_water_filter', 'appliances', 'semiannual', 10, 'medium', false, ['refrigerator']),
  t('washer_drum_clean', 'appliances', 'monthly', 10, 'low', true, ['washer']),
  t('washer_filter', 'appliances', 'quarterly', 15, 'medium', true, ['washer']),
  t('washer_hoses', 'appliances', 'annual', 10, 'medium', false, ['washer']),
  t('dryer_vent', 'appliances', 'annual', 30, 'high', false, ['washer']),
  t('dishwasher_filter', 'appliances', 'monthly', 10, 'low', true, ['dishwasher']),
  t('dishwasher_descale', 'appliances', 'quarterly', 10, 'low', false, ['dishwasher']),
  t('oven_clean', 'appliances', 'quarterly', 45, 'low', true, ['oven']),
  t('range_hood_filter', 'appliances', 'quarterly', 15, 'medium', true, ['oven']),
  t('kettle_coffee_descale', 'appliances', 'monthly', 10, 'low', true),
  t('microwave_clean', 'appliances', 'monthly', 10, 'low', false),
  // Safety
  t('smoke_detector_test', 'safety', 'monthly', 5, 'high', true, ['safety']),
  t('smoke_detector_battery', 'safety', 'annual', 10, 'high', true, ['safety']),
  t('co_detector_test', 'safety', 'monthly', 5, 'high', false, ['safety']),
  t('fire_extinguisher_check', 'safety', 'annual', 5, 'medium', false, ['safety']),
  t('first_aid_kit', 'safety', 'semiannual', 10, 'low', false),
  t('rcd_test', 'electrical', 'quarterly', 5, 'medium', true, ['electrical']),
  t('electrical_inspection', 'electrical', 'custom', 60, 'medium', false, ['electrical'], { intervalValue: 5, intervalUnit: 'year' }),
  t('outdoor_lights', 'electrical', 'semiannual', 15, 'low', false, ['electrical']),
  // Exterior
  t('gutters_clean', 'exterior', 'semiannual', 90, 'medium', true),
  t('roof_inspection', 'exterior', 'annual', 30, 'medium', false),
  t('facade_check', 'exterior', 'annual', 30, 'low', false),
  t('window_seals', 'exterior', 'annual', 30, 'low', false),
  t('deck_treatment', 'exterior', 'annual', 180, 'low', false),
  t('garage_door_lube', 'exterior', 'semiannual', 15, 'low', false),
  // Garden
  t('lawn_mow', 'garden', 'weekly', 45, 'low', true, ['garden']),
  t('hedge_trim', 'garden', 'quarterly', 90, 'low', false, ['garden']),
  t('irrigation_check', 'garden', 'quarterly', 20, 'low', false, ['garden']),
  t('garden_tools', 'garden', 'annual', 30, 'low', false, ['garden']),
  t('pool_water_check', 'garden', 'weekly', 15, 'medium', false),
  t('mower_service', 'garden', 'annual', 45, 'low', false, ['garden']),
  // Cleaning & interior
  t('deep_clean', 'cleaning', 'quarterly', 240, 'low', true),
  t('windows_clean', 'cleaning', 'quarterly', 90, 'low', true),
  t('mattress_rotate', 'interior', 'quarterly', 10, 'low', false, ['furniture']),
  t('grout_seal', 'interior', 'annual', 60, 'low', false),
  t('caulk_check', 'interior', 'annual', 30, 'low', false),
  t('vacuum_filter', 'cleaning', 'monthly', 10, 'low', false, ['electronics']),
  t('pest_check', 'other', 'semiannual', 20, 'medium', false),
  t('emergency_supplies', 'other', 'annual', 20, 'low', false),
];

export function templateById(id: string | null | undefined): MaintenanceTemplate | undefined {
  return id ? MAINTENANCE_TEMPLATES.find((tpl) => tpl.id === id) : undefined;
}

/** Templates suggested for an asset of the given category. */
export function templatesForAsset(category: AssetCategory): MaintenanceTemplate[] {
  return MAINTENANCE_TEMPLATES.filter((tpl) => tpl.assets?.includes(category));
}
