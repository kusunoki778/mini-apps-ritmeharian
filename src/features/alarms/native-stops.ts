import { db } from '@/lib/db/db';
import { markReminderFired } from '@/features/calendar/events-repo';
import { markTriggered } from './alarms-repo';
import type { NativeAlarmStop } from './native-alarm';

export const EVENT_ID_PREFIX = 'event:';
export const TIMER_ID = 'timer';

// Menyalin kejadian berhenti dari lapisan Android ke Dexie. Tanpa ini, alarm yang
// dimatikan dari notifikasi atau layar kunci tidak pernah ditandai, sehingga alarm
// sekali pakai tetap aktif dan pengingat agenda bisa berbunyi lagi.
export async function applyNativeStops(stops: NativeAlarmStop[]): Promise<void> {
  for (const stop of stops) {
    if (!stop.alarmId || !stop.at || stop.alarmId === TIMER_ID) continue;

    if (stop.alarmId.startsWith(EVENT_ID_PREFIX)) {
      await markReminderFired(stop.alarmId.slice(EVENT_ID_PREFIX.length), stop.at);
      continue;
    }

    const alarm = await db.alarms.get(stop.alarmId);
    if (!alarm) continue;

    // Alarm sekali pakai selesai setelah berbunyi; alarm berulang tetap aktif.
    await markTriggered(alarm.id, stop.at, alarm.days.length === 0);
  }
}
