package id.nadi.app;

import android.content.Context;
import android.net.Uri;

import java.util.ArrayList;
import java.util.List;

// Daftar nada dering bawaan Nadi. Semua dibundel di res/raw sehingga alarm tetap
// berbunyi tanpa internet dan tanpa lisensi pihak ketiga.
final class AlarmSounds {

    static final String DEFAULT_ID = "nadi";
    static final String SYSTEM_ID = "sistem";

    static final class Entry {
        final String id;
        final String label;
        final int resource;

        Entry(String id, String label, int resource) {
            this.id = id;
            this.label = label;
            this.resource = resource;
        }
    }

    private static final List<Entry> ENTRIES = new ArrayList<>();

    static {
        ENTRIES.add(new Entry("nadi", "Nadi", R.raw.alarm));
        ENTRIES.add(new Entry("lembut", "Lembut", R.raw.alarm_lembut));
        ENTRIES.add(new Entry("tegas", "Tegas", R.raw.alarm_tegas));
        ENTRIES.add(new Entry("lonceng", "Lonceng", R.raw.alarm_lonceng));
        ENTRIES.add(new Entry("denyut", "Denyut", R.raw.alarm_denyut));
        ENTRIES.add(new Entry("fajar", "Fajar", R.raw.alarm_fajar));
    }

    private AlarmSounds() {}

    static List<Entry> entries() {
        return ENTRIES;
    }

    static String labelOf(String id) {
        for (Entry entry : ENTRIES) {
            if (entry.id.equals(id)) return entry.label;
        }
        return "Nada bawaan sistem";
    }

    static Uri uriFor(Context context, String id) {
        if (SYSTEM_ID.equals(id)) return AlarmSound.systemAlarmUri();

        for (Entry entry : ENTRIES) {
            if (entry.id.equals(id)) {
                return Uri.parse("android.resource://" + context.getPackageName() + "/"
                        + entry.resource);
            }
        }

        return Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.alarm);
    }
}
