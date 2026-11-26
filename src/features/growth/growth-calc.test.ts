import { describe, expect, it } from 'vitest';

import { GROWTH_DATA } from './growth-data';
import { adultFormulaLabel, adultIdealWeight } from './adult-formula';
import {
  classifyAdultBmi,
  classifyChildBmi,
  classifyHeight,
  computeGrowth,
  interpolateRow,
  valueAtZ,
  zScore,
} from './growth-calc';

describe('interpolateRow', () => {
  it('mengembalikan baris persis untuk bulan yang ada', () => {
    const row = interpolateRow(GROWTH_DATA.heightForAge.male, 0);
    expect(row.M).toBeCloseTo(49.8842, 4);
    expect(row.L).toBeCloseTo(1, 4);
  });

  it('mengambil titik tengah pada interpolasi', () => {
    const rows = [
      [10, 1, 100, 0.1],
      [12, 1, 120, 0.2],
    ] as const;
    const row = interpolateRow([...rows], 11);
    expect(row.M).toBeCloseTo(110, 5);
    expect(row.S).toBeCloseTo(0.15, 5);
  });
});

describe('zScore dan valueAtZ', () => {
  it('saling membalik', () => {
    const lms = { L: -0.5, M: 15.2, S: 0.09 };
    expect(valueAtZ(zScore(15.2, lms), lms)).toBeCloseTo(15.2, 5);
    expect(valueAtZ(zScore(18, lms), lms)).toBeCloseTo(18, 5);
  });

  it('z nol adalah median', () => {
    const lms = { L: 1, M: 50, S: 0.04 };
    expect(valueAtZ(0, lms)).toBeCloseTo(50, 6);
    expect(zScore(50, lms)).toBeCloseTo(0, 6);
  });

  it('menangani L nol', () => {
    const lms = { L: 0, M: 10, S: 0.1 };
    expect(zScore(10, lms)).toBeCloseTo(0, 6);
    expect(valueAtZ(0, lms)).toBeCloseTo(10, 6);
  });
});

describe('klasifikasi', () => {
  it('tinggi menurut umur', () => {
    expect(classifyHeight(-3.5).label).toBe('Sangat pendek');
    expect(classifyHeight(-2.5).label).toBe('Pendek');
    expect(classifyHeight(0).label).toBe('Normal');
    expect(classifyHeight(3.5).label).toBe('Tinggi');
  });

  it('IMT menurut umur beda ambang 0-60 bulan dan 5-18 tahun', () => {
    expect(classifyChildBmi(2.5, 24).label).toBe('Gizi lebih');
    expect(classifyChildBmi(1.5, 24).label).toBe('Berisiko gizi lebih');
    expect(classifyChildBmi(1.5, 120).label).toBe('Kelebihan berat badan');
    expect(classifyChildBmi(0, 120).label).toBe('Gizi baik');
    expect(classifyChildBmi(-2.5, 120).label).toBe('Kurus');
  });

  it('IMT dewasa Asia-Pasifik', () => {
    expect(classifyAdultBmi(17).label).toBe('Kurus');
    expect(classifyAdultBmi(22).label).toBe('Normal');
    expect(classifyAdultBmi(23.5).label).toBe('Berisiko');
    expect(classifyAdultBmi(27).label).toBe('Obesitas I');
    expect(classifyAdultBmi(31).label).toBe('Obesitas II');
  });
});

describe('adultIdealWeight', () => {
  it('Devine untuk pria dan wanita', () => {
    expect(adultIdealWeight(170, 'male', 'devine')).toBeCloseTo(65.937, 3);
    expect(adultIdealWeight(160, 'female', 'devine')).toBeCloseTo(52.382, 3);
  });

  it('Robinson, Miller, dan Hamwi memberi hasil berbeda', () => {
    expect(adultIdealWeight(170, 'male', 'robinson')).toBeCloseTo(65.165, 3);
    expect(adultIdealWeight(170, 'male', 'miller')).toBeCloseTo(65.97, 3);
    expect(adultIdealWeight(170, 'male', 'hamwi')).toBeCloseTo(66.709, 3);
    expect(adultIdealWeight(160, 'female', 'hamwi')).toBeCloseTo(52.083, 3);
  });

  it('memakai Devine bila rumus tidak diberikan', () => {
    expect(adultIdealWeight(170, 'male')).toBeCloseTo(65.937, 3);
  });

  it('memberi label yang terbaca', () => {
    expect(adultFormulaLabel('miller')).toBe('Miller');
    expect(adultFormulaLabel('hamwi')).toBe('Hamwi');
  });
});

describe('computeGrowth', () => {
  it('anak tanpa tinggi dan berat memakai median', () => {
    const result = computeGrowth({ mode: 'child', sex: 'male', ageMonths: 24 });
    expect(result.idealHeightCm).toBeGreaterThan(80);
    expect(result.idealWeightKg).toBeGreaterThan(10);
    expect(result.healthyMinKg).toBeLessThan(result.idealWeightKg);
    expect(result.idealWeightKg).toBeLessThan(result.healthyMaxKg);
    expect(result.heightStatus).toBeUndefined();
  });

  it('anak dengan tinggi dan berat memberi status gizi', () => {
    const result = computeGrowth({
      mode: 'child',
      sex: 'female',
      ageMonths: 36,
      heightCm: 96,
      weightKg: 14,
    });
    expect(result.heightStatus).toBeDefined();
    expect(result.weightStatus).toBeDefined();
    expect(result.bmi).toBeCloseTo(14 / (0.96 * 0.96), 6);
    expect(result.heightZ).toBeTypeOf('number');
  });

  it('menandai umur di luar jangkauan tabel', () => {
    const result = computeGrowth({ mode: 'child', sex: 'male', ageMonths: 260 });
    expect(result.outOfRange).toBe(true);
  });

  it('dewasa memakai rumus Devine dan rentang BMI sehat', () => {
    const result = computeGrowth({
      mode: 'adult',
      sex: 'male',
      ageYears: 30,
      heightCm: 170,
      weightKg: 80,
    });
    expect(result.idealWeightKg).toBeCloseTo(65.937, 3);
    expect(result.formula).toBe('devine');
    expect(result.healthyMinKg).toBeCloseTo(18.5 * 2.89, 2);
    expect(result.healthyMaxKg).toBeCloseTo(24.9 * 2.89, 2);
    expect(result.bmi).toBeCloseTo(80 / 2.89, 4);
    expect(result.weightStatus?.label).toBe('Obesitas I');
    expect(result.idealHeightCm).toBeUndefined();
  });

  it('dewasa memakai rumus yang dipilih', () => {
    const result = computeGrowth({
      mode: 'adult',
      sex: 'male',
      ageYears: 30,
      heightCm: 170,
      formula: 'hamwi',
    });
    expect(result.idealWeightKg).toBeCloseTo(66.709, 3);
    expect(result.formula).toBe('hamwi');
  });
});
