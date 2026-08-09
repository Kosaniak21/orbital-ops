import { describe, it, expect } from 'vitest';
import { countIncidents, getSeverityColor, rankIncidents, getTopIncident } from './incidents';
import type { Incident } from '../api/types';

describe('incidents', () => {
  const mockIncidents: Incident[] = [
    { id: '1', title: 'Alert 1', severity: 'critical', resolved: false, timestamp: '2036-07-11T10:00:00Z' },
    { id: '2', title: 'Alert 2', severity: 'warning', resolved: false, timestamp: '2036-07-11T11:00:00Z' },
    { id: '3', title: 'Alert 3', severity: 'info', resolved: false, timestamp: '2036-07-11T09:00:00Z' },
    { id: '4', title: 'Alert 4', severity: 'critical', resolved: true, timestamp: '2036-07-11T08:00:00Z' }
  ];

  describe('countIncidents', () => {
    it('counts unresolved critical incidents', () => {
      const result = countIncidents(mockIncidents, '2036-07-11');
      expect(result.unresolvedCritical).toBe(1);
    });

    it('counts unresolved warnings', () => {
      const result = countIncidents(mockIncidents, '2036-07-11');
      expect(result.unresolvedWarning).toBe(1);
    });

    it('counts resolved incidents from today', () => {
      const result = countIncidents(mockIncidents, '2036-07-11');
      expect(result.resolvedToday).toBe(1);
    });
  });

  describe('getSeverityColor', () => {
    it('returns critical color', () => {
      expect(getSeverityColor('critical')).toBe('#ff4d4d');
    });

    it('returns warning color', () => {
      expect(getSeverityColor('warning')).toBe('#ffb020');
    });

    it('returns info color', () => {
      expect(getSeverityColor('info')).toBe('#4da3ff');
    });

    it('returns muted color for unknown', () => {
      expect(getSeverityColor('unknown')).toBe('#8892a6');
    });
  });

  describe('rankIncidents', () => {
    it('ranks by severity', () => {
      const result = rankIncidents(mockIncidents);
      expect(result[0].severity).toBe('critical');
      expect(result[1].severity).toBe('warning');
    });

    it('only includes unresolved incidents', () => {
      const result = rankIncidents(mockIncidents);
      expect(result.every((inc) => !inc.resolved)).toBe(true);
    });

    it('orders by timestamp (newest first) within same severity', () => {
      const incidents: Incident[] = [
        { id: '1', title: 'A', severity: 'warning', resolved: false, timestamp: '2036-07-11T10:00:00Z' },
        { id: '2', title: 'B', severity: 'warning', resolved: false, timestamp: '2036-07-11T11:00:00Z' }
      ];
      const result = rankIncidents(incidents);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });
  });

  describe('getTopIncident', () => {
    it('returns highest priority incident', () => {
      const result = getTopIncident(mockIncidents);
      expect(result?.severity).toBe('critical');
    });

    it('returns null when no unresolved incidents', () => {
      const resolved: Incident[] = [
        { id: '1', title: 'Resolved', severity: 'critical', resolved: true, timestamp: '2036-07-11T10:00:00Z' }
      ];
      const result = getTopIncident(resolved);
      expect(result).toBeNull();
    });
  });
});
