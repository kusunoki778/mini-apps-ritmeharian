import { Ruler, Scales } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { Banner } from '@/components/ui/Banner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/utils/cn';
import {
  ADULT_AGE_YEARS,
  computeGrowth,
  type GrowthProfile,
  type GrowthResult,
  type GrowthSex,
  type StatusBand,
} from './growth-calc';

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

const TONE_CLASS: Record<StatusBand['tone'], string> = {
  normal: 'border border-line bg-surface text-ink',
  caution: 'bg-accent-soft text-ink',
  warn: 'bg-danger-soft text-danger',
};

function Stat({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string;
  unit: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[13px] font-medium text-ink-muted">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="tabular text-3xl font-bold tracking-tight">{value}</span>
        <span className="text-sm text-ink-muted">{unit}</span>
      </p>
      {hint ? <p className="mt-1 text-[13px] text-ink-muted">{hint}</p> : null}
    </div>
  );
}

function StatusChip({ title, band, z }: { title: string; band: StatusBand; z?: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-ink-muted">{title}</span>
      <span
        className={cn('rounded-full px-3 py-1 text-[13px] font-semibold', TONE_CLASS[band.tone])}
      >
        {band.label}
        {z !== undefined ? ` · z ${formatNumber(z, 2)}` : ''}
      </span>
    </div>
  );
}

function AgeResult({ result }: { result: GrowthResult }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {result.idealHeightCm !== undefined ? (
          <Stat
            label="Tinggi ideal"
            value={formatNumber(result.idealHeightCm)}
            unit="cm"
            hint="Median tinggi menurut umur."
          />
        ) : null}
        <Stat
          label="Berat ideal"
          value={formatNumber(result.idealWeightKg)}
          unit="kg"
          hint={result.mode === 'child' ? 'Dari IMT median untuk umur.' : 'Rumus Devine.'}
        />
      </div>

      <div className="rounded-card border border-line bg-paper px-4 py-3">
        <p className="text-[13px] text-ink-muted">
          Rentang berat {result.mode === 'child' ? 'gizi baik' : 'sehat'}
        </p>
        <p className="mt-1 text-lg font-semibold tabular">
          {formatNumber(result.healthyMinKg)} sampai {formatNumber(result.healthyMaxKg)} kg
        </p>
      </div>

      {result.heightStatus || result.weightStatus ? (
        <div className="space-y-3 border-t border-line pt-4">
          {result.heightStatus ? (
            <StatusChip title="Tinggi menurut umur" band={result.heightStatus} z={result.heightZ} />
          ) : null}
          {result.weightStatus ? (
            <StatusChip
              title={result.mode === 'child' ? 'Status gizi (IMT/U)' : 'Indeks massa tubuh'}
              band={result.weightStatus}
              z={result.weightZ}
            />
          ) : null}
          {result.bmi !== undefined ? (
            <p className="text-[13px] text-ink-muted">IMT: {formatNumber(result.bmi)} kg/m²</p>
          ) : null}
        </div>
      ) : (
        <p className="border-t border-line pt-4 text-[13px] text-ink-muted">
          Isi tinggi dan berat badan untuk melihat status gizi.
        </p>
      )}
    </div>
  );
}

export default function GrowthPage() {
  const [sex, setSex] = useState<GrowthSex>('male');
  const [ageText, setAgeText] = useState('30');
  const [heightText, setHeightText] = useState('');
  const [weightText, setWeightText] = useState('');

  const ageYears = parseNumber(ageText);
  const heightCm = parseNumber(heightText);
  const weightKg = parseNumber(weightText);

  const result = useMemo<GrowthResult | null>(() => {
    if (ageYears === null || ageYears < 0) return null;

    if (ageYears < ADULT_AGE_YEARS) {
      const profile: GrowthProfile = {
        mode: 'child',
        sex,
        ageMonths: ageYears * 12,
        heightCm: heightCm ?? undefined,
        weightKg: weightKg ?? undefined,
      };
      return computeGrowth(profile);
    }

    if (heightCm === null) return null;
    return computeGrowth({
      mode: 'adult',
      sex,
      ageYears,
      heightCm,
      weightKg: weightKg ?? undefined,
    });
  }, [ageYears, sex, heightCm, weightKg]);

  const isChild = ageYears !== null && ageYears < ADULT_AGE_YEARS;
  const needsHeight = ageYears !== null && ageYears >= ADULT_AGE_YEARS && heightCm === null;

  return (
    <div>
      <PageHeader
        eyebrow="Tumbuh kembang"
        title="Tinggi dan berat ideal"
        description="Hitung tinggi dan berat badan ideal menurut umur, jenis kelamin, dan tinggi badan."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-5">
          <SegmentedControl
            label="Jenis kelamin"
            value={sex}
            onChange={setSex}
            options={[
              { value: 'male', label: 'Laki-laki' },
              { value: 'female', label: 'Perempuan' },
            ]}
          />

          <Input
            label="Umur (tahun)"
            inputMode="decimal"
            placeholder="30"
            value={ageText}
            onChange={(event) => setAgeText(event.target.value)}
            hint={`Masukkan desimal untuk balita, misalnya 0,5. Di bawah ${ADULT_AGE_YEARS} tahun memakai tabel pertumbuhan WHO.`}
          />

          <Input
            label="Tinggi badan (cm)"
            inputMode="decimal"
            placeholder="170"
            value={heightText}
            onChange={(event) => setHeightText(event.target.value)}
            hint={
              isChild
                ? 'Opsional, untuk menilai tinggi menurut umur.'
                : 'Wajib untuk menghitung berat ideal.'
            }
          />

          <Input
            label="Berat badan (kg)"
            inputMode="decimal"
            placeholder="60"
            value={weightText}
            onChange={(event) => setWeightText(event.target.value)}
            hint="Opsional, untuk melihat status gizi."
          />
        </Card>

        <Card className="p-5">
          {needsHeight ? (
            <p className="text-sm text-ink-muted">
              Isi tinggi badan untuk menghitung berat ideal pada dewasa.
            </p>
          ) : result ? (
            <AgeResult result={result} />
          ) : (
            <p className="text-sm text-ink-muted">Masukkan umur untuk mulai menghitung.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        {result?.outOfRange ? (
          <Banner variant="warning">
            Umur di atas jangkauan tabel pertumbuhan. Angka ditampilkan dari batas tabel terdekat.
          </Banner>
        ) : null}

        <div className="flex items-start gap-3 rounded-card border border-line bg-surface px-4 py-3 text-[13px] text-ink-muted">
          <Ruler size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p>
            Anak dan remaja 0 sampai 19 tahun memakai WHO Child Growth Standards dan WHO Growth
            Reference, dengan ambang status sesuai Permenkes No. 2 Tahun 2020. Dewasa memakai rumus
            Devine dan rentang IMT sehat WHO. Hasil ini panduan umum, bukan nasihat medis.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-card border border-line bg-surface px-4 py-3 text-[13px] text-ink-muted">
          <Scales size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p>
            Untuk orang Asia, titik potong IMT bergeser: berisiko mulai 23, obesitas mulai 25.
            Klasifikasi IMT/U anak memakai ambang Kemenkes. Data tabel disimpan di perangkat tanpa
            perlu internet.
          </p>
        </div>
      </div>
    </div>
  );
}
