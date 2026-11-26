import type { AirQualityResponse } from './air-api';

export const SAMPLE_AIR: AirQualityResponse = {
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: 'Asia/Jakarta',
  current: {
    time: '2026-11-26T08:00',
    us_aqi: 68,
    pm2_5: 18.4,
    pm10: 32.1,
    european_aqi: 42,
  },
  hourly: {
    time: ['2026-11-26T08:00', '2026-11-26T09:00'],
    us_aqi: [68, 72],
    pm2_5: [18.4, 19.1],
  },
};
