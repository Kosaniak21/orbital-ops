# Widget Scaffolding Template

This template shows the complete pattern for creating a new dashboard widget following Orbital Ops conventions. All four layers are illustrated using the **Fuel Reserves** widget as a concrete example.

---

## 1. Domain Logic — Pure, Testable Calculations

**File:** `src/domain/widgets/fuel.ts`

Pure functions export both types and business logic. No React dependencies. No component-specific formatting (that lives in the component).

```typescript
// Domain types: what the widget will display
export interface FuelTank {
  id: string;
  type: 'hydrazine' | 'cold-gas';
  capacityKg: number;
  currentKg: number;
}

export interface FuelData {
  updated: string;
  tanks: FuelTank[];
  dailyConsumptionKg: number;
}

export interface FuelMetrics {
  totalCapacityKg: number;
  totalCurrentKg: number;
  usagePercentage: number;
  daysOfFuelRemaining: number;
  dangerZone: boolean;
}

// Pure calculation functions
export function calculateFuelMetrics(data: FuelData): FuelMetrics {
  const totalCapacityKg = data.tanks.reduce((sum, tank) => sum + tank.capacityKg, 0);
  const totalCurrentKg = data.tanks.reduce((sum, tank) => sum + tank.currentKg, 0);
  const usagePercentage = Math.round((totalCurrentKg / totalCapacityKg) * 100);
  const daysOfFuelRemaining = totalCurrentKg / data.dailyConsumptionKg;
  const dangerZone = daysOfFuelRemaining < 14;

  return {
    totalCapacityKg,
    totalCurrentKg,
    usagePercentage,
    daysOfFuelRemaining: Math.round(daysOfFuelRemaining * 10) / 10,
    dangerZone,
  };
}

// Validator: runtime type safety for API responses
import { z } from 'zod';

const FuelTankSchema = z.object({
  id: z.string(),
  type: z.enum(['hydrazine', 'cold-gas']),
  capacityKg: z.number().positive(),
  currentKg: z.number().nonnegative(),
});

export const FuelDataSchema = z.object({
  updated: z.string().datetime(),
  tanks: z.array(FuelTankSchema),
  dailyConsumptionKg: z.number().positive(),
});

export function validateFuelData(raw: unknown): FuelData {
  return FuelDataSchema.parse(raw);
}
```

---

## 2. Unit Tests — Coverage for Edge Cases

**File:** `src/domain/widgets/fuel.test.ts`

Colocated with domain logic. Test the math, the validation, and edge cases.

```typescript
import { describe, it, expect } from 'vitest';
import { calculateFuelMetrics, validateFuelData } from './fuel';

describe('Fuel Domain', () => {
  describe('calculateFuelMetrics', () => {
    it('computes days of fuel remaining', () => {
      const data = {
        updated: '2036-07-11T09:00:00Z',
        tanks: [
          { id: 'main-a', type: 'hydrazine' as const, capacityKg: 1200, currentKg: 142 },
        ],
        dailyConsumptionKg: 14.2,
      };
      const metrics = calculateFuelMetrics(data);
      expect(metrics.daysOfFuelRemaining).toBe(10.0);
    });

    it('flags danger zone when fuel < 14 days', () => {
      const data = {
        updated: '2036-07-11T09:00:00Z',
        tanks: [
          { id: 'main-a', type: 'hydrazine' as const, capacityKg: 1200, currentKg: 100 },
        ],
        dailyConsumptionKg: 14.2,
      };
      const metrics = calculateFuelMetrics(data);
      expect(metrics.dangerZone).toBe(true);
    });

    it('aggregates multiple tanks', () => {
      const data = {
        updated: '2036-07-11T09:00:00Z',
        tanks: [
          { id: 'main-a', type: 'hydrazine' as const, capacityKg: 1200, currentKg: 800 },
          { id: 'main-b', type: 'hydrazine' as const, capacityKg: 1200, currentKg: 600 },
        ],
        dailyConsumptionKg: 28.4,
      };
      const metrics = calculateFuelMetrics(data);
      expect(metrics.totalCurrentKg).toBe(1400);
      expect(metrics.totalCapacityKg).toBe(2400);
    });
  });

  describe('validateFuelData', () => {
    it('accepts valid fuel data', () => {
      const valid = {
        updated: '2036-07-11T09:00:00Z',
        tanks: [
          { id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 830 },
        ],
        dailyConsumptionKg: 14.2,
      };
      expect(() => validateFuelData(valid)).not.toThrow();
    });

    it('rejects negative consumption', () => {
      const invalid = {
        updated: '2036-07-11T09:00:00Z',
        tanks: [{ id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 830 }],
        dailyConsumptionKg: -14.2,
      };
      expect(() => validateFuelData(invalid)).toThrow();
    });
  });
});
```

---

## 3. Data Hook — Typed API Integration

**File:** `src/hooks/useFuelData.ts`

Typed hook using the shared `useApiResource` pattern. Validates and transforms API responses.

```typescript
import { useApiResource } from './useApiResource';
import { FuelData, validateFuelData } from '../domain/widgets/fuel';

export function useFuelData() {
  return useApiResource<FuelData>(async () => {
    const response = await fetch('/api/fuel.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    return validateFuelData(raw);
  });
}
```

---

## 4. UI Component — Render Metrics + Status

**File:** `src/components/widgets/FuelWidget.tsx`

Thin rendering layer. All logic in domain; styling via tile classes (from config).

```typescript
import type { FuelMetrics } from '../domain/widgets/fuel';
import { MetricTile } from '../MetricTile';
import { COLOR_CRITICAL, COLOR_DEGRADED, COLOR_NOMINAL } from '../../config';

interface Props {
  metrics: FuelMetrics;
}

export function FuelWidget({ metrics }: Props) {
  const tileClass =
    metrics.daysOfFuelRemaining < 7
      ? 'tile-bad'
      : metrics.daysOfFuelRemaining < 14
        ? 'tile-warn'
        : 'tile-ok';

  return (
    <MetricTile
      label="Fuel Reserves"
      value={metrics.daysOfFuelRemaining}
      unit="days"
      sub={`${metrics.usagePercentage}% reserve · ${metrics.totalCurrentKg}/${metrics.totalCapacityKg} kg`}
      tileClass={tileClass}
    />
  );
}
```

---

## 5. Grid Registration — Add to Dashboard

**File:** `src/components/TilesGrid.tsx`

Import the metrics calculator and the UI component. Render alongside other tiles.

```typescript
import { useFuelData } from '../hooks/useFuelData';
import { calculateFuelMetrics } from '../domain/widgets/fuel';
import { FuelWidget } from './widgets/FuelWidget';

export function TilesGrid({ station, telemetry, crew, incidents }: Props) {
  // ...existing tile computations...

  // Fuel widget
  const { data: fuelData, loading: fuelLoading, error: fuelError } = useFuelData();
  const fuelMetrics = fuelData ? calculateFuelMetrics(fuelData) : null;

  return (
    <div className="tiles">
      {/* existing tiles... */}

      {fuelMetrics && <FuelWidget metrics={fuelMetrics} />}
    </div>
  );
}
```

---

## API Data File

**File:** `public/api/fuel.json`

Save this file to provide test data.

```json
{
  "updated": "2036-07-11T09:00:00Z",
  "tanks": [
    { "id": "main-a", "type": "hydrazine", "capacityKg": 1200, "currentKg": 830 },
    { "id": "main-b", "type": "hydrazine", "capacityKg": 1200, "currentKg": 764 },
    { "id": "rcs", "type": "cold-gas", "capacityKg": 300, "currentKg": 211 }
  ],
  "dailyConsumptionKg": 14.2
}
```

---

## Validation Checklist

- [ ] Domain logic in `src/domain/widgets/<name>.ts` (no React)
- [ ] Unit tests in `src/domain/widgets/<name>.test.ts`
- [ ] Typed hook in `src/hooks/use<Name>Data.ts` (uses `useApiResource`)
- [ ] Component in `src/components/widgets/<Name>Widget.tsx` (uses `MetricTile`)
- [ ] Registered in `TilesGrid.tsx`
- [ ] API data in `public/api/<name>.json`
- [ ] `npm run validate` passes
