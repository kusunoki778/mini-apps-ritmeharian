package id.nadi.app;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

// Memutar nada dering alarm berulang. Jalur utama MediaPlayer dengan USAGE_ALARM.
// Bila gagal, dipakai Ringtone nada alarm bawaan sistem. Semua jalur memakai aliran
// alarm sehingga tidak ikut senyap saat ponsel dalam mode getar.
final class AlarmSound {

    private static final String TAG = "NadiAlarmSound";

    private final Context context;
    private MediaPlayer player;
    private Ringtone ringtone;

    AlarmSound(Context context) {
        this.context = context.getApplicationContext();
    }

    /** Mengembalikan true bila ada jalur bunyi yang berhasil dimulai. */
    boolean start(String soundId) {
        raiseAlarmVolume();
        Uri source = AlarmSounds.uriFor(context, soundId);
        if (startPlayer(source)) return true;
        if (startRingtone(source)) return true;
        Log.w(TAG, "Semua jalur nada gagal, alarm tetap tampil.");
        return false;
    }

    void stop() {
        if (player != null) {
            try {
                if (player.isPlaying()) player.stop();
            } catch (IllegalStateException ignored) {
                // Sudah berhenti.
            }
            player.release();
            player = null;
        }

        if (ringtone != null) {
            try {
                if (ringtone.isPlaying()) ringtone.stop();
            } catch (IllegalStateException ignored) {
                // Sudah berhenti.
            }
            ringtone = null;
        }
    }

    // Naikkan aliran alarm ke minimal 80 persen agar tidak terdengar pelan.
    private void raiseAlarmVolume() {
        AudioManager manager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        if (manager == null) return;

        try {
            int max = manager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
            int current = manager.getStreamVolume(AudioManager.STREAM_ALARM);
            int target = Math.max(current, Math.round(max * 0.8f));
            if (target > current) {
                manager.setStreamVolume(AudioManager.STREAM_ALARM, target, 0);
            }
        } catch (SecurityException ignored) {
            // Sebagian perangkat membatasi perubahan volume.
        }
    }

    private boolean startPlayer(Uri source) {
        try {
            MediaPlayer next = new MediaPlayer();
            next.setAudioAttributes(new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build());
            next.setLooping(true);
            next.setDataSource(context, source);
            next.prepare();
            next.start();
            player = next;
            return true;
        } catch (Exception error) {
            Log.w(TAG, "MediaPlayer gagal untuk " + source, error);
            player = null;
            return false;
        }
    }

    private boolean startRingtone(Uri source) {
        try {
            Ringtone next = RingtoneManager.getRingtone(context, source);
            if (next == null) return false;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                next.setAudioAttributes(new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build());
            }
            next.setLooping(true);
            next.play();
            ringtone = next;
            return true;
        } catch (Exception error) {
            Log.w(TAG, "Ringtone gagal untuk " + source, error);
            ringtone = null;
            return false;
        }
    }

    /** Nada alarm bawaan sistem, dipakai 4.1 sebagai pilihan terakhir. */
    static Uri systemAlarmUri() {
        Uri fallback = Settings.System.DEFAULT_ALARM_ALERT_URI;
        return fallback != null ? fallback : Settings.System.DEFAULT_RINGTONE_URI;
    }
}
