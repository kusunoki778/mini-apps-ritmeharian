import { Suspense, lazy } from 'react';

import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatUpdatedAt } from '@/features/weather/weather-utils';
import type { AirResult } from './air-service';
import { AqiBadge } from './AqiBadge';
import { AQI_DISCLAIMER, categorizeUsAqi } from './categories';

const AqiChart = lazy(() => import('./AqiChart'));

interface AqiCardProps {
  result: AirResult | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function AqiCard({ result, isPending, isError, onRetry }: AqiCardProps) {
  if (!result && isPending) {
    return (
      <Card className="p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-3 h-10 w-20" />
        <Skeleton className="mt-3 h-3 w-48" />
        <Skeleton className="mt-5 h-40 w-full" />
      </Card>
    );
  }

  if (!result) {
    return (
      <ErrorState
        description={
          isError
            ? 'Data kualitas udara belum bisa dimuat dan belum ada salinan tersimpan.'
            : 'Data kualitas udara belum tersedia.'
        }
        onRetry={onRetry}
      />
    );
  }

  const { data, fetchedAt, stale } = result;
  const { current, hourly } = data;
  const category = categorizeUsAqi(current.us_aqi);

  return (
    <Card className="p-5">
      <p className="text-[13px] font-medium text-ink-muted">Kualitas udara · US AQI</p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className="tabular text-3xl font-bold" style={{ color: category.color }}>
          {Math.round(current.us_aqi)}
        </p>
        <AqiBadge category={category} />
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{category.advice}</p>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
        <p>
          PM2.5 <span className="tabular font-medium">{current.pm2_5.toFixed(1)}</span>
        </p>
        <p>
          PM10 <span className="tabular font-medium">{current.pm10.toFixed(1)}</span>
        </p>
      </div>

      <div className="mt-4">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <AqiChart hourly={hourly} color={category.color} label={category.label} />
        </Suspense>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[12px] text-ink-muted">
          {stale ? `Data tersimpan · ${formatUpdatedAt(fetchedAt)}` : formatUpdatedAt(fetchedAt)}
        </p>
        <p className="text-[12px] text-ink-muted">{AQI_DISCLAIMER}</p>
        <p className="text-[12px] text-ink-muted">
          Sumber: Open-Meteo, berisi data CAMS (Copernicus).
        </p>
      </div>
    </Card>
  );
}
