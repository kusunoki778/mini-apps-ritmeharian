export interface AirCurrent {
  time: string;
  us_aqi: number;
  pm2_5: number;
  pm10: number;
  european_aqi: number;
}

export interface AirHourly {
  time: string[];
  us_aqi: number[];
  pm2_5: number[];
}

export interface AirQualityResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: AirCurrent;
  hourly: AirHourly;
}

export class AirApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AirApiError';
    this.status = status;
  }
}

const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
export const AIR_TIMEOUT_MS = 8000;

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isNumber);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

export function parseAirQualityResponse(payload: unknown): AirQualityResponse | null {
  const root = asRecord(payload);
  if (!root) return null;

  const current = asRecord(root.current);
  const hourly = asRecord(root.hourly);
  if (!current || !hourly) return null;

  const currentValid =
    isString(current.time) &&
    isNumber(current.us_aqi) &&
    isNumber(current.pm2_5) &&
    isNumber(current.pm10) &&
    isNumber(current.european_aqi);

  const hourlyValid =
    isStringArray(hourly.time) &&
    isNumberArray(hourly.us_aqi) &&
    isNumberArray(hourly.pm2_5);

  if (!currentValid || !hourlyValid) return null;

  return {
    latitude: isNumber(root.latitude) ? root.latitude : 0,
    longitude: isNumber(root.longitude) ? root.longitude : 0,
    timezone: isString(root.timezone) ? root.timezone : 'auto',
    current: current as unknown as AirCurrent,
    hourly: hourly as unknown as AirHourly,
  };
}

export function buildAirUrl(lat: number, lon: number): string {
  const url = new URL(AIR_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'us_aqi,pm2_5,pm10,european_aqi');
  url.searchParams.set('hourly', 'us_aqi,pm2_5');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '2');

  return url.toString();
}

export async function fetchAirQualityFromApi(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<AirQualityResponse> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), AIR_TIMEOUT_MS);
  const onAbort = () => controller.abort();

  signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(buildAirUrl(lat, lon), { signal: controller.signal });

    if (!response.ok) {
      throw new AirApiError(`Kualitas udara gagal dimuat (${response.status}).`, response.status);
    }

    const parsed = parseAirQualityResponse(await response.json());
    if (!parsed) {
      throw new AirApiError('Format data kualitas udara tidak dikenali.');
    }

    return parsed;
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
