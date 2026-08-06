// Data models for the station API with full type coverage.

export interface Station {
  id: string;
  name: string;
  orbit: string;
  inclinationDeg: number;
  velocityKms: number;
  crewCapacity: number;
  crewOnboard: number;
  commissioned: string;
  nextResupply: string;
  daysInService: number;
}

export type Severity = 'critical' | 'warning' | 'info';

export interface TelemetrySeries {
  points: number[];
  label?: string;
  unit?: string;
}

export interface TelemetryResponse {
  station: string;
  timestamp: string;
  series: {
    o2: TelemetrySeries;
    power: TelemetrySeries;
    hullTemp: TelemetrySeries;
    hullIntegrity: TelemetrySeries;
  };
}

export interface CrewMember {
  id: string;
  name: string;
  shift: string;
  onDuty: boolean;
  sleepHours: number;
  role?: string;
  heartRate?: number;
  missionDay?: number;
}

export interface CrewResponse {
  station: string;
  timestamp: string;
  members: CrewMember[];
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  resolved: boolean;
  timestamp: string;
  system?: string;
}

export interface IncidentsResponse {
  station: string;
  timestamp: string;
  items: Incident[];
}
