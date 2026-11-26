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

import org.json.JSONException;
import org.json.JSONObject;

// Jembatan Capacitor untuk alarm layar penuh (Tier 2). Menjadwalkan alarm pasti ke
// AlarmManager lewat AlarmScheduler, lalu AlarmService yang membunyikan dan menampilkan
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
                        item.optString(AlarmScheduler.EXTRA_SOUND_ID, AlarmScheduler.DEFAULT_SOUND_ID));
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
