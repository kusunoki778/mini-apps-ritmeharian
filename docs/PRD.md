# PRD: Nadi

Versi: 0.1
Tanggal: 25 November 2026
Status: draf untuk direview
Pemilik: Muhamad Fadhlurr

## 1. Ringkasan

Nadi adalah aplikasi web progresif (PWA) yang menampilkan informasi harian dalam satu dasbor: jam, tanggal, cuaca, kualitas udara, agenda, catatan, alarm, dan kalkulator. Aplikasi berjalan tanpa akun dan tanpa backend. Data pribadi disimpan di perangkat pengguna. Data cuaca dan kualitas udara diambil dari Open-Meteo.

Kalimat posisi: satu layar untuk tahu keadaan hari ini.

## 2. Masalah

Pagi hari biasanya memaksa seseorang membuka beberapa aplikasi: jam atau widget, aplikasi cuaca, aplikasi kualitas udara, kalender, catatan, lalu alarm. Setiap perpindahan memutus konteks dan menambah waktu.

Aplikasi yang ada juga terpisah: aplikasi cuaca tidak tahu agenda hari ini, catatan tidak terhubung ke jadwal, dan alarm tidak memberi konteks apa pun. Untuk penggunaan harian, friksi kecil ini terasa berulang.

Peluang yang diambil Nadi: satu permukaan ringan yang bisa di-install, tetap berguna saat offline, dan tidak meminta akun.

## 3. Tujuan

- G1: satu dasbor menjawab lima pertanyaan pagi: jam berapa, cuaca bagaimana, udara bagaimana, ada agenda apa, alarm berikutnya kapan.
- G2: tetap berguna tanpa sinyal untuk data lokal dan data cuaca terakhir.
- G3: bisa di-install sebagai PWA dan tetap nyaman di layar 320px.
- G4: menjadi bukti portofolio untuk React, TypeScript, integrasi API, PWA, dan aksesibilitas.

## 4. Metrik keberhasilan

Angka berikut adalah target yang diukur saat build produksi, bukan klaim.

- Lighthouse Performance minimal 90 pada perangkat mobile.
- Lighthouse Accessibility minimal 95.
- PWA dapat di-install, dengan manifest dan service worker valid.
- Catatan, agenda, dan alarm tetap ada setelah reload dan setelah browser ditutup.
- Dasbor tetap terbuka saat offline dan menampilkan data cache beserta waktu pengambilan.
- Tidak ada horizontal overflow pada lebar 320px.
- Semua kontrol dapat dioperasikan dengan keyboard, dengan indikator fokus yang terlihat.
- Tidak ada error di konsol pada alur utama.

## 5. Persona

Rani, 22, mahasiswa. Membuka ponsel sebentar sebelum kelas. Butuh tahu cuaca, kualitas udara, dan jadwal hari ini tanpa membuka banyak aplikasi.

Dimas, 28, pekerja remote. Keluar rumah beberapa kali sehari. Peduli kualitas udara dan ingin alarm serta catatan singkat ada di tempat yang sama.

Rina, 31, reviewer portofolio. Membuka aplikasi sekali untuk menilai kualitas teknis. Yang dinilai: performa, state kosong dan error, aksesibilitas, dan kerapian kode.

## 6. Prinsip produk

1. Satu layar menjawab hari ini. Informasi sekunder tidak boleh mengalahkan jam dan cuaca.
2. Cepat dibaca. Kepadatan data dijaga, tetapi tidak sampai menjadi dashboard monitoring.
3. Jujur soal batasan. Alarm berbasis web tidak bisa diandalkan saat aplikasi tertutup, dan ini ditulis di UI.
4. Data milik pengguna. Tidak ada akun, tidak ada unggahan data pribadi ke server sendiri.
5. Tanpa akun, tanpa sinyal, tetap jalan untuk data lokal.

## 7. Lingkup

| Prioritas  | Item                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Must       | Dasbor, jam dan tanggal, cuaca saat ini, prakiraan per jam, prakiraan 7 hari, kualitas udara saat ini, catatan (buat, baca, ubah, hapus, cari, pin), kalender bulanan dengan agenda lokal, alarm dalam aplikasi, kalkulator ilmiah dan BMI, pengaturan lokasi, tema terang dan gelap, PWA installable, offline shell, responsif 320px ke atas, aksesibilitas dasar |
| Should     | Jam dunia, grafik AQI 24 jam, pengingat agenda dalam aplikasi, stopwatch dan timer, kompas, pintasan keyboard, ekspor dan impor data JSON, indikator data basi                                                                                                                                                                                                     |
| Could      | Integrasi Google Calendar, peringatan cuaca ekstrem, beberapa lokasi tersimpan, konversi ISPU                                                                                                                                                                                                                                                                      |
| Won't (v1) | Akun, backend sendiri, sinkronisasi cloud, kolaborasi, widget sistem operasi                                                                                                                                                                                                                                                                                       |

## 8. User story dan kriteria penerimaan

| ID    | User story                                                                                     | Kriteria penerimaan                                                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-01 | Sebagai pengguna, saya ingin melihat jam, tanggal, dan lokasi saat ini begitu aplikasi dibuka. | Jam diperbarui tiap detik. Tanggal mengikuti lokal perangkat. Nama lokasi tampil. Tidak ada layout shift saat jam berganti digit.                                                                               |
| US-02 | Sebagai pengguna, saya ingin tahu cuaca saat ini dan beberapa jam ke depan.                    | Suhu, kondisi, suhu terasa, kelembapan, dan angin tampil. Strip per jam menampilkan minimal 12 jam ke depan. Prakiraan 7 hari tersedia. Ada state loading, error, dan data basi.                                |
| US-03 | Sebagai pengguna, saya ingin tahu kualitas udara sekarang.                                     | Nilai AQI, kategori, polutan dominan, dan saran singkat tampil. Sumber dan standar AQI disebut. Warna tidak menjadi satu-satunya penanda kategori.                                                              |
| US-04 | Sebagai pengguna, saya ingin mencatat hal cepat.                                               | Catatan bisa dibuat, dibaca, diubah, dihapus, dicari, dan dipin. Data bertahan setelah reload. Ada state kosong dan konfirmasi hapus.                                                                           |
| US-05 | Sebagai pengguna, saya ingin melihat agenda bulan ini.                                         | Kalender bulanan tampil bersama catatan dalam satu halaman. Agenda bisa dibuat, diubah, dan dihapus, dan bisa dipasangi nada dering. Agenda hari ini muncul di dasbor.                                          |
| US-06 | Sebagai pengguna, saya ingin memasang alarm.                                                   | Alarm bisa dibuat, diubah, dihapus, dan diaktifkan. Alarm berbunyi saat aplikasi terbuka, dan di Android tetap berbunyi saat aplikasi tertutup. Nada alarm bisa dipilih. Batasan web dijelaskan di layar alarm. |
| US-07 | Sebagai pengguna, saya ingin memilih tema terang atau gelap.                                   | Pilihan Sistem, Terang, dan Gelap tersedia. Pilihan bertahan setelah reload. Kedua tema lolos pemeriksaan kontras.                                                                                              |
| US-08 | Sebagai pengguna, saya ingin tetap melihat data saat offline.                                  | Dasbor tetap terbuka. Data cache tampil dengan label waktu. Data lokal tetap bisa diubah.                                                                                                                       |
| US-09 | Sebagai pengguna, saya ingin memasang aplikasi ke layar utama.                                 | Manifest valid, ikon tersedia, dan aplikasi terbuka dalam mode standalone setelah dipasang.                                                                                                                     |
| US-10 | Sebagai pengguna, saya ingin mengganti lokasi.                                                 | Pencarian kota berjalan. Izin lokasi bisa ditolak tanpa memblokir aplikasi. Lokasi pilihan bertahan setelah reload.                                                                                             |
| US-11 | Sebagai pengguna, saya ingin menghitung cepat.                                                 | Kalkulator ilmiah lengkap dan kalkulator BMI tersedia dalam satu halaman. Hasil menghormati urutan operasi.                                                                                                     |
| US-12 | Sebagai pengguna, saya ingin stopwatch, timer, dan kompas.                                     | Stopwatch dan timer berjalan dan bisa direset. Timer tetap berbunyi saat aplikasi tertutup di Android. Kompas menampilkan arah dari sensor perangkat, atau ajakan mengaktifkan sensor di desktop.               |

## 9. Kebutuhan fungsional

### FR-01 Jam dan tanggal

- Jam besar dengan format 24 jam sebagai default. Format 12 jam tersedia di Pengaturan.
- Tanggal lengkap dalam bahasa Indonesia, contoh: "Selasa, 25 November 2026".
- Sapaan mengikuti waktu: pagi (04.00-10.59), siang (11.00-14.59), sore (15.00-17.59), malam (18.00-03.59).
- Jam tidak diumumkan oleh pembaca layar setiap detik. Jam memakai elemen dengan `aria-hidden` untuk detik, atau pembaruan teks tanpa live region.

### FR-02 Lokasi

- Saat pertama dibuka, pengguna diminta memilih: gunakan lokasi saat ini atau cari kota.
- Jika izin ditolak, aplikasi menampilkan pencarian kota dan memakai Jakarta sebagai default sementara dengan label jelas.
- Lokasi tersimpan di perangkat dan dipakai ulang.
- Nama lokasi berasal dari hasil pencarian atau dari koordinat terakhir yang dipilih.

### FR-03 Cuaca

- Sumber: Open-Meteo Forecast API.
- Data saat ini: suhu, suhu terasa, kelembapan, kecepatan angin, kode cuaca, dan status siang atau malam.
- Data per jam: suhu, kode cuaca, peluang hujan, minimal 12 jam ke depan.
- Data harian: kode cuaca, suhu minimum dan maksimum, matahari terbit dan terbenam, 7 hari.
- Kode cuaca WMO dipetakan ke label Indonesia dan ikon.
- Data dianggap basi setelah 30 menit. Label waktu tampil saat data basi.
- Kegagalan API tidak memblokir modul lain. Kartu cuaca menampilkan pesan dan tombol coba lagi.

### FR-04 Kualitas udara

- Sumber: Open-Meteo Air Quality API.
- Data: US AQI, PM2.5, PM10, dan European AQI sebagai data pendukung.
- Kategori US AQI: Baik (0-50), Sedang (51-100), Tidak sehat bagi kelompok sensitif (101-150), Tidak sehat (151-200), Sangat tidak sehat (201-300), Berbahaya (301 ke atas).
- Saran kesehatan bersifat umum dan diberi catatan bahwa itu bukan nasihat medis.
- Standar yang dipakai ditulis di kartu: "US AQI". Konversi ke ISPU Indonesia masuk backlog karena butuh tabel breakpoint terpisah.
- Warna kategori selalu disertai label teks dan angka.

### FR-05 Catatan

- Field: judul (wajib, maksimal 80 karakter), isi (wajib, maksimal 5000 karakter), pin, waktu dibuat, waktu diubah.
- Aksi: buat, baca, ubah, hapus, cari, pin atau lepas pin.
- Urutan: pin lebih dulu, lalu waktu diubah terbaru.
- Pencarian mencakup judul dan isi, tidak peka huruf besar kecil.
- Hapus meminta konfirmasi.
- State kosong menjelaskan cara membuat catatan pertama.

### FR-06 Kalender dan agenda

- Tampilan bulanan dengan navigasi bulan sebelumnya dan berikutnya, serta tombol kembali ke hari ini.
- Agenda: judul (wajib), tanggal (wajib), waktu mulai dan selesai (opsional), sepanjang hari (opsional), catatan (opsional), dan nada dering (opsional).
- Agenda dengan nada dering berbunyi seperti alarm pada waktunya, dengan pilihan kapan berbunyi (tepat mulai sampai satu jam sebelum) dan pilihan nada. Titik merah menandai agenda ini di kalender.
- Agenda bisa dibuat, diubah, dan dihapus dari panel hari. Kalender dan catatan berada dalam satu halaman, agenda lebih dulu lalu daftar catatan.
- Dasbor menampilkan maksimal tiga agenda terdekat hari ini dan besok.
- Di web pengingat berjalan selama aplikasi terbuka. Di aplikasi Android, pengingat agenda dijadwalkan ke sistem sehingga tetap berbunyi saat aplikasi tertutup.

### FR-07 Alarm

- Field: label, waktu, ulangi (sekali, setiap hari, atau hari tertentu), aktif, menit tunda, dan nada dering per alarm.
- Nada dering dipilih dari enam nada bundel; pengaturan menyediakan nada bawaan untuk alarm baru dan timer.
- Alarm berbunyi saat aplikasi terbuka. Bunyi memakai Web Audio, tanpa file audio eksternal pada v1.
- Di aplikasi Android, alarm dijadwalkan ke sistem, berbunyi tepat waktu walau aplikasi tertutup, dan memakai salah satu dari enam nada bundel: Nadi, Lembut, Tegas, Lonceng, Denyut, Fajar.
- Notifikasi browser dipakai jika izin diberikan.
- Tombol tunda menunda 5 menit sebagai default.
- Batas jelas di layar saat web: "Alarm hanya berbunyi saat Nadi terbuka." Di Android batas ini digantikan penjadwalan native.
- Alarm sekali pakai otomatis nonaktif setelah berbunyi.
- Stopwatch dan timer tersedia di halaman Alarm. Timer tetap berbunyi saat aplikasi tertutup di Android.

### FR-08 Pengaturan

- Lokasi: cari kota, gunakan lokasi saat ini.
- Tema: Sistem, Terang, Gelap.
- Satuan suhu: Celsius atau Fahrenheit.
- Format jam: 24 jam atau 12 jam.
- Awal minggu: Senin atau Minggu.
- Ekspor data ke JSON, impor dari JSON dengan validasi.
- Hapus semua data dengan konfirmasi teks.
- Nada alarm: pilih satu dari enam nada bundel untuk alarm dan timer.
- Aplikasi Android: unduh APK dari peramban.
- Tentang: versi, sumber data, atribusi Open-Meteo dan CAMS, lisensi.

### FR-09 PWA dan offline

- Manifest lengkap: nama, nama pendek, ikon 192 dan 512, warna tema, mode standalone.
- Service worker menyimpan shell aplikasi dan respons API terakhir.
- Saat offline, data cache tampil dengan label waktu pengambilan.
- Aplikasi menampilkan banner offline yang bisa ditutup.
- Pembaruan service worker memberi tahu pengguna dan menunggu reload.

### FR-10 Tema dan aksesibilitas

- Token warna terang dan gelap berbasis CSS variable.
- Tema awal mengikuti `prefers-color-scheme`, lalu pilihan pengguna.
- Tidak ada flash tema saat memuat halaman.
- Kontras teks memenuhi WCAG AA.
- Target sentuh minimal 44x44px.
- Panel dan dialog bisa ditutup dengan Escape dan mengunci fokus.
- `prefers-reduced-motion` dihormati.
- Seluruh alur utama bisa diselesaikan dengan keyboard.

### FR-11 Kalkulator

- Halaman sendiri di navigasi bawah, menggantikan tab kalender.
- Mode Ilmiah: kurung, persen, pangkat, akar kuadrat dan kubik, sin, cos, tan beserta invers, log, ln, pi, e, faktorial, mode sudut derajat atau radian, pratinjau hasil langsung, dan riwayat singkat.
- Mode BMI: tinggi dan berat, angka IMT, kategori memakai ambang Asia, dan rentang berat sehat.
- Hasil memakai batas "panduan umum, bukan nasihat medis" pada bagian BMI.

### FR-12 Alat dan kompas

- Stopwatch dan timer di halaman Alarm. Timer memakai nada alarm terpilih dan di Android dijadwalkan ke sistem supaya tetap berbunyi saat aplikasi tertutup.
- Kompas di dasbor memakai sensor `deviceorientation`. Tidak ada permintaan internet. Di peramban desktop hanya menampilkan ajakan mengaktifkan sensor.

## 10. Kebutuhan non-fungsional

Performa:

- JavaScript awal di bawah 200KB gzip, tanpa grafik yang dimuat malas.
- Grafik AQI dimuat malas.
- Font disubset ke latin dan latin-ext, dengan `font-display: swap`.
- Tinggi kartu dicadangkan untuk mencegah layout shift.

Aksesibilitas:

- Struktur landmark: header, nav, main.
- Satu `h1` per halaman, level heading tidak melompat.
- Fokus terlihat di semua elemen interaktif.
- Ikon dekoratif memakai `aria-hidden`.
- Tombol ikon memiliki nama aksesibel.

Privasi:

- Tidak ada akun dan tidak ada analitik pada v1.
- Koordinat dikirim ke Open-Meteo hanya untuk permintaan cuaca dan kualitas udara.
- Semua data pribadi disimpan lokal.
- Ekspor data hanya terjadi atas tindakan pengguna.

Kompatibilitas:

- Chrome, Edge, Firefox, dan Safari versi terbaru.
- Android dan iOS, termasuk mode standalone.
- Lebar 320px sampai 1440px.

Lisensi dan atribusi:

- Atribusi Open-Meteo dan CAMS tampil di Pengaturan dan Tentang.
- Penggunaan non-komersial. Penggunaan komersial memerlukan peninjauan lisensi.

## 11. Batasan dan risiko

| Risiko                                          | Dampak                          | Mitigasi                                                                     |
| ----------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| Alarm web tidak berjalan saat aplikasi tertutup | Pengguna melewatkan alarm       | Tulis batasan di UI, sediakan notifikasi browser, siapkan Capacitor untuk v2 |
| Kuota dan kebijakan Open-Meteo berubah          | Data cuaca berhenti             | Cache respons terakhir, tangani 429 dengan backoff, pantau dokumentasi       |
| Izin lokasi ditolak                             | Pengalaman pertama terganggu    | Fallback pencarian kota dan default yang diberi label                        |
| Scope enam modul melebar                        | Rilis tertunda                  | Urutan milestone, fitur Should dan Could dipisah                             |
| Perbedaan perilaku PWA di iOS                   | Install dan notifikasi terbatas | Uji di perangkat nyata, jelaskan batasan di Tentang                          |
| Data AQI disalahartikan sebagai nasihat medis   | Risiko komunikasi               | Label standar, saran umum, disclaimer singkat                                |

## 12. Rencana rilis

| Milestone | Isi                                             |
| --------- | ----------------------------------------------- |
| M0        | Fondasi proyek, tooling, shell, tema, PWA dasar |
| M1        | Design system dan komponen dasar                |
| M2        | Jam, tanggal, lokasi                            |
| M3        | Cuaca                                           |
| M4        | Kualitas udara                                  |
| M5        | Catatan                                         |
| M6        | Kalender dan agenda                             |
| M7        | Alarm                                           |
| M8        | Pengaturan, offline, aksesibilitas, performa    |
| M9        | Rilis dan pengujian instalasi                   |

Rincian task ada di [TASKS.md](TASKS.md).

## 13. Pertanyaan terbuka

- Apakah perlu onboarding tiga langkah, atau cukup state kosong dengan ajakan mengatur lokasi?
- Apakah jam dunia masuk v1 atau tetap di backlog?
- Target deploy: Netlify, Vercel, atau Cloudflare Pages?
- Apakah perlu halaman "Tentang" terpisah, atau cukup bagian di Pengaturan?
- Apakah nama Nadi final untuk domain dan judul aplikasi?

## 14. Istilah

PWA: Progressive Web App, aplikasi web yang bisa di-install dan bekerja offline.

AQI: Air Quality Index, indeks kualitas udara. Nadi memakai standar US AQI pada v1.

ISPU: Indeks Standar Pencemar Udara, standar Indonesia. Belum dipakai pada v1.

WMO code: kode kondisi cuaca dari World Meteorological Organization yang dipakai Open-Meteo.
