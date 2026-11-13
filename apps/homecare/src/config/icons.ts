import type { IconName } from '@factory/design-system';

import type {
  AssetCategory,
  AssetStatus,
  DocumentType,
  ExpenseCategory,
  HomeType,
  HouseholdCategory,
  InventoryCategory,
  MaintenanceCategory,
  RepairStatus,
  RoomKind,
} from '@/domain/types';

import { CATEGORY_TINTS } from './brand';

/** One consistent Ionicons set for every enumeration. */
export const HOME_TYPE_ICONS: Record<HomeType, IconName> = { apartment: 'business-outline', house: 'home-outline', villa: 'sunny-outline', studio: 'bed-outline', other: 'location-outline' };

export const ROOM_ICONS: Record<RoomKind, IconName> = {
  living: 'tv-outline',
  kitchen: 'restaurant-outline',
  bedroom: 'bed-outline',
  bathroom: 'water-outline',
  garage: 'car-outline',
  garden: 'leaf-outline',
  office: 'desktop-outline',
  other: 'cube-outline',
};

export const ASSET_ICONS: Record<AssetCategory, IconName> = {
  refrigerator: 'snow-outline',
  washer: 'water-outline',
  dishwasher: 'sparkles-outline',
  oven: 'flame-outline',
  air_conditioner: 'thermometer-outline',
  heating: 'bonfire-outline',
  boiler: 'flame-outline',
  water_heater: 'beaker-outline',
  tv: 'tv-outline',
  electronics: 'hardware-chip-outline',
  furniture: 'easel-outline',
  garden: 'leaf-outline',
  plumbing: 'construct-outline',
  electrical: 'flash-outline',
  safety: 'shield-checkmark-outline',
  vehicle: 'car-sport-outline',
  other: 'cube-outline',
};

export const MAINTENANCE_ICONS: Record<MaintenanceCategory, IconName> = {
  hvac: 'thermometer-outline',
  plumbing: 'water-outline',
  electrical: 'flash-outline',
  appliances: 'build-outline',
  safety: 'shield-checkmark-outline',
  exterior: 'home-outline',
  garden: 'leaf-outline',
  cleaning: 'sparkles-outline',
  interior: 'color-palette-outline',
  other: 'construct-outline',
};

export const DOCUMENT_ICONS: Record<DocumentType, IconName> = {
  invoice: 'receipt-outline',
  warranty: 'shield-checkmark-outline',
  contract: 'document-text-outline',
  manual: 'book-outline',
  certificate: 'ribbon-outline',
  insurance: 'umbrella-outline',
  property: 'key-outline',
  maintenance: 'construct-outline',
  other: 'document-outline',
};

export const EXPENSE_ICONS: Record<ExpenseCategory, IconName> = {
  electricity: 'flash-outline',
  water: 'water-outline',
  gas: 'flame-outline',
  internet: 'wifi-outline',
  maintenance: 'construct-outline',
  repairs: 'hammer-outline',
  cleaning: 'sparkles-outline',
  furniture: 'easel-outline',
  appliances: 'tv-outline',
  insurance: 'umbrella-outline',
  other: 'pricetag-outline',
};

export const HOUSEHOLD_ICONS: Record<HouseholdCategory, IconName> = {
  cleaning: 'sparkles-outline',
  laundry: 'shirt-outline',
  trash: 'trash-outline',
  groceries: 'cart-outline',
  plants: 'flower-outline',
  tidying: 'file-tray-stacked-outline',
  stock: 'cube-outline',
  preparation: 'clipboard-outline',
  other: 'checkbox-outline',
};

export const INVENTORY_ICONS: Record<InventoryCategory, IconName> = {
  electronics: 'phone-portrait-outline',
  furniture: 'easel-outline',
  kitchen: 'restaurant-outline',
  decoration: 'color-palette-outline',
  tools: 'hammer-outline',
  sports: 'bicycle-outline',
  garden: 'leaf-outline',
  other: 'cube-outline',
};

export const ASSET_STATUS_TONE: Record<AssetStatus, 'success' | 'warning' | 'neutral' | 'danger'> = { active: 'success', in_repair: 'warning', replaced: 'neutral', out_of_service: 'danger' };

export const REPAIR_STATUS_TONE: Record<RepairStatus, 'primary' | 'warning' | 'accent' | 'success' | 'neutral'> = { reported: 'warning', scheduled: 'primary', in_progress: 'accent', completed: 'success', cancelled: 'neutral' };

/** Stable tint for a category index. */
export function tintFor(values: readonly string[], value: string): string {
  const i = Math.max(0, values.indexOf(value));
  return CATEGORY_TINTS[i % CATEGORY_TINTS.length] as string;
}
