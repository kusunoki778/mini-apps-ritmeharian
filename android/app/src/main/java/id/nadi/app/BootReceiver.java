package id.nadi.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

// Memasang ulang alarm yang tersimpan setelah perangkat menyala.
public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
        AlarmScheduler.rescheduleAll(context);
    }
}
