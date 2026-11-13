/**
 * Built-in maintenance & inspection checklists (informational only).
 *
 * Items are generic visual checks and reminders; they never state intervals or
 * quantities, because those depend on the vehicle: the UI always shows the
 * "check your owner's manual or a professional" disclaimer next to them.
 * Labels live in i18n under templates.items.<id> / templates.checks.<item>.
 */
export const TEMPLATE_GROUPS = ['routine', 'pre_trip', 'post_trip', 'seasonal', 'used_car', 'ev', 'hybrid'] as const;
export type TemplateGroup = (typeof TEMPLATE_GROUPS)[number];

export const CHECK_ITEMS = [
  // tyres & wheels
  'tire_pressure', 'tire_tread', 'tire_damage', 'spare_tire', 'wheel_nuts',
  // fluids
  'engine_oil_level', 'coolant_level', 'brake_fluid_level', 'washer_fluid', 'power_steering_fluid', 'transmission_fluid',
  // service items
  'oil_and_filter', 'air_filter', 'cabin_filter', 'fuel_filter', 'spark_plugs', 'service_book',
  // brakes & chassis
  'brake_pads', 'brake_noise', 'parking_brake', 'suspension', 'steering', 'exhaust', 'leaks', 'belts_hoses',
  // visibility & electrics
  'headlights', 'brake_lights', 'indicators', 'horn', 'wipers', 'windshield', 'mirrors', 'battery_terminals', 'battery_health', 'dashboard_warnings',
  // cabin & safety
  'seatbelts', 'ac_heating', 'defrost', 'first_aid_kit', 'warning_triangle', 'reflective_vest', 'documents_onboard', 'emergency_kit', 'child_seats',
  // trip
  'load_secured', 'roof_load', 'tow_hitch', 'trailer_lights', 'trailer_tires', 'route_fuel_plan', 'phone_navigation',
  // after trip
  'body_damage', 'underbody_wash', 'cabin_clean', 'odometer_note', 'unusual_noises', 'debris_radiator',
  // seasonal & storage
  'antifreeze', 'winter_tires', 'snow_kit', 'door_seals', 'summer_tires', 'ac_performance', 'fuel_stabilizer', 'battery_maintainer', 'storage_cover', 'tire_flat_spots',
  // used car
  'rust', 'panel_gaps', 'paint', 'glass', 'interior_wear', 'electrics', 'mileage_consistency', 'cold_start', 'smoke', 'gearbox', 'clutch', 'brakes_straight', 'alignment', 'service_history', 'vin_match', 'ownership_papers', 'recalls', 'keys',
  // electric & hybrid
  'charge_port', 'charging_cable', 'battery_state_of_health', 'software_update', 'regen_braking', 'thermal_system', 'preconditioning', 'home_charger', 'range_note', 'hybrid_battery_fan', 'hybrid_system_warnings', 'engine_runs', 'aux_battery',
] as const;
export type CheckItem = (typeof CHECK_ITEMS)[number];

export interface ChecklistTemplate {
  id: string;
  group: TemplateGroup;
  icon: string;
  items: CheckItem[];
}

export const TEMPLATES: ChecklistTemplate[] = [
  // Routine maintenance
  { id: 'routine_monthly', group: 'routine', icon: 'calendar-outline', items: ['tire_pressure', 'tire_tread', 'engine_oil_level', 'coolant_level', 'washer_fluid', 'headlights', 'brake_lights', 'wipers'] },
  { id: 'routine_quarterly', group: 'routine', icon: 'calendar-number-outline', items: ['brake_fluid_level', 'power_steering_fluid', 'battery_terminals', 'belts_hoses', 'leaks', 'brake_pads', 'cabin_filter', 'spare_tire'] },
  { id: 'routine_oil_service', group: 'routine', icon: 'water-outline', items: ['oil_and_filter', 'air_filter', 'cabin_filter', 'engine_oil_level', 'leaks', 'service_book'] },
  { id: 'routine_annual_service', group: 'routine', icon: 'construct-outline', items: ['oil_and_filter', 'air_filter', 'cabin_filter', 'fuel_filter', 'spark_plugs', 'brake_pads', 'brake_fluid_level', 'coolant_level', 'suspension', 'exhaust', 'battery_health', 'service_book'] },
  { id: 'routine_brakes', group: 'routine', icon: 'disc-outline', items: ['brake_pads', 'brake_noise', 'brake_fluid_level', 'parking_brake', 'brakes_straight'] },
  { id: 'routine_lights_visibility', group: 'routine', icon: 'bulb-outline', items: ['headlights', 'brake_lights', 'indicators', 'horn', 'wipers', 'windshield', 'mirrors'] },
  { id: 'routine_battery_electrics', group: 'routine', icon: 'battery-half-outline', items: ['battery_terminals', 'battery_health', 'dashboard_warnings', 'headlights', 'horn'] },
  { id: 'routine_tires', group: 'routine', icon: 'ellipse-outline', items: ['tire_pressure', 'tire_tread', 'tire_damage', 'wheel_nuts', 'spare_tire', 'alignment'] },
  // Pre-trip
  { id: 'pre_trip_quick', group: 'pre_trip', icon: 'flash-outline', items: ['tire_pressure', 'engine_oil_level', 'washer_fluid', 'headlights', 'dashboard_warnings', 'documents_onboard'] },
  { id: 'pre_trip_long', group: 'pre_trip', icon: 'map-outline', items: ['tire_pressure', 'tire_tread', 'spare_tire', 'engine_oil_level', 'coolant_level', 'brake_fluid_level', 'washer_fluid', 'headlights', 'wipers', 'first_aid_kit', 'warning_triangle', 'reflective_vest', 'documents_onboard', 'route_fuel_plan'] },
  { id: 'pre_trip_towing', group: 'pre_trip', icon: 'git-merge-outline', items: ['tow_hitch', 'trailer_lights', 'trailer_tires', 'tire_pressure', 'mirrors', 'load_secured', 'brake_fluid_level'] },
  { id: 'pre_trip_mountain', group: 'pre_trip', icon: 'triangle-outline', items: ['brake_pads', 'brake_fluid_level', 'coolant_level', 'tire_tread', 'snow_kit', 'defrost', 'emergency_kit'] },
  { id: 'pre_trip_family', group: 'pre_trip', icon: 'people-outline', items: ['child_seats', 'seatbelts', 'load_secured', 'roof_load', 'ac_heating', 'first_aid_kit', 'phone_navigation'] },
  // Post-trip
  { id: 'post_trip_quick', group: 'post_trip', icon: 'checkmark-done-outline', items: ['odometer_note', 'body_damage', 'unusual_noises', 'dashboard_warnings', 'cabin_clean'] },
  { id: 'post_trip_long', group: 'post_trip', icon: 'flag-outline', items: ['odometer_note', 'tire_damage', 'tire_pressure', 'body_damage', 'windshield', 'leaks', 'debris_radiator', 'engine_oil_level'] },
  { id: 'post_trip_offroad', group: 'post_trip', icon: 'trail-sign-outline', items: ['underbody_wash', 'tire_damage', 'wheel_nuts', 'suspension', 'exhaust', 'leaks', 'debris_radiator', 'body_damage'] },
  // Seasonal
  { id: 'seasonal_winter_prep', group: 'seasonal', icon: 'snow-outline', items: ['winter_tires', 'antifreeze', 'battery_health', 'wipers', 'washer_fluid', 'defrost', 'snow_kit', 'door_seals', 'headlights'] },
  { id: 'seasonal_summer_prep', group: 'seasonal', icon: 'sunny-outline', items: ['summer_tires', 'ac_performance', 'coolant_level', 'cabin_filter', 'tire_pressure', 'belts_hoses'] },
  { id: 'seasonal_spring', group: 'seasonal', icon: 'flower-outline', items: ['underbody_wash', 'rust', 'wipers', 'tire_tread', 'alignment', 'cabin_clean'] },
  { id: 'seasonal_autumn', group: 'seasonal', icon: 'leaf-outline', items: ['headlights', 'wipers', 'battery_health', 'tire_tread', 'debris_radiator', 'defrost'] },
  { id: 'seasonal_storage', group: 'seasonal', icon: 'archive-outline', items: ['fuel_stabilizer', 'battery_maintainer', 'tire_pressure', 'storage_cover', 'cabin_clean', 'documents_onboard'] },
  { id: 'seasonal_after_storage', group: 'seasonal', icon: 'play-circle-outline', items: ['tire_flat_spots', 'tire_pressure', 'battery_health', 'engine_oil_level', 'brake_noise', 'leaks', 'dashboard_warnings'] },
  // Used car inspection
  { id: 'used_exterior', group: 'used_car', icon: 'car-outline', items: ['rust', 'panel_gaps', 'paint', 'glass', 'tire_tread', 'headlights', 'body_damage'] },
  { id: 'used_interior', group: 'used_car', icon: 'albums-outline', items: ['interior_wear', 'electrics', 'ac_heating', 'seatbelts', 'dashboard_warnings', 'mileage_consistency'] },
  { id: 'used_mechanical', group: 'used_car', icon: 'cog-outline', items: ['cold_start', 'smoke', 'leaks', 'engine_oil_level', 'coolant_level', 'belts_hoses', 'exhaust', 'suspension'] },
  { id: 'used_test_drive', group: 'used_car', icon: 'speedometer-outline', items: ['gearbox', 'clutch', 'brakes_straight', 'alignment', 'steering', 'unusual_noises', 'dashboard_warnings'] },
  { id: 'used_paperwork', group: 'used_car', icon: 'document-text-outline', items: ['service_history', 'vin_match', 'ownership_papers', 'recalls', 'keys', 'mileage_consistency'] },
  // Electric vehicles
  { id: 'ev_monthly', group: 'ev', icon: 'flash-outline', items: ['tire_pressure', 'tire_tread', 'charge_port', 'charging_cable', 'washer_fluid', 'range_note'] },
  { id: 'ev_annual', group: 'ev', icon: 'battery-charging-outline', items: ['battery_state_of_health', 'software_update', 'thermal_system', 'regen_braking', 'brake_pads', 'cabin_filter', 'aux_battery', 'suspension'] },
  { id: 'ev_winter', group: 'ev', icon: 'thermometer-outline', items: ['preconditioning', 'winter_tires', 'range_note', 'defrost', 'aux_battery'] },
  { id: 'ev_home_charging', group: 'ev', icon: 'home-outline', items: ['home_charger', 'charging_cable', 'charge_port'] },
  // Hybrid vehicles
  { id: 'hybrid_monthly', group: 'hybrid', icon: 'leaf-outline', items: ['tire_pressure', 'engine_oil_level', 'coolant_level', 'hybrid_system_warnings', 'engine_runs', 'washer_fluid'] },
  { id: 'hybrid_annual', group: 'hybrid', icon: 'sync-outline', items: ['oil_and_filter', 'hybrid_battery_fan', 'thermal_system', 'aux_battery', 'brake_pads', 'regen_braking', 'spark_plugs', 'service_book'] },
];

export function templateById(id: string): ChecklistTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function templatesByGroup(): { group: TemplateGroup; templates: ChecklistTemplate[] }[] {
  return TEMPLATE_GROUPS.map((group) => ({ group, templates: TEMPLATES.filter((t) => t.group === group) }));
}

/** User customisation of a template: hidden built-in items + extra free-text items. */
export interface TemplateCustomization {
  hidden: CheckItem[];
  extra: string[];
}

export function effectiveItems(template: ChecklistTemplate, custom?: TemplateCustomization | null): { key: string; builtIn: boolean }[] {
  const hidden = new Set(custom?.hidden ?? []);
  return [
    ...template.items.filter((i) => !hidden.has(i)).map((key) => ({ key, builtIn: true })),
    ...(custom?.extra ?? []).filter((x) => x.trim()).map((text, i) => ({ key: `extra:${i}:${text.trim()}`, builtIn: false })),
  ];
}

/** Settings key holding a template's customisation. */
export const customizationKey = (id: string) => `template_custom:${id}`;

/** Label of a checklist entry: built-in items are translated, user items shown as typed. */
export function checkLabel(key: string, t: (k: string) => string): string {
  return key.startsWith('extra:') ? key.split(':').slice(2).join(':') : t(`templates.checks.${key}`);
}
