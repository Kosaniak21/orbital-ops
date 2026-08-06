import type { Station, TelemetryResponse, CrewResponse, IncidentsResponse } from '../api/types';
import { MetricTile } from './MetricTile';
import {
  getLatestValue,
  getO2TrendArrow,
  getPowerTrendArrow,
  getO2TileClass,
  getAverageTelemetry,
  getPowerBudgetPercent,
  getPowerTileClass,
  computeResupplyCountdown
} from '../domain/telemetry';
import { countIncidents } from '../domain/incidents';
import { analyzeCrew } from '../domain/crew';
import { formatIncidentTimestamp } from '../domain/formatting';

interface Props {
  station: Station;
  telemetry: TelemetryResponse;
  crew: CrewResponse;
  incidents: IncidentsResponse;
}

function computeShiftCounts(members: CrewResponse['members']): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const member of members) {
    counts[member.shift] = (counts[member.shift] || 0) + 1;
  }
  return counts;
}

export function TilesGrid({ station, telemetry, crew, incidents }: Props) {
  const o2Points = telemetry.series.o2.points;
  const powerPoints = telemetry.series.power.points;
  const hullTempPoints = telemetry.series.hullTemp.points;
  const integrityPoints = telemetry.series.hullIntegrity.points;

  const latestO2 = getLatestValue(o2Points);
  const latestPower = getLatestValue(powerPoints);
  const latestHullTemp = getLatestValue(hullTempPoints);
  const latestIntegrity = getLatestValue(integrityPoints);

  const o2Trend = getO2TrendArrow(o2Points);
  const powerTrend = getPowerTrendArrow(powerPoints);
  const powerAvg = getAverageTelemetry(powerPoints);
  const powerBudgetPct = getPowerBudgetPercent(latestPower);

  const incidentCounts = countIncidents(incidents.items, '2036-07-11');
  const crewAnalysis = analyzeCrew(crew.members);
  const resupplyInfo = computeResupplyCountdown(new Date(station.nextResupply), new Date('2036-07-11T09:00:00Z').getTime());
  const shiftCounts = computeShiftCounts(crew.members);

  return (
    <div className="tiles">
      <MetricTile
        label="O2 Level"
        value={latestO2.toFixed(1)}
        unit="%"
        trend={o2Trend}
        sub="floor 19.5 · cabin nominal 20.9"
        tileClass={getO2TileClass(latestO2)}
      />

      <MetricTile
        label="Power Output"
        value={latestPower}
        unit="kW"
        trend={powerTrend}
        sub={`avg ${powerAvg.toFixed(0)} kW · budget ${powerBudgetPct}%`}
        tileClass={getPowerTileClass(powerBudgetPct)}
      />

      <MetricTile
        label="Hull Temp"
        value={latestHullTemp}
        unit="°C"
        sub="day/night swing normal"
        tileClass={latestHullTemp > 40 || latestHullTemp < -30 ? 'tile-warn' : 'tile-ok'}
      />

      <MetricTile
        label="Hull Integrity"
        value={latestIntegrity.toFixed(1)}
        unit="%"
        sub="MMOD shielding rated to 97.0"
        tileClass={latestIntegrity < 98 ? 'tile-bad' : latestIntegrity < 99 ? 'tile-warn' : 'tile-ok'}
      />

      <MetricTile
        label="Open Incidents"
        value={incidentCounts.unresolvedCritical + incidentCounts.unresolvedWarning}
        unit="open"
        sub={`${incidentCounts.unresolvedCritical} critical · ${incidentCounts.unresolvedWarning} warning · ${incidentCounts.resolvedToday} resolved today`}
        tileClass={
          incidentCounts.unresolvedCritical > 0 ? 'tile-bad' : incidentCounts.unresolvedWarning > 0 ? 'tile-warn' : 'tile-ok'
        }
      />

      <MetricTile
        label="Next Resupply"
        value={resupplyInfo.label}
        sub={formatIncidentTimestamp(station.nextResupply)}
        tileClass={resupplyInfo.tileClass}
      />

      <MetricTile
        label="Crew Rest"
        value={crewAnalysis.avgSleep}
        unit="h avg"
        sub={`${crewAnalysis.onDuty.length} on duty · ${crewAnalysis.offDuty.length} off duty`}
        tileClass={crewAnalysis.sleepClass}
      />

      <MetricTile
        label="Shift Board"
        value={`α ${shiftCounts['alpha'] || 0} · β ${shiftCounts['beta'] || 0} · γ ${shiftCounts['gamma'] || 0}`}
        sub={formatIncidentTimestamp(station.commissioned + 'T00:00:00Z')}
        tileClass="tile-ok"
      />
    </div>
  );
}
