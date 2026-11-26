import { Capacitor } from '@capacitor/core';
import { useEffect, useRef, useState } from 'react';

import { startAlarmSound } from '@/features/alarms/alarm-sound';
import { RingScreen } from '@/features/alarms/RingScreen';
import type { CalendarEvent } from '@/lib/db/db';
import { markReminderFired, reminderTimeOf } from './events-repo';
import { useRemindersBetween } from './useEvents';

const CHECK_INTERVAL_MS = 1000;
const WINDOW_MS = 2 * 24 * 60 * 60 * 1000;
const SNOOZE_MS = 5 * 60 * 1000;
const GRACE_MS = 60_000;

const timeFormatter = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });

interface RingingState {
  id: string;
  title: string;
  at: number;
}

interface CalendarReminderEngineProps {
  soundFactory?: () => () => void;
  intervalMs?: number;
}

// Mesin pengingat agenda untuk web. Di dalam pembungkus native, penjadwalan
// ditangani lapisan Android, jadi komponen ini diam agar tidak dobel.
export function CalendarReminderEngine({
  soundFactory = startAlarmSound,
  intervalMs = CHECK_INTERVAL_MS,
}: CalendarReminderEngineProps) {
  const [from] = useState(() => Date.now());
  const events = useRemindersBetween(from, from + WINDOW_MS);
  const [ringing, setRinging] = useState<RingingState | null>(null);

  const ringingRef = useRef<RingingState | null>(null);
  const stopRef = useRef<() => void>(() => {});
  const firedRef = useRef<Map<string, number>>(new Map());
  const snoozeRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const list = events ?? [];

    const ring = (event: CalendarEvent, at: number) => {
      if (ringingRef.current) return;
      const state: RingingState = { id: event.id, title: event.title, at };
      ringingRef.current = state;
      firedRef.current.set(event.id, at);
      setRinging(state);
      stopRef.current = soundFactory();
    };

    const check = () => {
      if (ringingRef.current) return;
      const now = Date.now();

      for (const event of list) {
        const at = reminderTimeOf(event);
        if (at === null || event.reminderFiredAt === at) continue;

        const snoozeAt = snoozeRef.current.get(event.id);
        if (snoozeAt !== undefined) {
          if (now >= snoozeAt) {
            snoozeRef.current.delete(event.id);
            ring(event, snoozeAt);
          }
          continue;
        }

        if (now >= at && now - at < GRACE_MS && firedRef.current.get(event.id) !== at) {
          ring(event, at);
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
  }, [events, soundFactory, intervalMs]);

  useEffect(() => () => stopRef.current(), []);

  const dismiss = async () => {
    const state = ringingRef.current;
    if (!state) return;
    stopRef.current();
    ringingRef.current = null;
    setRinging(null);
    await markReminderFired(state.id, state.at);
  };

  const snooze = () => {
    const state = ringingRef.current;
    if (!state) return;
    stopRef.current();
    ringingRef.current = null;
    setRinging(null);
    snoozeRef.current.set(state.id, Date.now() + SNOOZE_MS);
  };

  if (!ringing) return null;

  return (
    <RingScreen
      kind="Agenda"
      time={timeFormatter.format(new Date(ringing.at))}
      title={ringing.title}
      snoozeLabel="Tunda 5 menit"
      onSnooze={snooze}
      onDismiss={() => void dismiss()}
    />
  );
}
