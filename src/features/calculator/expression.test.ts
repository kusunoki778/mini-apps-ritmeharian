import { describe, expect, it } from 'vitest';

import { evaluateExpression, formatResult } from './expression';

describe('evaluateExpression', () => {
  it('menghormati urutan operasi', () => {
    expect(evaluateExpression('2 + 3 * 4')).toBe(14);
    expect(evaluateExpression('(2 + 3) * 4')).toBe(20);
  });

  it('menghitung pangkat dari kanan dan akar', () => {
    expect(evaluateExpression('2^3^2')).toBe(512);
    expect(evaluateExpression('sqrt(16)')).toBe(4);
    expect(evaluateExpression('cbrt(27)')).toBe(3);
  });

  it('menangani kurang sebagai unary', () => {
    expect(evaluateExpression('-5 + 2')).toBe(-3);
    expect(evaluateExpression('10 - -3')).toBe(13);
  });

  it('memakai derajat secara bawaan dan radian bila diminta', () => {
    expect(evaluateExpression('sin(30)')).toBeCloseTo(0.5, 10);
    expect(evaluateExpression('sin(pi/2)', 'rad')).toBeCloseTo(1, 10);
    expect(evaluateExpression('asin(1)')).toBeCloseTo(90, 10);
  });

  it('mendukung logaritma, nilai mutlak, dan eksponen', () => {
    expect(evaluateExpression('log(1000)')).toBeCloseTo(3, 10);
    expect(evaluateExpression('ln(e)')).toBeCloseTo(1, 10);
    expect(evaluateExpression('abs(-7)')).toBe(7);
    expect(evaluateExpression('exp(0)')).toBe(1);
  });

  it('menghitung faktorial dan persen', () => {
    expect(evaluateExpression('5!')).toBe(120);
    expect(evaluateExpression('50%')).toBe(0.5);
    expect(evaluateExpression('200 * 10%')).toBe(20);
  });

  it('membaca bilangan desimal dan notasi ilmiah', () => {
    expect(evaluateExpression('1.5 + .5')).toBe(2);
    expect(evaluateExpression('2e3')).toBe(2000);
  });

  it('melempar pesan untuk rumus tidak valid', () => {
    expect(() => evaluateExpression('')).toThrow();
    expect(() => evaluateExpression('2 +')).toThrow();
    expect(() => evaluateExpression('(1 + 2')).toThrow();
    expect(() => evaluateExpression('sin 30')).toThrow();
    expect(() => evaluateExpression('foo(2)')).toThrow();
    expect(() => evaluateExpression('2 $ 3')).toThrow();
  });
});

describe('formatResult', () => {
  it('membuang nol yang tidak perlu', () => {
    expect(formatResult(14)).toBe('14');
    expect(formatResult(2.5)).toBe('2.5');
    expect(formatResult(0)).toBe('0');
  });

  it('menangani nilai khusus', () => {
    expect(formatResult(Number.NaN)).toBe('Tidak terdefinisi');
    expect(formatResult(Number.POSITIVE_INFINITY)).toBe('Tak hingga');
  });

  it('memakai notasi ilmiah untuk angka sangat besar atau kecil', () => {
    expect(formatResult(1e13)).toContain('e+');
    expect(formatResult(0.0000001)).toContain('e-');
  });
});
