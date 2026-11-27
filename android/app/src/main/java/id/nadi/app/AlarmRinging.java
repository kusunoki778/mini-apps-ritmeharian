package id.nadi.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

// Menyimpan alarm yang sedang berbunyi beserta catatan alarm yang sudah dihentikan.
// Lapisan web membaca keadaan ini lewat plugin: yang pertama untuk menampilkan tombol
// Matikan di dalam aplikasi, yang kedua supaya basis data Dexie ikut tahu alarm sudah
// berbunyi (alarm sekali pakai jadi nonaktif, pengingat agenda ditandai).
//
// Denyut disimpan bersama keadaan. Bila layanan dimatikan paksa oleh sistem tanpa
// sempat mencatat, denyut berhenti dan lapisan web tidak lagi menampilkan tombol
// Matikan untuk alarm yang sudah tidak berbunyi.
final class AlarmRinging {

    private static final String PREFS = "nadi_alarm_ringing";
    private static final String KEY_CURRENT = "current";
    private static final String KEY_STOPS = "stops";
    private static final String KEY_BEAT = "beat";
    private static final long STALE_MS = 90_000;
    private static final int MAX_STOPS = 40;

    private AlarmRinging() {}

    static void start(Context context, int notificationId, long triggerAt, String label,
                      String alarmId, int snoozeMinutes, String soundId) {
        JSONObject current = new JSONObject();
        try {
            current.put(AlarmScheduler.EXTRA_NOTIFICATION_ID, notificationId);
            current.put(AlarmScheduler.EXTRA_TRIGGER_AT, triggerAt);
            current.put(AlarmScheduler.EXTRA_LABEL, label == null ? "" : label);
            current.put(AlarmScheduler.EXTRA_ALARM_ID, alarmId == null ? "" : alarmId);
            current.put(AlarmScheduler.EXTRA_SNOOZE_MINUTES, snoozeMinutes);
            current.put(AlarmScheduler.EXTRA_SOUND_ID, soundId);
            current.put(KEY_BEAT, System.currentTimeMillis());
        } catch (JSONException ignored) {
            return;
        }
        prefs(context).edit().putString(KEY_CURRENT, current.toString()).apply();
    }

    // Segarkan denyut agar keadaan dianggap masih berbunyi.
    static void touch(Context context) {
        JSONObject current = readCurrent(context);
        if (current == null) return;

        try {
            current.put(KEY_BEAT, System.currentTimeMillis());
        } catch (JSONException ignored) {
            return;
        }
        prefs(context).edit().putString(KEY_CURRENT, current.toString()).apply();
    }

    // Alarm yang benar-benar sedang berbunyi. Keadaan basi dibuang supaya tombol
    // Matikan tidak muncul untuk alarm yang sudah tidak terdengar.
    static JSONObject current(Context context) {
        JSONObject current = readCurrent(context);
        if (current == null) return null;

        long beat = current.optLong(KEY_BEAT, 0);
        if (beat <= 0 || System.currentTimeMillis() - beat > STALE_MS) {
            clear(context);
            return null;
        }

        return current;
    }

    static void clear(Context context) {
        prefs(context).edit().remove(KEY_CURRENT).apply();
    }

    // Catat bahwa alarm selesai berbunyi. Entri dipakai sekali oleh lapisan web lalu
    // dibuang. Tunda sengaja tidak dicatat: alarm yang ditunda masih berjalan, dan
    // pencatatan akan memicu penyelarasan ulang yang membatalkan jadwal tundanya.
    static void recordStop(Context context, JSONObject current) {
        if (current == null) return;

        String alarmId = current.optString(AlarmScheduler.EXTRA_ALARM_ID, "");
        long triggerAt = current.optLong(AlarmScheduler.EXTRA_TRIGGER_AT, 0);
        if (alarmId.isEmpty() || triggerAt <= 0) return;

        JSONArray stops = readStops(context);
        JSONObject entry = new JSONObject();
        try {
            entry.put(AlarmScheduler.EXTRA_ALARM_ID, alarmId);
            entry.put(AlarmScheduler.EXTRA_TRIGGER_AT, triggerAt);
        } catch (JSONException ignored) {
            return;
        }

        JSONArray next = new JSONArray();
        int start = Math.max(0, stops.length() - (MAX_STOPS - 1));
        for (int index = start; index < stops.length(); index += 1) {
            JSONObject item = stops.optJSONObject(index);
            if (item != null) next.put(item);
        }
        next.put(entry);
        prefs(context).edit().putString(KEY_STOPS, next.toString()).apply();
    }

    static JSONArray consumeStops(Context context) {
        JSONArray stops = readStops(context);
        prefs(context).edit().remove(KEY_STOPS).apply();
        return stops;
    }

    private static JSONObject readCurrent(Context context) {
        String raw = prefs(context).getString(KEY_CURRENT, null);
        if (raw == null) return null;

        try {
            return new JSONObject(raw);
        } catch (JSONException error) {
            return null;
        }
    }

    private static JSONArray readStops(Context context) {
        String raw = prefs(context).getString(KEY_STOPS, "[]");
        try {
            return new JSONArray(raw == null ? "[]" : raw);
        } catch (JSONException error) {
            return new JSONArray();
        }
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
