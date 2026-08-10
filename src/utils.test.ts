import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flashAlert } from './utils';

describe('utils', () => {
  describe('flashAlert', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      document.body.innerHTML = '';
    });

    it('adds alert-flash class to alert banner', () => {
      const alertBanner = document.createElement('div');
      alertBanner.className = 'alert-banner';
      document.body.appendChild(alertBanner);

      flashAlert();

      expect(alertBanner.classList.contains('alert-flash')).toBe(true);
    });

    it('removes alert-flash class after 600ms', () => {
      vi.useFakeTimers();
      const alertBanner = document.createElement('div');
      alertBanner.className = 'alert-banner';
      document.body.appendChild(alertBanner);

      flashAlert();
      expect(alertBanner.classList.contains('alert-flash')).toBe(true);

      vi.advanceTimersByTime(600);
      expect(alertBanner.classList.contains('alert-flash')).toBe(false);

      vi.useRealTimers();
    });

    it('does nothing if alert banner does not exist', () => {
      expect(() => flashAlert()).not.toThrow();
    });
  });
});
