import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Sheet } from '@/components/ui/Sheet';
import { Toggle } from '@/components/ui/Toggle';
import { toast } from '@/components/ui/toast-store';
import { useAlarmSoundId } from '@/features/settings/useSettings';
import type { Alarm } from '@/lib/db/db';
import { cn } from '@/lib/utils/cn';
import { ensureAlarmPermissions } from './alarm-permissions';
import { nativeAlarmsSupported } from './alarm-scheduler';
import { ALARM_SOUNDS, isAlarmSoundId, type AlarmSoundId } from './alarm-sounds';
import { allDays, DAY_LABELS, DAY_ORDER, repeatModeFromDays, type RepeatMode } from './alarm-utils';
import { hasAlarmErrors, validateAlarm, type AlarmErrors } from './alarm-validation';
import {
  createAlarm,
  DEFAULT_SNOOZE_MINUTES,
  SNOOZE_OPTIONS,
  updateAlarm,
  type AlarmInput,
} from './alarms-repo';
import { requestNotificationPermission } from './notifications';

interface AlarmFormSheetProps {
  alarm: Alarm | null;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

const REPEAT_OPTIONS: Array<{ value: RepeatMode; label: string }> = [
  { value: 'once', label: 'Sekali' },
  { value: 'daily', label: 'Setiap hari' },
  { value: 'custom', label: 'Hari tertentu' },
];

function timeValue(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function initialInput(alarm: Alarm | null, defaultSoundId: AlarmSoundId): AlarmInput {
  if (!alarm) {
    return {
      label: '',
      time: '07:00',
      repeat: 'once',
      days: [],
      snoozeMinutes: DEFAULT_SNOOZE_MINUTES,
      enabled: true,
      soundId: defaultSoundId,
    };
  }

  return {
    label: alarm.label,
    time: timeValue(alarm.hour, alarm.minute),
    repeat: repeatModeFromDays(alarm.days),
    days: alarm.days,
    snoozeMinutes: alarm.snoozeMinutes,
    enabled: alarm.enabled,
    soundId: isAlarmSoundId(alarm.soundId) ? alarm.soundId : defaultSoundId,
  };
}

export function AlarmFormSheet({ alarm, onClose, onSaved }: AlarmFormSheetProps) {
  const defaultSoundId = useAlarmSoundId();
  const [input, setInput] = useState<AlarmInput>(() => initialInput(alarm, defaultSoundId));
  const [errors, setErrors] = useState<AlarmErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<AlarmInput>) => setInput((current) => ({ ...current, ...patch }));

  const changeRepeat = (repeat: RepeatMode) => {
    if (repeat === 'once') {
      update({ repeat, days: [] });
    } else if (repeat === 'daily') {
      update({ repeat, days: allDays() });
    } else {
      update({ repeat, days: input.days.length > 0 ? input.days : [] });
    }
  };

  const toggleDay = (day: number) => {
    const days = input.days.includes(day)
      ? input.days.filter((value) => value !== day)
      : [...input.days, day];
    update({ days });
  };

  const handleSave = async () => {
    const nextErrors = validateAlarm(input);
    setErrors(nextErrors);
    if (hasAlarmErrors(nextErrors)) return;

    setSaving(true);
    try {
      void requestNotificationPermission();
      if (input.enabled && nativeAlarmsSupported()) {
        void ensureAlarmPermissions();
      }
      if (alarm) {
        await updateAlarm(alarm.id, input);
        onSaved?.(alarm.id);
        toast('Alarm diperbarui.', 'success');
      } else {
        const id = await createAlarm(input);
        onSaved?.(id);
        toast('Alarm disimpan.', 'success');
      }
      onClose();
    } catch {
      toast('Alarm gagal disimpan.', 'error');
      setSaving(false);
    }
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={alarm ? 'Ubah alarm' : 'Alarm baru'}
      description={
        nativeAlarmsSupported()
          ? 'Waktu wajib diisi. Alarm berbunyi lewat sistem, bahkan saat Nadi tertutup.'
          : 'Waktu wajib diisi. Alarm berbunyi selama Nadi terbuka.'
      }
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
          label="Label"
          autoFocus
          placeholder="Bangun pagi"
          value={input.label}
          onChange={(event) => update({ label: event.target.value })}
          hint="Opsional"
        />

        <Input
          label="Waktu"
          type="time"
          value={input.time}
          onChange={(event) => update({ time: event.target.value })}
          error={errors.time}
        />

        <Select
          label="Ulangi"
          value={input.repeat}
          onChange={(event) => changeRepeat(event.target.value as RepeatMode)}
        >
          {REPEAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {input.repeat === 'custom' ? (
          <fieldset>
            <legend className="mb-1.5 block text-[13px] font-medium">Hari</legend>
            <div className="flex flex-wrap gap-2">
              {DAY_ORDER.map((day) => {
                const selected = input.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'min-h-9 min-w-11 rounded-control border px-3 text-[13px] font-medium transition-colors',
                      selected
                        ? 'border-accent bg-accent text-paper'
                        : 'border-line bg-surface text-ink-muted hover:bg-paper',
                    )}
                  >
                    {DAY_LABELS[day]}
                  </button>
                );
              })}
            </div>
            {errors.days ? <p className="mt-2 text-[13px] text-danger">{errors.days}</p> : null}
          </fieldset>
        ) : null}

        <Select
          label="Menit tunda"
          value={input.snoozeMinutes}
          onChange={(event) => update({ snoozeMinutes: Number(event.target.value) })}
        >
          {SNOOZE_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} menit
            </option>
          ))}
        </Select>

        <Select
          label="Nada dering"
          value={input.soundId}
          hint="Nada berbunyi saat alarm ini berdering."
          onChange={(event) => update({ soundId: event.target.value as AlarmSoundId })}
        >
          {ALARM_SOUNDS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>

        <Toggle
          checked={input.enabled}
          onChange={(checked) => update({ enabled: checked })}
          label="Aktifkan alarm"
          description="Alarm nonaktif tidak akan berbunyi."
        />
      </div>
    </Sheet>
  );
}
