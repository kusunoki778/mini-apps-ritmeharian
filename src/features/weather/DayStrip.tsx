import { useNow } from '@/lib/hooks/useNow';
import { formatTemperature } from '@/lib/format/units';
import type { WeatherHourly } from './weather-api';
import { currentHourIndex, formatClock, hourIsDaylight } from './weather-utils';
import { WeatherGlyph } from './WeatherGlyph';
import { describeWeather } from './wmo';

interface DayStripProps {
  hourly: WeatherHourly;
  sunrise: string[];
  sunset: string[];
}

const VISIBLE_HOURS = 12;

export function DayStrip({ hourly, sunrise, sunset }: DayStripProps) {
  const now = useNow(60_000);
  const start = currentHourIndex(hourly.time, now);
  const items = hourly.time.slice(start, start + VISIBLE_HOURS);

  return (
    <div
      role="region"
      aria-label="Prakiraan per jam"
      tabIndex={0}
      className="min-w-0 overflow-x-auto pb-1"
    >
      <ul className="flex gap-1.5">
        {items.map((time, offset) => {
          const index = start + offset;
          const temperature = hourly.temperature_2m[index];
          const code = hourly.weather_code[index];
          const precipitation = hourly.precipitation_probability[index];
          const isDay = hourIsDaylight(time, sunrise, sunset);
          const isCurrent = offset === 0;

          return (
            <li
              key={time}
              aria-current={isCurrent ? 'time' : undefined}
              // relative wajib: label sr-only memakai position absolute. Tanpa induk
              // berposisi, containing block-nya jatuh ke body dan label item terjauh
              // melebarkan lebar dokumen, sehingga seluruh Beranda ikut melar di WebView.
              className={`relative min-w-16 shrink-0 rounded-control border px-2 py-3 text-center text-[12px] ${
                isCurrent ? 'border-accent bg-accent-soft' : 'border-transparent bg-paper'
              }`}
            >
              <p className="text-ink-muted">{isCurrent ? 'Kini' : formatClock(time)}</p>
              <WeatherGlyph code={code} isDay={isDay} size={20} className="mx-auto my-1 text-ink" />
              <p className="tabular text-sm font-medium">{formatTemperature(temperature)}</p>
              <p className="mt-0.5 text-[11px] text-ink-muted" title="Peluang hujan">
                {precipitation}%
              </p>
              <span className="sr-only">{describeWeather(code).label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
