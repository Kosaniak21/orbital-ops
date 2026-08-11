// Station status computation from telemetry and incidents.

import {
  O2_CRITICAL_FLOOR,
  O2_DEGRADED_FLOOR,
  POWER_CRITICAL_FLOOR,
  COLOR_NOMINAL,
  COLOR_DEGRADED,
  COLOR_CRITICAL
} from '../config';

export type StationStatus = 'NOMINAL' | 'DEGRADED' | 'CRITICAL';

export interface StatusResult {
  status: StationStatus;
  color: string;
}

export function computeStatus(o2: number, power: number, unresolvedCritical: number): StatusResult {
  if (o2 < O2_CRITICAL_FLOOR || unresolvedCritical > 1) {
    return { status: 'CRITICAL', color: COLOR_CRITICAL };
  }
  if (o2 < O2_DEGRADED_FLOOR || power < POWER_CRITICAL_FLOOR || unresolvedCritical > 0) {
    return { status: 'DEGRADED', color: COLOR_DEGRADED };
  }
  return { status: 'NOMINAL', color: COLOR_NOMINAL };
}
