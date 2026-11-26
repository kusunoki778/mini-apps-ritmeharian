import { Sheet } from '@/components/ui/Sheet';
import { formatTemperature } from '@/lib/format/units';
import type { WeatherDaily } from './weather-api';
import { formatClock, formatDayLabel } from './weather-utils';
import { WeatherGlyph } from './WeatherGlyph';
import { describeWeather } from './wmo';

interface ForecastSheetProps {
  open: boolean;
  onClose: () => void;
  daily: WeatherDaily;
}

export function ForecastSheet({ open, onClose, daily }: ForecastSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Prakiraan 7 hari"
      description="Suhu minimum, maksimum, dan matahari terbit serta terbenam."
    >
      <ul className="divide-y divide-line">
        {daily.time.map((time, index) => (
          <li key={time} className="flex items-center gap-3 py-3">
            <span className="w-20 shrink-0 text-sm font-medium">
              {index === 0 ? 'Hari ini' : formatDayLabel(time)}
            </span>
            <WeatherGlyph
              code={daily.weather_code[index]}
              size={22}
              className="shrink-0 text-ink"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px]">
                {describeWeather(daily.weather_code[index]).label}
              </p>
              <p className="truncate text-[12px] text-ink-muted">
                Terbit {formatClock(daily.sunrise[index])} · Terbenam{' '}
                {formatClock(daily.sunset[index])}
              </p>
            </div>
            <span className="tabular shrink-0 text-sm">
              <span className="font-semibold">
                {formatTemperature(daily.temperature_2m_max[index])}
              </span>{' '}
              <span className="text-ink-muted">
                {formatTemperature(daily.temperature_2m_min[index])}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
