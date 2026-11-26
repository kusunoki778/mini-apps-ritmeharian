import { CaretRight, Ruler } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Banner } from '@/components/ui/Banner';
import { AqiCard } from '@/features/air/AqiCard';
import { useAirQuality } from '@/features/air/useAirQuality';
import { ApkInstallBanner } from '@/features/install/ApkInstallBanner';
import { useLocationStore } from '@/features/location/location-store';
import { ForecastSheet } from '@/features/weather/ForecastSheet';
import { WeatherCard } from '@/features/weather/WeatherCard';
import { useWeather } from '@/features/weather/useWeather';
import { AgendaCard } from './AgendaCard';
import { ClockPanel } from './ClockPanel';
import { NotesCard } from './NotesCard';

export default function DashboardPage() {
  const location = useLocationStore((state) => state.location);
  const weather = useWeather(location.lat, location.lon);
  const air = useAirQuality(location.lat, location.lon);
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
        Cuaca, kualitas udara, catatan, agenda, dan alarm sudah berjalan. Semua tersimpan di
        perangkat.
      </Banner>

      <div className="mt-6">
        <ApkInstallBanner />
      </div>

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

          <div className="mt-4">
            <AqiCard
              result={air.data}
              isPending={air.isPending}
              isError={air.isError}
              onRetry={() => void air.refetch()}
            />
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <AgendaCard />

        <NotesCard />
      </div>

      <Link
        to="/tumbuh-kembang"
        className="mt-8 flex items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:bg-paper"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Ruler size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Tinggi dan berat ideal</span>
            <span className="block text-[13px] text-ink-muted">
              Hitung menurut umur dan jenis kelamin.
            </span>
          </span>
        </span>
        <CaretRight size={18} aria-hidden="true" className="shrink-0 text-ink-muted" />
      </Link>

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
