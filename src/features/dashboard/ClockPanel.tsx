import { MapPin } from '@phosphor-icons/react';

import { PageHeader } from '@/components/ui/PageHeader';
import { dayEnd, dayStart, formatTime } from '@/features/calendar/calendar-utils';
import { useEventsBetween } from '@/features/calendar/useEvents';
import { useLocationStore } from '@/features/location/location-store';
import { SOURCE_LABEL } from '@/features/location/types';
import { useWeather } from '@/features/weather/useWeather';
import { formatClock } from '@/features/weather/weather-utils';
import { formatTimeOfDay } from '@/lib/format/time';
import { useNow } from '@/lib/hooks/useNow';
import { getGreeting } from '@/lib/utils/greeting';
import { DayLine } from './DayLine';
import { Stat } from './Stat';

export function ClockPanel() {
  const now = useNow();
  const location = useLocationStore((state) => state.location);
  const weather = useWeather(location.lat, location.lon);
  const dayEvents = useEventsBetween(dayStart(now), dayEnd(now));

  const time = formatTimeOfDay(now);
  const date = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const greeting = getGreeting(now.getHours());

  const today = weather.data?.data.daily;
  const sunrise = today?.sunrise[0] ? formatClock(today.sunrise[0]) : null;
  const sunset = today?.sunset[0] ? formatClock(today.sunset[0]) : null;

  const nextEvent =
    (dayEvents ?? []).find((event) => !event.allDay && event.start >= now.getTime()) ?? null;

  return (
    <section className="min-w-0 lg:col-span-7" aria-label="Jam dan garis hari">
      <PageHeader eyebrow={`${greeting}, ini ${location.name}`} title="Beranda" />

      <p className="tabular text-[clamp(4rem,17vw,8rem)] font-bold leading-none tracking-[-0.05em]">
        {time}
      </p>
      <p className="mt-3 text-[15px] text-ink-muted">{date}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Stat
          icon={<MapPin size={18} weight="fill" />}
          label={SOURCE_LABEL[location.source]}
          value={location.name}
        />
      </div>

      <div className="mt-6">
        <DayLine
          now={now}
          sunrise={sunrise}
          sunset={sunset}
          nextEvent={
            nextEvent ? { title: nextEvent.title, time: formatTime(nextEvent.start) } : null
          }
        />
      </div>
    </section>
  );
}
