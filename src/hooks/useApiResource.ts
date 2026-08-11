// Shared API fetch hook with retry, cancellation, and error handling.

import { useEffect, useState } from 'react';
import { MAX_RETRIES, RETRY_DELAY_MS } from '../config';

export interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

export function useApiResource<T>(fetcher: () => Promise<T>): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    async function fetchWithRetry() {
      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;

        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            if (!cancelled) {
              setRetryCount(retryCount + 1);
            }
          }, RETRY_DELAY_MS);
        } else {
          const message = typeof err === 'object' && err !== null && 'message' in err ? String((err as Record<string, unknown>).message) : String(err);
          setError(message);
          setLoading(false);
        }
      }
    }

    fetchWithRetry();

    return () => {
      cancelled = true;
    };
  }, [fetcher, retryCount]);

  return { data, loading, error };
}
