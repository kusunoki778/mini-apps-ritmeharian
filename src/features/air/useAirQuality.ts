import { useQuery } from '@tanstack/react-query';

import { AirApiError } from './air-api';
import { loadAirQuality } from './air-service';

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof AirApiError && error.status && error.status < 500) {
    return false;
  }

  return failureCount < 2;
}

export function useAirQuality(lat: number, lon: number) {
  return useQuery({
    queryKey: ['air', lat, lon],
    queryFn: ({ signal }) => loadAirQuality(lat, lon, signal),
    staleTime: 20 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: shouldRetry,
  });
}
