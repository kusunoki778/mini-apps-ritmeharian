import { Link } from 'react-router-dom';

import { useNow } from '@/lib/hooks/useNow';
import { getGreeting } from '@/lib/utils/greeting';

const MODULES = [
  { name: 'Cuaca', detail: 'Prakiraan saat ini, per jam, dan 7 hari', milestone: 'M3' },
  { name: 'Kualitas udara', detail: 'US AQI, polutan, dan saran singkat', milestone: 'M4' },
  { name: 'Catatan', detail: 'Catatan cepat dengan pencarian dan pin', milestone: 'M5' },
  { name: 'Kalender', detail: 'Agenda bulanan dan acara lokal', milestone: 'M6' },
  { name: 'Alarm', detail: 'Alarm selama aplikasi terbuka', milestone: 'M7' },
];

const READY = ['Shell dan navigasi', 'Token tema terang dan gelap', 'Routing lima halaman', 'Baseline PWA'];

export default function DashboardPage() {
  const now = useNow();
  const time = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now);
  const date = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const greeting = getGreeting(now.getHours());

  return (
    <div>
      <h1 className="sr-only">Beranda</h1>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <section className="lg:col-span-7">
          <p className="text-[13px] font-medium text-ink-muted">{greeting}</p>
          <p className="tabular mt-2 text-[clamp(4rem,16vw,7.5rem)] font-bold leading-none tracking-[-0.05em]">
            {time}
          </p>
          <p className="mt-3 text-[15px] text-ink-muted">{date}</p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Lokasi belum diatur.{' '}
            <Link to="/pengaturan" className="font-medium text-accent underline-offset-4 hover:underline">
              Atur lokasi
            </Link>
          </p>
        </section>

        <section className="lg:col-span-5">
          <div className="rounded-card border border-line bg-surface p-5 md:p-6">
            <p className="text-[13px] font-medium text-ink-muted">Status fondasi</p>
            <h2 className="mt-1 text-lg font-semibold">M0 aktif</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Fondasi sudah berjalan. Modul data masuk bertahap di milestone berikutnya.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {READY.map((item) => (
                <li key={item} className="flex items-center gap-2 text-ink-muted">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="modul-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="modul-heading" className="text-base font-semibold">
            Modul
          </h2>
          <p className="text-[13px] text-ink-muted">Belum aktif</p>
        </div>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {MODULES.map((module) => (
            <li key={module.name} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
              <span className="w-32 text-sm font-medium">{module.name}</span>
              <span className="flex-1 text-[13px] text-ink-muted">{module.detail}</span>
              <span className="rounded-full border border-line px-2.5 py-1 text-[12px] font-medium text-ink-muted">
                {module.milestone}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
