import type { Incident } from '../api/types';
import { formatIncidentTimestamp } from '../domain/formatting';
import { COLOR_MUTED } from '../config';

interface Props {
  incident: Incident;
  status: string;
  statusColor: string;
}

export function AlertBanner({ incident, status, statusColor }: Props) {
  return (
    <div className="alert-banner" style={{ borderColor: statusColor }}>
      <strong style={{ color: statusColor }}>{status === 'CRITICAL' ? 'CRITICAL ALERT' : 'ATTENTION'}</strong>
      <span style={{ marginLeft: 10 }}>
        {incident.id}: {incident.title}
      </span>
      <span style={{ marginLeft: 'auto', color: COLOR_MUTED, fontSize: 12 }}>{formatIncidentTimestamp(incident.timestamp)}</span>
    </div>
  );
}
