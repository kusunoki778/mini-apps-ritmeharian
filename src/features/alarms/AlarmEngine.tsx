import { Capacitor } from '@capacitor/core';
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
  canSnooze: boolean;
}

interface AlarmEngineProps {
  soundFactory?: (soundId?: string) => () => void;
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
  const snoozeCountRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Di dalam pembungkus native, alarm ditangani layanan Android (bunyi, layar
    // penuh, tombol Matikan). Mesin web harus diam supaya nada tidak dobel dan
    // alarm tidak dianggap "terlewat" hanya karena halaman sempat tertutup.
    if (Capacitor.isNativePlatform()) return;

    const currentAlarms = alarms ?? [];

    const ring = (alarm: Alarm, at: number, fromSnooze = false) => {
      if (ringingRef.current) return;

      const count = fromSnooze ? (snoozeCountRef.current.get(alarm.id) ?? 0) : 0;
      if (!fromSnooze) snoozeCountRef.current.set(alarm.id, 0);
      const limit = alarm.snoozeLimit ?? 0;
      const state = { alarm, at, canSnooze: limit === 0 || count < limit };
      ringingRef.current = state;
      handledRef.current.set(alarm.id, at);
      if (!fromSnooze) snoozeCountRef.current.set(alarm.id, 0);
      setRinging(state);
      stopSoundRef.current = soundFactory(alarm.soundId);
      if (alarm.vibrate !== false && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([500, 300, 500, 300, 500]);
      }
      showAlarmNotification(alarm.label, formatAlarmTime(alarm.hour, alarm.minute));
    };

    const check = () => {
      if (ringingRef.current) return;

      const now = new Date();
      const nowMs = now.getTime();

      for (const alarm of currentAlarms) {
        if (!alarm.enabled) {
          snoozeUntilRef.current.delete(alarm.id);
          snoozeCountRef.current.delete(alarm.id);
          continue;
        }

        const snoozeAt = snoozeUntilRef.current.get(alarm.id);
        if (snoozeAt !== undefined) {
          if (nowMs >= snoozeAt) {
            snoozeUntilRef.current.delete(alarm.id);
            ring(alarm, snoozeAt, true);
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
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(0);
    ringingRef.current = null;
    snoozeCountRef.current.delete(state.alarm.id);
    setRinging(null);
    await markTriggered(state.alarm.id, state.at, state.alarm.days.length === 0);
  };

  const snooze = async () => {
    const state = ringingRef.current;
    if (!state) return;

    stopSoundRef.current();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(0);
    ringingRef.current = null;
    snoozeCountRef.current.set(
      state.alarm.id,
      (snoozeCountRef.current.get(state.alarm.id) ?? 0) + 1,
    );
    setRinging(null);
    await markTriggered(state.alarm.id, state.at, false);
    snoozeUntilRef.current.set(state.alarm.id, Date.now() + state.alarm.snoozeMinutes * 60_000);
  };

  if (!ringing) return null;

  const canSnooze = ringing.canSnooze;

  return (
    <RingScreen
      kind="Alarm"
      time={formatAlarmTime(ringing.alarm.hour, ringing.alarm.minute)}
      title={ringing.alarm.label}
      snoozeLabel={canSnooze ? `Tunda ${ringing.alarm.snoozeMinutes} menit` : undefined}
      onSnooze={canSnooze ? () => void snooze() : undefined}
      onDismiss={() => void dismiss()}
    />
  );
}
