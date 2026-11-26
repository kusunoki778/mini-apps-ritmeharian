export type WeatherIconKey =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder'
  | 'unknown';

export interface WeatherDescription {
  label: string;
  icon: WeatherIconKey;
}

const DESCRIPTIONS: Record<number, WeatherDescription> = {
  0: { label: 'Cerah', icon: 'clear' },
  1: { label: 'Cerah berawan', icon: 'partly' },
  2: { label: 'Berawan', icon: 'cloudy' },
  3: { label: 'Mendung', icon: 'overcast' },
  45: { label: 'Kabut', icon: 'fog' },
  48: { label: 'Kabut berembun', icon: 'fog' },
  51: { label: 'Gerimis ringan', icon: 'drizzle' },
  53: { label: 'Gerimis', icon: 'drizzle' },
  55: { label: 'Gerimis lebat', icon: 'drizzle' },
  56: { label: 'Gerimis beku ringan', icon: 'drizzle' },
  57: { label: 'Gerimis beku lebat', icon: 'drizzle' },
  61: { label: 'Hujan ringan', icon: 'rain' },
  63: { label: 'Hujan', icon: 'rain' },
  65: { label: 'Hujan lebat', icon: 'rain' },
  66: { label: 'Hujan beku ringan', icon: 'rain' },
  67: { label: 'Hujan beku lebat', icon: 'rain' },
  71: { label: 'Salju ringan', icon: 'snow' },
  73: { label: 'Salju', icon: 'snow' },
  75: { label: 'Salju lebat', icon: 'snow' },
  77: { label: 'Butir salju', icon: 'snow' },
  80: { label: 'Hujan lokal ringan', icon: 'rain' },
  81: { label: 'Hujan lokal', icon: 'rain' },
  82: { label: 'Hujan lokal lebat', icon: 'rain' },
  85: { label: 'Hujan salju lokal ringan', icon: 'snow' },
  86: { label: 'Hujan salju lokal lebat', icon: 'snow' },
  95: { label: 'Badai petir', icon: 'thunder' },
  96: { label: 'Badai petir dengan hujan es ringan', icon: 'thunder' },
  99: { label: 'Badai petir dengan hujan es lebat', icon: 'thunder' },
};

export const UNKNOWN_WEATHER: WeatherDescription = {
  label: 'Tidak diketahui',
  icon: 'unknown',
};

export function describeWeather(code: number): WeatherDescription {
  return DESCRIPTIONS[code] ?? UNKNOWN_WEATHER;
}
