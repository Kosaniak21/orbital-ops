// Fuel reserves domain: tank calculations, consumption rates, and status thresholds.

import { RESUPPLY_BAD_DAYS, RESUPPLY_WARN_DAYS } from '../../config';

export interface Tank {
  id: string;
  type: string;
  capacityKg: number;
  currentKg: number;
}

export interface FuelData {
  updated: string;
  tanks: Tank[];
  dailyConsumptionKg: number;
}

export interface FuelMetrics {
  totalCurrentKg: number;
  totalCapacityKg: number;
  percentRemaining: number;
  daysRemaining: number;
  tileClass: string;
}

export function calculateFuelMetrics(data: FuelData): FuelMetrics {
  const totalCurrentKg = data.tanks.reduce((sum, tank) => sum + tank.currentKg, 0);
  const totalCapacityKg = data.tanks.reduce((sum, tank) => sum + tank.capacityKg, 0);

  const percentRemaining = totalCapacityKg > 0 ? (totalCurrentKg / totalCapacityKg) * 100 : 0;
  const daysRemaining = data.dailyConsumptionKg > 0 ? totalCurrentKg / data.dailyConsumptionKg : 0;

  let tileClass = 'tile-ok';
  if (daysRemaining < RESUPPLY_BAD_DAYS) {
    tileClass = 'tile-bad';
  } else if (daysRemaining < RESUPPLY_WARN_DAYS) {
    tileClass = 'tile-warn';
  }

  return {
    totalCurrentKg,
    totalCapacityKg,
    percentRemaining,
    daysRemaining,
    tileClass
  };
}
