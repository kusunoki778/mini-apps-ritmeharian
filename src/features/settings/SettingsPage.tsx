import type { ReactNode } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import { LocationSetting } from '@/features/location/LocationSetting';
import { ThemeToggle } from './ThemeToggle';

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

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Pengaturan"
        title="Pengaturan"
        description="Tema dan lokasi aktif sekarang. Data dan preferensi lain menyusul di M8."
      />

      <div className="space-y-4">
        <Section title="Tampilan">
          <p className="mb-4 text-sm leading-relaxed text-ink-muted">
            Pilih tema. Opsi Sistem mengikuti pengaturan perangkat dan berubah otomatis saat
            perangkat berganti mode.
          </p>
          <ThemeToggle />
        </Section>

        <Section title="Lokasi">
          <LocationSetting />
        </Section>

        <Section title="Data">
          <p className="text-sm leading-relaxed text-ink-muted">
            Ekspor, impor, dan hapus data aktif di M8. Semua data akan tersimpan di perangkat, tanpa
            akun dan tanpa server.
          </p>
        </Section>

        <Section title="Atribusi data">
          <p className="text-sm leading-relaxed text-ink-muted">
            Cuaca, kualitas udara, dan nama kota berasal dari Open-Meteo. Data kualitas udara berisi
            data CAMS (Copernicus Atmosphere Monitoring Service). Penggunaan non-komersial.
          </p>
        </Section>

        <Section title="Tentang">
          <p className="text-sm leading-relaxed text-ink-muted">Nadi versi 0.1.0, milestone M7.</p>
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
