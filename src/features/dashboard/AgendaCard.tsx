import { ArrowRight, Plus } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { CalendarEvent } from '@/lib/db/db';
import { useNow } from '@/lib/hooks/useNow';
import { dayStart, formatEventTime, toDateKey } from '@/features/calendar/calendar-utils';
import { EventFormSheet } from '@/features/calendar/EventFormSheet';
import { useEventsBetween } from '@/features/calendar/useEvents';

export function AgendaCard() {
  const now = useNow(60_000);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  const range = useMemo(() => {
    const from = dayStart(now);
    const to = dayStart(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2));

    return { from, to };
  }, [now]);

  const events = useEventsBetween(range.from, range.to);

  const upcoming = useMemo(
    () =>
      (events ?? []).filter((event) => event.allDay || event.start >= now.getTime()).slice(0, 3),
    [events, now],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditing(event);
    setFormOpen(true);
  };

  return (
    <section aria-labelledby="agenda-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="agenda-heading" className="text-base font-semibold">
          Agenda terdekat
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={openCreate}>
            <Plus size={16} aria-hidden="true" />
            Tambah agenda
          </Button>
          <Link
            to="/catatan"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
          >
            Agenda <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {events === undefined ? (
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
      ) : upcoming.length === 0 ? (
        <Card className="p-5 text-sm leading-relaxed text-ink-muted">
          Belum ada agenda terdekat. Tambah satu agar harimu lebih tenang.
        </Card>
      ) : (
        <Card className="divide-y divide-line">
          <ul>
            {upcoming.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => openEdit(event)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left"
                >
                  <span className="tabular w-24 shrink-0 text-[13px] font-medium text-ink-muted">
                    {event.allDay ? 'Sepanjang hari' : formatEventTime(event)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{event.title}</span>
                    {event.note ? (
                      <span className="mt-0.5 block truncate text-[12px] text-ink-muted">
                        {event.note}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {formOpen ? (
        <EventFormSheet
          initialDate={toDateKey(now)}
          event={editing}
          onClose={() => setFormOpen(false)}
        />
      ) : null}
    </section>
  );
}
