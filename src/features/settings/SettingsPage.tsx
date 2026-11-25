import type { ReactNode } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import { ThemeToggle } from './ThemeToggle';

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const id = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section aria-labelledby={id} className="rounded-card border border-line bg-surface p-5 md:p-6">
      <h2 id={id} className="text-base font-semibold">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="M8"
        title="Pengaturan"
        description="Tema aktif sekarang. Lokasi, data, dan preferensi lain menyusul."
      />

      <div className="space-y-4">
        <Section title="Tampilan">
          <p className="mb-4">
            Pilih tema. Opsi Sistem mengikuti pengaturan perangkat dan berubah otomatis saat
            perangkat berganti mode.
          </p>
          <ThemeToggle />
        </Section>

        <Section title="Lokasi">
          <p>
            Pencarian kota dan izin lokasi aktif di M2. Sampai saat itu, cuaca dan kualitas udara
            belum bisa dimuat.
          </p>
        </Section>

        <Section title="Data">
          <p>
            Ekspor, impor, dan hapus data aktif di M8. Semua data akan tersimpan di perangkat,
            tanpa akun dan tanpa server.
          </p>
        </Section>

        <Section title="Tentang">
          <p>Nadi versi 0.1.0, milestone M1.</p>
          <p className="mt-2">
            Data cuaca dan kualitas udara oleh Open-Meteo, berisi data CAMS. Atribusi lengkap
            ditampilkan saat modul data aktif.
          </p>
        </Section>
      </div>
    </div>
  );
}
