package id.nadi.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

// Menangani tombol notifikasi dan tombol di layar alarm: Tunda dan Matikan.
public class AlarmActionReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        int notificationId = intent.getIntExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, 0);

        if (AlarmService.ACTION_SNOOZE.equals(action)) {
            int snoozeMinutes = intent.getIntExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, 5);
            String label = intent.getStringExtra(AlarmScheduler.EXTRA_LABEL);
            String alarmId = intent.getStringExtra(AlarmScheduler.EXTRA_ALARM_ID);
            String soundId = intent.getStringExtra(AlarmScheduler.EXTRA_SOUND_ID);
            long triggerAt = System.currentTimeMillis() + snoozeMinutes * 60_000L;
            AlarmScheduler.schedule(context, notificationId, triggerAt, label, alarmId,
                    snoozeMinutes,
                    soundId == null ? AlarmScheduler.DEFAULT_SOUND_ID : soundId);
        }

        AlarmService.stop(context);
    }
}
