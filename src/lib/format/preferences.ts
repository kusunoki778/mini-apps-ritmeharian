export type ClockFormat = '24h' | '12h';
export type TemperatureUnit = 'celsius' | 'fahrenheit';

interface FormatPreferences {
  clockFormat: ClockFormat;
  temperatureUnit: TemperatureUnit;
}

const DEFAULTS: FormatPreferences = {
  clockFormat: '24h',
  temperatureUnit: 'celsius',
};

let current: FormatPreferences = { ...DEFAULTS };

// Nilai modul dipakai fungsi format murni. Provider menyinkronkannya sebelum anak merender.
export function setFormatPreferences(next: FormatPreferences): void {
  current = next;
}

export function getClockFormat(): ClockFormat {
  return current.clockFormat;
}

export function getTemperatureUnit(): TemperatureUnit {
  return current.temperatureUnit;
}
