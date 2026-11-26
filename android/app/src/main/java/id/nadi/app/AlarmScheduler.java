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

    private static final String PREFS = "nadi_alarm_store";
    private static final String KEY = "scheduled";

    private AlarmScheduler() {}

    static void schedule(Context context, int notificationId, long triggerAt, String label,
                         String alarmId, int snoozeMinutes) {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null) return;

        PendingIntent intent = pendingIntent(context, notificationId, triggerAt, label, alarmId,
                snoozeMinutes);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !manager.canScheduleExactAlarms()) {
            // Izin alarm pasti belum diberikan. Pakai alarm tidak pasti agar tetap berbunyi.
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, intent);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, intent);
        } else {
            manager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, intent);
        }

        persist(context, notificationId, triggerAt, label, alarmId, snoozeMinutes);
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
            if (item != null) cancel(context, item.optInt(EXTRA_NOTIFICATION_ID, 0));
        }
        clear(context);
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
                    item.optInt(EXTRA_SNOOZE_MINUTES, 5));
        }
    }

    private static PendingIntent pendingIntent(Context context, int notificationId, long triggerAt,
                                               String label, String alarmId, int snoozeMinutes) {
        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.putExtra(EXTRA_NOTIFICATION_ID, notificationId);
        intent.putExtra(EXTRA_TRIGGER_AT, triggerAt);
        intent.putExtra(EXTRA_LABEL, label);
        intent.putExtra(EXTRA_ALARM_ID, alarmId);
        intent.putExtra(EXTRA_SNOOZE_MINUTES, snoozeMinutes);
        return PendingIntent.getBroadcast(context, notificationId, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static synchronized void persist(Context context, int notificationId, long triggerAt,
                                             String label, String alarmId, int snoozeMinutes) {
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
