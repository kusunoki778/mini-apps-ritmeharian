package id.nadi.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

// Dipicu AlarmManager saat alarm jatuh tempo. Menyalakan layanan berbunyi.
public class AlarmReceiver extends BroadcastReceiver {

    private static final String TAG = "NadiAlarmReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        Intent service = new Intent(context, AlarmService.class);
        service.setAction(AlarmService.ACTION_START);
        if (intent != null && intent.getExtras() != null) {
            service.putExtras(intent);
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(service);
            } else {
                context.startService(service);
            }
        } catch (RuntimeException error) {
            // Alarm dari setAlarmClock selalu boleh menyalakan layanan latar depan.
            // Penjagaan ini hanya agar penerima tidak ikut gagal bila sistem menolak.
            Log.e(TAG, "Gagal menyalakan layanan alarm", error);
        }
    }
}
