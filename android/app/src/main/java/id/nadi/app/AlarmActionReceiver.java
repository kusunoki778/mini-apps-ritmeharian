package id.nadi.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

// Menangani tombol notifikasi dan tombol di layar alarm: Tunda dan Matikan.
// Keduanya berhenti lewat AlarmService supaya bunyi, wakelock, dan catatan alarm
// ditutup dengan rapi. Sebelumnya aksi apa pun otomatis menjadwalkan tunda, jadi
// tombol Matikan ikut menunda alarm.
public class AlarmActionReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        int notificationId = intent.getIntExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, 0);
        boolean snoozed = intent.getBooleanExtra("snoozed", false);

        int snoozeMinutes = intent.getIntExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, 5);
        boolean canSnooze = AlarmService.ACTION_SNOOZE.equals(action) && snoozed
                && snoozeMinutes > 0;

        if (canSnooze) {
            String label = intent.getStringExtra(AlarmScheduler.EXTRA_LABEL);
            String alarmId = intent.getStringExtra(AlarmScheduler.EXTRA_ALARM_ID);
            String soundId = intent.getStringExtra(AlarmScheduler.EXTRA_SOUND_ID);
            long triggerAt = System.currentTimeMillis() + snoozeMinutes * 60_000L;
            AlarmScheduler.schedule(context, notificationId, triggerAt, label, alarmId,
                    snoozeMinutes,
                    soundId == null ? AlarmScheduler.DEFAULT_SOUND_ID : soundId, true);
        }

        // PendingIntent.getBroadcast dengan FLAG_UPDATE_CURRENT dipakai bersama antar
        // alarm, jadi putaran ini selalu diakhiri dengan menghentikan layanan.
        AlarmService.stopWithRecord(context, canSnooze);
    }
}
