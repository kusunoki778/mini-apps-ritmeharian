import { DEFAULT_LOCATION, type Location } from './types';

const STORAGE_KEY = 'nadi-location';

// ponytail: simpan di localStorage sampai tabel settings Dexie masuk di M8.
export function readLocation(): Location {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
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
