// Orbital Ops configuration: thresholds, intervals, colors, and sizing constants.

// Poll and retry behavior
export const POLL_INTERVAL_MS = 5000;
export const RETRY_DELAY_MS = 1000;
export const MAX_RETRIES = 3;

// O2 thresholds (mission control wall display values)
export const O2_CRITICAL_FLOOR = 19.5;
export const O2_DEGRADED_FLOOR = 19.9;

// Power thresholds
export const POWER_CRITICAL_FLOOR = 50;
export const POWER_BUDGET_BASELINE = 90;
export const POWER_BUDGET_WARN_PCT = 75;
export const POWER_BUDGET_BAD_PCT = 55;

// Hull/integrity thresholds
export const HULL_TEMP_WARN = 45;
export const HULL_INTEGRITY_WARN = 92;

// Resupply warning windows (days)
export const RESUPPLY_BAD_DAYS = 7;
export const RESUPPLY_WARN_DAYS = 14;

// Crew sleep thresholds (hours)
export const CREW_SLEEP_BAD_HRS = 6;
export const CREW_SLEEP_WARN_HRS = 7;

// Telemetry downsampling
export const TELEMETRY_MAX_POINTS = 12;

// Trend detection thresholds
export const TREND_THRESHOLD_O2 = 0.15;
export const TREND_THRESHOLD_POWER = 2;

// Status colors (hex)
export const COLOR_NOMINAL = '#3ddc84';
export const COLOR_DEGRADED = '#ffb020';
export const COLOR_CRITICAL = '#ff4d4d';
export const COLOR_INFO = '#4da3ff';
export const COLOR_MUTED = '#8892a6';
