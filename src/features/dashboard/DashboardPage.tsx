import {
  ArrowRight,
  Drop,
  MapPin,
  NotePencil,
  PushPin,
  SunHorizon,
  Wind,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

import { Banner } from '@/components/ui/Banner';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useNow } from '@/lib/hooks/useNow';
import { getGreeting } from '@/lib/utils/greeting';
import {
  SAMPLE_AGENDA,
  SAMPLE_AIR_QUALITY,
  SAMPLE_NOTES,
  SAMPLE_WEATHER,
} from './sample-data';

function usAqiTone(value: number): string {
  if (value <= 50) return 'text-emerald-600 dark:text-emerald-400';
  if (value <= 100) return 'text-amber-600 dark:text-amber-400';
  if (value <= 150) return 'text-orange-600 dark:text-orange-400';
  return 'text-danger';
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ink-muted" aria-hidden="true">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="text-[12px] text-ink-muted">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const now = useNow();
  const formatter = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const time = formatter.format(now);
  const date = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const greeting = getGreeting(now.getHours());

  return (
    <div>
      <PageHeader
        eyebrow={`${greeting}, ini ${SAMPLE_WEATHER.location}`}
        title="Beranda"
      />

      <Banner
        action={
          <Link
            to="/pengaturan"
            className="shrink-0 text-[13px] font-medium text-accent underline-offset-4 hover:underline"
          >
            Aktifkan data nyata
          </Link>
        }
      >
        Angka di halaman ini masih data contoh. Cuaca dan kualitas udara nyata aktif setelah lokasi
        diatur.
      </Banner>

      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <section className="lg:col-span-7" aria-label="Jam">
          <p className="tabular text-[clamp(4rem,17vw,8rem)] font-bold leading-none tracking-[-0.05em]">
            {time}
          </p>
          <p className="mt-3 text-[15px] text-ink-muted">{date}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Stat
              icon={<MapPin size={18} weight="fill" />}
              label="Lokasi contoh"
              value={SAMPLE_WEATHER.location}
            />
            <Stat icon={<SunHorizon size={18} />} label="Matahari terbit" value={SAMPLE_WEATHER.sunrise} />
            <Stat icon={<SunHorizon size={18} />} label="Matahari terbenam" value={SAMPLE_WEATHER.sunset} />
          </div>
        </section>

        <section className="lg:col-span-5" aria-label="Cuaca dan kualitas udara">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-ink-muted">{SAMPLE_WEATHER.condition}</p>
                <p className="tabular mt-1 text-4xl font-bold">{SAMPLE_WEATHER.temperature}°</p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Terasa {SAMPLE_WEATHER.feelsLike}° · Tinggi {SAMPLE_WEATHER.high}° · Rendah{' '}
                  {SAMPLE_WEATHER.low}°
                </p>
              </div>
            </div>

            <ul className="mt-5 grid grid-cols-4 gap-1">
              {SAMPLE_WEATHER.hours.slice(0, 4).map((hour) => (
                <li
                  key={hour.time}
                  className="rounded-control bg-paper px-2 py-3 text-center text-[12px]"
                >
                  <p className="text-ink-muted">{hour.time}</p>
                  <p className="tabular mt-1 text-sm font-medium">{hour.temperature}°</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{hour.precipitation}%</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              <Stat icon={<Drop size={18} />} label="Kelembapan" value={`${SAMPLE_WEATHER.humidity}%`} />
              <Stat icon={<Wind size={18} />} label="Angin" value={`${SAMPLE_WEATHER.windSpeed} km/j`} />
            </div>
          </Card>

          <Card className="mt-4 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-ink-muted">Kualitas udara (US AQI)</p>
                <p className={`tabular mt-1 text-3xl font-bold ${usAqiTone(SAMPLE_AIR_QUALITY.usAqi)}`}>
                  {SAMPLE_AIR_QUALITY.usAqi}
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {SAMPLE_AIR_QUALITY.category} · dominan {SAMPLE_AIR_QUALITY.dominantPollutant}
                </p>
              </div>
              <div className="text-right text-[12px] text-ink-muted">
                <p>PM2.5 {SAMPLE_AIR_QUALITY.pm25}</p>
                <p>PM10 {SAMPLE_AIR_QUALITY.pm10}</p>
                <p className="mt-1">{SAMPLE_AIR_QUALITY.updatedAt}</p>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="agenda-heading">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="agenda-heading" className="text-base font-semibold">
              Agenda hari ini
            </h2>
            <Link
              to="/kalender"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
            >
              Kalender <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <Card className="divide-y divide-line">
            {SAMPLE_AGENDA.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <span className="tabular w-14 text-sm font-medium">{item.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.location ? (
                    <p className="truncate text-[12px] text-ink-muted">{item.location}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </Card>
        </section>

        <section aria-labelledby="catatan-heading">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="catatan-heading" className="text-base font-semibold">
              Catatan terakhir
            </h2>
            <Link
              to="/catatan"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
            >
              Semua catatan <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <Card className="divide-y divide-line">
            {SAMPLE_NOTES.map((note) => (
              <div key={note.id} className="flex items-start gap-3 px-5 py-4">
                <NotePencil size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-muted" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{note.title}</span>
                    {note.pinned ? (
                      <PushPin size={13} weight="fill" aria-label="Disematkan" className="text-accent" />
                    ) : null}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-muted">{note.excerpt}</p>
                </div>
                <span className="shrink-0 text-[12px] text-ink-muted">{note.updatedAt}</span>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
