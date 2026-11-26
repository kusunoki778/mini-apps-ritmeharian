import { getTemperatureUnit, type TemperatureUnit } from './preferences';

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit = getTemperatureUnit(),
): string {
  return `${Math.round(convertTemperature(celsius, unit))}°`;
}
