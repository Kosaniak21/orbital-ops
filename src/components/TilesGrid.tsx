import type { Station, TelemetryResponse, CrewResponse, IncidentsResponse, FuelResponse } from '../api/types';
import { MetricTile } from './MetricTile';
import { FuelReservesWidget } from './widgets/FuelReservesWidget';
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
import { calculateFuelMetrics } from '../domain/widgets/fuel-reserves';

interface Props {
  station: Station;
  telemetry: TelemetryResponse;
  crew: CrewResponse;
  incidents: IncidentsResponse;
  fuel?: FuelResponse;
}

function computeShiftCounts(members: CrewResponse['members']): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const member of members) {
    counts[member.shift] = (counts[member.shift] || 0) + 1;
  }
  return counts;
}

function getHullTempTileClass(temp: number): string {
  return temp > 40 || temp < -30 ? 'tile-warn' : 'tile-ok';
}

function getHullIntegrityTileClass(integrity: number): string {
  return integrity < 98 ? 'tile-bad' : integrity < 99 ? 'tile-warn' : 'tile-ok';
}

function getIncidentsTileClass(unresolvedCritical: number, unresolvedWarning: number): string {
  return unresolvedCritical > 0 ? 'tile-bad' : unresolvedWarning > 0 ? 'tile-warn' : 'tile-ok';
}

function extractTelemetryData(telemetry: TelemetryResponse) {
  return {
    latestO2: getLatestValue(telemetry.series.o2.points),
    latestPower: getLatestValue(telemetry.series.power.points),
    latestHullTemp: getLatestValue(telemetry.series.hullTemp.points),
    latestIntegrity: getLatestValue(telemetry.series.hullIntegrity.points),
    o2Trend: getO2TrendArrow(telemetry.series.o2.points),
    powerTrend: getPowerTrendArrow(telemetry.series.power.points),
    powerAvg: getAverageTelemetry(telemetry.series.power.points),
    powerBudgetPct: getPowerBudgetPercent(getLatestValue(telemetry.series.power.points)),
  };
}

export function TilesGrid({ station, telemetry, crew, incidents, fuel }: Props) {
  const tel = extractTelemetryData(telemetry);
  const incidentCounts = countIncidents(incidents.items, '2036-07-11');
  const crewAnalysis = analyzeCrew(crew.members);
  const resupplyInfo = computeResupplyCountdown(new Date(station.nextResupply), new Date('2036-07-11T09:00:00Z').getTime());
  const shiftCounts = computeShiftCounts(crew.members);
  const fuelMetrics = fuel ? calculateFuelMetrics(fuel) : null;

  const hullTempClass = getHullTempTileClass(tel.latestHullTemp);
  const integrityClass = getHullIntegrityTileClass(tel.latestIntegrity);
  const incidentsClass = getIncidentsTileClass(incidentCounts.unresolvedCritical, incidentCounts.unresolvedWarning);

  return (
    <div className="tiles">
      <MetricTile
        label="O2 Level"
        value={tel.latestO2.toFixed(1)}
        unit="%"
        trend={tel.o2Trend}
        sub="floor 19.5 · cabin nominal 20.9"
        tileClass={getO2TileClass(tel.latestO2)}
      />

      <MetricTile
        label="Power Output"
        value={tel.latestPower}
        unit="kW"
        trend={tel.powerTrend}
        sub={`avg ${tel.powerAvg.toFixed(0)} kW · budget ${tel.powerBudgetPct}%`}
        tileClass={getPowerTileClass(tel.powerBudgetPct)}
      />

      <MetricTile
        label="Hull Temp"
        value={tel.latestHullTemp}
        unit="°C"
        sub="day/night swing normal"
        tileClass={hullTempClass}
      />

      <MetricTile
        label="Hull Integrity"
        value={tel.latestIntegrity.toFixed(1)}
        unit="%"
        sub="MMOD shielding rated to 97.0"
        tileClass={integrityClass}
      />

      <MetricTile
        label="Open Incidents"
        value={incidentCounts.unresolvedCritical + incidentCounts.unresolvedWarning}
        unit="open"
        sub={`${incidentCounts.unresolvedCritical} critical · ${incidentCounts.unresolvedWarning} warning · ${incidentCounts.resolvedToday} resolved today`}
        tileClass={incidentsClass}
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

      {fuelMetrics && <FuelReservesWidget metrics={fuelMetrics} />}
    </div>
  );
}
