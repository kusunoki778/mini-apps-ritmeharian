import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatClock } from '@/features/weather/weather-utils';
import { useNow } from '@/lib/hooks/useNow';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { currentHourIndex } from '@/lib/utils/hour-series';
import type { AirHourly } from './air-api';

interface AqiChartProps {
  hourly: AirHourly;
  color: string;
  label: string;
}

interface Point {
  time: string;
  label: string;
  value: number;
}

export default function AqiChart({ hourly, color, label }: AqiChartProps) {
  const reduced = usePrefersReducedMotion();
  const now = useNow(60_000);
  const start = currentHourIndex(hourly.time, now);

  const points: Point[] = hourly.time
    .slice(start, start + 24)
    .map((time, offset) => {
      const index = start + offset;
      return { time, label: formatClock(time), value: hourly.us_aqi[index] };
    })
    .filter((point) => Number.isFinite(point.value));

  if (points.length < 2) {
    return <p className="text-[13px] text-ink-muted">Grafik belum punya cukup data.</p>;
  }

  const values = points.map((point) => point.value);
  const min = Math.round(Math.min(...values));
  const max = Math.round(Math.max(...values));

  return (
    <div>
      <p className="sr-only">
        Grafik {label} 24 jam ke depan, terendah {min} dan tertinggi {max}.
      </p>

      <div aria-hidden="true" className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              interval={3}
              tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              width={40}
              tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip
              formatter={(value) => [Math.round(Number(value)), 'US AQI']}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                fontSize: 12,
                color: 'var(--ink)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill="url(#aqiFill)"
              isAnimationActive={!reduced}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-[13px] text-ink-muted">Lihat tabel 24 jam</summary>
        <div className="mt-2 max-h-40 overflow-y-auto">
          <table className="w-full text-[12px]">
            <caption className="sr-only">Nilai US AQI per jam</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left font-medium text-ink-muted">
                  Jam
                </th>
                <th scope="col" className="text-right font-medium text-ink-muted">
                  US AQI
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.time}>
                  <td className="py-0.5">{point.label}</td>
                  <td className="tabular py-0.5 text-right">{Math.round(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
