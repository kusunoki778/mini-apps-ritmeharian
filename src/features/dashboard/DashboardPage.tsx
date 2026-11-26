import { ArrowRight, NotePencil, PushPin } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Banner } from '@/components/ui/Banner';
import { Card } from '@/components/ui/Card';
import { useLocationStore } from '@/features/location/location-store';
import { SOURCE_LABEL } from '@/features/location/types';
import { ForecastSheet } from '@/features/weather/ForecastSheet';
import { WeatherCard } from '@/features/weather/WeatherCard';
import { useWeather } from '@/features/weather/useWeather';
import { ClockPanel } from './ClockPanel';
import { SAMPLE_AGENDA, SAMPLE_AIR_QUALITY, SAMPLE_NOTES } from './sample-data';

function usAqiTone(value: number): string {
  if (value <= 50) return 'text-emerald-600 dark:text-emerald-400';
  if (value <= 100) return 'text-amber-600 dark:text-amber-400';
  if (value <= 150) return 'text-orange-600 dark:text-orange-400';
  return 'text-danger';
}

export default function DashboardPage() {
  const location = useLocationStore((state) => state.location);
  const weather = useWeather(location.lat, location.lon);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div>
      <Banner
        action={
          <Link
            to="/pengaturan"
            className="shrink-0 text-[13px] font-medium text-accent underline-offset-4 hover:underline"
          >
            Atur lokasi
          </Link>
        }
      >
        Cuaca sudah data nyata Open-Meteo untuk {location.name} ({SOURCE_LABEL[location.source]}).
        Kualitas udara masih data contoh sampai M4.
      </Banner>

      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <ClockPanel />

        <section className="min-w-0 lg:col-span-5" aria-label="Cuaca dan kualitas udara">
          <WeatherCard
            result={weather.data}
            isPending={weather.isPending}
            isError={weather.isError}
            onRetry={() => void weather.refetch()}
            onOpenDetail={() => setDetailOpen(true)}
          />

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

      {weather.data ? (
        <ForecastSheet
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          daily={weather.data.data.daily}
        />
      ) : null}
    </div>
  );
}
