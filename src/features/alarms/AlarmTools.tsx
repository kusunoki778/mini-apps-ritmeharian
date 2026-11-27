import { ClockCounterClockwise, Timer as TimerIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { RingScreen } from '@/features/alarms/RingScreen';
import { startAlarmSound } from '@/features/alarms/alarm-sound';
import { useAlarmSoundId } from '@/features/settings/useSettings';
import { fullAlarmSupported, scheduleNativeTimer, cancelNativeTimer } from './native-alarm';

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((value) => String(value).padStart(2, '0')).join(':');
}

function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ClockCounterClockwise size={18} aria-hidden="true" /> Stopwatch
      </div>
      <p className="font-mono text-3xl tabular-nums">{formatDuration(elapsed)}</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-11 rounded-control bg-accent px-4 text-sm font-semibold text-paper"
          onClick={() => setRunning((value) => !value)}
        >
          {running ? 'Jeda' : 'Mulai'}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-control border border-line px-4 text-sm"
          onClick={() => {
            setRunning(false);
            setElapsed(0);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function Timer() {
  const soundId = useAlarmSoundId();
  const [minutes, setMinutes] = useState('5');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [ringing, setRinging] = useState(false);
  const stopSoundRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!running || remaining === null) return;
    const id = window.setInterval(() => {
      if (remaining <= 1) {
        setRemaining(0);
        setRunning(false);
        // Di dalam APK, alarm native yang berbunyi, jadi lapisan web diam supaya
        // nadanya tidak dobel.
        if (!fullAlarmSupported()) setRinging(true);
        return;
      }
      setRemaining(remaining - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    if (!ringing) return;

    stopSoundRef.current = startAlarmSound(soundId);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([300, 100, 300]);
    }

    return () => {
      stopSoundRef.current();
      stopSoundRef.current = () => {};
    };
  }, [ringing, soundId]);

  const start = () => {
    const value = Math.max(1, Number(minutes) || 0) * 60;
    const duration = remaining && remaining > 0 ? remaining : value;
    setRemaining(duration);
    setRunning(true);
    if (fullAlarmSupported())
      void scheduleNativeTimer(Date.now() + duration * 1000, 'Timer', soundId);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(null);
    setRinging(false);
    void cancelNativeTimer();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <TimerIcon size={18} aria-hidden="true" /> Timer
      </div>
      {remaining === null ? (
        <Input
          label="Menit"
          inputMode="numeric"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
        />
      ) : (
        <p className="font-mono text-3xl tabular-nums">{formatDuration(remaining)}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-11 rounded-control bg-accent px-4 text-sm font-semibold text-paper"
          onClick={start}
        >
          {running ? 'Lanjut' : 'Mulai'}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-control border border-line px-4 text-sm"
          onClick={reset}
        >
          Reset
        </button>
      </div>
      <p className="text-[13px] text-ink-muted">
        {fullAlarmSupported()
          ? 'Timer native tetap berbunyi saat Nadi tertutup.'
          : 'Timer web berjalan selama halaman terbuka.'}
      </p>

      {ringing ? (
        <RingScreen
          kind="Timer"
          time={formatDuration(0)}
          title="Waktu habis"
          onDismiss={() => {
            setRinging(false);
            setRemaining(null);
            void cancelNativeTimer();
          }}
          hint="Tekan Matikan untuk menghentikan bunyi."
        />
      ) : null}
    </div>
  );
}

export function AlarmTools() {
  return (
    <Card className="mt-6 grid gap-6 p-5 sm:grid-cols-2">
      <Stopwatch />
      <Timer />
    </Card>
  );
}
