import { z } from 'zod';

export interface CityResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  admin1?: string;
  country?: string;
}

const resultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  admin1: z.string().optional(),
  country: z.string().optional(),
});

const responseSchema = z.object({
  results: z.array(resultSchema).optional(),
});

const REQUEST_TIMEOUT_MS = 8000;

export function mapGeocodingResponse(payload: unknown): CityResult[] {
  const parsed = responseSchema.safeParse(payload);
  if (!parsed.success) return [];

  return (parsed.data.results ?? []).map((item) => ({
    id: String(item.id),
    name: item.name,
    lat: item.latitude,
    lon: item.longitude,
    admin1: item.admin1,
    country: item.country,
  }));
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<CityResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'id');
  url.searchParams.set('format', 'json');

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  const response = await fetch(url, { signal: combined });
  if (!response.ok) {
    throw new Error(`Pencarian kota gagal (${response.status}).`);
  }

  return mapGeocodingResponse(await response.json());
}
