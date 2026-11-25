import { MapPin, SunHorizon } from '@phosphor-icons/react';

import { PageHeader } from '@/components/ui/PageHeader';
import { useLocationStore } from '@/features/location/location-store';
import { SOURCE_LABEL } from '@/features/location/types';
import { useNow } from '@/lib/hooks/useNow';
import { getGreeting } from '@/lib/utils/greeting';
import { DayLine } from './DayLine';
import { clockMinutes } from './day-line';
import { SAMPLE_AGENDA, SAMPLE_WEATHER } from './sample-data';
import { Stat } from './Stat';

export function ClockPanel() {
  const now = useNow();
  const location = useLocationStore((state) => state.location);

  const time = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now);
  const date = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const greeting = getGreeting(now.getHours());

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextEvent =
    SAMPLE_AGENDA.map((item) => ({ ...item, minutes: clockMinutes(item.time) })).find(
      (item) => item.minutes !== null && item.minutes > nowMinutes,
    ) ?? null;

  return (
    <section className="lg:col-span-7" aria-label="Jam dan garis hari">
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
        <Stat icon={<SunHorizon size={18} />} label="Matahari terbit" value={SAMPLE_WEATHER.sunrise} />
        <Stat icon={<SunHorizon size={18} />} label="Matahari terbenam" value={SAMPLE_WEATHER.sunset} />
      </div>

      <div className="mt-6">
        <DayLine
          now={now}
          sunrise={SAMPLE_WEATHER.sunrise}
          sunset={SAMPLE_WEATHER.sunset}
          nextEvent={nextEvent ? { title: nextEvent.title, time: nextEvent.time } : null}
        />
      </div>
    </section>
  );
}
