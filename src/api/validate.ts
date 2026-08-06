// Runtime type guards for API responses.

import type { Station, TelemetryResponse, CrewResponse, IncidentsResponse, Severity } from './types';

function isSeverity(value: unknown): value is Severity {
  return value === 'critical' || value === 'warning' || value === 'info';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasStringField(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'string';
}

function hasNumberField(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'number';
}

function hasArrayField(obj: Record<string, unknown>, key: string): boolean {
  return Array.isArray(obj[key]);
}

function validateStationFields(obj: Record<string, unknown>): boolean {
  return (
    hasStringField(obj, 'id') &&
    hasStringField(obj, 'name') &&
    hasStringField(obj, 'orbit') &&
    hasNumberField(obj, 'inclinationDeg') &&
    hasNumberField(obj, 'velocityKms') &&
    hasNumberField(obj, 'crewCapacity') &&
    hasNumberField(obj, 'crewOnboard') &&
    hasStringField(obj, 'commissioned') &&
    hasStringField(obj, 'nextResupply') &&
    hasNumberField(obj, 'daysInService')
  );
}

export function isStation(value: unknown): value is Station {
  if (!isObject(value)) return false;
  return validateStationFields(value);
}

function validateNumberArray(arr: unknown): boolean {
  return Array.isArray(arr) && arr.every((x) => typeof x === 'number');
}

function validateTelemetrySeries(series: unknown): boolean {
  if (!isObject(series)) return false;
  return (
    validateNumberArray(series.o2) &&
    validateNumberArray(series.power) &&
    validateNumberArray(series.hullTemp) &&
    validateNumberArray(series.hullIntegrity)
  );
}

export function isTelemetryResponse(value: unknown): value is TelemetryResponse {
  if (!isObject(value)) return false;
  if (!hasStringField(value, 'station') || !hasStringField(value, 'timestamp')) return false;
  return validateTelemetrySeries(value.series);
}

function isCrewMember(value: unknown): boolean {
  if (!isObject(value)) return false;
  return (
    hasStringField(value, 'id') &&
    hasStringField(value, 'name') &&
    hasStringField(value, 'shift') &&
    typeof value.onDuty === 'boolean' &&
    hasNumberField(value, 'sleepHours')
  );
}

export function isCrewResponse(value: unknown): value is CrewResponse {
  if (!isObject(value)) return false;
  if (!hasStringField(value, 'station') || !hasStringField(value, 'timestamp')) return false;
  if (!hasArrayField(value, 'members')) return false;
  const members = value.members as unknown[];
  return members.every(isCrewMember);
}

function isIncident(value: unknown): boolean {
  if (!isObject(value)) return false;
  return (
    hasStringField(value, 'id') &&
    hasStringField(value, 'title') &&
    isSeverity(value.severity) &&
    typeof value.resolved === 'boolean' &&
    hasStringField(value, 'timestamp')
  );
}

export function isIncidentsResponse(value: unknown): value is IncidentsResponse {
  if (!isObject(value)) return false;
  if (!hasStringField(value, 'station') || !hasStringField(value, 'timestamp')) return false;
  if (!hasArrayField(value, 'items')) return false;
  const items = value.items as unknown[];
  return items.every(isIncident);
}
