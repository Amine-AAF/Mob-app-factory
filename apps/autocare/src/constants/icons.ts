import type { IconName } from '@factory/design-system';

import type { DeadlineType, DocumentCategory, ExpenseCategory, FuelType, MaintenanceType, VehicleType } from '@/types';

/** Automotive iconography (Ionicons) used consistently across screens. */
export const MAINTENANCE_ICONS: Record<MaintenanceType, IconName> = {
  oil_change: 'water',
  oil_filter: 'funnel',
  air_filter: 'cloudy',
  fuel_filter: 'filter',
  cabin_filter: 'leaf',
  brake_pads: 'disc',
  brake_discs: 'disc-outline',
  tires: 'ellipse',
  battery: 'battery-charging',
  coolant: 'thermometer',
  brake_fluid: 'water-outline',
  air_conditioning: 'snow',
  timing_belt: 'sync',
  spark_plugs: 'flash',
  shock_absorbers: 'swap-vertical',
  service: 'construct',
  repair: 'hammer',
  other: 'build',
};

export const EXPENSE_ICONS: Record<ExpenseCategory, IconName> = {
  fuel: 'speedometer',
  maintenance: 'construct',
  repair: 'hammer',
  insurance: 'shield-checkmark',
  inspection: 'clipboard',
  parking: 'car',
  tolls: 'git-branch',
  washing: 'water',
  tires: 'ellipse',
  accessories: 'bag-handle',
  taxes: 'receipt',
  financing: 'card',
  fines: 'alert-circle',
  other: 'pricetag',
};

export const DEADLINE_ICONS: Record<DeadlineType, IconName> = {
  inspection: 'clipboard',
  insurance: 'shield-checkmark',
  annual_tax: 'receipt',
  registration: 'id-card',
  emissions: 'leaf',
  warranty: 'ribbon',
  financing: 'card',
  parking_permit: 'car',
  other: 'calendar',
};

export const DOCUMENT_ICONS: Record<DocumentCategory, IconName> = {
  registration: 'id-card',
  insurance_certificate: 'shield-checkmark',
  insurance_contract: 'document-text',
  inspection: 'clipboard',
  invoice: 'receipt',
  service_book: 'book',
  purchase: 'cart',
  warranty: 'ribbon',
  photo: 'image',
  other: 'document',
};

export const FUEL_ICONS: Record<FuelType, IconName> = {
  gasoline: 'speedometer',
  diesel: 'speedometer',
  hybrid: 'leaf',
  plugin_hybrid: 'leaf',
  electric: 'flash',
  lpg: 'flame',
  cng: 'flame',
  other: 'speedometer',
};

export const VEHICLE_TYPE_ICONS: Record<VehicleType, IconName> = {
  car: 'car-sport',
  suv: 'car',
  van: 'bus',
  pickup: 'car',
  motorcycle: 'bicycle',
  truck: 'bus',
  other: 'car',
};
