import type { Input } from '@/database';
import type { FuelRecord, MaintenanceSchedule, Vehicle } from '@/types';

let n = 0;
const iso = '2026-01-01T00:00:00.000Z';

export function fill(p: Partial<FuelRecord> & Pick<FuelRecord, 'day'>): FuelRecord {
  n++;
  return {
    id: p.id ?? `f${n}`,
    vehicleId: 'v1',
    odometerKm: null,
    quantity: 40,
    quantityUnit: 'L',
    unitPrice: 1.8,
    totalMinor: 7200,
    currency: 'EUR',
    fuelType: 'gasoline',
    station: null,
    isFull: true,
    missedPrevious: false,
    notes: null,
    createdAt: `${p.day}T10:00:${String(n % 60).padStart(2, '0')}.000Z`,
    updatedAt: iso,
    ...p,
  };
}

export function schedule(p: Partial<MaintenanceSchedule> = {}): MaintenanceSchedule {
  return {
    id: 's1',
    vehicleId: 'v1',
    type: 'oil_change',
    title: null,
    intervalKm: null,
    intervalMonths: null,
    lastDay: null,
    lastOdometerKm: null,
    remindDaysBefore: 14,
    remindKmBefore: 500,
    enabled: true,
    notes: null,
    createdAt: iso,
    updatedAt: iso,
    ...p,
  };
}

export function vehicleInput(p: Partial<Input<Vehicle>> = {}): Input<Vehicle> {
  return {
    name: 'Clio',
    make: 'Renault',
    model: 'Clio',
    trim: null,
    year: 2021,
    vehicleType: 'car',
    engine: null,
    fuelType: 'gasoline',
    transmission: 'manual',
    powerHp: null,
    plate: 'AB-123-CD',
    vin: null,
    purchaseDate: null,
    purchaseOdometerKm: null,
    odometerKm: 30000,
    purchasePriceMinor: 1500000,
    currency: 'EUR',
    photoFile: null,
    color: '#1E5AA8',
    notes: null,
    archived: false,
    ...p,
  };
}

export function vehicle(p: Partial<Vehicle> = {}): Vehicle {
  return { ...vehicleInput(), id: 'v1', createdAt: '2026-01-01T09:00:00.000Z', updatedAt: iso, ...p } as Vehicle;
}
