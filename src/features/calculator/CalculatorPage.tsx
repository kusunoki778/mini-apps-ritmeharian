import { Calculator as CalculatorIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { SegmentedControl, type SegmentOption } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/utils/cn';
import { evaluateExpression, formatResult, type AngleMode } from './expression';

type Mode = 'ilmiah' | 'bmi';

const MODE_OPTIONS: SegmentOption<Mode>[] = [
  { value: 'ilmiah', label: 'Ilmiah' },
  { value: 'bmi', label: 'BMI' },
];

interface Key {
  label: string;
  insert?: string;
  ariaLabel?: string;
  tone?: 'accent' | 'function';
}

const FUNCTION_KEYS: Key[] = [
  { label: 'sin', insert: 'sin(', ariaLabel: 'sin (sinus)' },
  { label: 'cos', insert: 'cos(', ariaLabel: 'cos (cosinus)' },
  { label: 'tan', insert: 'tan(', ariaLabel: 'tan (tangen)' },
  { label: 'asin', insert: 'asin(', ariaLabel: 'asin (sinus invers)' },
  { label: 'acos', insert: 'acos(', ariaLabel: 'acos (cosinus invers)' },
  { label: 'atan', insert: 'atan(', ariaLabel: 'atan (tangen invers)' },
  { label: '√', insert: 'sqrt(', ariaLabel: '√ akar' },
  { label: '∛', insert: 'cbrt(', ariaLabel: '∛ akar pangkat tiga' },
  { label: 'log', insert: 'log(', ariaLabel: 'log (logaritma basis sepuluh)' },
  { label: 'ln', insert: 'ln(', ariaLabel: 'ln (logaritma natural)' },
  { label: 'abs', insert: 'abs(', ariaLabel: 'abs (nilai mutlak)' },
  { label: 'exp', insert: 'exp(', ariaLabel: 'exp (eksponen)' },
  { label: 'π', insert: 'π', ariaLabel: 'π pi' },
  { label: 'e', insert: 'e', ariaLabel: 'e (bilangan e)' },
  { label: 'x!', insert: '!', ariaLabel: 'x! faktorial' },
  { label: '%', insert: '%', ariaLabel: '% persen' },
];

const PAD_KEYS: Key[] = [
  { label: '(', insert: '(', ariaLabel: '( kurung buka' },
  { label: ')', insert: ')', ariaLabel: ') kurung tutup' },
  { label: '^', insert: '^', ariaLabel: '^ pangkat', tone: 'function' },
  { label: '⌫', ariaLabel: '⌫ hapus satu', tone: 'function' },
  { label: '7', insert: '7' },
  { label: '8', insert: '8' },
  { label: '9', insert: '9' },
  { label: '÷', insert: '/', ariaLabel: '÷ bagi', tone: 'function' },
  { label: '4', insert: '4' },
  { label: '5', insert: '5' },
  { label: '6', insert: '6' },
  { label: '×', insert: '*', ariaLabel: '× kali', tone: 'function' },
  { label: '1', insert: '1' },
  { label: '2', insert: '2' },
  { label: '3', insert: '3' },
  { label: '−', insert: '-', ariaLabel: '− kurang', tone: 'function' },
  { label: '0', insert: '0' },
  { label: '.', insert: '.', ariaLabel: '. titik desimal' },
  { label: 'C', ariaLabel: 'C bersihkan', tone: 'function' },
  { label: '+', insert: '+', ariaLabel: '+ tambah', tone: 'function' },
];

function scientificButtonClass(tone: Key['tone']) {
  return cn(
    'min-h-12 rounded-control border text-sm font-medium transition-colors',
    tone === 'function'
      ? 'border-line bg-paper text-ink hover:bg-accent-soft'
      : tone === 'accent'
        ? 'border-accent bg-accent text-paper'
        : 'border-line bg-surface text-ink hover:bg-accent-soft',
  );
}

function ScientificCalculator() {
  const [expression, setExpression] = useState('');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [history, setHistory] = useState<string[]>([]);

  const preview = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      return formatResult(evaluateExpression(expression, angleMode));
    } catch {
      return null;
    }
  }, [expression, angleMode]);

  const insert = (text: string) => setExpression((current) => current + text);
  const backspace = () => setExpression((current) => current.slice(0, -1));

  const evaluate = () => {
    if (!expression.trim()) return;
    try {
      const result = formatResult(evaluateExpression(expression, angleMode));
      setHistory((current) => [`${expression} = ${result}`, ...current].slice(0, 5));
      setExpression(result);
    } catch {
      setHistory((current) => [`${expression} (tidak valid)`, ...current].slice(0, 5));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-line bg-paper p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-ink-muted">Sudut</span>
          <div className="flex overflow-hidden rounded-control border border-line">
            {(['deg', 'rad'] as AngleMode[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={angleMode === option}
                onClick={() => setAngleMode(option)}
                className={cn(
                  'min-h-9 px-3 text-[13px] font-medium',
                  angleMode === option ? 'bg-accent text-paper' : 'bg-surface text-ink-muted',
                )}
              >
                {option === 'deg' ? 'Derajat' : 'Radian'}
              </button>
            ))}
          </div>
        </div>

        <input
          aria-label="Rumus"
          inputMode="text"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') evaluate();
          }}
          placeholder="contoh: 2 + 3 × sin(30)"
          className="mt-3 w-full bg-transparent text-right text-2xl font-semibold tabular-nums outline-none"
        />
        <p className="mt-1 min-h-6 text-right text-lg text-ink-muted tabular-nums">
          {preview === null ? '' : `= ${preview}`}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {FUNCTION_KEYS.map((key) => (
          <button
            key={key.label}
            type="button"
            aria-label={key.ariaLabel}
            onClick={() => key.insert && insert(key.insert)}
            className={scientificButtonClass('function')}
          >
            {key.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PAD_KEYS.map((key) => (
          <button
            key={key.label}
            type="button"
            aria-label={key.ariaLabel ?? key.label}
            onClick={() => {
              if (key.label === '⌫') backspace();
              else if (key.label === 'C') setExpression('');
              else if (key.insert) insert(key.insert);
            }}
            className={scientificButtonClass(key.tone)}
          >
            {key.label}
          </button>
        ))}
        <button
          type="button"
          aria-label="hitung"
          onClick={evaluate}
          className="col-span-4 min-h-12 rounded-control bg-accent text-sm font-semibold text-paper"
        >
          Hitung
        </button>
      </div>

      {history.length > 0 ? (
        <div className="rounded-card border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink-muted">Riwayat</span>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-[13px] font-medium text-accent hover:underline"
            >
              Bersihkan
            </button>
          </div>
          <ul className="space-y-1">
            {history.map((item, index) => (
              <li key={`${item}-${index}`} className="truncate text-sm tabular-nums text-ink-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function bmiCategory(bmi: number): { label: string; tone: string } {
  if (bmi < 18.5) return { label: 'Kurang berat', tone: 'text-sky-600' };
  if (bmi < 23) return { label: 'Normal', tone: 'text-emerald-600' };
  if (bmi < 25) return { label: 'Berlebih', tone: 'text-amber-600' };
  if (bmi < 30) return { label: 'Obesitas I', tone: 'text-orange-600' };
  return { label: 'Obesitas II', tone: 'text-danger' };
}

function BmiCalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const result = useMemo(() => {
    const h = Number(height) / 100;
    const w = Number(weight);
    if (!(h > 0) || !(w > 0)) return null;

    const bmi = w / (h * h);
    const healthyMin = 18.5 * h * h;
    const healthyMax = 22.9 * h * h;
    return { bmi, healthyMin, healthyMax };
  }, [height, weight]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Tinggi (cm)"
          inputMode="decimal"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
        />
        <Input
          label="Berat (kg)"
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
      </div>

      <div className="rounded-card border border-line bg-paper p-4">
        <p className="text-[13px] font-medium text-ink-muted">Indeks massa tubuh</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {result === null ? '--' : result.bmi.toFixed(1)}
        </p>
        {result ? (
          <>
            <p className={cn('mt-1 text-sm font-semibold', bmiCategory(result.bmi).tone)}>
              {bmiCategory(result.bmi).label}
            </p>
            <p className="mt-2 text-[13px] text-ink-muted">
              Berat sehat untuk tinggi ini sekitar {result.healthyMin.toFixed(1)} sampai{' '}
              {result.healthyMax.toFixed(1)} kg.
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">Isi tinggi dan berat badan.</p>
        )}
      </div>

      <p className="text-[13px] text-ink-muted">
        Kategori memakai ambang Asia (normal 18,5 sampai 22,9). Hasil bersifat panduan umum, bukan
        nasihat medis.
      </p>
    </div>
  );
}

export default function CalculatorPage() {
  const [mode, setMode] = useState<Mode>('ilmiah');

  return (
    <div>
      <PageHeader
        eyebrow="Kalkulator"
        title="Kalkulator"
        description="Hitung rumus ilmiah lengkap atau cek indeks massa tubuh."
        action={<CalculatorIcon size={28} aria-hidden="true" className="text-accent" />}
      />

      <div className="mb-5 max-w-md">
        <SegmentedControl
          label="Jenis kalkulator"
          value={mode}
          options={MODE_OPTIONS}
          onChange={setMode}
        />
      </div>

      <Card className="max-w-2xl p-4 md:p-5">
        {mode === 'ilmiah' ? <ScientificCalculator /> : <BmiCalculator />}
      </Card>

      <p className="mt-4 text-[13px] text-ink-muted">
        Gunakan tombol atau ketik langsung, lalu tekan Enter atau Hitung.
      </p>
    </div>
  );
}
