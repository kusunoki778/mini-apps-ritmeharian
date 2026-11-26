export type AqiCategoryKey =
  | 'good'
  | 'moderate'
  | 'sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous';

export interface AqiCategory {
  key: AqiCategoryKey;
  label: string;
  advice: string;
  color: string;
}

export const AQI_DISCLAIMER = 'Saran umum, bukan nasihat medis.';

const CATEGORIES: Record<AqiCategoryKey, Omit<AqiCategory, 'key'>> = {
  good: {
    label: 'Baik',
    advice: 'Aktivitas luar ruang aman untuk umum.',
    color: 'var(--aqi-good)',
  },
  moderate: {
    label: 'Sedang',
    advice: 'Kelompok sensitif perlu memperhatikan gejala.',
    color: 'var(--aqi-moderate)',
  },
  sensitive: {
    label: 'Tidak sehat bagi kelompok sensitif',
    advice: 'Kelompok sensitif kurangi aktivitas luar ruang yang berat.',
    color: 'var(--aqi-sensitive)',
  },
  unhealthy: {
    label: 'Tidak sehat',
    advice: 'Kurangi aktivitas luar ruang.',
    color: 'var(--aqi-unhealthy)',
  },
  'very-unhealthy': {
    label: 'Sangat tidak sehat',
    advice: 'Hindari aktivitas luar ruang.',
    color: 'var(--aqi-very-unhealthy)',
  },
  hazardous: {
    label: 'Berbahaya',
    advice: 'Tetap di dalam ruang, tutup ventilasi.',
    color: 'var(--aqi-hazardous)',
  },
};

export function categorizeUsAqi(value: number): AqiCategory {
  const key: AqiCategoryKey =
    value <= 50
      ? 'good'
      : value <= 100
        ? 'moderate'
        : value <= 150
          ? 'sensitive'
          : value <= 200
            ? 'unhealthy'
            : value <= 300
              ? 'very-unhealthy'
              : 'hazardous';

  return { key, ...CATEGORIES[key] };
}
