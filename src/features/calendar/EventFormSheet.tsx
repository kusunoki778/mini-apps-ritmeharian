import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Sheet } from '@/components/ui/Sheet';
import { TextArea } from '@/components/ui/TextArea';
import { Toggle } from '@/components/ui/Toggle';
import { toast } from '@/components/ui/toast-store';
import { ALARM_SOUNDS, DEFAULT_ALARM_SOUND } from '@/features/alarms/alarm-sounds';
import type { CalendarEvent, EventRepeat } from '@/lib/db/db';
import { toDateKey, toTimeInput } from './calendar-utils';
import { hasEventErrors, validateEvent, type EventErrors } from './event-validation';
import { createEvent, updateEvent, type EventInput } from './events-repo';

interface EventFormSheetProps {
  initialDate: string;
  event: CalendarEvent | null;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

const REPEAT_OPTIONS: { value: EventRepeat; label: string }[] = [
  { value: 'none', label: 'Tidak berulang' },
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
];

const LEAD_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Tepat saat mulai' },
  { value: 5, label: '5 menit sebelum' },
  { value: 10, label: '10 menit sebelum' },
  { value: 15, label: '15 menit sebelum' },
  { value: 30, label: '30 menit sebelum' },
  { value: 60, label: '1 jam sebelum' },
  { value: 120, label: '2 jam sebelum' },
  { value: 1440, label: '1 hari sebelum' },
  { value: 2880, label: '2 hari sebelum' },
  { value: 10080, label: '1 minggu sebelum' },
];

function initialInput(event: CalendarEvent | null, initialDate: string): EventInput {
  if (!event) {
    return {
      title: '',
      date: initialDate,
      allDay: false,
      startTime: '09:00',
      endTime: '',
      repeat: 'none',
      note: '',
      reminderMinutes: null,
      reminderSoundId: DEFAULT_ALARM_SOUND,
    };
  }

  return {
    title: event.title,
    date: toDateKey(new Date(event.start)),
    allDay: event.allDay,
    startTime: event.allDay ? '09:00' : toTimeInput(event.start),
    endTime: event.allDay || !event.end ? '' : toTimeInput(event.end),
    repeat: event.repeat ?? 'none',
    note: event.note ?? '',
    reminderMinutes: event.reminderMinutes ?? null,
    reminderSoundId: event.reminderSoundId ?? DEFAULT_ALARM_SOUND,
  };
}

export function EventFormSheet({ initialDate, event, onClose, onSaved }: EventFormSheetProps) {
  const [input, setInput] = useState<EventInput>(() => initialInput(event, initialDate));
  const [errors, setErrors] = useState<EventErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<EventInput>) => setInput((current) => ({ ...current, ...patch }));
  const reminderOn = input.reminderMinutes !== null;

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

        <Select
          label="Ulangi"
          value={input.repeat}
          hint="Agenda berulang memakai jam yang sama."
          onChange={(changeEvent) => update({ repeat: changeEvent.target.value as EventRepeat })}
        >
          {REPEAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <TextArea
          label="Catatan"
          rows={3}
          value={input.note}
          onChange={(changeEvent) => update({ note: changeEvent.target.value })}
          hint="Opsional"
        />

        {input.allDay ? null : (
          <div className="rounded-control border border-line p-4">
            <Toggle
              checked={reminderOn}
              onChange={(checked) =>
                update({ reminderMinutes: checked ? (input.reminderMinutes ?? 0) : null })
              }
              label="Pasang nada dering"
              description="Agenda berbunyi seperti alarm saat waktunya, bukan cuma notifikasi."
            />
            {reminderOn ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Select
                  label="Kapan berbunyi"
                  value={String(input.reminderMinutes ?? 0)}
                  onChange={(changeEvent) =>
                    update({ reminderMinutes: Number(changeEvent.target.value) })
                  }
                >
                  {LEAD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Nada dering"
                  value={input.reminderSoundId}
                  onChange={(changeEvent) => update({ reminderSoundId: changeEvent.target.value })}
                >
                  {ALARM_SOUNDS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Sheet>
  );
}
