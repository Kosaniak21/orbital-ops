import { describe, it, expect } from 'vitest';
import { formatTimestamp, formatIncidentTimestamp, formatTime } from './formatting';

describe('formatting', () => {
  describe('formatTimestamp', () => {
    it('formats ISO datetime to readable format', () => {
      const result = formatTimestamp('2036-07-11T10:30:45Z');
      expect(result).toBe('Jul 11, 10:30 UTC');
    });
  });

  describe('formatIncidentTimestamp', () => {
    it('formats ISO datetime for incidents', () => {
      const result = formatIncidentTimestamp('2036-07-11T10:30:45Z');
      expect(result).toBe('Jul 11 10:30z');
    });
  });

  describe('formatTime', () => {
    it('formats time in HH:MM:SS format', () => {
      const date = new Date('2036-07-11T09:05:03Z');
      const result = formatTime(date);
      expect(result).toContain('09:05:03');
    });

    it('pads single digit hours/minutes/seconds', () => {
      const date = new Date('2036-07-11T01:02:03Z');
      const result = formatTime(date);
      expect(result).toContain('01:02:03');
    });
  });
});
