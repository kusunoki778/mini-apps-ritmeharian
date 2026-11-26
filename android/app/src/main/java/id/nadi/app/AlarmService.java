package id.nadi.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;

// Layanan latar depan yang membunyikan alarm berulang dan menampilkan notifikasi
// layar penuh dengan tombol Tunda dan Matikan. Berjalan walau aplikasi tertutup.
public class AlarmService extends Service {

    static final String ACTION_START = "id.nadi.app.action.ALARM_START";
    static final String ACTION_SNOOZE = "id.nadi.app.action.ALARM_SNOOZE";
    static final String ACTION_STOP = "id.nadi.app.action.ALARM_STOP";

    static final String CHANNEL_ID = "nadi-alarm-full-v2";
    private static final int FALLBACK_NOTIFICATION_ID = 7001;

    private AlarmSound sound;
    private PowerManager.WakeLock wakeLock;

    static void stop(Context context) {
        context.stopService(new Intent(context, AlarmService.class));
    }

    static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Alarm layar penuh",
                NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Alarm Nadi yang membangunkan layar dan berbunyi berulang.");
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[] {0, 800, 400, 800, 400, 800});
        // Nada diputar sendiri oleh AlarmSound agar bisa berganti dan berulang. Kanal
        // sengaja tanpa suara supaya tidak dobel dengan pemutar alarm.
        channel.setSound(null, null);

        manager.createNotificationChannel(channel);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }

        int notificationId = intent != null
                ? intent.getIntExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, FALLBACK_NOTIFICATION_ID)
                : FALLBACK_NOTIFICATION_ID;
        long triggerAt = intent != null
                ? intent.getLongExtra(AlarmScheduler.EXTRA_TRIGGER_AT, System.currentTimeMillis())
                : System.currentTimeMillis();
        String label = intent != null ? intent.getStringExtra(AlarmScheduler.EXTRA_LABEL) : null;
        String alarmId = intent != null ? intent.getStringExtra(AlarmScheduler.EXTRA_ALARM_ID) : "";
        int snoozeMinutes = intent != null
                ? intent.getIntExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, 5)
                : 5;
        String soundId = intent != null ? intent.getStringExtra(AlarmScheduler.EXTRA_SOUND_ID) : null;
        if (soundId == null) soundId = AlarmScheduler.DEFAULT_SOUND_ID;

        acquireWakeLock();
        startSound(soundId);
        Notification notification =
                buildNotification(label, triggerAt, alarmId, snoozeMinutes, notificationId, soundId);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(notificationId, notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(notificationId, notification);
        }

        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        releaseSound();
        releaseWakeLock();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private Notification buildNotification(String label, long triggerAt, String alarmId,
                                           int snoozeMinutes, int notificationId, String soundId) {
        Intent fullScreen = new Intent(this, AlarmActivity.class);
        fullScreen.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        fullScreen.putExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, notificationId);
        fullScreen.putExtra(AlarmScheduler.EXTRA_TRIGGER_AT, triggerAt);
        fullScreen.putExtra(AlarmScheduler.EXTRA_LABEL, label);
        fullScreen.putExtra(AlarmScheduler.EXTRA_ALARM_ID, alarmId);
        fullScreen.putExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, snoozeMinutes);
        fullScreen.putExtra(AlarmScheduler.EXTRA_SOUND_ID, soundId);
        PendingIntent fullScreenIntent = PendingIntent.getActivity(this, notificationId, fullScreen,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent content = new Intent(this, MainActivity.class);
        content.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(this, notificationId + 1, content,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String title = label == null || label.isEmpty() ? "Alarm" : label;

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_alarm_notification)
                .setContentTitle(title)
                .setContentText("Waktunya bangun")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(contentIntent)
                .setFullScreenIntent(fullScreenIntent, true)
                .setOngoing(true)
                .setAutoCancel(false)
                .setWhen(triggerAt)
                .setShowWhen(true)
                .addAction(0, "Tunda", actionIntent(notificationId, ACTION_SNOOZE, label, alarmId,
                        snoozeMinutes, soundId))
                .addAction(0, "Matikan", actionIntent(notificationId, ACTION_STOP, label, alarmId,
                        snoozeMinutes, soundId))
                .build();
    }

    private PendingIntent actionIntent(int notificationId, String action, String label,
                                       String alarmId, int snoozeMinutes, String soundId) {
        Intent intent = new Intent(this, AlarmActionReceiver.class);
        intent.setAction(action);
        intent.putExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, notificationId);
        intent.putExtra(AlarmScheduler.EXTRA_LABEL, label);
        intent.putExtra(AlarmScheduler.EXTRA_ALARM_ID, alarmId);
        intent.putExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, snoozeMinutes);
        intent.putExtra(AlarmScheduler.EXTRA_SOUND_ID, soundId);
        int requestCode = notificationId * 10 + (ACTION_SNOOZE.equals(action) ? 1 : 2);
        return PendingIntent.getBroadcast(this, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private void startSound(String soundId) {
        if (sound != null) return;
        sound = new AlarmSound(this);
        sound.start(soundId);
    }

    private void releaseSound() {
        if (sound == null) return;
        sound.stop();
        sound = null;
    }

    private void acquireWakeLock() {
        if (wakeLock != null) return;
        PowerManager manager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (manager == null) return;
        wakeLock = manager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "nadi:alarm");
        wakeLock.acquire(10 * 60 * 1000L);
    }

    private void releaseWakeLock() {
        if (wakeLock == null) return;
        if (wakeLock.isHeld()) wakeLock.release();
        wakeLock = null;
    }
}
