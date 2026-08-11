import { describe, it, expect } from 'vitest';
import { calculateFuelMetrics, type FuelData } from './fuel-reserves';

describe('fuel reserves domain', () => {
  it('calculates metrics from tank data', () => {
    const data: FuelData = {
      updated: '2036-07-11T09:00:00Z',
      tanks: [
        { id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 830 },
        { id: 'main-b', type: 'hydrazine', capacityKg: 1200, currentKg: 764 },
        { id: 'rcs', type: 'cold-gas', capacityKg: 300, currentKg: 211 }
      ],
      dailyConsumptionKg: 14.2
    };

    const metrics = calculateFuelMetrics(data);

    expect(metrics.totalCurrentKg).toBe(1805);
    expect(metrics.totalCapacityKg).toBe(2700);
    expect(metrics.percentRemaining).toBeCloseTo(66.85, 1);
    expect(metrics.daysRemaining).toBeCloseTo(127.11, 1);
    expect(metrics.tileClass).toBe('tile-ok');
  });

  it('flags critical status when fuel is low', () => {
    const data: FuelData = {
      updated: '2036-07-11T09:00:00Z',
      tanks: [
        { id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 30 },
        { id: 'rcs', type: 'cold-gas', capacityKg: 300, currentKg: 40 }
      ],
      dailyConsumptionKg: 14.2
    };

    const metrics = calculateFuelMetrics(data);

    expect(metrics.daysRemaining).toBeCloseTo(4.93, 1);
    expect(metrics.tileClass).toBe('tile-bad');
  });

  it('flags warning status at medium fuel levels', () => {
    const data: FuelData = {
      updated: '2036-07-11T09:00:00Z',
      tanks: [
        { id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 100 },
        { id: 'rcs', type: 'cold-gas', capacityKg: 300, currentKg: 50 }
      ],
      dailyConsumptionKg: 14.2
    };

    const metrics = calculateFuelMetrics(data);

    expect(metrics.daysRemaining).toBeCloseTo(10.56, 1);
    expect(metrics.tileClass).toBe('tile-warn');
  });

  it('handles empty tanks gracefully', () => {
    const data: FuelData = {
      updated: '2036-07-11T09:00:00Z',
      tanks: [
        { id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 0 }
      ],
      dailyConsumptionKg: 14.2
    };

    const metrics = calculateFuelMetrics(data);

    expect(metrics.totalCurrentKg).toBe(0);
    expect(metrics.percentRemaining).toBe(0);
    expect(metrics.daysRemaining).toBe(0);
    expect(metrics.tileClass).toBe('tile-bad');
  });

  it('handles zero consumption gracefully', () => {
    const data: FuelData = {
      updated: '2036-07-11T09:00:00Z',
      tanks: [
        { id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 500 }
      ],
      dailyConsumptionKg: 0
    };

    const metrics = calculateFuelMetrics(data);

    expect(metrics.daysRemaining).toBe(0);
  });

  it('handles zero capacity gracefully', () => {
    const data: FuelData = {
      updated: '2036-07-11T09:00:00Z',
      tanks: [],
      dailyConsumptionKg: 14.2
    };

    const metrics = calculateFuelMetrics(data);

    expect(metrics.totalCapacityKg).toBe(0);
    expect(metrics.percentRemaining).toBe(0);
  });
});
