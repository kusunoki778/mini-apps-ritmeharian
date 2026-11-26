import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { addMonths, isSameMonth, isToday } from 'date-fns';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { PageHeader } from '@/components/ui/PageHeader';
import { toast } from '@/components/ui/toast-store';
import type { CalendarEvent } from '@/lib/db/db';
import { readWeekStart, type WeekStart } from '@/features/settings/week-start';
import { cn } from '@/lib/utils/cn';
import {
  buildMonthGrid,
  fullDateLabel,
  groupByDayKey,
  monthLabel,
  monthRange,
  toDateKey,
  weekdayLabels,
} from './calendar-utils';
import { DeleteEventDialog } from './DeleteEventDialog';
import { DayPanel } from './DayPanel';
import { EventFormSheet } from './EventFormSheet';
import { deleteEvent } from './events-repo';
import { useEventsBetween } from './useEvents';

export default function CalendarPage() {
  const [weekStart] = useState<WeekStart>(() => readWeekStart());
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [initialDate, setInitialDate] = useState(() => toDateKey(new Date()));
  const [pendingDelete, setPendingDelete] = useState<CalendarEvent | null>(null);

  const range = useMemo(() => monthRange(month, weekStart), [month, weekStart]);
  const events = useEventsBetween(range.from, range.to);
  const grid = useMemo(() => buildMonthGrid(month, weekStart), [month, weekStart]);
  const grouped = useMemo(() => groupByDayKey(events ?? []), [events]);
  const labels = weekdayLabels(weekStart);

  const openCreate = (date: Date) => {
    setSelectedDay(null);
    setEditing(null);
    setInitialDate(toDateKey(date));
    setEditorOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setSelectedDay(null);
    setEditing(event);
    setInitialDate(toDateKey(new Date(event.start)));
    setEditorOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, title } = pendingDelete;
    await deleteEvent(id);
    setPendingDelete(null);
    toast(`Agenda "${title}" dihapus.`, 'success');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Kalender"
        title="Kalender"
        description="Agenda bulanan tersimpan di perangkat ini. Tekan tanggal untuk melihat dan menambah agenda."
      />

      <Card className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{monthLabel(month)}</h2>
          <div className="flex items-center gap-1">
            <IconButton
              label="Bulan sebelumnya"
              size="sm"
              onClick={() => setMonth((current) => addMonths(current, -1))}
            >
              <CaretLeft size={16} aria-hidden="true" />
            </IconButton>
            <Button variant="secondary" size="sm" onClick={() => setMonth(new Date())}>
              Hari ini
            </Button>
            <IconButton
              label="Bulan berikutnya"
              size="sm"
              onClick={() => setMonth((current) => addMonths(current, 1))}
            >
              <CaretRight size={16} aria-hidden="true" />
            </IconButton>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mt-4 grid grid-cols-7 gap-1 text-center text-[12px] text-ink-muted"
        >
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((day) => {
            const key = toDateKey(day);
            const dayEvents = grouped.get(key) ?? [];
            const inMonth = isSameMonth(day, month);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(day)}
                aria-label={fullDateLabel(day)}
                aria-current={isToday(day) ? 'date' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center gap-1 rounded-control p-1 transition-colors hover:bg-accent-soft',
                  !inMonth && 'text-ink-muted/60',
                )}
              >
                <span
                  className={cn(
                    'tabular flex size-7 items-center justify-center rounded-full text-sm',
                    isToday(day) && 'bg-accent font-bold text-paper',
                  )}
                >
                  {day.getDate()}
                </span>
                <span aria-hidden="true" className="flex h-1.5 items-center gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span key={event.id} className="size-1.5 rounded-full bg-accent" />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDay ? (
        <DayPanel
          date={selectedDay}
          events={grouped.get(toDateKey(selectedDay)) ?? []}
          onClose={() => setSelectedDay(null)}
          onAdd={() => openCreate(selectedDay)}
          onEdit={openEdit}
          onDelete={setPendingDelete}
        />
      ) : null}

      {editorOpen ? (
        <EventFormSheet
          initialDate={initialDate}
          event={editing}
          onClose={() => setEditorOpen(false)}
        />
      ) : null}

      <DeleteEventDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete?.title ?? ''}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
