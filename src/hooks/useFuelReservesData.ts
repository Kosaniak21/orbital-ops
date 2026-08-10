// Typed data hook for fuel reserves with validation and error handling.

import { useCallback } from 'react';
import type { FuelResponse } from '../api/types';
import { useApiResource } from './useApiResource';

export function useFuelReservesData() {
  const fetcher = useCallback(async (): Promise<FuelResponse> => {
    const response = await fetch('/api/fuel.json');
    if (!response.ok) {
      throw new Error(`Fuel API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }, []);

  return useApiResource(fetcher);
}
