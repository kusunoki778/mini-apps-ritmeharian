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
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import org.json.JSONObject;

// Layanan latar depan yang membunyikan alarm berulang dan menampilkan notifikasi
// layar penuh dengan tombol Tunda dan Matikan. Berjalan walau aplikasi tertutup.
//
// Ada tiga jalur berhenti supaya alarm tidak pernah berbunyi tanpa tombol:
// 1. Tombol di AlarmActivity (intent layar penuh).
// 2. Tombol di notifikasi.
// 3. Tombol di dalam aplikasi, yang membaca AlarmRinging lewat plugin.
// Sebagai jaring pengaman terakhir, alarm berhenti sendiri setelah BATAS_BUNYI.
public class AlarmService extends Service {

    static final String ACTION_START = "id.nadi.app.action.ALARM_START";
    static final String ACTION_SNOOZE = "id.nadi.app.action.ALARM_SNOOZE";
    static final String ACTION_STOP = "id.nadi.app.action.ALARM_STOP";

    static final String CHANNEL_ID = "nadi-alarm-full-v2";
    static final String EXTRA_SNOOZED = "snoozed";
    private static final int FALLBACK_NOTIFICATION_ID = 7001;
    private static final String TAG = "NadiAlarmService";

    // Alarm berbunyi paling lama 10 menit, lalu berhenti sendiri. Alarm bawaan sistem
    // juga berhenti sendiri, jadi perangkat tidak berbunyi tanpa henti.
    private static final long BATAS_BUNYI_MS = 10 * 60 * 1000L;
    private static final long DENYUT_MS = 20 * 1000L;

    private AlarmSound sound;
    private PowerManager.WakeLock wakeLock;
    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable denyut = new Runnable() {
        @Override
        public void run() {
            AlarmRinging.touch(AlarmService.this);
            handler.postDelayed(this, DENYUT_MS);
        }
    };

    private final Runnable batasBunyi = () -> {
        Log.w(TAG, "Batas waktu bunyi tercapai, alarm dihentikan.");
        stopWithRecord(this, false);
    };

    static void stop(Context context) {
        stopWithRecord(context, false);
    }

    // Hentikan layanan sekaligus catat kejadiannya untuk lapisan web. Catatan dipakai
    // agar alarm sekali pakai menjadi nonaktif dan pengingat agenda ditandai berbunyi.
    static void stopWithRecord(Context context, boolean snoozed) {
        JSONObject current = AlarmRinging.current(context);
        // Tunda tidak dicatat karena jadwal berikutnya sudah dipasang dan penyelarasan
        // ulang dari lapisan web akan membatalkannya.
        if (current != null && !snoozed) AlarmRinging.recordStop(context, current);
        AlarmRinging.clear(context);
        context.stopService(new Intent(context, AlarmService.class));
    }

    static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;

        NotificationChannel existing = manager.getNotificationChannel(CHANNEL_ID);
        if (existing != null) return;

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
        String action = intent == null ? null : intent.getAction();

        if (ACTION_STOP.equals(action)) {
            boolean snoozed = intent.getBooleanExtra(EXTRA_SNOOZED, false);
            stopWithRecord(this, snoozed);
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

        AlarmRinging.start(this, notificationId, triggerAt, label, alarmId, snoozeMinutes, soundId);

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

        // Jalur cadangan bila intent layar penuh ditolak atau notifikasi dimatikan:
        // coba buka layar alarm langsung. Bila sistem melarang, alarm tetap bisa
        // dihentikan dari tombol di dalam aplikasi.
        openAlarmScreen(intent, notificationId, triggerAt, label, alarmId, snoozeMinutes, soundId);

        handler.removeCallbacks(denyut);
        handler.postDelayed(denyut, DENYUT_MS);
        handler.removeCallbacks(batasBunyi);
        handler.postDelayed(batasBunyi, BATAS_BUNYI_MS);

        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacksAndMessages(null);
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
        boolean isTimer = "timer".equals(alarmId);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_alarm_notification)
                .setContentTitle(title)
                .setContentText(isTimer
                        ? "Waktu habis. Ketuk Matikan untuk menghentikan."
                        : "Waktunya bangun. Ketuk Matikan untuk menghentikan.")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(contentIntent)
                .setFullScreenIntent(fullScreenIntent, true)
                .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
                .setOngoing(true)
                .setAutoCancel(false)
                .setWhen(triggerAt)
                .setShowWhen(true)
                // Nada diputar sendiri. Tanpa ini, Android 7 ke bawah menambahkan nada
                // notifikasi bawaan sehingga terdengar dobel.
                .setDefaults(0)
                .setSound(null)
                .addAction(R.drawable.ic_alarm_notification, "Matikan",
                        actionIntent(notificationId, ACTION_STOP, label, alarmId, snoozeMinutes,
                                soundId, false));

        // Tunda hanya untuk alarm yang punya menit tunda. Timer tidak punya tunda, dan
        // tombol Tunda pada timer akan menjadwalkan ulang tepat di detik yang sama.
        if (snoozeMinutes > 0) {
            builder.addAction(R.drawable.ic_alarm_notification, "Tunda",
                    actionIntent(notificationId, ACTION_SNOOZE, label, alarmId, snoozeMinutes,
                            soundId, true));
        }

        return builder.build();
    }

    private PendingIntent actionIntent(int notificationId, String action, String label,
                                       String alarmId, int snoozeMinutes, String soundId,
                                       boolean snoozed) {
        Intent intent = new Intent(this, AlarmActionReceiver.class);
        intent.setAction(action);
        intent.putExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, notificationId);
        intent.putExtra(AlarmScheduler.EXTRA_LABEL, label);
        intent.putExtra(AlarmScheduler.EXTRA_ALARM_ID, alarmId);
        intent.putExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, snoozeMinutes);
        intent.putExtra(AlarmScheduler.EXTRA_SOUND_ID, soundId);
        intent.putExtra(EXTRA_SNOOZED, snoozed);
        int requestCode = notificationId * 10 + (ACTION_SNOOZE.equals(action) ? 1 : 2);
        return PendingIntent.getBroadcast(this, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // Membuka AlarmActivity tanpa menunggu intent layar penuh. Diabaikan bila sistem
    // melarang aktivitas dari latar belakang, karena masih ada tombol di aplikasi.
    private void openAlarmScreen(Intent source, int notificationId, long triggerAt, String label,
                                 String alarmId, int snoozeMinutes, String soundId) {
        try {
            Intent screen = new Intent(this, AlarmActivity.class);
            screen.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                    | Intent.FLAG_ACTIVITY_CLEAR_TOP
                    | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            screen.putExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, notificationId);
            screen.putExtra(AlarmScheduler.EXTRA_TRIGGER_AT, triggerAt);
            screen.putExtra(AlarmScheduler.EXTRA_LABEL, label);
            screen.putExtra(AlarmScheduler.EXTRA_ALARM_ID, alarmId);
            screen.putExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, snoozeMinutes);
            screen.putExtra(AlarmScheduler.EXTRA_SOUND_ID, soundId);
            startActivity(screen);
        } catch (RuntimeException error) {
            Log.w(TAG, "Layar alarm tidak bisa dibuka dari latar belakang", error);
        }
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
        wakeLock.acquire(BATAS_BUNYI_MS + 60_000L);
    }

    private void releaseWakeLock() {
        if (wakeLock == null) return;
        if (wakeLock.isHeld()) wakeLock.release();
        wakeLock = null;
    }
}
