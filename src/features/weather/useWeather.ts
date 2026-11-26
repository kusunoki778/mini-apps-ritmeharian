import { useQuery } from '@tanstack/react-query';

import { WeatherApiError } from './weather-api';
import { loadWeather } from './weather-service';

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof WeatherApiError && error.status && error.status < 500) {
    return false;
  }

  return failureCount < 2;
}

export function useWeather(lat: number, lon: number) {
  return useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: ({ signal }) => loadWeather(lat, lon, signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: shouldRetry,
  });
}
