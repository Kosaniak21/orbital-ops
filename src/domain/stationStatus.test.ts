import { describe, it, expect } from 'vitest';
import { computeStatus } from './stationStatus';

describe('stationStatus', () => {
  it('returns NOMINAL when all metrics are healthy', () => {
    const result = computeStatus(20, 80, 0);
    expect(result.status).toBe('NOMINAL');
    expect(result.color).toBe('#3ddc84');
  });

  it('returns CRITICAL when O2 is below floor', () => {
    const result = computeStatus(19.4, 80, 0);
    expect(result.status).toBe('CRITICAL');
    expect(result.color).toBe('#ff4d4d');
  });

  it('returns CRITICAL when unresolved critical incidents > 1', () => {
    const result = computeStatus(20, 80, 2);
    expect(result.status).toBe('CRITICAL');
  });

  it('returns DEGRADED when O2 is in degraded range', () => {
    const result = computeStatus(19.7, 80, 0);
    expect(result.status).toBe('DEGRADED');
    expect(result.color).toBe('#ffb020');
  });

  it('returns DEGRADED when power is low', () => {
    const result = computeStatus(20, 49, 0);
    expect(result.status).toBe('DEGRADED');
  });

  it('returns DEGRADED when there is one unresolved critical', () => {
    const result = computeStatus(20, 80, 1);
    expect(result.status).toBe('DEGRADED');
  });
});
