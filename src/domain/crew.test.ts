import { describe, it, expect } from 'vitest';
import { analyzeCrew } from './crew';
import type { CrewMember } from '../api/types';

describe('crew', () => {
  const mockCrew: CrewMember[] = [
    { id: '1', name: 'Alice', shift: 'alpha', onDuty: true, sleepHours: 8 },
    { id: '2', name: 'Bob', shift: 'beta', onDuty: false, sleepHours: 6.5 },
    { id: '3', name: 'Charlie', shift: 'alpha', onDuty: true, sleepHours: 7.5 }
  ];

  describe('analyzeCrew', () => {
    it('splits crew by duty status', () => {
      const result = analyzeCrew(mockCrew);
      expect(result.onDuty.length).toBe(2);
      expect(result.offDuty.length).toBe(1);
    });

    it('counts crew by shift', () => {
      const result = analyzeCrew(mockCrew);
      expect(result.shiftCounts['alpha']).toBe(2);
      expect(result.shiftCounts['beta']).toBe(1);
    });

    it('calculates average sleep hours', () => {
      const result = analyzeCrew(mockCrew);
      const expected = Math.round(((8 + 6.5 + 7.5) / 3) * 10) / 10;
      expect(result.avgSleep).toBe(expected);
    });

    it('marks sleep as bad when below 6 hours', () => {
      const crew: CrewMember[] = [
        { id: '1', name: 'Tired', shift: 'alpha', onDuty: false, sleepHours: 5 }
      ];
      const result = analyzeCrew(crew);
      expect(result.sleepClass).toBe('tile-bad');
    });

    it('marks sleep as warn when 6-7 hours', () => {
      const crew: CrewMember[] = [
        { id: '1', name: 'Medium', shift: 'alpha', onDuty: false, sleepHours: 6.5 }
      ];
      const result = analyzeCrew(crew);
      expect(result.sleepClass).toBe('tile-warn');
    });

    it('marks sleep as ok when 7+ hours', () => {
      const crew: CrewMember[] = [
        { id: '1', name: 'Rested', shift: 'alpha', onDuty: false, sleepHours: 8 }
      ];
      const result = analyzeCrew(crew);
      expect(result.sleepClass).toBe('tile-ok');
    });
  });
});
