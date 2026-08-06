import { useEffect, useState, useCallback } from 'react';
import { getStation, getTelemetry, getCrew, getIncidents } from '../api/client';
import { useApiResource } from '../hooks/useApiResource';
import { formatTime } from '../domain/formatting';
import { computeStatus } from '../domain/stationStatus';
import { getLatestValue } from '../domain/telemetry';
import { countIncidents, getTopIncident } from '../domain/incidents';
import { flashAlert } from '../utils';
import { DashboardHeader } from './DashboardHeader';
import { AlertBanner } from './AlertBanner';
import { TilesGrid } from './TilesGrid';

export default function Dashboard() {
  const [lastSync, setLastSync] = useState('');

  const fetcher = useCallback(() => {
    return Promise.all([getStation(), getTelemetry(), getCrew(), getIncidents()]).then((results) => ({
      station: results[0],
      telemetry: results[1],
      crew: results[2],
      incidents: results[3]
    }));
  }, []);

  const { data, loading, error } = useApiResource(fetcher);

  useEffect(() => {
    if (data?.telemetry) {
      const latestO2 = getLatestValue(data.telemetry.series.o2.points);
      if (latestO2 < 19.5) {
        flashAlert();
      }
      setLastSync(formatTime(new Date()));
    }
  }, [data]);

  if (loading && !data) {
    return (
      <div className="dashboard dashboard-loading">
        <div className="spinner" />
        <p>Establishing uplink to ISS Kruger-60…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard dashboard-error">
        <h1>⚠ Uplink lost</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { station, telemetry, crew, incidents } = data;

  const latestO2 = getLatestValue(telemetry.series.o2.points);
  const incidentCounts = countIncidents(incidents.items, '2036-07-11');
  const statusResult = computeStatus(latestO2, getLatestValue(telemetry.series.power.points), incidentCounts.unresolvedCritical);
  const topIncident = getTopIncident(incidents.items);

  return (
    <div className="dashboard">
      <DashboardHeader station={station} status={statusResult.status} statusColor={statusResult.color} lastSync={lastSync} />

      {statusResult.status !== 'NOMINAL' && topIncident && <AlertBanner incident={topIncident} status={statusResult.status} statusColor={statusResult.color} />}

      <TilesGrid station={station} telemetry={telemetry} crew={crew} incidents={incidents} />
    </div>
  );
}
