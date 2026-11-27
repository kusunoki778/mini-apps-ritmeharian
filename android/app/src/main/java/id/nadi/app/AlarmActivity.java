package id.nadi.app;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

// Layar alarm penuh yang muncul di atas kunci layar. Menyediakan tombol Tunda
// dan Matikan, sama seperti alarm bawaan.
public class AlarmActivity extends AppCompatActivity {

    private static final long CEK_MS = 1000L;

    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable cekBerbunyi = new Runnable() {
        @Override
        public void run() {
            // Alarm bisa dihentikan dari notifikasi atau dari dalam aplikasi. Bila itu
            // terjadi, layar ini ikut menutup supaya tidak ada layar alarm menggantung.
            if (AlarmRinging.current(AlarmActivity.this) == null) {
                finish();
                return;
            }
            handler.postDelayed(this, CEK_MS);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

        setContentView(R.layout.activity_alarm);

        final int notificationId = getIntent()
                .getIntExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, 7001);
        final long triggerAt = getIntent()
                .getLongExtra(AlarmScheduler.EXTRA_TRIGGER_AT, System.currentTimeMillis());
        final int snoozeMinutes = getIntent().getIntExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, 5);
        final String label = getIntent().getStringExtra(AlarmScheduler.EXTRA_LABEL);
        final String alarmId = getIntent().getStringExtra(AlarmScheduler.EXTRA_ALARM_ID);
        String sound = getIntent().getStringExtra(AlarmScheduler.EXTRA_SOUND_ID);
        final String soundId = sound == null ? AlarmScheduler.DEFAULT_SOUND_ID : sound;

        TextView timeView = findViewById(R.id.alarm_time);
        TextView labelView = findViewById(R.id.alarm_label);
        timeView.setText(formatTime(triggerAt));
        labelView.setText(label == null || label.isEmpty() ? "Alarm" : label);

        Button snoozeButton = findViewById(R.id.alarm_snooze);
        if (snoozeMinutes <= 0) {
            // Timer tidak punya tunda, jadi tombolnya disembunyikan.
            snoozeButton.setVisibility(View.GONE);
        } else {
            snoozeButton.setText("Tunda " + snoozeMinutes + " menit");
            snoozeButton.setOnClickListener(view -> {
                long next = System.currentTimeMillis() + snoozeMinutes * 60_000L;
                AlarmScheduler.schedule(this, notificationId, next, label, alarmId, snoozeMinutes,
                        soundId, true);
                AlarmService.stopWithRecord(this, true);
                finish();
            });
        }

        Button stopButton = findViewById(R.id.alarm_stop);
        stopButton.setOnClickListener(view -> {
            AlarmService.stopWithRecord(this, false);
            finish();
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        handler.removeCallbacks(cekBerbunyi);
        handler.postDelayed(cekBerbunyi, CEK_MS);
    }

    @Override
    protected void onStop() {
        handler.removeCallbacks(cekBerbunyi);
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        // Layar alarm ditutup oleh sistem (bukan oleh tombol Matikan atau Tunda).
        // Tanpa ini alarm tetap berbunyi walau layarnya sudah hilang.
        if (isFinishing() && AlarmRinging.current(this) != null) {
            AlarmService.stopWithRecord(this, false);
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        // Tombol kembali tidak boleh menutup layar tanpa menghentikan alarm, karena
        // bunyi akan terus berjalan tanpa layar penghenti.
    }

    private static String formatTime(long millis) {
        return new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date(millis));
    }
}
