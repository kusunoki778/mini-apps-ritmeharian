package id.nadi.app;

import android.os.Build;
import android.os.Bundle;
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
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        setContentView(R.layout.activity_alarm);

        final int notificationId = getIntent()
                .getIntExtra(AlarmScheduler.EXTRA_NOTIFICATION_ID, 7001);
        final long triggerAt = getIntent()
                .getLongExtra(AlarmScheduler.EXTRA_TRIGGER_AT, System.currentTimeMillis());
        final int snoozeMinutes = getIntent().getIntExtra(AlarmScheduler.EXTRA_SNOOZE_MINUTES, 5);
        final String label = getIntent().getStringExtra(AlarmScheduler.EXTRA_LABEL);
        final String alarmId = getIntent().getStringExtra(AlarmScheduler.EXTRA_ALARM_ID);

        TextView timeView = findViewById(R.id.alarm_time);
        TextView labelView = findViewById(R.id.alarm_label);
        timeView.setText(formatTime(triggerAt));
        labelView.setText(label == null || label.isEmpty() ? "Alarm" : label);

        Button snoozeButton = findViewById(R.id.alarm_snooze);
        snoozeButton.setText("Tunda " + snoozeMinutes + " menit");
        snoozeButton.setOnClickListener(view -> {
            long next = System.currentTimeMillis() + snoozeMinutes * 60_000L;
            AlarmScheduler.schedule(this, notificationId, next, label, alarmId, snoozeMinutes);
            AlarmService.stop(this);
            finish();
        });

        Button stopButton = findViewById(R.id.alarm_stop);
        stopButton.setOnClickListener(view -> {
            AlarmService.stop(this);
            finish();
        });
    }

    private static String formatTime(long millis) {
        return new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date(millis));
    }
}
