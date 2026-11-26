import { clockFraction, dayFraction } from './day-line';

interface DayLineProps {
  now: Date;
  sunrise?: string | null;
  sunset?: string | null;
  nextEvent?: { title: string; time: string } | null;
}

function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(2)}%`;
}

export function DayLine({ now, sunrise, sunset, nextEvent }: DayLineProps) {
  const fraction = dayFraction(now);
  const visibleFraction = Math.min(0.995, Math.max(0.005, fraction));
  const sunriseFraction = sunrise ? clockFraction(sunrise) : null;
  const sunsetFraction = sunset ? clockFraction(sunset) : null;

  const summary = [
    `${Math.round(fraction * 100)} persen hari berjalan.`,
    sunrise && sunset ? `Matahari terbit ${sunrise}, terbenam ${sunset}.` : '',
    nextEvent
      ? `Agenda berikutnya ${nextEvent.title} pukul ${nextEvent.time}.`
      : 'Tidak ada agenda lagi hari ini.',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section aria-label="Garis hari">
      <div role="img" aria-label={summary} className="px-1.5">
        <div aria-hidden="true" className="relative h-2 rounded-full bg-line">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent/30"
            style={{ width: percent(fraction) }}
          />

          {sunriseFraction !== null ? (
            <span
              className="absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-muted/60"
              style={{ left: percent(sunriseFraction) }}
            />
          ) : null}

          {sunsetFraction !== null ? (
            <span
              className="absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-muted/60"
              style={{ left: percent(sunsetFraction) }}
            />
          ) : null}

          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-accent shadow-sm"
            style={{ left: percent(visibleFraction) }}
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-ink-muted"
      >
        {sunrise ? <span>Terbit {sunrise}</span> : <span />}
        <span className="text-ink">
          {nextEvent ? `Berikutnya ${nextEvent.time} · ${nextEvent.title}` : 'Tidak ada agenda lagi'}
        </span>
        {sunset ? <span>Terbenam {sunset}</span> : <span />}
      </div>
    </section>
  );
}
