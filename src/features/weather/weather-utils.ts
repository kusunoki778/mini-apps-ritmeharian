import { getClockFormat, type ClockFormat } from '@/lib/format/preferences';
import { formatClockParts, formatTimeOfDay } from '@/lib/format/time';
import { currentHourIndex } from '@/lib/utils/hour-series';

const TIME_PATTERN = /T(\d{2}):(\d{2})/;

export { currentHourIndex };

export function formatClock(iso: string, format: ClockFormat = getClockFormat()): string {
  const match = TIME_PATTERN.exec(iso);
  if (!match) return iso;

  return formatClockParts(Number(match[1]), Number(match[2]), format);
}

export function formatUpdatedAt(timestamp: number): string {
  return `Diperbarui ${formatTimeOfDay(new Date(timestamp))}`;
}

export function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(iso));
}

export function formatDayShort(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(iso));
}

export function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function hourIsDaylight(timeIso: string, sunrise: string[], sunset: string[]): boolean {
  const date = timeIso.slice(0, 10);
  const index = sunrise.findIndex((value) => value.slice(0, 10) === date);
  if (index === -1 || !sunrise[index] || !sunset[index]) return true;

  return timeIso >= sunrise[index] && timeIso < sunset[index];
}

// Tingkat paparan sinar matahari. Ambang mengikuti skala UV baku (WHO).
export function uvLevel(value: number): string {
  if (value >= 11) return 'Ekstrem';
  if (value >= 8) return 'Sangat tinggi';
  if (value >= 6) return 'Tinggi';
  if (value >= 3) return 'Sedang';
  return 'Rendah';
}

export interface ComfortIndex {
  score: number;
  label: string;
  advice: string;
}

// Indeks kenyamanan 0 sampai 100 dari beberapa unsur cuaca. Suhu dan kelembapan
// punya rentang nyaman, sedangkan angin, UV, dan hujan menurunkan nilai.
export function comfortIndex(input: {
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
}): ComfortIndex {
  let score = 100;

  const temperature = input.apparentTemperature;
  if (temperature < 18) score -= (18 - temperature) * 3;
  else if (temperature > 27) score -= (temperature - 27) * 3;

  const humidity = input.humidity;
  if (humidity < 40) score -= (40 - humidity) * 0.5;
  else if (humidity > 65) score -= (humidity - 65) * 0.7;

  if (input.windSpeed > 20) score -= (input.windSpeed - 20) * 1.2;
  if (input.uvIndex > 7) score -= (input.uvIndex - 7) * 4;
  score -= Math.min(Math.max(input.precipitation, 0), 10) * 4;

  score = Math.round(Math.max(0, Math.min(100, score)));

  if (score >= 80) return { score, label: 'Nyaman', advice: 'Cuaca enak untuk aktivitas di luar.' };
  if (score >= 60) {
    return {
      score,
      label: 'Cukup nyaman',
      advice: 'Masih nyaman. Jaga cairan dan lindungi kulit dari matahari.',
    };
  }
  if (score >= 40) {
    return {
      score,
      label: 'Kurang nyaman',
      advice: 'Batasi aktivitas luar dan cari tempat teduh.',
    };
  }
  return { score, label: 'Tidak nyaman', advice: 'Sebaiknya beraktivitas di dalam ruangan.' };
}
