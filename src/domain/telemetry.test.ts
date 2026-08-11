import { describe, it, expect } from 'vitest';
import {
  downsampleTelemetry,
  getLatestValue,
  getTrendArrow,
  getO2TrendArrow,
  getPowerTrendArrow,
  getPowerBudgetPercent,
  getPowerTileClass,
  getO2TileClass,
  getAverageTelemetry,
  computeResupplyCountdown
} from './telemetry';

describe('telemetry', () => {
  describe('downsampleTelemetry', () => {
    it('returns points unchanged if within max', () => {
      const points = [1, 2, 3];
      const result = downsampleTelemetry(points, 12);
      expect(result).toEqual(points);
    });

    it('downsamples points to max size', () => {
      const points = Array.from({ length: 100 }, (_, i) => i);
      const result = downsampleTelemetry(points, 12);
      expect(result.length).toBe(12);
    });

    it('produces correct downsampled values', () => {
      const points = [10, 20, 30, 40];
      const result = downsampleTelemetry(points, 2);
      expect(result.length).toBe(2);
      expect(result[0]).toBeCloseTo(15); // average of 10, 20
      expect(result[1]).toBeCloseTo(35); // average of 30, 40
    });
  });

  describe('getLatestValue', () => {
    it('returns last value', () => {
      const result = getLatestValue([1, 2, 3]);
      expect(result).toBe(3);
    });

    it('returns 0 for empty array', () => {
      const result = getLatestValue([]);
      expect(result).toBe(0);
    });
  });

  describe('getTrendArrow', () => {
    it('returns up arrow when threshold exceeded upward', () => {
      const result = getTrendArrow(5, 2, 1);
      expect(result).toBe('↑');
    });

    it('returns down arrow when threshold exceeded downward', () => {
      const result = getTrendArrow(2, 5, 1);
      expect(result).toBe('↓');
    });

    it('returns neutral arrow when within threshold', () => {
      const result = getTrendArrow(5, 4.5, 1);
      expect(result).toBe('→');
    });
  });

  describe('getO2TrendArrow', () => {
    it('returns trend for O2', () => {
      const points = [19, 19.1, 19.2, 19.3, 19.8];
      const result = getO2TrendArrow(points);
      expect(result).toBe('↑');
    });
  });

  describe('getPowerBudgetPercent', () => {
    it('calculates power budget percentage', () => {
      const result = getPowerBudgetPercent(45);
      expect(result).toBe(50);
    });
  });

  describe('getPowerTrendArrow', () => {
    it('returns trend for power', () => {
      const points = Array(4).fill(45).concat([55]);
      const result = getPowerTrendArrow(points);
      expect(result).toBe('↑');
    });

    it('returns neutral when less than 4 points', () => {
      const points = [45, 46];
      const result = getPowerTrendArrow(points);
      expect(result).toBe('→');
    });
  });

  describe('getO2TileClass', () => {
    it('returns tile-bad when critical', () => {
      const result = getO2TileClass(19.3);
      expect(result).toBe('tile-bad');
    });

    it('returns tile-warn when degraded', () => {
      const result = getO2TileClass(19.7);
      expect(result).toBe('tile-warn');
    });

    it('returns tile-ok when nominal', () => {
      const result = getO2TileClass(20.9);
      expect(result).toBe('tile-ok');
    });
  });

  describe('getAverageTelemetry', () => {
    it('calculates average of points', () => {
      const result = getAverageTelemetry([10, 20, 30]);
      expect(result).toBe(20);
    });

    it('returns 0 for empty array', () => {
      const result = getAverageTelemetry([]);
      expect(result).toBe(0);
    });
  });

  describe('getPowerTileClass', () => {
    it('returns tile-bad when below bad threshold', () => {
      const result = getPowerTileClass(50);
      expect(result).toBe('tile-bad');
    });

    it('returns tile-warn when in warning range', () => {
      const result = getPowerTileClass(70);
      expect(result).toBe('tile-warn');
    });

    it('returns tile-ok when healthy', () => {
      const result = getPowerTileClass(90);
      expect(result).toBe('tile-ok');
    });
  });

  describe('computeResupplyCountdown', () => {
    it('computes days and hours remaining', () => {
      const futureDate = new Date('2036-07-20T09:00:00Z');
      const now = new Date('2036-07-11T09:00:00Z').getTime();
      const result = computeResupplyCountdown(futureDate, now);
      expect(result.daysLeft).toBe(9);
      expect(result.hoursLeft).toBe(0);
    });

    it('marks as bad when less than 7 days', () => {
      const futureDate = new Date('2036-07-15T09:00:00Z');
      const now = new Date('2036-07-11T09:00:00Z').getTime();
      const result = computeResupplyCountdown(futureDate, now);
      expect(result.tileClass).toBe('tile-bad');
      expect(result.label).toContain('⚠');
    });

    it('marks as warn when 7-14 days', () => {
      const futureDate = new Date('2036-07-20T09:00:00Z');
      const now = new Date('2036-07-11T09:00:00Z').getTime();
      const result = computeResupplyCountdown(futureDate, now);
      expect(result.tileClass).toBe('tile-warn');
    });

    it('marks as ok when 15+ days', () => {
      const futureDate = new Date('2036-07-27T09:00:00Z');
      const now = new Date('2036-07-11T09:00:00Z').getTime();
      const result = computeResupplyCountdown(futureDate, now);
      expect(result.tileClass).toBe('tile-ok');
      expect(result.daysLeft).toBe(16);
    });
  });
});
