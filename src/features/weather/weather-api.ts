export interface WeatherCurrent {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: 0 | 1;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface WeatherHourly {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability: number[];
}

export interface WeatherDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds: number;
  current: WeatherCurrent;
  hourly: WeatherHourly;
  daily: WeatherDaily;
}

export class WeatherApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
  }
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const WEATHER_TIMEOUT_MS = 8000;

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

export function parseWeatherResponse(payload: unknown): WeatherResponse | null {
  const root = asRecord(payload);
  if (!root) return null;

  const current = asRecord(root.current);
  const hourly = asRecord(root.hourly);
  const daily = asRecord(root.daily);
  if (!current || !hourly || !daily) return null;

  const currentValid =
    isString(current.time) &&
    isNumber(current.temperature_2m) &&
    isNumber(current.relative_humidity_2m) &&
    isNumber(current.apparent_temperature) &&
    (current.is_day === 0 || current.is_day === 1) &&
    isNumber(current.precipitation) &&
    isNumber(current.weather_code) &&
    isNumber(current.wind_speed_10m);

  const hourlyValid =
    isStringArray(hourly.time) &&
    isNumberArray(hourly.temperature_2m) &&
    isNumberArray(hourly.weather_code) &&
    isNumberArray(hourly.precipitation_probability);

  const dailyValid =
    isStringArray(daily.time) &&
    isNumberArray(daily.weather_code) &&
    isNumberArray(daily.temperature_2m_max) &&
    isNumberArray(daily.temperature_2m_min) &&
    isStringArray(daily.sunrise) &&
    isStringArray(daily.sunset);

  if (!currentValid || !hourlyValid || !dailyValid) return null;

  return {
    latitude: isNumber(root.latitude) ? root.latitude : 0,
    longitude: isNumber(root.longitude) ? root.longitude : 0,
    timezone: isString(root.timezone) ? root.timezone : 'auto',
    utc_offset_seconds: isNumber(root.utc_offset_seconds) ? root.utc_offset_seconds : 0,
    current: current as unknown as WeatherCurrent,
    hourly: hourly as unknown as WeatherHourly,
    daily: daily as unknown as WeatherDaily,
  };
}

export function buildWeatherUrl(lat: number, lon: number): string {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
  );
  url.searchParams.set('hourly', 'temperature_2m,weather_code,precipitation_probability');
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  return url.toString();
}

export async function fetchWeatherFromApi(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<WeatherResponse> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);
  const onAbort = () => controller.abort();

  signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(buildWeatherUrl(lat, lon), { signal: controller.signal });

    if (!response.ok) {
      throw new WeatherApiError(`Cuaca gagal dimuat (${response.status}).`, response.status);
    }

    const parsed = parseWeatherResponse(await response.json());
    if (!parsed) {
      throw new WeatherApiError('Format data cuaca tidak dikenali.');
    }

    return parsed;
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
