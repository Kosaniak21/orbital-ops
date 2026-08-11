import { MetricTile } from "./MetricTile";
import type { FuelMetrics } from "../domain/fuel-reserves";

interface Props {
  metrics: FuelMetrics;
}

export function FuelReservesWidget({ metrics }: Props) {
  return (
    <MetricTile
      label="Fuel Reserves"
      value={metrics.percentRemaining.toFixed(1)}
      unit="%"
      sub={`${metrics.totalCurrentKg.toFixed(0)} / ${metrics.totalCapacityKg.toFixed(0)} kg · ${metrics.daysRemaining.toFixed(1)} days at current burn`}
      tileClass={metrics.tileClass}
    />
  );
}
