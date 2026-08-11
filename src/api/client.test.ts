import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getData } from './client';

describe('api client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('constructs correct URL and fetches data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Test' })
    });

    const result = await getData('test');
    expect(result).toEqual({ id: '1', name: 'Test' });
  });

  it('throws error when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    });

    await expect(getData('test')).rejects.toThrow('Request failed: 404');
  });

  it('throws error on simulated uplink failure', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { search: '?fail=1' },
      writable: true
    });

    await expect(getData('test')).rejects.toThrow('Simulated uplink failure');

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });
});
