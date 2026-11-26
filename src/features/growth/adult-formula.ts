// Rumus berat badan ideal dewasa. Modul ini sengaja tidak mengimpor tabel WHO
// supaya halaman Pengaturan bisa memakainya tanpa membawa data pertumbuhan.

export type AdultFormula = 'devine' | 'robinson' | 'miller' | 'hamwi';

export type FormulaSex = 'male' | 'female';

export const ADULT_FORMULAS: Array<{ value: AdultFormula; label: string }> = [
  { value: 'devine', label: 'Devine' },
  { value: 'robinson', label: 'Robinson' },
  { value: 'miller', label: 'Miller' },
  { value: 'hamwi', label: 'Hamwi' },
];

// Base dan kenaikan per inci di atas 5 kaki (152,4 cm) untuk tiap rumus.
const ADULT_BASE: Record<AdultFormula, Record<FormulaSex, number>> = {
  devine: { male: 50, female: 45.5 },
  robinson: { male: 52, female: 49 },
  miller: { male: 56.2, female: 53.1 },
  hamwi: { male: 48, female: 45.5 },
};

const ADULT_PER_INCH: Record<AdultFormula, Record<FormulaSex, number>> = {
  devine: { male: 2.3, female: 2.3 },
  robinson: { male: 1.9, female: 1.7 },
  miller: { male: 1.41, female: 1.36 },
  hamwi: { male: 2.7, female: 2.2 },
};

// Berat badan ideal dewasa. Keempat rumus memakai tinggi di atas 5 kaki sebagai
// dasar. Bila rumus tidak dikenal, dipakai Devine.
export function adultIdealWeight(
  heightCm: number,
  sex: FormulaSex,
  formula: AdultFormula = 'devine',
): number {
  const inchesOverFiveFeet = (heightCm - 152.4) / 2.54;
  const base = ADULT_BASE[formula] ?? ADULT_BASE.devine;
  const perInch = ADULT_PER_INCH[formula] ?? ADULT_PER_INCH.devine;
  return base[sex] + perInch[sex] * inchesOverFiveFeet;
}

export function adultFormulaLabel(formula: AdultFormula): string {
  return ADULT_FORMULAS.find((item) => item.value === formula)?.label ?? 'Devine';
}
