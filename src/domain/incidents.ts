// Incident severity ranking, filtering, and counting.

import type { Incident } from '../api/types';
import { COLOR_CRITICAL, COLOR_DEGRADED, COLOR_INFO, COLOR_MUTED } from '../config';

export interface IncidentCounts {
  unresolvedCritical: number;
  unresolvedWarning: number;
  resolvedToday: number;
}

export function countIncidents(items: Incident[], today: string): IncidentCounts {
  let unresolvedCritical = 0;
  let unresolvedWarning = 0;
  let resolvedToday = 0;

  for (let i = 0; i < items.length; i++) {
    const inc = items[i];
    if (!inc.resolved && inc.severity === 'critical') {
      unresolvedCritical++;
    } else if (!inc.resolved && inc.severity === 'warning') {
      unresolvedWarning++;
    } else if (inc.resolved && inc.timestamp.indexOf(today) === 0) {
      resolvedToday++;
    }
  }

  return { unresolvedCritical, unresolvedWarning, resolvedToday };
}

export function getSeverityColor(severity: string): string {
  if (severity === 'critical') return COLOR_CRITICAL;
  if (severity === 'warning') return COLOR_DEGRADED;
  if (severity === 'info') return COLOR_INFO;
  return COLOR_MUTED;
}

export function rankIncidents(items: Incident[]): Incident[] {
  const unresolved = items.filter((inc) => !inc.resolved);
  unresolved.sort((a, b) => {
    const rank: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    const ra = rank[a.severity] !== undefined ? rank[a.severity] : 3;
    const rb = rank[b.severity] !== undefined ? rank[b.severity] : 3;
    if (ra !== rb) return ra - rb;
    return a.timestamp < b.timestamp ? 1 : -1;
  });
  return unresolved;
}

export function getTopIncident(items: Incident[]): Incident | null {
  const ranked = rankIncidents(items);
  return ranked.length > 0 ? ranked[0] : null;
}
