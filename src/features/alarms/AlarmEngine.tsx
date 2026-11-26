import { useEffect, useRef, useState } from 'react';

import type { Alarm } from '@/lib/db/db';
import { startAlarmSound } from './alarm-sound';
import { decideAlarm, formatAlarmTime } from './alarm-utils';
import { markTriggered } from './alarms-repo';
import { showAlarmNotification } from './notifications';
import { RingScreen } from './RingScreen';
import { useAlarms } from './useAlarms';

const CHECK_INTERVAL_MS = 1000;

interface RingingState {
  alarm: Alarm;
  at: number;
}

interface AlarmEngineProps {
  soundFactory?: () => () => void;
  intervalMs?: number;
}

export function AlarmEngine({
  soundFactory = startAlarmSound,
  intervalMs = CHECK_INTERVAL_MS,
}: AlarmEngineProps) {
  const alarms = useAlarms();
  const [ringing, setRinging] = useState<RingingState | null>(null);

  const ringingRef = useRef<RingingState | null>(null);
  const stopSoundRef = useRef<() => void>(() => {});
  const snoozeUntilRef = useRef<Map<string, number>>(new Map());
  const handledRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const currentAlarms = alarms ?? [];

    const ring = (alarm: Alarm, at: number) => {
      if (ringingRef.current) return;

      const state = { alarm, at };
      ringingRef.current = state;
      handledRef.current.set(alarm.id, at);
      setRinging(state);
      stopSoundRef.current = soundFactory();
      showAlarmNotification(alarm.label, formatAlarmTime(alarm.hour, alarm.minute));
    };

    const check = () => {
      if (ringingRef.current) return;

      const now = new Date();
      const nowMs = now.getTime();

      for (const alarm of currentAlarms) {
        if (!alarm.enabled) {
          snoozeUntilRef.current.delete(alarm.id);
          continue;
        }

        const snoozeAt = snoozeUntilRef.current.get(alarm.id);
        if (snoozeAt !== undefined) {
          if (nowMs >= snoozeAt) {
            snoozeUntilRef.current.delete(alarm.id);
            ring(alarm, snoozeAt);
          }
          continue;
        }

        const decision = decideAlarm(alarm, now);
        if (decision.type === 'ring') {
          ring(alarm, decision.at);
        } else if (decision.type === 'missed' && handledRef.current.get(alarm.id) !== decision.at) {
          handledRef.current.set(alarm.id, decision.at);
          void markTriggered(alarm.id, decision.at, alarm.days.length === 0);
        }
      }
    };

    const timer = window.setInterval(check, intervalMs);
    const initial = window.setTimeout(check, 0);
    document.addEventListener('visibilitychange', check);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(initial);
      document.removeEventListener('visibilitychange', check);
    };
  }, [alarms, soundFactory, intervalMs]);

  useEffect(() => () => stopSoundRef.current(), []);

  const dismiss = async () => {
    const state = ringingRef.current;
    if (!state) return;

    stopSoundRef.current();
    ringingRef.current = null;
    setRinging(null);
    await markTriggered(state.alarm.id, state.at, state.alarm.days.length === 0);
  };

  const snooze = async () => {
    const state = ringingRef.current;
    if (!state) return;

    stopSoundRef.current();
    ringingRef.current = null;
    setRinging(null);
    await markTriggered(state.alarm.id, state.at, false);
    snoozeUntilRef.current.set(state.alarm.id, Date.now() + state.alarm.snoozeMinutes * 60_000);
  };

  if (!ringing) return null;

  return (
    <RingScreen
      kind="Alarm"
      time={formatAlarmTime(ringing.alarm.hour, ringing.alarm.minute)}
      title={ringing.alarm.label}
      snoozeLabel={`Tunda ${ringing.alarm.snoozeMinutes} menit`}
      onSnooze={() => void snooze()}
      onDismiss={() => void dismiss()}
    />
  );
}
