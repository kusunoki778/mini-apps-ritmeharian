package id.nadi.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

// Menjadwalkan alarm pasti ke AlarmManager dan menyimpannya agar bisa dipulihkan
// setelah reboot. Dipakai plugin NativeAlarm (Tier 2: alarm layar penuh).
final class AlarmScheduler {

    static final String EXTRA_NOTIFICATION_ID = "notificationId";
    static final String EXTRA_TRIGGER_AT = "triggerAt";
    static final String EXTRA_LABEL = "label";
    static final String EXTRA_ALARM_ID = "alarmId";
    static final String EXTRA_SNOOZE_MINUTES = "snoozeMinutes";
    static final String EXTRA_SOUND_ID = "soundId";
    static final String DEFAULT_SOUND_ID = "nadi";
    static final int TIMER_ID = 2147483001;

    private static final String PREFS = "nadi_alarm_store";
    private static final String KEY = "scheduled";

    private AlarmScheduler() {}

    static void schedule(Context context, int notificationId, long triggerAt, String label,
                         String alarmId, int snoozeMinutes, String soundId) {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null) return;

        PendingIntent intent = pendingIntent(context, notificationId, triggerAt, label, alarmId,
                snoozeMinutes, soundId);

        boolean canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S
                || manager.canScheduleExactAlarms();

        if (notificationId != TIMER_ID && canExact) {
            // Alarm diperlakukan seperti jam bawaan sistem: pasti, lolos mode hemat daya,
            // dan boleh menyalakan layanan latar depan walau aplikasi tertutup. Sistem
            // juga menampilkannya di info alarm berikutnya.
            manager.setAlarmClock(alarmClockInfo(context, notificationId, triggerAt), intent);
        } else if (canExact) {
            manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, intent);
        } else {
            // Izin alarm pasti belum diberikan. Pakai alarm tidak pasti agar tetap berbunyi.
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, intent);
        }

        persist(context, notificationId, triggerAt, label, alarmId, snoozeMinutes, soundId);
    }

    // Info untuk setAlarmClock: intent yang membuka aplikasi saat pengguna menekan
    // penanda alarm berikutnya di sistem. Memakai ulang intent yang sama dengan
    // konten notifikasi alarm.
    private static AlarmManager.AlarmClockInfo alarmClockInfo(Context context, int notificationId,
                                                              long triggerAt) {
        Intent show = new Intent(context, MainActivity.class);
        show.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent showIntent = PendingIntent.getActivity(context, notificationId + 1, show,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new AlarmManager.AlarmClockInfo(triggerAt, showIntent);
    }

    static void cancel(Context context, int notificationId) {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager != null) {
            PendingIntent pending = PendingIntent.getBroadcast(context, notificationId,
                    new Intent(context, AlarmReceiver.class),
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
            if (pending != null) {
                manager.cancel(pending);
                pending.cancel();
            }
        }
        remove(context, notificationId);
    }

    static void cancelAll(Context context) {
        JSONArray stored = read(context);
        for (int index = 0; index < stored.length(); index += 1) {
            JSONObject item = stored.optJSONObject(index);
            if (item != null && item.optInt(EXTRA_NOTIFICATION_ID, 0) != TIMER_ID) {
                cancel(context, item.optInt(EXTRA_NOTIFICATION_ID, 0));
            }
        }
    }

    // Dipakai setelah reboot untuk memasang ulang alarm yang masih di masa depan.
    static void rescheduleAll(Context context) {
        JSONArray stored = read(context);
        long now = System.currentTimeMillis();
        for (int index = 0; index < stored.length(); index += 1) {
            JSONObject item = stored.optJSONObject(index);
            if (item == null) continue;
            long triggerAt = item.optLong(EXTRA_TRIGGER_AT, 0);
            if (triggerAt <= now) continue;
            schedule(context, item.optInt(EXTRA_NOTIFICATION_ID, 0), triggerAt,
                    item.optString(EXTRA_LABEL, "Alarm"), item.optString(EXTRA_ALARM_ID, ""),
                    item.optInt(EXTRA_SNOOZE_MINUTES, 5),
                    item.optString(EXTRA_SOUND_ID, DEFAULT_SOUND_ID));
        }
    }

    private static PendingIntent pendingIntent(Context context, int notificationId, long triggerAt,
                                               String label, String alarmId, int snoozeMinutes,
                                               String soundId) {
        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.putExtra(EXTRA_NOTIFICATION_ID, notificationId);
        intent.putExtra(EXTRA_TRIGGER_AT, triggerAt);
        intent.putExtra(EXTRA_LABEL, label);
        intent.putExtra(EXTRA_ALARM_ID, alarmId);
        intent.putExtra(EXTRA_SNOOZE_MINUTES, snoozeMinutes);
        intent.putExtra(EXTRA_SOUND_ID, soundId);
        return PendingIntent.getBroadcast(context, notificationId, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static synchronized void persist(Context context, int notificationId, long triggerAt,
                                             String label, String alarmId, int snoozeMinutes,
                                             String soundId) {
        JSONArray next = new JSONArray();
        JSONArray stored = read(context);
        for (int index = 0; index < stored.length(); index += 1) {
            JSONObject item = stored.optJSONObject(index);
            if (item != null && item.optInt(EXTRA_NOTIFICATION_ID, 0) != notificationId) {
                next.put(item);
            }
        }

        JSONObject entry = new JSONObject();
        try {
            entry.put(EXTRA_NOTIFICATION_ID, notificationId);
            entry.put(EXTRA_TRIGGER_AT, triggerAt);
            entry.put(EXTRA_LABEL, label);
            entry.put(EXTRA_ALARM_ID, alarmId);
            entry.put(EXTRA_SNOOZE_MINUTES, snoozeMinutes);
            entry.put(EXTRA_SOUND_ID, soundId);
        } catch (JSONException ignored) {
            return;
        }
        next.put(entry);
        prefs(context).edit().putString(KEY, next.toString()).apply();
    }

    private static synchronized void remove(Context context, int notificationId) {
        JSONArray next = new JSONArray();
        JSONArray stored = read(context);
        for (int index = 0; index < stored.length(); index += 1) {
            JSONObject item = stored.optJSONObject(index);
            if (item != null && item.optInt(EXTRA_NOTIFICATION_ID, 0) != notificationId) {
                next.put(item);
            }
        }
        prefs(context).edit().putString(KEY, next.toString()).apply();
    }

    private static synchronized void clear(Context context) {
        prefs(context).edit().remove(KEY).apply();
    }

    private static JSONArray read(Context context) {
        String raw = prefs(context).getString(KEY, "[]");
        try {
            return new JSONArray(raw == null ? "[]" : raw);
        } catch (JSONException error) {
            return new JSONArray();
        }
    }
}
