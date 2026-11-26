import type { WeatherResponse } from './weather-api';

export const SAMPLE_WEATHER: WeatherResponse = {
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: 'Asia/Jakarta',
  utc_offset_seconds: 25200,
  current: {
    time: '2026-11-26T20:00',
    temperature_2m: 28.4,
    relative_humidity_2m: 78,
    apparent_temperature: 31.2,
    is_day: 0,
    precipitation: 0,
    weather_code: 2,
    wind_speed_10m: 9.5,
  },
  hourly: {
    time: ['2026-11-26T20:00', '2026-11-26T21:00'],
    temperature_2m: [28.4, 27.9],
    weather_code: [2, 3],
    precipitation_probability: [10, 20],
  },
  daily: {
    time: ['2026-11-26', '2026-11-27'],
    weather_code: [2, 61],
    temperature_2m_max: [32, 31],
    temperature_2m_min: [25, 24],
    sunrise: ['2026-11-26T05:28', '2026-11-27T05:28'],
    sunset: ['2026-11-26T17:52', '2026-11-27T17:52'],
  },
};
