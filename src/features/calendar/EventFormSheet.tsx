import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { TextArea } from '@/components/ui/TextArea';
import { Toggle } from '@/components/ui/Toggle';
import { toast } from '@/components/ui/toast-store';
import type { CalendarEvent } from '@/lib/db/db';
import { toDateKey, toTimeInput } from './calendar-utils';
import { hasEventErrors, validateEvent, type EventErrors } from './event-validation';
import { createEvent, updateEvent, type EventInput } from './events-repo';

interface EventFormSheetProps {
  initialDate: string;
  event: CalendarEvent | null;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

function initialInput(event: CalendarEvent | null, initialDate: string): EventInput {
  if (!event) {
    return {
      title: '',
      date: initialDate,
      allDay: false,
      startTime: '09:00',
      endTime: '',
      note: '',
    };
  }

  return {
    title: event.title,
    date: toDateKey(new Date(event.start)),
    allDay: event.allDay,
    startTime: event.allDay ? '09:00' : toTimeInput(event.start),
    endTime: event.allDay || !event.end ? '' : toTimeInput(event.end),
    note: event.note ?? '',
  };
}

export function EventFormSheet({ initialDate, event, onClose, onSaved }: EventFormSheetProps) {
  const [input, setInput] = useState<EventInput>(() => initialInput(event, initialDate));
  const [errors, setErrors] = useState<EventErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<EventInput>) => setInput((current) => ({ ...current, ...patch }));

  const handleSave = async () => {
    const nextErrors = validateEvent(input);
    setErrors(nextErrors);
    if (hasEventErrors(nextErrors)) return;

    setSaving(true);
    try {
      if (event) {
        await updateEvent(event.id, input);
        onSaved?.(event.id);
        toast('Agenda diperbarui.', 'success');
      } else {
        const id = await createEvent(input);
        onSaved?.(id);
        toast('Agenda disimpan.', 'success');
      }
      onClose();
    } catch {
      toast('Agenda gagal disimpan.', 'error');
      setSaving(false);
    }
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={event ? 'Ubah agenda' : 'Agenda baru'}
      description="Judul dan tanggal wajib diisi. Waktu mulai dan selesai opsional."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button isLoading={saving} onClick={() => void handleSave()}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Judul"
          autoFocus
          value={input.title}
          onChange={(changeEvent) => update({ title: changeEvent.target.value })}
          error={errors.title}
        />

        <Input
          label="Tanggal"
          type="date"
          value={input.date}
          onChange={(changeEvent) => update({ date: changeEvent.target.value })}
          error={errors.date}
        />

        <Toggle
          checked={input.allDay}
          onChange={(checked) => update({ allDay: checked })}
          label="Sepanjang hari"
          description="Agenda tanpa jam tertentu."
        />

        {input.allDay ? null : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Mulai"
              type="time"
              value={input.startTime}
              onChange={(changeEvent) => update({ startTime: changeEvent.target.value })}
            />
            <Input
              label="Selesai"
              type="time"
              value={input.endTime}
              onChange={(changeEvent) => update({ endTime: changeEvent.target.value })}
              error={errors.endTime}
              hint={errors.endTime ? undefined : 'Opsional'}
            />
          </div>
        )}

        <TextArea
          label="Catatan"
          rows={3}
          value={input.note}
          onChange={(changeEvent) => update({ note: changeEvent.target.value })}
          hint="Opsional"
        />
      </div>
    </Sheet>
  );
}
