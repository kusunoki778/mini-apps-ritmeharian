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

- [ ] T2.1 Hook waktu dan sapaan (S)
  - Satu interval, format `id-ID`, sapaan pagi sampai malam.
  - Penerimaan: pembaruan tiap detik, tidak memicu re-render seluruh halaman, jam tidak diumumkan pembaca layar tiap detik.

- [ ] T2.2 Alur lokasi (M)
  - Izin geolocation, fallback pencarian kota, default Jakarta berlabel.
  - Penerimaan: izin ditolak tidak memblokir aplikasi, lokasi tersimpan setelah reload.

- [ ] T2.3 Pencarian kota (M)
  - Geocoding Open-Meteo, debounce 300ms, minimal dua karakter.
  - Penerimaan: state loading, kosong, error, dan hasil; memilih hasil langsung menyimpan lokasi.

- [ ] T2.4 Garis hari (M)
  - Posisi waktu sekarang, matahari terbit dan terbenam, agenda berikutnya.
  - Penerimaan: akurat pada 00.00 dan 23.59, punya ringkasan teks untuk pembaca layar.

## M3: Cuaca

- [ ] T3.1 Klien API cuaca (M)
  - Tipe, timeout 8 detik, penulisan cache Dexie, fallback cache.
  - Penerimaan: unit test untuk sukses, timeout, offline dengan cache, offline tanpa cache.

- [ ] T3.2 Kartu cuaca saat ini (M)
  - Suhu, kondisi, terasa, kelembapan, angin, tombol detail.
  - Penerimaan: loading, error dengan retry, data basi dengan label waktu.

- [ ] T3.3 Strip per jam (M)
  - Minimal 12 jam, scroll horizontal, penanda jam sekarang.
  - Penerimaan: bisa di-scroll dengan keyboard, tidak ada overflow halaman.

- [ ] T3.4 Sheet 7 hari (S)
  - Suhu minimum dan maksimum, kondisi, terbit dan terbenam.
  - Penerimaan: buka, tutup, Escape, fokus kembali.

- [ ] T3.5 Pemetaan WMO (S)
  - Label Indonesia, ikon siang dan malam, fallback kode tidak dikenal.
  - Penerimaan: semua kode di tabel punya test.

- [ ] T3.6 Perilaku data basi dan offline (S)
  - Label "Diperbarui HH.mm", banner offline.
  - Penerimaan: data tetap tampil saat offline, tidak ada klaim data segar.

## M4: Kualitas udara

- [ ] T4.1 Klien API kualitas udara (M)
  - Data saat ini dan per jam, cache, fallback, timeout.
  - Penerimaan: unit test untuk kasus offline dan respons kosong.

- [ ] T4.2 Kartu AQI (M)
  - Angka US AQI, kategori, PM2.5, saran, disclaimer.
  - Penerimaan: enam kategori benar, selalu ada label teks, warna bukan satu-satunya petunjuk.

- [ ] T4.3 Grafik 24 jam (M)
  - Recharts dimuat malas, ringkasan teks, tabel alternatif.
  - Penerimaan: tidak menambah bundle awal, tidak ada animasi saat reduced motion.

- [ ] T4.4 Atribusi (S)
  - Open-Meteo dan CAMS di kartu dan Pengaturan.
  - Penerimaan: teks atribusi tidak terpotong di 320px.

- [ ] T4.5 Test batas kategori (S)
  - 50/51, 100/101, 150/151, 200/201, 300/301.
  - Penerimaan: semua batas diuji.

## M5: Catatan

- [ ] T5.1 Skema dan repositori (M)
  - Tabel `notes`, CRUD, urutan pin lalu terbaru.
  - Penerimaan: unit test CRUD dan urutan.

- [ ] T5.2 Daftar, pencarian, pin (M)
  - Pencarian judul dan isi, tidak peka huruf besar kecil.
  - Penerimaan: state kosong, hasil kosong, dan daftar normal berbeda.

- [ ] T5.3 Editor (M)
  - Sheet atau dialog, validasi 80 dan 5000 karakter, simpan dan batal.
  - Penerimaan: perubahan belum disimpan memicu konfirmasi saat ditutup.

- [ ] T5.4 Hapus dengan konfirmasi (S)
  - Dialog menyebut judul catatan.
  - Penerimaan: fokus awal di tombol batal, Escape menutup.

- [ ] T5.5 Kartu catatan di dasbor (S)
  - Dua catatan terbaru atau dipin, tombol catatan cepat.
  - Penerimaan: setelah menambah catatan, kartu langsung berubah.

- [ ] T5.6 Test komponen (M)
  - Tambah, cari, pin, hapus.
  - Penerimaan: semua alur lulus di jsdom.

## M6: Kalender dan agenda

- [ ] T6.1 Grid bulanan (M)
  - Tujuh kolom, awal minggu mengikuti pengaturan, hari ini ditandai.
  - Penerimaan: benar untuk bulan dengan 28, 29, 30, dan 31 hari, serta pergantian tahun.

- [ ] T6.2 Panel hari (M)
  - Daftar agenda, tombol tambah, state kosong.
  - Penerimaan: buka dari tanggal mana pun, fokus terkunci.

- [ ] T6.3 Form agenda (M)
  - Judul, tanggal, mulai, selesai, sepanjang hari, catatan.
  - Penerimaan: validasi waktu selesai setelah mulai, field wajib ditandai.

- [ ] T6.4 Repositori agenda (M)
  - CRUD, sorting berdasarkan waktu mulai.
  - Penerimaan: unit test CRUD dan sorting.

- [ ] T6.5 Kartu agenda di dasbor (S)
  - Maksimal tiga agenda terdekat hari ini dan besok.
  - Penerimaan: agenda yang sudah lewat tidak ditampilkan sebagai berikutnya.

- [ ] T6.6 Test kalender (M)
  - Navigasi bulan, buka panel hari, tambah dan hapus agenda.
  - Penerimaan: lulus di jsdom, tidak ada warning React.

## M7: Alarm

- [ ] T7.1 Repositori dan form alarm (M)
  - Label, waktu, ulangi, aktif, tunda.
  - Penerimaan: validasi waktu dan hari, toggle langsung tersimpan.

- [ ] T7.2 Perhitungan waktu berikutnya (M)
  - Sekali, harian, hari tertentu, tengah malam, DST.
  - Penerimaan: unit test semua kasus.

- [ ] T7.3 Mesin alarm (L)
  - Interval, layar berbunyi, nada Web Audio, tunda, matikan.
  - Penerimaan: alarm berbunyi dalam 1 detik dari waktu yang dijadwalkan saat aplikasi terbuka.

- [ ] T7.4 Notifikasi browser (S)
  - Permintaan izin saat membuat alarm, fallback saat ditolak.
  - Penerimaan: tidak meminta izin saat aplikasi pertama dibuka.

- [ ] T7.5 Banner batasan (S)
  - Teks bahwa alarm hanya berbunyi saat aplikasi terbuka.
  - Penerimaan: tampil di layar Alarm dan di Tentang.

- [ ] T7.6 Alarm terlewat (S)
  - Dalam 60 detik terakhir ditampilkan, lebih lama ditandai terlewat.
  - Penerimaan: tidak ada alarm berbunyi berulang.

- [ ] T7.7 Test alarm (M)
  - Form, perhitungan, trigger, tunda.
  - Penerimaan: lulus, tidak memakai timer nyata di test.

## M8: Pengaturan, offline, aksesibilitas, performa

- [ ] T8.1 Halaman Pengaturan (M)
  - Lokasi, tema, satuan, format jam, awal minggu.
  - Penerimaan: semua pilihan bertahan setelah reload.

- [ ] T8.2 Ekspor dan impor JSON (M)
  - Ekspor semua data, impor dengan validasi Zod dan batas ukuran.
  - Penerimaan: roundtrip utuh, file rusak ditolak dengan pesan jelas.

- [ ] T8.3 Hapus semua data (S)
  - Konfirmasi dengan mengetik kata kunci.
  - Penerimaan: data terhapus, aplikasi kembali ke state awal.

- [ ] T8.4 Pembaruan PWA (S)
  - Banner versi baru, tombol muat ulang.
  - Penerimaan: tidak reload paksa saat pengguna sedang mengetik.

- [ ] T8.5 Uji offline (M)
  - Matriks: cold start offline, offline setelah data segar, offline tanpa cache.
  - Penerimaan: perilaku sesuai PRD, label waktu benar.

- [ ] T8.6 Audit aksesibilitas (M)
  - axe, keyboard, kontras, reduced motion.
  - Penerimaan: tidak ada pelanggaran kritis, semua alur bisa diselesaikan dengan keyboard.

- [ ] T8.7 Audit performa (M)
  - Lighthouse mobile, ukuran bundle, LCP.
  - Penerimaan: target terpenuhi atau selisihnya ditulis beserta alasannya.

- [ ] T8.8 Uji lintas perangkat (M)
  - Chrome, Firefox, Safari, Android, iOS.
  - Penerimaan: catatan hasil uji per perangkat.

- [ ] T8.9 Dokumentasi dan studi kasus (M)
  - README dengan cara jalan, tangkapan layar, keputusan desain, batasan.
  - Penerimaan: orang lain bisa menjalankan proyek dari nol.

## M9: Rilis

- [ ] T9.1 Lighthouse final (S)
- [ ] T9.2 Uji instalasi Android dan iOS (S)
- [ ] T9.3 Deploy produksi dan domain (S)
- [ ] T9.4 Tag rilis v1.0 dan catatan rilis (S)

## Backlog setelah v1

- Pembungkus Capacitor dan notifikasi lokal native.
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

| Milestone | Perkiraan |
|---|---|
| M0 | 2 hari |
| M1 | 4 hari |
| M2 | 2 hari |
| M3 | 3 hari |
| M4 | 2 hari |
| M5 | 3 hari |
| M6 | 3 hari |
| M7 | 3 hari |
| M8 | 4 hari |
| M9 | 1 hari |
| Total | sekitar 27 hari kerja |

Paruh waktu sekitar 6 sampai 8 minggu. Jika waktu terbatas, tunda M6 dan M7 ke v1.1 dan rilis dasbor, cuaca, AQI, serta catatan lebih dulu. Jangan memotong state, aksesibilitas, atau pengujian offline, karena ketiganya adalah nilai jual proyek ini.
