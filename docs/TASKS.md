# TASKS: Nadi

Versi: 0.1
Tanggal: 25 November 2026

## Cara pakai

Kerjakan berurutan per milestone. Satu task selesai hanya jika kriteria penerimaan dan Definition of Done terpenuhi. Centang kotak saat selesai.

Estimasi memakai skala:

- S: setengah hari atau kurang.
- M: satu sampai dua hari.
- L: tiga hari atau lebih.

Estimasi untuk satu orang, kerja penuh waktu. Kerja paruh waktu sekitar dua kali lipat. Angka ini perkiraan, bukan komitmen.

## Definition of Done

Berlaku untuk semua task yang menghasilkan UI:

- Kriteria penerimaan task terpenuhi.
- State loading, kosong, dan error tersedia.
- Tema terang dan gelap diperiksa.
- Lebar 320px, 768px, dan 1280px diperiksa tanpa overflow.
- Bisa dioperasikan dengan keyboard, fokus terlihat.
- Tidak ada error di konsol.
- Tipe TypeScript ketat, lint bersih.
- Logika yang tidak sepele punya unit test.
- Dokumentasi diperbarui bila keputusan berubah.

## M0: Fondasi

Tujuan: proyek bisa dijalankan, di-build, dan di-deploy sebagai shell kosong.

- [x] T0.1 Scaffold proyek (S)
  - Vite + React + TypeScript, ESLint, Prettier, alias `@/`.
  - Penerimaan: `npm run dev` dan `npm run build` berhasil, tidak ada error tipe.

- [x] T0.2 Token desain (S)
  - `styles/tokens.css` dan `styles/global.css`, pemetaan Tailwind.
  - Penerimaan: `data-theme="light"` dan `data-theme="dark"` mengubah seluruh token, tanpa flash saat reload.

- [x] T0.3 Shell dan routing (M)
  - `AppShell`, lima route, halaman 404, lazy loading.
  - Penerimaan: semua nav menuju halaman nyata, tidak ada tautan mati.

- [x] T0.4 Baseline PWA (M)
  - Manifest, ikon placeholder, service worker, `navigateFallback`.
  - Penerimaan: manifest dan service worker aktif. Uji tawaran install di perangkat nyata menyusul di M9.

- [ ] T0.5 Deploy preview (S)
  - Netlify, Vercel, atau Cloudflare Pages. Rewrite SPA aktif.
  - Penerimaan: URL publik bisa dibuka langsung di route dalam.
  - Status: menunggu pilihan akun hosting.

- [x] T0.6 Setup test (S)
  - Vitest + Testing Library + jsdom.
  - Penerimaan: satu test contoh berjalan di `npm test`.

## M1: Design system dan validasi arah visual

Tujuan: komponen dasar siap dan arah visual terbukti sebelum data asli masuk.

- [x] T1.1 Komponen dasar (L)
  - Button, IconButton, Card, Input, TextArea, Select, Toggle, Sheet, Dialog, Toast, Banner, Skeleton, EmptyState, ErrorState.
  - Penerimaan: state hover, active, focus, disabled, dan loading tersedia. Escape dan klik latar menutup sheet dan dialog. Fokus kembali ke pemicu otomatis dari elemen `dialog` native.

- [x] T1.2 Navigasi (M)
  - Bottom tab mobile, rail desktop, indikator aktif.
  - Penerimaan: target sentuh 44px ke atas, aktif ditandai warna dan bobot ikon, semua item terjangkau keyboard.

- [x] T1.3 Komponen state (S)
  - EmptyState, ErrorState, Skeleton, Banner.
  - Penerimaan: EmptyState dipakai di halaman Kalender, Catatan, dan Alarm. Animasi dimatikan saat `prefers-reduced-motion`.

- [ ] T1.4 Ikon (S)
  - Phosphor untuk UI sudah dipakai. Meteocons statis untuk cuaca menyusul bersama M3.
  - Penerimaan: ikon dekoratif `aria-hidden`, tombol ikon punya `aria-label`. Selesai untuk Phosphor, Meteocons tertunda.

- [ ] T1.5 Audit tipografi dan spacing (S)
  - Skala, tabular nums, line height, radius, border sudah konsisten. Label navigasi dan teks bantu kecil masih 11-12px dan perlu keputusan akhir pada audit penuh.
  - Penerimaan: jam tidak bergeser saat digit berubah (tabular nums aktif). Ambang minimum teks belum final.

- [x] T1.6 Prototipe dasbor dengan data palsu (M)
  - Jam, kartu cuaca, kartu AQI, agenda, dan catatan memakai data statis di `features/dashboard/sample-data.ts`.
  - Penerimaan: hierarki terbaca cepat, layout mobile dan desktop siap ditinjau sebelum integrasi API.

Alasan prototipe lebih dulu: mengunci arah visual sebelum biaya integrasi API dan state membuat perubahan layout menjadi mahal.

## M2: Jam, tanggal, dan lokasi

- [x] T2.1 Hook waktu dan sapaan (S)
  - `useNow` satu interval per panel jam, berhenti saat tab tersembunyi, langsung menyegarkan saat tab kembali. Format `id-ID`.
  - Penerimaan: jam hanya ada di `ClockPanel`, jadi detik tidak memicu re-render seluruh halaman. Jam tidak memakai `aria-live`, jadi tidak diumumkan tiap detik.

- [x] T2.2 Alur lokasi (M)
  - Default Jakarta berlabel "Lokasi bawaan", tombol gunakan lokasi saat ini, dan lokasi tersimpan di localStorage.
  - Penerimaan: izin ditolak memunculkan pesan inline dan toast, aplikasi tetap jalan. Lokasi pilihan bertahan setelah reload (diuji dengan Bandung).
  - Catatan: dialog izin perangkat nyata belum diuji otomatis, hanya jalur sukses dan gagal manual.

- [x] T2.3 Pencarian kota (M)
  - Geocoding Open-Meteo, debounce 300ms, minimal dua karakter, validasi Zod.
  - Penerimaan: state loading, kosong, error, dan hasil ada. Memilih hasil langsung menyimpan lokasi dan tampil di Beranda.

- [x] T2.4 Garis hari (M)
  - Posisi sekarang, penanda terbit dan terbenam, agenda berikutnya, ringkasan teks untuk pembaca layar.
  - Penerimaan: `dayFraction` diuji pada 00.00, 12.00, dan 23.59, tidak pernah keluar dari rentang 0 sampai 1.

## M3: Cuaca

- [x] T3.1 Klien API cuaca (M)
  - Validasi manual, bukan Zod, agar bundle awal tidak membengkak. Timeout 8 detik lewat `AbortController`. Cache Dexie dan fallback saat gagal.
  - Penerimaan: unit test untuk sukses, timeout, offline dengan cache, offline tanpa cache, dan pembatalan pemanggil.

- [x] T3.2 Kartu cuaca saat ini (M)
  - Suhu, kondisi, terasa, tinggi dan rendah, kelembapan, angin, tombol `Detail 7 hari`.
  - Penerimaan: skeleton saat memuat, ErrorState dengan coba lagi, label waktu segar atau tersimpan.

- [x] T3.3 Strip per jam (M)
  - 12 jam mulai jam sekarang, penanda "Kini", gulir horizontal.
  - Penerimaan: wadah bisa difokus dengan keyboard, tidak menambah overflow halaman (dipakai `min-w-0`).

- [x] T3.4 Sheet 7 hari (S)
  - Suhu minimum dan maksimum, kondisi, terbit dan terbenam per hari.
  - Penerimaan: buka, tutup, Escape menutup, fokus kembali ke pemicu.

- [x] T3.5 Pemetaan WMO (S)
  - Label Indonesia per kode, ikon siang dan malam lewat `WeatherGlyph`, fallback untuk kode tak dikenal.
  - Penerimaan: semua kode di tabel punya test, termasuk kode 999.

- [x] T3.6 Perilaku data basi dan offline (S)
  - Label "Diperbarui HH.mm" dan "Data tersimpan · Diperbarui HH.mm", plus banner offline di shell.
  - Penerimaan: uji offline dengan reload memakai service worker dan cache Dexie, data tetap tampil tanpa klaim segar.

## M4: Kualitas udara

- [x] T4.1 Klien API kualitas udara (M)
  - Data saat ini dan per jam, validasi manual, timeout 8 detik, cache Dexie, fallback cache.
  - Penerimaan: unit test untuk offline dengan cache, offline tanpa cache, respons kosong, dan pembatalan pemanggil.

- [x] T4.2 Kartu AQI (M)
  - Angka US AQI berwarna kategori, label kategori, saran, PM2.5, PM10, disclaimer, dan atribusi.
  - Penerimaan: enam kategori benar, label teks selalu ada, warna bukan satu-satunya petunjuk.

- [x] T4.3 Grafik 24 jam (M)
  - Recharts dimuat malas lewat `React.lazy`, ringkasan teks untuk pembaca layar, tabel alternatif di dalam elemen `details`.
  - Penerimaan: grafik masuk chunk terpisah dan tidak menambah bundle awal. Animasi mati saat `prefers-reduced-motion`.

- [x] T4.4 Atribusi (S)
  - Teks Open-Meteo dan CAMS di kartu AQI dan di bagian Atribusi pada Pengaturan.
  - Penerimaan: teks atribusi membungkus tanpa terpotong di 320px, dicek lewat uji overflow halaman.

- [x] T4.5 Test batas kategori (S)
  - Batas 50/51, 100/101, 150/151, 200/201, dan 300/301 diuji, termasuk nilai di atas 301.

## M5: Catatan

- [x] T5.1 Skema dan repositori (M)
  - Tabel `notes`, CRUD, urutan pin lalu waktu diubah terbaru, satu-satunya lapisan yang menyentuh Dexie.
  - Penerimaan: unit test CRUD, pemangkasan spasi, pin, hapus, dan urutan.

- [x] T5.2 Daftar, pencarian, pin (M)
  - Pencarian judul dan isi tanpa peduli huruf besar kecil, input di-debounce 200ms lewat `useDebouncedValue`.
  - Penerimaan: state kosong, hasil kosong, dan daftar normal tampil berbeda.

- [x] T5.3 Editor (M)
  - Sheet dengan judul dan isi, validasi 80 dan 5000 karakter, penghitung karakter, simpan dan batal.
  - Penerimaan: menutup editor dengan perubahan memunculkan dialog "Buang perubahan?".

- [x] T5.4 Hapus dengan konfirmasi (S)
  - Dialog menyebut judul catatan, fokus awal di tombol Batal, Escape menutup.
  - Penerimaan: batal mempertahankan catatan, konfirmasi menghapusnya.

- [x] T5.5 Kartu catatan di dasbor (S)
  - Dua catatan terbaru atau yang dipin lewat `useLiveQuery`, tombol catatan cepat.
  - Penerimaan: setelah menambah catatan, kartu langsung berubah tanpa reload.

- [x] T5.6 Test komponen (M)
  - Tambah, cari, pin, hapus, dan konfirmasi buang perubahan.
  - Penerimaan: semua alur lulus di jsdom dengan fake-indexeddb.

## M6: Kalender dan agenda

- [x] T6.1 Grid bulanan (M)
  - Tujuh kolom, awal minggu mengikuti `readWeekStart`, hari ini ditandai lingkaran aksen.
  - Penerimaan: unit test untuk 28, 29, 30, dan 31 hari serta pergantian tahun.

- [x] T6.2 Panel hari (M)
  - Sheet daftar agenda, tombol tambah, state kosong "Belum ada agenda di hari ini.".
  - Penerimaan: terbuka dari tanggal mana pun, fokus terkunci oleh elemen `dialog` modal.

- [x] T6.3 Form agenda (M)
  - Judul, tanggal, sepanjang hari, mulai, selesai, catatan.
  - Penerimaan: judul dan tanggal wajib ditandai, waktu selesai harus setelah mulai.

- [x] T6.4 Repositori agenda (M)
  - CRUD pada tabel `events`, penyaringan rentang lewat indeks `start`, sorting menaik.
  - Penerimaan: unit test CRUD, sorting, dan batas rentang inklusif atau eksklusif.

- [x] T6.5 Kartu agenda di dasbor (S)
  - Maksimal tiga agenda terdekat hari ini dan besok lewat `useLiveQuery`, tombol tambah cepat.
  - Penerimaan: agenda yang sudah lewat tidak ditampilkan sebagai berikutnya.

- [x] T6.6 Test kalender (M)
  - Navigasi bulan, buka panel hari, tambah, dan hapus agenda.
  - Penerimaan: lulus di jsdom tanpa warning React.

## M7: Alarm

- [x] T7.1 Repositori dan form alarm (M)
  - Label, waktu, ulangi (sekali, harian, hari tertentu), menit tunda, aktif. Tabel `alarms` satu-satunya yang disentuh lapisan ini.
  - Penerimaan: validasi waktu dan hari, toggle langsung tersimpan.

- [x] T7.2 Perhitungan waktu berikutnya (M)
  - Waktu lokal dibangun dari komponen tanggal, jadi pergantian hari, tengah malam, dan DST tidak menggeser jam dinding.
  - Penerimaan: unit test untuk sekali, harian, hari tertentu, tengah malam, pergantian tahun, dan pergantian waktu musiman.

- [x] T7.3 Mesin alarm (L)
  - Interval satu detik, layar berbunyi, nada Web Audio berulang, tunda, dan matikan. Dipasang di `AppShell` supaya jalan di semua rute.
  - Penerimaan: alarm berbunyi dalam 1 detik dari waktu yang dijadwalkan saat aplikasi terbuka.

- [x] T7.4 Notifikasi browser (S)
  - Permintaan izin saat menyimpan alarm, langsung jatuh ke mode dalam aplikasi saat ditolak atau tidak didukung.
  - Penerimaan: tidak meminta izin saat aplikasi pertama dibuka.

- [x] T7.5 Banner batasan (S)
  - Teks "Alarm berbunyi selama Nadi terbuka.".
  - Penerimaan: tampil di layar Alarm dan di bagian Tentang Pengaturan.

- [x] T7.6 Alarm terlewat (S)
  - Terlewat dalam 60 detik tetap berbunyi, lebih lama ditandai lewat `lastTriggeredAt` tanpa dibunyikan.
  - Penerimaan: tidak ada alarm berbunyi berulang untuk waktu pemicu yang sama.

- [x] T7.7 Test alarm (M)
  - Form, perhitungan, pemicu, dan tunda.
  - Penerimaan: lulus memakai fake timer, tanpa timer nyata.

## M8: Pengaturan, offline, aksesibilitas, performa

- [x] T8.1 Halaman Pengaturan (M)
  - Lokasi, tema, satuan suhu, format jam, dan awal minggu. Semua menulis ke objek `Settings` di Dexie, dengan tema dan awal minggu bercermin ke `localStorage` untuk boot.
  - Penerimaan: semua pilihan bertahan setelah reload. Diuji di unit dan smoke.

- [x] T8.2 Ekspor dan impor JSON (M)
  - Ekspor seluruh tabel ke satu berkas JSON berisi pengaturan dan lokasi. Impor divalidasi dengan Zod terhadap versi yang didukung dan dibatasi 5 MB.
  - Penerimaan: roundtrip utuh, berkas rusak atau versi asing ditolak dengan pesan jelas.

- [x] T8.3 Hapus semua data (S)
  - Konfirmasi dengan mengetik kata kunci HAPUS, lalu semua tabel dan kunci `localStorage` dibersihkan.
  - Penerimaan: data terhapus, aplikasi kembali ke state awal setelah muat ulang.

- [x] T8.4 Pembaruan PWA (S)
  - Banner versi baru dengan tombol muat ulang, tanpa reload paksa.
  - Penerimaan: pembaruan menunggu tindakan pengguna.

- [x] T8.5 Uji offline (M)
  - Matriks: cold start offline, offline setelah data segar, offline tanpa cache.
  - Penerimaan: perilaku sesuai PRD, label waktu benar.
  - Hasil: tiga skenario diperiksa di `scripts/smoke.mjs`. Offline setelah data segar tetap memuat shell, menampilkan banner "Kamu sedang offline", dan label `Data tersimpan` dari cache. Cold start offline pada konteks yang sama tetap memuat shell. Konteks baru tanpa cache tidak bisa memuat aplikasi, sesuai ekspektasi.

- [x] T8.6 Audit aksesibilitas (M)
  - axe, keyboard, kontras, reduced motion.
  - Penerimaan: tidak ada pelanggaran kritis, semua alur bisa diselesaikan dengan keyboard.
  - Hasil: axe pada Beranda dan Pengaturan bersih dari pelanggaran critical dan serious. Skip link "Lewati ke konten" fokus lebih dulu dan targetnya ada. `prefers-reduced-motion` memangkas transisi ke 0.01ms. Kontras token diuji di unit lewat pemeriksa rasio. Temuan diperbaiki: input berkas impor kini punya `aria-label`. Lighthouse Accessibility 96.

- [x] T8.7 Audit performa (M)
  - Lighthouse mobile, ukuran bundle, LCP.
  - Penerimaan: target terpenuhi atau selisihnya ditulis beserta alasannya.
  - Hasil Lighthouse mobile (Chrome headless, throttle 4x): Performance 93 sampai 94, Accessibility 96, Best Practices 100, CLS 0, TBT 100 sampai 110 ms, FCP 2.2 s.
  - Bundle awal: `index` 123 kB gzip, plus `jsx-runtime` 3 kB dan CSS 8.9 kB gzip. Di bawah target PRD 200 kB. Grafik AQI tetap di chunk terpisah 117 kB gzip dan hanya dimuat malas.
  - Selisih: LCP 2.6 sampai 2.8 s, sedikit di atas target 2.5 s. Alasannya aplikasi ini SPA yang dirender di klien: HTML datang lebih dulu, lalu JS memasang jam yang menjadi elemen LCP. Di bawah throttle CPU 4x, render delay menyumbang sekitar 82 persen LCP. Di perangkat nyata shell tampil jauh lebih cepat (smoke mengukur 112 sampai 128 ms). Kandidat perbaikan dicatat di backlog: sebariskan CSS kritis dan pindahkan pembacaan Dexie dari jalur boot.

- [x] T8.8 Uji lintas perangkat (M)
  - Chrome, Firefox, Safari, Android, iOS.
  - Penerimaan: catatan hasil uji per perangkat.
  - Hasil otomatis:
    - Chrome (mesin Blink) di `scripts/smoke.mjs`: 69 dari 69 pemeriksaan lulus, termasuk offline, axe, keyboard, reduced motion, dan LCP.
    - Firefox (mesin Gecko) di `scripts/smoke-engines.mjs`: lulus alur inti, tanpa overflow 320px, tanpa error konsol.
    - WebKit (mesin Safari) di `scripts/smoke-engines.mjs`: lulus alur inti, tanpa overflow 320px, tanpa error konsol.
  - Catatan manual yang belum diuji di perangkat nyata: instalasi Android dan iOS (T9.2), menunggu hosting HTTPS (T0.5). Alarm native juga menunggu milestone Capacitor.

- [x] T8.9 Dokumentasi dan studi kasus (M)
  - README dengan cara jalan, tangkapan layar, keputusan desain, batasan.
  - Penerimaan: orang lain bisa menjalankan proyek dari nol.
  - Hasil: `README.md` memuat cara jalan, tabel skrip, tangkapan layar, keputusan, dan batasan. Tangkapan layar dihasilkan ulang dengan `npm run screenshots`. Tabel keputusan dan batasan diperbarui di `docs/README.md`.

## M9: Rilis

- [ ] T9.1 Lighthouse final (S)
- [ ] T9.2 Uji instalasi Android dan iOS (S)
- [ ] T9.3 Deploy produksi dan domain (S)
- [ ] T9.4 Tag rilis v1.0 dan catatan rilis (S)

## M10: Pembungkus Capacitor dan alarm native

Tujuan: alarm berbunyi tepat waktu lewat sistem, bahkan saat aplikasi tertutup dan ponsel terkunci. Android jadi target utama. Distribusi lewat APK sideload, tanpa Play Store.

- [x] T10.1 Proyek Capacitor (M)
  - `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, dan `@capacitor/local-notifications`. Proyek `android/` dibuat dengan `npx cap add android`, appId `id.nadi.app`, webDir `dist`.
  - Penerimaan: `npx cap sync android` menyalin bundel web dan mengenali plugin.

- [x] T10.2 Penjadwal alarm native Tier 1 (M)
  - `alarm-scheduler.ts` menyelaraskan daftar alarm Dexie ke `AlarmManager` lewat notifikasi lokal pasti. Tujuh kemunculan berikutnya per alarm berulang. Diselaraskan saat boot dan setiap daftar berubah lewat `NativeAlarmSync`.
  - Penerimaan: `buildNativeNotifications` dan `upcomingOccurrences` diuji di unit. HP tetap berbunyi saat aplikasi tertutup.

- [x] T10.3 Perizinan dan kanal notifikasi (S)
  - `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `VIBRATE`. Kanal `nadi-alarm` dengan importance maksimum.
  - Penerimaan: izin diminta saat membuat atau mengaktifkan alarm, bukan saat boot.

- [x] T10.4 Bunyi alarm dan APK debug (S)
  - Bunyi bundel `res/raw/alarm.wav` dibuat lewat `scripts/make-alarm-sound.mjs`. APK debug dibangun dengan Gradle.
  - Penerimaan: `android/app/build/outputs/apk/debug/app-debug.apk` terpasang lewat sideload dan alarm berbunyi.

- [x] T10.5 Tier 2: alarm layar penuh (L)
  - Plugin native `NativeAlarm` (Java) dengan penjadwalan `AlarmManager`, layanan latar depan `mediaPlayback`, full-screen intent, bunyi berulang lewat `MediaPlayer`, dan tombol Tunda serta Matikan di notifikasi dan di `AlarmActivity`. `BootReceiver` memasang ulang alarm setelah reboot.
  - Lapisan web memilih Tier 2 bila plugin terdaftar, dengan `@capacitor/local-notifications` sebagai cadangan.
  - Penerimaan: kode terkompilasi dan APK terbangun. Verifikasi di perangkat ada di T10.6.

- [ ] T10.6 Uji di perangkat nyata (M)
  - Uji alarm saat ponsel terkunci, setelah reboot, dan pada OEM yang agresif mematikan latar belakang (Xiaomi, Oppo, Vivo). Pastikan izin layar penuh dan alarm pasti diberikan.
  - Penerimaan: catatan hasil per perangkat.

## M11: Tinggi dan berat badan ideal

Tujuan: menghitung tinggi dan berat badan ideal menurut umur, jenis kelamin, dan tinggi badan. Fitur punya rute sendiri `/tumbuh-kembang` dan kartu pintu masuk ringkas di dasbor.

- [x] T11.1 Tabel LMS yang dibundel (M)
  - `scripts/build-growth-data.mjs` mengubah tabel WHO menjadi modul `src/features/growth/growth-data.ts`. Sumber data dari paket `child-growth-standards` (MIT), yaitu WHO Child Growth Standards (0 sampai 5 tahun) dan WHO Growth Reference (5 sampai 19 tahun).
  - Penerimaan: skrip dijalankan ulang menghasilkan berkas yang sama, tanpa permintaan jaringan.

- [x] T11.2 Perhitungan z-score dan klasifikasi (M)
  - `growth-calc.ts` menghitung z-score LMS, interpolasi antar bulan, dan rentang sehat. Anak memakai ambang Permenkes No. 2 Tahun 2020. Dewasa memakai rumus Devine dan titik potong IMT Asia-Pasifik.
  - Penerimaan: rumus dan batas diuji di unit.

- [x] T11.3 Halaman dan kartu dasbor (M)
  - `GrowthPage.tsx` di rute `/tumbuh-kembang`, dimuat malas agar tabel tidak masuk bundel awal. Kartu masuk di dasbor.
  - Penerimaan: hasil tampil tanpa internet, dan uji asap serta tangkapan layar menutup alurnya.

- [x] T11.4 Rumus dewasa alternatif (S)
  - Rumus Devine, Robinson, Miller, dan Hamwi di `adult-formula.ts`, terpisah dari tabel WHO agar halaman Pengaturan tidak membawa data pertumbuhan.
  - Pilihan rumus memakai `settings.idealWeightFormula` dan diubah dari halaman Pengaturan.
  - Penerimaan: pilihan tersimpan di pengaturan dan dipakai halaman Tumbuh kembang. Diuji di unit dan di halaman Pengaturan.

## Backlog setelah v1

- Sebariskan CSS kritis dan pindahkan pembacaan Dexie dari jalur boot untuk menekan LCP di bawah 2.5 s pada throttle mobile.
- Sinkronisasi Google Calendar.
- Jam dunia.
- Konversi ISPU Indonesia.
- Peringatan cuaca ekstrem.
- Beberapa lokasi tersimpan.
- Antar muka dua bahasa.
- Widget sistem operasi.
- Ekspor catatan ke Markdown.

## Urutan yang disarankan

1. M0 dan M1, termasuk prototipe data palsu.
2. M2, karena jam dan lokasi dipakai semua modul.
3. M3, lalu M4, karena keduanya berbagi pola cache dan state.
4. M5, M6, M7, dari yang paling sederhana ke paling rumit.
5. M8 dan M9.

Jangan mulai dari catatan atau alarm. Keduanya menggoda karena terasa mudah, tetapi arah visual dan pola data belum terkunci. Mulai dari dasbor memaksa keputusan layout dan token diambil lebih awal.

## Perkiraan total

| Milestone | Perkiraan             |
| --------- | --------------------- |
| M0        | 2 hari                |
| M1        | 4 hari                |
| M2        | 2 hari                |
| M3        | 3 hari                |
| M4        | 2 hari                |
| M5        | 3 hari                |
| M6        | 3 hari                |
| M7        | 3 hari                |
| M8        | 4 hari                |
| M9        | 1 hari                |
| M10       | 3 hari                |
| M11       | 2 hari                |
| Total     | sekitar 32 hari kerja |

Paruh waktu sekitar 6 sampai 8 minggu. Jika waktu terbatas, tunda M6 dan M7 ke v1.1 dan rilis dasbor, cuaca, AQI, serta catatan lebih dulu. Jangan memotong state, aksesibilitas, atau pengujian offline, karena ketiganya adalah nilai jual proyek ini.
