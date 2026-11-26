import type { AdultFormula } from '@/features/growth/adult-formula';
import type { ClockFormat, TemperatureUnit } from '@/lib/format/preferences';
import type { ThemePreference } from './theme';
import type { WeekStart } from './week-start';

export interface Settings {
  theme: ThemePreference;
  temperatureUnit: TemperatureUnit;
  clockFormat: ClockFormat;
  weekStart: WeekStart;
  idealWeightFormula: AdultFormula;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  temperatureUnit: 'celsius',
  clockFormat: '24h',
  weekStart: 1,
  idealWeightFormula: 'devine',
};

// Menyaring nilai yang tidak dikenal dari penyimpanan atau impor tanpa melempar.
export function sanitizeSettings(value: unknown): Partial<Settings> {
  if (typeof value !== 'object' || value === null) return {};

  const record = value as Record<string, unknown>;
  const result: Partial<Settings> = {};

  if (record.theme === 'system' || record.theme === 'light' || record.theme === 'dark') {
    result.theme = record.theme;
  }
  if (record.temperatureUnit === 'celsius' || record.temperatureUnit === 'fahrenheit') {
    result.temperatureUnit = record.temperatureUnit;
  }
  if (record.clockFormat === '24h' || record.clockFormat === '12h') {
    result.clockFormat = record.clockFormat;
  }
  if (record.weekStart === 0 || record.weekStart === 1) {
    result.weekStart = record.weekStart;
  }
  if (
    record.idealWeightFormula === 'devine' ||
    record.idealWeightFormula === 'robinson' ||
    record.idealWeightFormula === 'miller' ||
    record.idealWeightFormula === 'hamwi'
  ) {
    result.idealWeightFormula = record.idealWeightFormula;
  }

  return result;
}
