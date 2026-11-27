import { Drop, Sun, Wind } from '@phosphor-icons/react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatTemperature } from '@/lib/format/units';
import { DayStrip } from './DayStrip';
import type { WeatherResult } from './weather-service';
import { comfortIndex, formatUpdatedAt, uvLevel } from './weather-utils';
import { WeatherGlyph } from './WeatherGlyph';
import { describeWeather } from './wmo';

interface WeatherCardProps {
  result: WeatherResult | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenDetail: () => void;
}

export function WeatherCard({
  result,
  isPending,
  isError,
  onRetry,
  onOpenDetail,
}: WeatherCardProps) {
  if (!result && isPending) {
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="size-14 rounded-full" />
        </div>
        <div className="mt-5 flex gap-2" aria-hidden="true">
          <Skeleton className="h-24 w-16" />
          <Skeleton className="h-24 w-16" />
          <Skeleton className="h-24 w-16" />
          <Skeleton className="h-24 w-16" />
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <ErrorState
        description={
          isError
            ? 'Data cuaca belum bisa dimuat dan belum ada salinan tersimpan.'
            : 'Data cuaca belum tersedia.'
        }
        onRetry={onRetry}
      />
    );
  }

  const { data, fetchedAt, stale } = result;
  const { current, hourly, daily } = data;
  const description = describeWeather(current.weather_code);
  const uv = current.uv_index ?? 0;
  const comfort = comfortIndex({
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    uvIndex: uv,
    precipitation: current.precipitation,
  });

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-ink-muted">{description.label}</p>
          <p className="tabular mt-1 text-4xl font-bold">
            {formatTemperature(current.temperature_2m)}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Terasa {formatTemperature(current.apparent_temperature)} · Tinggi{' '}
            {formatTemperature(daily.temperature_2m_max[0])} · Rendah{' '}
            {formatTemperature(daily.temperature_2m_min[0])}
          </p>
        </div>
        <WeatherGlyph
          code={current.weather_code}
          isDay={current.is_day === 1}
          size={56}
          className="shrink-0 text-accent"
        />
      </div>

      <div className="mt-5">
        <DayStrip hourly={hourly} sunrise={daily.sunrise} sunset={daily.sunset} />
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Drop size={18} aria-hidden="true" className="text-ink-muted" />
          <div className="leading-tight">
            <p className="text-[12px] text-ink-muted">Kelembapan</p>
            <p className="text-sm font-medium">{current.relative_humidity_2m}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind size={18} aria-hidden="true" className="text-ink-muted" />
          <div className="leading-tight">
            <p className="text-[12px] text-ink-muted">Angin</p>
            <p className="text-sm font-medium">{Math.round(current.wind_speed_10m)} km/j</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sun size={18} aria-hidden="true" className="text-ink-muted" />
          <div className="leading-tight">
            <p className="text-[12px] text-ink-muted">Sinar UV</p>
            <p className="text-sm font-medium">
              {uv} · {uvLevel(uv)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-control border border-line p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium">Indeks kenyamanan</p>
          <p className="text-sm font-semibold">
            {comfort.label} · {comfort.score}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent" style={{ width: `${comfort.score}%` }} />
        </div>
        <p className="mt-2 text-[12px] text-ink-muted">{comfort.advice}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-ink-muted">
          {stale ? `Data tersimpan · ${formatUpdatedAt(fetchedAt)}` : formatUpdatedAt(fetchedAt)}
        </p>
        <Button variant="secondary" size="sm" onClick={onOpenDetail}>
          Detail 7 hari
        </Button>
      </div>
    </Card>
  );
}
