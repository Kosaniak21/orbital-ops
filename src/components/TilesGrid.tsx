import type {
  Station,
  TelemetryResponse,
  CrewResponse,
  IncidentsResponse,
  FuelResponse,
} from "../api/types";
import { MetricTile } from "./MetricTile";
import { FuelReservesWidget } from "./FuelReservesWidget";
import {
  getLatestValue,
  getO2TrendArrow,
  getPowerTrendArrow,
  getO2TileClass,
  getAverageTelemetry,
  getPowerBudgetPercent,
  getPowerTileClass,
  computeResupplyCountdown,
} from "../domain/telemetry";
import { countIncidents } from "../domain/incidents";
import { analyzeCrew } from "../domain/crew";
import { formatIncidentTimestamp } from "../domain/formatting";
import { calculateFuelMetrics } from "../domain/fuel-reserves";

interface Props {
  station: Station;
  telemetry: TelemetryResponse;
  crew: CrewResponse;
  incidents: IncidentsResponse;
  fuel?: FuelResponse;
}

function computeShiftCounts(
  members: CrewResponse["members"],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const member of members) {
    counts[member.shift] = (counts[member.shift] || 0) + 1;
  }
  return counts;
}

function getHullTempTileClass(temp: number): string {
  return temp > 40 || temp < -30 ? "tile-warn" : "tile-ok";
}

function getHullIntegrityTileClass(integrity: number): string {
  return integrity < 98 ? "tile-bad" : integrity < 99 ? "tile-warn" : "tile-ok";
}

function getIncidentsTileClass(
  unresolvedCritical: number,
  unresolvedWarning: number,
): string {
  return unresolvedCritical > 0
    ? "tile-bad"
    : unresolvedWarning > 0
      ? "tile-warn"
      : "tile-ok";
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
    powerBudgetPct: getPowerBudgetPercent(
      getLatestValue(telemetry.series.power.points),
    ),
  };
}

function extractDashboardData(
  station: Station,
  telemetry: TelemetryResponse,
  crew: CrewResponse,
  incidents: IncidentsResponse,
  fuel: FuelResponse | undefined,
) {
  const tel = extractTelemetryData(telemetry);
  const incidentCounts = countIncidents(incidents.items, "2036-07-11");
  return {
    tel,
    incidentCounts,
    crewAnalysis: analyzeCrew(crew.members),
    resupplyInfo: computeResupplyCountdown(
      new Date(station.nextResupply),
      new Date("2036-07-11T09:00:00Z").getTime(),
    ),
    shiftCounts: computeShiftCounts(crew.members),
    fuelMetrics: fuel ? calculateFuelMetrics(fuel) : null,
    hullTempClass: getHullTempTileClass(tel.latestHullTemp),
    integrityClass: getHullIntegrityTileClass(tel.latestIntegrity),
    incidentsClass: getIncidentsTileClass(
      incidentCounts.unresolvedCritical,
      incidentCounts.unresolvedWarning,
    ),
  };
}

type DashboardData = ReturnType<typeof extractDashboardData>;

function renderMetricTiles(data: DashboardData, station: Station) {
  return [
    <MetricTile
      key="o2"
      label="O2 Level"
      value={data.tel.latestO2.toFixed(1)}
      unit="%"
      trend={data.tel.o2Trend}
      sub="floor 19.5 · cabin nominal 20.9"
      tileClass={getO2TileClass(data.tel.latestO2)}
    />,
    <MetricTile
      key="power"
      label="Power Output"
      value={data.tel.latestPower}
      unit="kW"
      trend={data.tel.powerTrend}
      sub={`avg ${data.tel.powerAvg.toFixed(0)} kW · budget ${data.tel.powerBudgetPct}%`}
      tileClass={getPowerTileClass(data.tel.powerBudgetPct)}
    />,
    <MetricTile
      key="hull-temp"
      label="Hull Temp"
      value={data.tel.latestHullTemp}
      unit="°C"
      sub="day/night swing normal"
      tileClass={data.hullTempClass}
    />,
    <MetricTile
      key="integrity"
      label="Hull Integrity"
      value={data.tel.latestIntegrity.toFixed(1)}
      unit="%"
      sub="MMOD shielding rated to 97.0"
      tileClass={data.integrityClass}
    />,
    <MetricTile
      key="incidents"
      label="Open Incidents"
      value={data.incidentCounts.unresolvedCritical + data.incidentCounts.unresolvedWarning}
      unit="open"
      sub={`${data.incidentCounts.unresolvedCritical} critical · ${data.incidentCounts.unresolvedWarning} warning · ${data.incidentCounts.resolvedToday} resolved today`}
      tileClass={data.incidentsClass}
    />,
    <MetricTile
      key="resupply"
      label="Next Resupply"
      value={data.resupplyInfo.label}
      sub={formatIncidentTimestamp(station.nextResupply)}
      tileClass={data.resupplyInfo.tileClass}
    />,
    <MetricTile
      key="crew"
      label="Crew Rest"
      value={data.crewAnalysis.avgSleep}
      unit="h avg"
      sub={`${data.crewAnalysis.onDuty.length} on duty · ${data.crewAnalysis.offDuty.length} off duty`}
      tileClass={data.crewAnalysis.sleepClass}
    />,
    <MetricTile
      key="shift"
      label="Shift Board"
      value={`α ${data.shiftCounts["alpha"] || 0} · β ${data.shiftCounts["beta"] || 0} · γ ${data.shiftCounts["gamma"] || 0}`}
      sub={formatIncidentTimestamp(station.commissioned + "T00:00:00Z")}
      tileClass="tile-ok"
    />,
    data.fuelMetrics && <FuelReservesWidget key="fuel" metrics={data.fuelMetrics} />,
  ];
}

export function TilesGrid({
  station,
  telemetry,
  crew,
  incidents,
  fuel,
}: Props) {
  const data = extractDashboardData(station, telemetry, crew, incidents, fuel);
  return <div className="tiles">{renderMetricTiles(data, station)}</div>;
}
