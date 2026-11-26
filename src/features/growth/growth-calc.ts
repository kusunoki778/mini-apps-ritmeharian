import { adultIdealWeight, type AdultFormula } from './adult-formula';
import { GROWTH_DATA, type GrowthRow, type GrowthSex } from './growth-data';

export type { AdultFormula };
export type { GrowthSex };

export const MAX_CHILD_MONTHS = 228; // 19 tahun
export const ADULT_AGE_YEARS = 20;

export interface ChildProfile {
  mode: 'child';
  sex: GrowthSex;
  ageMonths: number;
  heightCm?: number;
  weightKg?: number;
}

export interface AdultProfile {
  mode: 'adult';
  sex: GrowthSex;
  ageYears: number;
  heightCm: number;
  weightKg?: number;
  formula?: AdultFormula;
}

export type GrowthProfile = ChildProfile | AdultProfile;

export type StatusTone = 'normal' | 'caution' | 'warn';

export interface StatusBand {
  label: string;
  tone: StatusTone;
}

export interface GrowthResult {
  mode: 'child' | 'adult';
  /** Tinggi median menurut umur. Hanya bermakna untuk anak dan remaja. */
  idealHeightCm?: number;
  idealWeightKg: number;
  healthyMinKg: number;
  healthyMaxKg: number;
  bmi?: number;
  heightStatus?: StatusBand;
  weightStatus?: StatusBand;
  heightZ?: number;
  weightZ?: number;
  /** Rumus yang dipakai untuk berat ideal dewasa. */
  formula?: AdultFormula;
  /** Umur di luar jangkauan tabel LMS. */
  outOfRange?: boolean;
}

interface Lms {
  L: number;
  M: number;
  S: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Interpolasi linear antar baris bulan agar umur dengan pecahan bulan tetap wajar.
export function interpolateRow(rows: GrowthRow[], month: number): Lms {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (month <= first[0]) return { L: first[1], M: first[2], S: first[3] };
  if (month >= last[0]) return { L: last[1], M: last[2], S: last[3] };

  for (let index = 0; index < rows.length - 1; index += 1) {
    const a = rows[index];
    const b = rows[index + 1];
    if (month >= a[0] && month <= b[0]) {
      const t = (month - a[0]) / (b[0] - a[0]);
      return {
        L: a[1] + (b[1] - a[1]) * t,
        M: a[2] + (b[2] - a[2]) * t,
        S: a[3] + (b[3] - a[3]) * t,
      };
    }
  }

  return { L: last[1], M: last[2], S: last[3] };
}

export function zScore(value: number, { L, M, S }: Lms): number {
  if (L === 0) return Math.log(value / M) / S;
  return (Math.pow(value / M, L) - 1) / (L * S);
}

export function valueAtZ(z: number, { L, M, S }: Lms): number {
  if (L === 0) return M * Math.exp(S * z);
  return M * Math.pow(1 + L * S * z, 1 / L);
}

export function classifyHeight(z: number): StatusBand {
  if (z < -3) return { label: 'Sangat pendek', tone: 'warn' };
  if (z < -2) return { label: 'Pendek', tone: 'caution' };
  if (z > 3) return { label: 'Tinggi', tone: 'normal' };
  return { label: 'Normal', tone: 'normal' };
}

// Ambang Permenkes No. 2 Tahun 2020: IMT/U dibedakan 0-60 bulan dan 5-18 tahun.
export function classifyChildBmi(z: number, ageMonths: number): StatusBand {
  if (z < -3) return { label: 'Sangat kurus', tone: 'warn' };
  if (z < -2) return { label: 'Kurus', tone: 'caution' };
  if (z <= 1) return { label: 'Gizi baik', tone: 'normal' };

  if (ageMonths <= 60) {
    if (z <= 2) return { label: 'Berisiko gizi lebih', tone: 'caution' };
    if (z <= 3) return { label: 'Gizi lebih', tone: 'warn' };
    return { label: 'Obesitas', tone: 'warn' };
  }

  if (z <= 2) return { label: 'Kelebihan berat badan', tone: 'caution' };
  return { label: 'Obesitas', tone: 'warn' };
}

// Klasifikasi Asia-Pasifik, lebih relevan untuk pengguna Indonesia.
export function classifyAdultBmi(bmi: number): StatusBand {
  if (bmi < 18.5) return { label: 'Kurus', tone: 'caution' };
  if (bmi < 23) return { label: 'Normal', tone: 'normal' };
  if (bmi < 25) return { label: 'Berisiko', tone: 'caution' };
  if (bmi < 30) return { label: 'Obesitas I', tone: 'warn' };
  return { label: 'Obesitas II', tone: 'warn' };
}

// Berat badan ideal dewasa ada di adult-formula.ts supaya tabel WHO tidak ikut
// terbawa ke halaman lain.

export function computeGrowth(profile: GrowthProfile): GrowthResult {
  if (profile.mode === 'child') {
    const month = clamp(profile.ageMonths, 0, MAX_CHILD_MONTHS);
    const heightRow = interpolateRow(GROWTH_DATA.heightForAge[profile.sex], month);
    const bmiRow = interpolateRow(GROWTH_DATA.bmiForAge[profile.sex], month);

    const idealHeightCm = heightRow.M;
    const height = profile.heightCm ?? idealHeightCm;
    const heightM = height / 100;
    const idealWeightKg = bmiRow.M * heightM * heightM;

    const result: GrowthResult = {
      mode: 'child',
      idealHeightCm,
      idealWeightKg,
      healthyMinKg: valueAtZ(-2, bmiRow) * heightM * heightM,
      healthyMaxKg: valueAtZ(1, bmiRow) * heightM * heightM,
      outOfRange: profile.ageMonths > MAX_CHILD_MONTHS || profile.ageMonths < 0,
    };

    if (profile.heightCm !== undefined) {
      const heightZ = zScore(profile.heightCm, heightRow);
      result.heightZ = heightZ;
      result.heightStatus = classifyHeight(heightZ);
    }

    if (profile.heightCm !== undefined && profile.weightKg !== undefined) {
      const bmi = profile.weightKg / heightM / heightM;
      const weightZ = zScore(bmi, bmiRow);
      result.bmi = bmi;
      result.weightZ = weightZ;
      result.weightStatus = classifyChildBmi(weightZ, month);
    }

    return result;
  }

  const heightM = profile.heightCm / 100;
  const result: GrowthResult = {
    mode: 'adult',
    idealWeightKg: adultIdealWeight(profile.heightCm, profile.sex, profile.formula),
    healthyMinKg: 18.5 * heightM * heightM,
    healthyMaxKg: 24.9 * heightM * heightM,
    formula: profile.formula ?? 'devine',
  };

  if (profile.weightKg !== undefined) {
    const bmi = profile.weightKg / heightM / heightM;
    result.bmi = bmi;
    result.weightStatus = classifyAdultBmi(bmi);
  }

  return result;
}
