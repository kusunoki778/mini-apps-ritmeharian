import { Drop, Wind } from '@phosphor-icons/react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { DayStrip } from './DayStrip';
import type { WeatherResult } from './weather-service';
import { formatUpdatedAt } from './weather-utils';
import { WeatherGlyph } from './WeatherGlyph';
import { describeWeather } from './wmo';

interface WeatherCardProps {
  result: WeatherResult | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenDetail: () => void;
}

export function WeatherCard({ result, isPending, isError, onRetry, onOpenDetail }: WeatherCardProps) {
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

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-ink-muted">{description.label}</p>
          <p className="tabular mt-1 text-4xl font-bold">{Math.round(current.temperature_2m)}°</p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Terasa {Math.round(current.apparent_temperature)}° · Tinggi{' '}
            {Math.round(daily.temperature_2m_max[0])}° · Rendah {Math.round(daily.temperature_2m_min[0])}°
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
