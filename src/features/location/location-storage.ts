import { DEFAULT_LOCATION, type Location } from './types';

export const LOCATION_STORAGE_KEY = 'nadi-location';

export function readLocation(): Location {
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCATION;

    const parsed: unknown = JSON.parse(raw);
    if (!isLocation(parsed)) return DEFAULT_LOCATION;

    return parsed;
  } catch {
    return DEFAULT_LOCATION;
  }
}

export function writeLocation(location: Location): void {
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch {
    // Penyimpanan bisa diblokir. Lokasi tetap berlaku untuk sesi ini.
  }
}

function isLocation(value: unknown): value is Location {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.lat === 'number' &&
    typeof candidate.lon === 'number' &&
    (candidate.source === 'geolocation' ||
      candidate.source === 'search' ||
      candidate.source === 'default')
  );
}
