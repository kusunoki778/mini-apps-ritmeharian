# ARCHITECTURE: Nadi

Versi: 0.1
Tanggal: 25 November 2026
Status: draf untuk direview

## 1. Ringkasan

Nadi adalah aplikasi frontend murni. Tidak ada server sendiri, tidak ada basis data pusat, dan tidak ada kunci API. Seluruh data pribadi disimpan di IndexedDB pada perangkat. Data cuaca, kualitas udara, dan pencarian kota diambil langsung dari Open-Meteo.

Bentuk sistem:

```
Browser
├─ React app (Vite build)
│  ├─ Router
│  ├─ Feature modules
│  ├─ TanStack Query (server state)
│  ├─ Zustand (UI state)
│  └─ Dexie (IndexedDB)
├─ Service worker (Workbox)
│  ├─ App shell cache
│  └─ Runtime cache Open-Meteo
└─ HTTPS requests
   ├─ api.open-meteo.com
   ├─ air-quality-api.open-meteo.com
   └─ geocoding-api.open-meteo.com
```

## 2. Prinsip arsitektur

1. Tanpa backend. Kalau sebuah fitur butuh server, fitur itu ditunda atau dibuang.
2. Data lokal adalah sumber kebenaran untuk catatan, agenda, alarm, dan pengaturan.
3. Data jaringan selalu punya cadangan cache dan label waktu.
4. Modul gagal secara terpisah. Kartu cuaca error tidak boleh menjatuhkan catatan.
5. Tidak ada abstraksi yang belum dibutuhkan. Tiga halaman mirip tidak otomatis butuh design system internal yang rumit.

## 3. Stack

| Lapisan        | Pilihan                        | Alasan                                                              |
| -------------- | ------------------------------ | ------------------------------------------------------------------- |
| Build          | Vite                           | Cepat, konfigurasi kecil, output statis                             |
| UI             | React 18 + TypeScript          | Ekosistem luas, tipe membantu model data dan API                    |
| Gaya           | Tailwind CSS 4 + CSS variables | Token tema mudah, utility cukup, tanpa file CSS besar               |
| Routing        | React Router 7                 | Lima route, lazy loading, data router bila perlu                    |
| Server state   | TanStack Query 5               | Cache, retry, stale time, refetch on focus                          |
| UI state       | Zustand 5                      | Ringan untuk state sheet, pencarian, dan preferensi sementara       |
| Penyimpanan    | Dexie 4 (IndexedDB)            | Query terindeks, transaksi, kapasitas lebih besar dari localStorage |
| Tanggal        | date-fns + Intl                | Format lokal Indonesia, operasi tanggal yang jelas                  |
| Grafik         | Recharts, dimuat malas         | Cukup untuk grafik AQI dan suhu                                     |
| Ikon           | Phosphor + Meteocons           | Alasan ada di DESIGN.md                                             |
| PWA            | vite-plugin-pwa (Workbox)      | Precache dan runtime cache dengan konfigurasi kecil                 |
| Test           | Vitest + Testing Library       | Satu toolchain dengan Vite                                          |
| Validasi impor | Zod                            | Validasi JSON impor tanpa menulis parser manual                     |

## 4. Struktur folder

```
nadi/
├─ docs/
├─ public/
│  ├─ icons/
│  │  ├─ icon-192.png
│  │  ├─ icon-512.png
│  │  └─ maskable-512.png
│  └─ fonts/
├─ src/
│  ├─ main.tsx
│  ├─ app/
│  │  ├─ router.tsx
│  │  ├─ AppShell.tsx
│  │  ├─ providers.tsx
│  │  └─ ErrorBoundary.tsx
│  ├─ features/
│  │  ├─ dashboard/
│  │  │  ├─ DashboardPage.tsx
│  │  │  ├─ HeroClock.tsx
│  │  │  ├─ DayLine.tsx
│  │  │  └─ DashboardCards.tsx
│  │  ├─ weather/
│  │  │  ├─ WeatherCard.tsx
│  │  │  ├─ WeatherSheet.tsx
│  │  │  ├─ DayStrip.tsx
│  │  │  └─ useWeather.ts
│  │  ├─ air-quality/
│  │  │  ├─ AqiCard.tsx
│  │  │  ├─ AqiChart.tsx
│  │  │  ├─ useAirQuality.ts
│  │  │  └─ aqi.ts
│  │  ├─ clock/
│  │  │  ├─ useNow.ts
│  │  │  └─ greeting.ts
│  │  ├─ notes/
│  │  │  ├─ NotesPage.tsx
│  │  │  ├─ NoteEditor.tsx
│  │  │  ├─ NoteList.tsx
│  │  │  ├─ useNotes.ts
│  │  │  └─ notes.repo.ts
│  │  ├─ calendar/
│  │  │  ├─ CalendarPage.tsx
│  │  │  ├─ MonthGrid.tsx
│  │  │  ├─ DaySheet.tsx
│  │  │  ├─ EventForm.tsx
│  │  │  ├─ useEvents.ts
│  │  │  └─ events.repo.ts
│  │  ├─ alarms/
│  │  │  ├─ AlarmsPage.tsx
│  │  │  ├─ AlarmForm.tsx
│  │  │  ├─ AlarmRinging.tsx
│  │  │  ├─ useAlarms.ts
│  │  │  ├─ alarm.engine.ts
│  │  │  └─ alarms.repo.ts
│  │  └─ settings/
│  │     ├─ SettingsPage.tsx
│  │     ├─ LocationPicker.tsx
│  │     ├─ DataSection.tsx
│  │     └─ useSettings.ts
│  ├─ components/
│  │  └─ ui/
│  │     ├─ Button.tsx
│  │     ├─ Card.tsx
│  │     ├─ Sheet.tsx
│  │     ├─ Dialog.tsx
│  │     ├─ Input.tsx
│  │     ├─ Toggle.tsx
│  │     ├─ Toast.tsx
│  │     ├─ EmptyState.tsx
│  │     ├─ ErrorState.tsx
│  │     └─ Skeleton.tsx
│  ├─ lib/
│  │  ├─ api/
│  │  │  ├─ openMeteo.ts
│  │  │  ├─ weatherCodes.ts
│  │  │  └─ http.ts
│  │  ├─ storage/
│  │  │  ├─ db.ts
│  │  │  ├─ cache.ts
│  │  │  └─ exportImport.ts
│  │  ├─ hooks/
│  │  │  ├─ useOnline.ts
│  │  │  ├─ useMediaQuery.ts
│  │  │  └─ useReducedMotion.ts
│  │  └─ utils/
│  │     ├─ date.ts
│  │     ├─ number.ts
│  │     └─ id.ts
│  ├─ styles/
│  │  ├─ tokens.css
│  │  └─ global.css
│  └─ types/
│     ├─ domain.ts
│     └─ api.ts
├─ index.html
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

Aturan folder:

- `features` tidak saling mengimpor komponen internal. Impor lintas fitur lewat `lib` atau `components/ui`.
- `lib/api` tidak tahu React.
- `repo` adalah satu-satunya tempat yang menyentuh Dexie langsung.

## 5. Routing

| Path          | Halaman         | Catatan                     |
| ------------- | --------------- | --------------------------- |
| `/`           | Beranda         | Dasbor                      |
| `/kalender`   | Kalender        | Bulan dan agenda            |
| `/catatan`    | Catatan         | Daftar dan editor           |
| `/alarm`      | Alarm           | Daftar dan form             |
| `/pengaturan` | Pengaturan      | Lokasi, tema, data, tentang |
| `*`           | Tidak ditemukan | Tautan kembali ke Beranda   |

Semua route dimuat malas dengan `React.lazy` dan `Suspense`. Halaman Beranda dimuat paling awal karena itu entry point. Grafik hanya dimuat saat kartu AQI terlihat.

## 6. Model data

```ts
type ID = string;

interface Note {
  id: ID;
  title: string;
  body: string;
  pinned: 0 | 1;
  createdAt: number;
  updatedAt: number;
}

interface CalendarEvent {
  id: ID;
  title: string;
  start: number;
  end: number | null;
  allDay: boolean;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

interface Alarm {
  id: ID;
  label: string;
  hour: number;
  minute: number;
  days: number[];
  enabled: boolean;
  snoozeMinutes: number;
  lastTriggeredAt?: number;
}

interface Settings {
  theme: 'system' | 'light' | 'dark';
  location: {
    name: string;
    lat: number;
    lon: number;
    source: 'geolocation' | 'search' | 'default';
  } | null;
  unit: 'c' | 'f';
  timeFormat: '24h' | '12h';
  weekStart: 0 | 1;
}
```

Catatan model:

- `pinned` memakai 0 atau 1 karena Dexie mengindeks angka, bukan boolean.
- Waktu disimpan sebagai epoch milidetik, bukan string, agar sorting dan perbandingan konsisten.
- `days` memakai 0 untuk Minggu sampai 6 untuk Sabtu, mengikuti `Date.getDay()`. Array kosong berarti sekali pakai.
- Semua objek punya `id` dari `crypto.randomUUID()`. Fallback untuk browser lama disediakan di `lib/utils/id.ts`.

## 7. Penyimpanan

Skema Dexie versi 1:

```ts
db.version(1).stores({
  notes: 'id, pinned, updatedAt',
  events: 'id, start',
  alarms: 'id, enabled',
  settings: 'key',
  cache: 'key',
});
```

Tabel:

- `notes`: catatan.
- `events`: agenda.
- `alarms`: alarm.
- `settings`: key-value. Kunci `app` menyimpan objek `Settings` (tema, satuan suhu, format jam, awal minggu).
- `cache`: key-value untuk payload API terakhir. Kunci `weather:<lat>,<lon>`, `air:<lat>,<lon>`.

Migrasi:

- Setiap perubahan skema menambah `db.version(n).stores(...)`.
- Migrasi data memakai `.upgrade(tx => ...)`.
- Tidak ada penghapusan data pengguna tanpa aksi eksplisit.

Pengaturan untuk boot:

- Sumber kebenaran `Settings` ada di `settings.app` pada Dexie.
- Nilai awal dibaca dari `localStorage` lebih dulu agar paint pertama tidak menunggu Dexie: tema dari `nadi-theme`, awal minggu dari `nadi-week-start`. Setelah Dexie selesai dibaca, nilai lama ditulis ke tabel dan `localStorage` tetap dicerminkan untuk tema.
- Lokasi tetap di `localStorage` dengan kunci `nadi-location`, di luar `Settings`, karena dibaca sinkron oleh semua modul.
- Satuan suhu dan format jam dipakai fungsi format murni lewat nilai modul di `lib/format/preferences`, yang disinkronkan provider sebelum anak komponen merender.

Ekspor dan impor:

- Ekspor menulis satu berkas JSON berisi `app`, `version`, `exportedAt`, `settings`, `location`, `notes`, `events`, dan `alarms`.
- Impor divalidasi dengan Zod terhadap `version` yang didukung dan dibatasi 5 MB sebelum ditulis. Impor menimpa tabel terkait dalam satu transaksi Dexie.
- Hapus semua data mengosongkan semua tabel dan kunci `localStorage` terkait, lalu memuat ulang aplikasi.

## 8. Lapisan API

### 8.1 Endpoint

Cuaca:

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m
  &hourly=temperature_2m,weather_code,precipitation_probability
  &daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset
  &timezone=auto
  &forecast_days=7
```

Kualitas udara:

```
GET https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude={lat}
  &longitude={lon}
  &current=us_aqi,pm2_5,pm10,european_aqi
  &hourly=us_aqi,pm2_5
  &timezone=auto
  &forecast_days=2
```

Pencarian kota:

```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={query}
  &count=5
  &language=id
  &format=json
```

Aturan:

- Tidak ada API key.
- `timezone=auto` agar jam data mengikuti lokasi.
- `language=id` untuk nama kota.
- Query pencarian minimal dua karakter dan di-debounce 300ms.
- Semua request memakai `AbortController` dengan batas 8 detik.

### 8.2 Tipe respons

```ts
interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: 0 | 1;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

interface AirQualityResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    us_aqi: number;
    pm2_5: number;
    pm10: number;
    european_aqi: number;
  };
  hourly: {
    time: string[];
    us_aqi: number[];
    pm2_5: number[];
  };
}
```

### 8.3 Pemetaan kode cuaca WMO

| Kode       | Label                       | Ikon          |
| ---------- | --------------------------- | ------------- |
| 0          | Cerah                       | cerah         |
| 1          | Cerah berawan               | cerah-berawan |
| 2          | Berawan                     | berawan       |
| 3          | Mendung                     | mendung       |
| 45, 48     | Kabut                       | kabut         |
| 51, 53, 55 | Gerimis                     | gerimis       |
| 56, 57     | Gerimis beku                | gerimis       |
| 61, 63, 65 | Hujan                       | hujan         |
| 66, 67     | Hujan beku                  | hujan         |
| 71, 73, 75 | Salju                       | salju         |
| 77         | Butir salju                 | salju         |
| 80, 81, 82 | Hujan lokal                 | hujan         |
| 85, 86     | Hujan salju lokal           | salju         |
| 95         | Badai petir                 | badai         |
| 96, 99     | Badai petir dengan hujan es | badai         |
| lainnya    | Tidak diketahui             | awan          |

Varian siang dan malam ditentukan oleh `current.is_day` untuk data saat ini, dan oleh jam matahari terbit serta terbenam untuk data per jam.

### 8.4 Pemetaan AQI

| Rentang US AQI | Label                              | Saran umum                                                 |
| -------------- | ---------------------------------- | ---------------------------------------------------------- |
| 0-50           | Baik                               | Aktivitas luar ruang aman untuk umum.                      |
| 51-100         | Sedang                             | Kelompok sensitif perlu memperhatikan gejala.              |
| 101-150        | Tidak sehat bagi kelompok sensitif | Kelompok sensitif kurangi aktivitas luar ruang yang berat. |
| 151-200        | Tidak sehat                        | Kurangi aktivitas luar ruang.                              |
| 201-300        | Sangat tidak sehat                 | Hindari aktivitas luar ruang.                              |
| 301 ke atas    | Berbahaya                          | Tetap di dalam ruang, tutup ventilasi.                     |

Saran ini bersifat umum, bukan nasihat medis. Teks disclaimer tampil di kartu.

### 8.5 Cache dan fallback

Setiap respons sukses ditulis ke tabel `cache`:

```ts
interface CacheEntry<T> {
  key: string;
  fetchedAt: number;
  payload: T;
}
```

Alur `queryFn`:

1. Coba jaringan.
2. Jika sukses, simpan ke `cache`, kembalikan data segar.
3. Jika gagal karena jaringan atau timeout, baca `cache`.
4. Jika cache ada, kembalikan data dengan `fetchedAt` dan `stale: true`.
5. Jika cache tidak ada, lempar error yang bisa ditampilkan kartu.

Kunci query:

```ts
const queryKeys = {
  weather: (lat: number, lon: number) => ['weather', lat, lon] as const,
  air: (lat: number, lon: number) => ['air', lat, lon] as const,
  cities: (q: string) => ['cities', q] as const,
};
```

Pengaturan query:

- `staleTime`: cuaca 10 menit, kualitas udara 20 menit, pencarian kota 5 menit.
- `gcTime`: 24 jam.
- `retry`: 2 kali dengan backoff, tidak untuk status 4xx.
- `refetchOnWindowFocus`: hanya jika data sudah basi.
- Tidak ada polling interval. Pembaruan terjadi saat fokus, saat mount, atau saat pengguna menekan coba lagi.

## 9. State

Pembagian:

- Server state: TanStack Query. Tidak disalin ke Zustand.
- Data domain: Dexie, dibaca lewat hook `useNotes`, `useEvents`, `useAlarms`, `useSettings`. Setiap perubahan memicu pembacaan ulang.
- UI state: Zustand untuk sheet yang terbuka, query pencarian, dan toast. Tidak untuk data domain.
- State turunan: dihitung dengan selector atau `useMemo`, tidak disimpan ganda.

Alasan: menyalin data server ke store global adalah sumber bug sinkronisasi yang tidak perlu untuk aplikasi sebesar ini.

## 10. Offline dan PWA

Konfigurasi Workbox:

```ts
VitePWA({
  strategies: 'generateSW',
  registerType: 'prompt',
  includeAssets: ['icons/*.png', 'fonts/*.woff2'],
  manifest: {
    name: 'Nadi',
    short_name: 'Nadi',
    description: 'Jam, cuaca, kualitas udara, agenda, catatan, dan alarm dalam satu dasbor.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F4EE',
    theme_color: '#F7F4EE',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    navigateFallback: '/index.html',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.open-meteo\.com\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'open-meteo-weather',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 40, maxAgeSeconds: 3600 },
        },
      },
      {
        urlPattern: /^https:\/\/air-quality-api\.open-meteo\.com\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'open-meteo-air',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 40, maxAgeSeconds: 3600 },
        },
      },
      {
        urlPattern: /^https:\/\/geocoding-api\.open-meteo\.com\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'open-meteo-geocoding',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 20, maxAgeSeconds: 86400 },
        },
      },
    ],
  },
});
```

Cache berlapis:

- Service worker: menyajikan respons HTTP terakhir saat offline, termasuk untuk cold start.
- Dexie: menyimpan payload terstruktur dan `fetchedAt`, sehingga UI bisa menampilkan label waktu yang benar tanpa menebak dari header cache.

Alasan dua lapis: service worker menjamin shell dan respons mentah, Dexie menjamin data terstruktur dan label basi yang dapat diuji. Biayanya kecil karena payload cuaca hanya beberapa kilobyte.

Perilaku offline:

- `useOnline` mendengarkan `online` dan `offline`.
- Banner offline muncul di atas konten.
- Modul yang gagal memakai cache dan menampilkan label waktu.
- CRUD lokal tetap berjalan.
- Pencarian kota menampilkan pesan bahwa pencarian butuh koneksi, sementara lokasi tersimpan tetap dipakai.

Pembaruan:

- `registerType: 'prompt'` menampilkan banner "Versi baru tersedia" dengan tombol "Muat ulang".
- Tidak ada reload paksa saat pengguna sedang mengetik catatan.

## 11. Tema

Token di `styles/tokens.css`, dipetakan ke Tailwind lewat `@theme`.

```css
:root,
[data-theme='light'] {
  --paper: #f7f4ee;
  --surface: #fffdf9;
  --ink: #1c1917;
  --ink-muted: #57534e;
  --line: #e7e1d8;
  --accent: #b23a26;
  --accent-soft: #f3d9d2;
}

[data-theme='dark'] {
  --paper: #141210;
  --surface: #1d1a17;
  --ink: #f5f1ea;
  --ink-muted: #aba39a;
  --line: #2e2924;
  --accent: #e8836f;
  --accent-soft: #3a241f;
}
```

Penerapan sebelum paint, di `index.html`:

```html
<script>
  (function () {
    try {
      var saved = localStorage.getItem('nadi-theme');
      var theme =
        saved === 'light' || saved === 'dark'
          ? saved
          : window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
      document.documentElement.dataset.theme = theme;
    } catch (error) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
</script>
```

Aturan:

- Pilihan "Sistem" mendengarkan perubahan `prefers-color-scheme` dan memperbarui atribut.
- Pilihan manual mengalahkan sistem.
- Perubahan tema tidak memakai transisi warna global agar tidak terasa lambat.
- Meta `theme-color` diperbarui mengikuti tema.

## 12. Alarm

Batasan produk: alarm hanya berbunyi saat aplikasi terbuka. Ini bukan bug yang bisa ditutup dengan kode frontend. Alarm latar belakang memerlukan Capacitor dan `@capacitor/local-notifications`.

Alur:

1. Saat aplikasi mount, muat alarm aktif.
2. Hitung waktu berbunyi berikutnya untuk setiap alarm.
3. Satu interval 1 detik memeriksa apakah ada alarm yang jatuh tempo.
4. Saat jatuh tempo, tampilkan layar Alarm Berbunyi, mainkan nada, kirim notifikasi jika diizinkan.
5. Alarm sekali pakai dinonaktifkan setelah berbunyi.
6. Tunda menambah 5 menit ke waktu berbunyi berikutnya.

Perhitungan waktu berikutnya:

```ts
function nextOccurrence(alarm: Alarm, now: Date): Date | null {
  for (let offset = 0; offset < 8; offset++) {
    const day = addDays(startOfDay(now), offset);
    if (alarm.days.length > 0 && !alarm.days.includes(day.getDay())) continue;
    const candidate = setMinutes(setHours(day, alarm.hour), alarm.minute);
    if (candidate.getTime() > now.getTime()) return candidate;
  }
  return null;
}
```

Catatan:

- `days` kosong berarti sekali pakai, bukan setiap hari.
- `days` berisi tujuh angka berarti setiap hari.
- Perhitungan memakai setter waktu lokal agar perubahan DST ditangani oleh `Date`.
- Nada dibuat dengan Web Audio, tanpa file audio. Audio harus dibuka oleh interaksi pengguna pertama. Jika belum terbuka, alarm tetap menampilkan layar dan getaran, dengan tombol "Aktifkan suara".
- `lastTriggeredAt` mencegah alarm berbunyi dua kali dalam satu menit.
- Pemeriksaan latar belakang browser tidak diandalkan. Saat tab kembali aktif, alarm yang terlewat dalam 60 detik terakhir tetap ditampilkan; yang lebih lama ditandai terlewat.

Notifikasi:

- Izin diminta saat pengguna pertama kali membuat alarm, bukan saat aplikasi dibuka.
- Jika izin ditolak, UI tetap berfungsi dan menampilkan catatan bahwa notifikasi tidak aktif.

## 13. Penanganan error

- `ErrorBoundary` di level route, dengan tampilan "Halaman gagal dimuat" dan tombol kembali ke Beranda.
- Error API ditangani di level kartu, bukan route.
- Error tipe:
  - `OfflineError`: tidak ada koneksi dan tidak ada cache.
  - `TimeoutError`: melewati 8 detik.
  - `HttpError`: status di luar 2xx.
  - `ParseError`: JSON tidak sesuai.
- Pesan pengguna tidak menampilkan pesan mentah dari server. Detail teknis hanya di konsol saat mode pengembangan.
- Validasi form dilakukan di sisi klien sebelum menulis ke Dexie.

## 14. Performa

Anggaran:

- JavaScript awal di bawah 200KB gzip.
- Halaman non-Beranda dimuat malas.
- Recharts dimuat malas saat kartu AQI masuk viewport atau dibuka.
- Font disubset latin dan latin-ext, dua bobot awal (400 dan 700), `font-display: swap`, `preload` untuk 700.
- Tidak ada gambar hero. Ikon berupa SVG inline atau file kecil.
- Tinggi kartu dan skeleton dicadangkan untuk mencegah CLS.
- Animasi hanya transform dan opacity.

Teknik:

- `React.lazy` per route.
- `content-visibility: auto` pada bagian bawah dasbor bila pengukuran menunjukkan manfaat.
- `Intl.DateTimeFormat` dibuat sekali per locale, tidak per render.
- Jam diperbarui dengan satu interval di hook `useNow`, bukan di setiap komponen.

Target terukur saat rilis: Lighthouse Performance minimal 90 mobile, LCP di bawah 2.5 detik pada 4G kelas menengah. Angka ini diverifikasi, bukan diklaim sebelum diukur.

Hasil ukur M8 (Chrome headless, throttle mobile default Lighthouse, pratinjau produksi):

- Performance 93 sampai 94, Accessibility 96, Best Practices 100, CLS 0, TBT 100 sampai 110 ms, FCP 2.2 s.
- Bundle awal 123 kB gzip untuk `index`, 3 kB untuk `jsx-runtime`, 8.9 kB untuk CSS. Di bawah anggaran 200 kB. Grafik AQI tetap di chunk terpisah 117 kB gzip.
- LCP 2.6 sampai 2.8 s, sedikit di atas target. Penyebab utama adalah render delay SPA di klien: jam besar yang menjadi elemen LCP baru bisa dilukis setelah bundel awal dieksekusi. Di bawah throttle CPU 4x, render delay sekitar 82 persen dari LCP. Di perangkat tanpa throttle, shell tampil di bawah 130 ms menurut uji asap.
- Kandidat perbaikan dicatat di backlog: sebariskan CSS kritis dan pindahkan pembacaan Dexie dari jalur boot.

## 15. Testing

Unit:

- `nextOccurrence`: sekali pakai, harian, hari tertentu, pergantian tengah malam, DST.
- Pemetaan kode WMO, termasuk kode tidak dikenal.
- Kategori AQI, batas setiap rentang, nilai kosong.
- Format tanggal dan jam untuk `id-ID`.
- Repositori Dexie: buat, ubah, hapus, urutan pin.
- Validasi impor JSON: skema benar, skema salah, versi tidak dikenal.

Komponen:

- Catatan: tambah, cari, pin, hapus dengan konfirmasi.
- Alarm: validasi form, toggle, label berikutnya.
- Kalender: navigasi bulan, buka panel hari.
- Tema: pilihan tersimpan dan atribut berubah.
- State kosong, loading, dan error pada setiap kartu data.

End-to-end opsional dengan Playwright:

- Dasbor memuat tanpa error konsol.
- Tambah catatan, reload, catatan masih ada.
- Mode offline menampilkan banner dan data cache.
- Instalasi PWA diuji manual di Android dan iOS.

Aksesibilitas:

- Pemeriksaan otomatis dengan axe di pengembangan.
- Pemeriksaan manual: tab melalui semua kontrol, Escape pada sheet, fokus kembali.

## 16. Deployment

Target: hosting statis dengan HTTPS. Netlify, Vercel, atau Cloudflare Pages semuanya cocok.

Build:

```
npm ci
npm run build
```

Output: `dist`.

Aturan hosting:

- Rewrite semua path ke `index.html` untuk SPA.
- Aset ber-hash: cache `immutable` satu tahun.
- `index.html` dan `sw.js`: `no-cache`.
- HTTPS wajib untuk geolocation dan service worker.

Tidak ada variabel lingkungan rahasia.

## 17. Keamanan dan privasi

- Tidak ada kunci API di klien.
- Tidak ada data pribadi yang dikirim ke server sendiri.
- Koordinat hanya dikirim ke Open-Meteo untuk permintaan data.
- Impor JSON divalidasi dengan Zod dan dibatasi ukurannya sebelum ditulis.
- Konten pengguna dirender sebagai teks. Tidak ada `dangerouslySetInnerHTML`.
- Tautan eksternal memakai `rel="noopener noreferrer"`.
- Ekspor data hanya lewat tindakan pengguna dan tidak diunggah otomatis.
- Analitik tidak dipasang pada v1. Jika ditambahkan nanti, harus tanpa cookie dan dijelaskan di Tentang.

## 18. ADR

ADR-001: Frontend murni dengan API publik.
Alasan: tidak ada beban server, biaya nol, dan cocok untuk aplikasi data lokal. Konsekuensi: tidak ada sinkronisasi antar perangkat.

ADR-002: Dexie, bukan localStorage.
Alasan: data terindeks, transaksi, dan kapasitas lebih besar. Konsekuensi: API asinkron dan perlu penanganan boot tema terpisah.

ADR-003: TanStack Query untuk server state.
Alasan: cache, stale time, retry, dan refetch on focus sudah terbukti. Konsekuensi: satu dependensi tambahan dan kurva belajar.

ADR-004: Open-Meteo untuk cuaca, kualitas udara, dan geocoding.
Alasan: tanpa kunci, satu penyedia, dokumentasi jelas. Konsekuensi: ketergantungan pada satu penyedia dan lisensi non-komersial.

ADR-005: Alarm dalam aplikasi dulu.
Alasan: batas browser nyata dan Capacitor belum masuk lingkup. Konsekuensi: alarm tidak bisa diandalkan saat aplikasi tertutup.

ADR-006: Satu keluarga huruf.
Alasan: beban unduh kecil dan konsistensi lebih mudah dijaga. Konsekuensi: identitas jam bergantung pada skala dan tracking, bukan pada huruf display terpisah.

ADR-007: Cache berlapis, service worker dan Dexie.
Alasan: shell dan respons mentah dari service worker, data terstruktur dan label waktu dari Dexie. Konsekuensi: dua tempat yang harus diuji saat offline.

## 19. Risiko teknis

| Risiko                                | Mitigasi                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| Alarm terlewat saat aplikasi tertutup | Batasan ditulis di UI, notifikasi browser, Capacitor di backlog                 |
| Payload API berubah bentuk            | Validasi opsional dengan Zod di batas API, test fixture                         |
| Data cache menumpuk                   | Batas entri Workbox dan pembersihan cache berdasarkan kunci lokasi              |
| IndexedDB diblokir mode privat        | Deteksi kegagalan buka DB, tampilkan pesan dan mode sementara tanpa penyimpanan |
| DST dan zona waktu                    | Simpan epoch, tampilkan dengan `Intl`, uji perhitungan alarm                    |
| PWA iOS berbeda                       | Uji perangkat nyata, jelaskan batasan di Tentang                                |
