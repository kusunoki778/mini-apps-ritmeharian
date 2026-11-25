import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { searchCities } from './geocoding';

export function useCitySearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['city-search', trimmed],
    queryFn: ({ signal }) => searchCities(trimmed, signal),
    enabled: trimmed.length >= 2,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
