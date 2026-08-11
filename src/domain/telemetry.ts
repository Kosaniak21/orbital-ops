// Telemetry analysis: downsampling, latest values, and trend detection.

import {
  TREND_THRESHOLD_O2,
  TREND_THRESHOLD_POWER,
  O2_CRITICAL_FLOOR,
  O2_DEGRADED_FLOOR,
  POWER_BUDGET_BASELINE,
  POWER_BUDGET_WARN_PCT,
  POWER_BUDGET_BAD_PCT,
  RESUPPLY_BAD_DAYS,
  RESUPPLY_WARN_DAYS
} from '../config';

export function downsampleTelemetry(points: number[], maxPoints: number): number[] {
  if (points.length <= maxPoints) return points;
  const bucketSize = points.length / maxPoints;
  const result: number[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    let sum = 0;
    let count = 0;
    for (let j = start; j < end && j < points.length; j++) {
      sum += points[j];
      count++;
    }
    result.push(count > 0 ? sum / count : points[start]);
  }
  return result;
}

export function getLatestValue(points: number[]): number {
  return points.length > 0 ? points[points.length - 1] : 0;
}

export function getTrendArrow(current: number, previous: number, threshold: number): string {
  const delta = current - previous;
  if (delta > threshold) return '↑';
  if (delta < -threshold) return '↓';
  return '→';
}

export function getO2TrendArrow(points: number[]): string {
  if (points.length < 4) return '→';
  const current = getLatestValue(points);
  const previous = points[points.length - 4];
  return getTrendArrow(current, previous, TREND_THRESHOLD_O2);
}

export function getPowerTrendArrow(points: number[]): string {
  if (points.length < 4) return '→';
  const current = getLatestValue(points);
  const previous = points[points.length - 4];
  return getTrendArrow(current, previous, TREND_THRESHOLD_POWER);
}

export function getO2TileClass(o2: number): string {
  if (o2 < O2_CRITICAL_FLOOR) return 'tile-bad';
  if (o2 < O2_DEGRADED_FLOOR) return 'tile-warn';
  return 'tile-ok';
}

export function getAverageTelemetry(points: number[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i];
  }
  return points.length > 0 ? sum / points.length : 0;
}

export function getPowerBudgetPercent(power: number): number {
  return Math.round((power / POWER_BUDGET_BASELINE) * 100);
}

export function getPowerTileClass(powerBudgetPct: number): string {
  if (powerBudgetPct < POWER_BUDGET_BAD_PCT) return 'tile-bad';
  if (powerBudgetPct < POWER_BUDGET_WARN_PCT) return 'tile-warn';
  return 'tile-ok';
}

export interface ResupplyInfo {
  daysLeft: number;
  hoursLeft: number;
  label: string;
  tileClass: string;
}

export function computeResupplyCountdown(resupplyDate: Date, nowMs: number): ResupplyInfo {
  const msLeft = resupplyDate.getTime() - nowMs;
  const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let label = daysLeft + 'd ' + hoursLeft + 'h';
  let tileClass = 'tile-ok';

  if (daysLeft < RESUPPLY_BAD_DAYS) {
    tileClass = 'tile-bad';
    label = label + ' ⚠';
  } else if (daysLeft < RESUPPLY_WARN_DAYS) {
    tileClass = 'tile-warn';
  }

  return { daysLeft, hoursLeft, label, tileClass };
}
