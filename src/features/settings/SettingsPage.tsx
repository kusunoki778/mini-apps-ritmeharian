import type { ReactNode } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import { SegmentedControl, type SegmentOption } from '@/components/ui/SegmentedControl';
import { LocationSetting } from '@/features/location/LocationSetting';
import type { ClockFormat, TemperatureUnit } from '@/lib/format/preferences';
import { DataSection } from './DataSection';
import { ThemeToggle } from './ThemeToggle';
import { useSettings } from './useSettings';
import type { WeekStart } from './week-start';

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section aria-labelledby={id} className="rounded-card border border-line bg-surface p-5 md:p-6">
      <h2 id={id} className="text-base font-semibold">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

const UNIT_OPTIONS: SegmentOption<TemperatureUnit>[] = [
  { value: 'celsius', label: 'Celsius' },
  { value: 'fahrenheit', label: 'Fahrenheit' },
];

const CLOCK_OPTIONS: SegmentOption<ClockFormat>[] = [
  { value: '24h', label: '24 jam' },
  { value: '12h', label: '12 jam' },
];

const WEEK_OPTIONS: SegmentOption<WeekStart>[] = [
  { value: 1, label: 'Senin' },
  { value: 0, label: 'Minggu' },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div>
      <PageHeader
        eyebrow="Pengaturan"
        title="Pengaturan"
        description="Tema, satuan, format jam, awal minggu, dan data. Semua tersimpan di perangkat ini."
      />

      <div className="space-y-4">
        <Section title="Tampilan">
          <p className="mb-4 text-sm leading-relaxed text-ink-muted">
            Pilih tema. Opsi Sistem mengikuti pengaturan perangkat dan berubah otomatis saat
            perangkat berganti mode.
          </p>
          <ThemeToggle />
        </Section>

        <Section title="Satuan dan format">
          <div className="space-y-4">
            <Field label="Satuan suhu">
              <SegmentedControl
                label="Satuan suhu"
                value={settings.temperatureUnit}
                options={UNIT_OPTIONS}
                onChange={(temperatureUnit) => updateSettings({ temperatureUnit })}
              />
            </Field>
            <Field label="Format jam">
              <SegmentedControl
                label="Format jam"
                value={settings.clockFormat}
                options={CLOCK_OPTIONS}
                onChange={(clockFormat) => updateSettings({ clockFormat })}
              />
            </Field>
            <Field label="Awal minggu">
              <SegmentedControl
                label="Awal minggu"
                value={settings.weekStart}
                options={WEEK_OPTIONS}
                onChange={(weekStart) => updateSettings({ weekStart })}
              />
            </Field>
          </div>
        </Section>

        <Section title="Lokasi">
          <LocationSetting />
        </Section>

        <Section title="Data">
          <DataSection />
        </Section>

        <Section title="Atribusi data">
          <p className="text-sm leading-relaxed text-ink-muted">
            Cuaca, kualitas udara, dan nama kota berasal dari Open-Meteo. Data kualitas udara berisi
            data CAMS (Copernicus Atmosphere Monitoring Service). Penggunaan non-komersial.
          </p>
        </Section>

        <Section title="Tentang">
          <p className="text-sm leading-relaxed text-ink-muted">Nadi versi 0.1.0, milestone M8.</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Alarm berbunyi selama Nadi terbuka. Alarm latar belakang memerlukan versi native.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Saran kualitas udara bersifat umum, bukan nasihat medis.
          </p>
        </Section>
      </div>
    </div>
  );
}
