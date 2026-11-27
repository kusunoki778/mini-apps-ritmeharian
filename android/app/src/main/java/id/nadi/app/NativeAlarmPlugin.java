package id.nadi.app;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

// Jembatan Capacitor untuk alarm layar penuh (Tier 2). Menjadwalkan alarm pasti ke
// AlarmManager lewat AlarmScheduler, lalu AlarmService membunyikan dan menampilkan
// layar alarm. Berjalan terpisah dari lapisan web.
@CapacitorPlugin(name = "NativeAlarm")
public class NativeAlarmPlugin extends Plugin {

    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray alarms = call.getArray("alarms");
        if (alarms == null) {
            call.resolve();
            return;
        }

        try {
            for (int index = 0; index < alarms.length(); index += 1) {
                JSONObject item = alarms.getJSONObject(index);
                AlarmScheduler.schedule(
                        getContext(),
                        item.optInt(AlarmScheduler.EXTRA_NOTIFICATION_ID, 1),
                        item.optLong("at", 0),
                        item.optString(AlarmScheduler.EXTRA_LABEL, "Alarm"),
                        item.optString(AlarmScheduler.EXTRA_ALARM_ID, ""),
                        item.optInt(AlarmScheduler.EXTRA_SNOOZE_MINUTES, 5),
                        item.optString(AlarmScheduler.EXTRA_SOUND_ID, AlarmScheduler.DEFAULT_SOUND_ID),
                        false,
                        item.optBoolean(AlarmScheduler.EXTRA_VIBRATE, true),
                        item.optInt(AlarmScheduler.EXTRA_SNOOZE_LIMIT, 0),
                        0);
            }
            call.resolve();
        } catch (JSONException error) {
            call.reject("Gagal menjadwalkan alarm", error);
        }
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        Integer id = call.getInt("id");
        if (id != null) AlarmScheduler.cancel(getContext(), id);
        call.resolve();
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        AlarmScheduler.cancelAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void scheduleTimer(PluginCall call) {
        Long at = call.getLong("at");
        if (at == null) {
            call.reject("Waktu timer tidak ada");
            return;
        }
        AlarmScheduler.schedule(getContext(), AlarmScheduler.TIMER_ID, at,
                call.getString("label", "Timer"), "timer", 0,
                call.getString("soundId", AlarmScheduler.DEFAULT_SOUND_ID));
        call.resolve();
    }

    @PluginMethod
    public void cancelTimer(PluginCall call) {
        AlarmScheduler.cancel(getContext(), AlarmScheduler.TIMER_ID);
        call.resolve();
    }

    // Alarm yang sedang berbunyi, atau null bila tidak ada. Dipakai lapisan web untuk
    // menampilkan tombol Matikan di dalam aplikasi, termasuk saat intent layar penuh
    // diblokir Android 14 ke atas.
    @PluginMethod
    public void getRinging(PluginCall call) {
        JSONObject current = AlarmRinging.current(getContext());
        JSObject result = new JSObject();
        if (current == null) {
            result.put("ringing", null);
            call.resolve(result);
            return;
        }

        JSObject ringing = new JSObject();
        ringing.put("notificationId",
                current.optInt(AlarmScheduler.EXTRA_NOTIFICATION_ID, 0));
        ringing.put("at", current.optLong(AlarmScheduler.EXTRA_TRIGGER_AT, 0));
        ringing.put("label", current.optString(AlarmScheduler.EXTRA_LABEL, "Alarm"));
        ringing.put("alarmId", current.optString(AlarmScheduler.EXTRA_ALARM_ID, ""));
        ringing.put("snoozeMinutes",
                current.optInt(AlarmScheduler.EXTRA_SNOOZE_MINUTES, 5));
        ringing.put("snoozeLimit",
                current.optInt(AlarmScheduler.EXTRA_SNOOZE_LIMIT, 0));
        ringing.put("snoozeCount",
                current.optInt(AlarmScheduler.EXTRA_SNOOZE_COUNT, 0));
        result.put("ringing", ringing);
        call.resolve(result);
    }

    // Hentikan alarm dari dalam aplikasi.
    @PluginMethod
    public void stopRinging(PluginCall call) {
        boolean snoozed = Boolean.TRUE.equals(call.getBoolean("snoozed", false));
        AlarmService.stopWithRecord(getContext(), snoozed);
        call.resolve();
    }

    // Tunda alarm dari dalam aplikasi: jadwalkan kemunculan berikutnya memakai info
    // alarm yang sedang berbunyi, lalu hentikan bunyi saat ini.
    @PluginMethod
    public void snoozeRinging(PluginCall call) {
        JSONObject current = AlarmRinging.current(getContext());
        if (current == null) {
            call.resolve();
            return;
        }

        int notificationId = current.optInt(AlarmScheduler.EXTRA_NOTIFICATION_ID, 0);
        int snoozeMinutes = current.optInt(AlarmScheduler.EXTRA_SNOOZE_MINUTES, 0);
        int snoozeLimit = current.optInt(AlarmScheduler.EXTRA_SNOOZE_LIMIT, 0);
        int snoozeCount = current.optInt(AlarmScheduler.EXTRA_SNOOZE_COUNT, 0);
        boolean vibrate = current.optBoolean(AlarmScheduler.EXTRA_VIBRATE, true);
        boolean limitReached = snoozeLimit > 0 && snoozeCount >= snoozeLimit;
        boolean canSnooze = notificationId != 0 && snoozeMinutes > 0 && !limitReached;
        if (canSnooze) {
            long triggerAt = System.currentTimeMillis() + snoozeMinutes * 60_000L;
            AlarmScheduler.schedule(getContext(), notificationId, triggerAt,
                    current.optString(AlarmScheduler.EXTRA_LABEL, "Alarm"),
                    current.optString(AlarmScheduler.EXTRA_ALARM_ID, ""),
                    snoozeMinutes,
                    current.optString(AlarmScheduler.EXTRA_SOUND_ID,
                            AlarmScheduler.DEFAULT_SOUND_ID),
                    true, vibrate, snoozeLimit, snoozeCount + 1);
        }

        AlarmService.stopWithRecord(getContext(), canSnooze);
        call.resolve();
    }

    // Ambil catatan alarm yang sudah berhenti (dari notifikasi, layar alarm, atau
    // aplikasi) supaya Dexie bisa menandai alarm dan pengingat agenda. Entri hanya
    // diberikan sekali.
    @PluginMethod
    public void consumeStops(PluginCall call) {
        JSONArray stops = AlarmRinging.consumeStops(getContext());
        JSArray result = new JSArray();
        for (int index = 0; index < stops.length(); index += 1) {
            JSONObject item = stops.optJSONObject(index);
            if (item == null) continue;

            JSObject entry = new JSObject();
            entry.put("alarmId", item.optString(AlarmScheduler.EXTRA_ALARM_ID, ""));
            entry.put("at", item.optLong(AlarmScheduler.EXTRA_TRIGGER_AT, 0));
            result.put(entry);
        }
        JSObject payload = new JSObject();
        payload.put("stops", result);
        call.resolve(payload);
    }

    @PluginMethod
    public void canScheduleExactAlarms(PluginCall call) {
        boolean granted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager manager = (AlarmManager) getContext()
                    .getSystemService(Context.ALARM_SERVICE);
            granted = manager != null && manager.canScheduleExactAlarms();
        }
        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    // Android 14 ke atas membatasi intent layar penuh. Tanpa izin ini alarm hanya
    // muncul sebagai notifikasi biasa. Cek dan buka pengaturannya dari lapisan web.
    @PluginMethod
    public void canUseFullScreenIntent(PluginCall call) {
        boolean granted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            NotificationManager manager = (NotificationManager) getContext()
                    .getSystemService(Context.NOTIFICATION_SERVICE);
            granted = manager != null && manager.canUseFullScreenIntent();
        }
        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    // OEM seperti Infinix, Xiaomi, dan Oppo bisa mematikan layanan latar belakang.
    // Pengecualian optimasi baterai membuat alarm lebih tahan.
    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        boolean exempt = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            android.os.PowerManager manager = (android.os.PowerManager) getContext()
                    .getSystemService(Context.POWER_SERVICE);
            exempt = manager != null
                    && manager.isIgnoringBatteryOptimizations(getContext().getPackageName());
        }
        JSObject result = new JSObject();
        result.put("exempt", exempt);
        call.resolve(result);
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimizations(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(
                    Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                    Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void openFullScreenIntentSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            Intent intent = new Intent(
                    Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT,
                    Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }
}
