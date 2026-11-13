import { useLocalSearchParams } from 'expo-router';

import { loadVehicleBundle, repos } from '@/database';
import { usePreferences } from '@/store/preferences';
import type { CurrencyCode, FuelType, Vehicle } from '@/types';

import { useAsync } from './index';

export function useVehicles(includeArchived = false) {
  return useAsync(() => repos().vehicles.list({ includeArchived }), [includeArchived]);
}

export function useVehicleBundle(id: string | undefined) {
  return useAsync(() => (id ? loadVehicleBundle(repos(), id) : Promise.resolve(null)), [id]);
}

/** Vehicle to preselect: route param > last used > first vehicle. */
export function pickVehicleId(vehicles: readonly Vehicle[] | undefined, param?: string | null): string | null {
  if (!vehicles?.length) return null;
  if (param && vehicles.some((v) => v.id === param)) return param;
  const active = usePreferences.getState().activeVehicleId;
  if (active && vehicles.some((v) => v.id === active)) return active;
  return vehicles[0]!.id;
}

/** Standard editor params: `?id=` to edit, `?vehicleId=` to preselect. */
export function useEditorParams() {
  return useLocalSearchParams<{ id?: string; vehicleId?: string }>();
}

/** Default currency for a new entry on a vehicle: the vehicle's, else the app default. */
export function currencyFor(vehicle: Vehicle | undefined | null): CurrencyCode {
  return vehicle?.currency ?? usePreferences.getState().currency;
}

/** Charging (kWh) applies to electric vehicles; plug-in hybrids can log both. */
export function defaultQuantityUnit(fuel: FuelType): 'L' | 'kWh' {
  return fuel === 'electric' ? 'kWh' : 'L';
}
