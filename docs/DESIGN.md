# DESIGN: Nadi

Versi: 0.1
Tanggal: 25 November 2026
Status: draf untuk direview

## 1. Design read

Reading this as: personal daily dashboard PWA for Indonesian students and remote workers, with a warm editorial utility language, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

Arti dial:

- ENERGY 2: hadir dan punya karakter, tetapi tidak berteriak. Bukan landing page agency.
- RHYTHM 2: komposisi konsisten dengan satu atau dua jeda asimetris, bukan grid seragam.
- MOTION 1: transisi state saja. Tidak ada scroll reveal, parallax, atau animasi dekoratif.

## 2. Identitas

Nadi berarti denyut. Antarmuka memperlakukan satu hari sebagai garis yang bergerak, dengan penanda "sekarang" yang maju sepanjang hari.

Motif garis nadi muncul tepat di dua tempat:

1. Garis hari di bawah jam, penanda posisi waktu sekarang, matahari terbit, matahari terbenam, dan agenda berikutnya.
2. Strip cuaca per jam, memakai bahasa garis dan titik yang sama.

Motif ini tidak dipakai di kartu, tombol, atau latar. Alasannya: kalau muncul di mana-mana, ia berhenti menjadi penanda waktu dan berubah menjadi hiasan.

Karakter yang dituju: tenang, hangat, terang, seperti buku catatan pagi, bukan panel kontrol ruang kendali.

## 3. Referensi dan apa yang diambil

| Referensi       | Diambil                                           | Tidak diambil                                    |
| --------------- | ------------------------------------------------- | ------------------------------------------------ |
| Apple Weather   | Hierarki data cuaca, kartu ringkas, strip per jam | Gaya foto latar dan animasi berat                |
| IQAir AirVisual | Skala AQI, label kategori, saran kesehatan        | Gauge melingkar besar dan warna neon             |
| Notion Calendar | Kerapian grid bulanan                             | Layout sidebar penuh dan estetika monokrom total |
| Amie            | Semangat harian yang ringan pada kalender         | Warna pastel dan ilustrasi 3D                    |
| Jago            | Kehangatan warna dan keberanian aksen             | Gaya ilustrasi dan gradient merek                |
| Bibit           | Keterbacaan data yang padat                       | Struktur onboarding finansial                    |

Referensi dipakai sebagai pelajaran komposisi, bukan untuk ditiru tampilannya.

## 4. Yang sengaja dihindari

- Gradient biru ke ungu, glow, dan latar orb.
- Glassmorphism pada nav, kartu, dan dialog sekaligus.
- Bento grid sebagai layout utama.
- Semua elemen berbentuk pill.
- Dark mode sebagai default tanpa alasan produk.
- Ikon Lucide sebagai set default tanpa alasan.
- Statistik dan testimoni palsu.
- Emoji di heading atau label.
- Animasi masuk pada setiap elemen.

Alasan: pola-pola itu membuat produk kehilangan identitas dan mudah dikenali sebagai hasil generator.

## 5. Warna

Palet inti: kertas hangat, tinta hangat, satu aksen terakota. Warna semantik hanya untuk data kualitas udara.

### Token terang

| Token           | Nilai     | Pemakaian                           |
| --------------- | --------- | ----------------------------------- |
| `--paper`       | `#F7F4EE` | Latar halaman                       |
| `--surface`     | `#FFFDF9` | Kartu, sheet, input                 |
| `--ink`         | `#1C1917` | Teks utama, jam                     |
| `--ink-muted`   | `#57534E` | Teks sekunder, label                |
| `--line`        | `#E7E1D8` | Garis pemisah dan border            |
| `--accent`      | `#B23A26` | Aksi utama, penanda sekarang, fokus |
| `--accent-soft` | `#F3D9D2` | Latar aksen ringan, state terpilih  |
| `--focus`       | `#B23A26` | Cincin fokus 2px dengan offset 2px  |

### Token gelap

| Token           | Nilai     | Pemakaian                           |
| --------------- | --------- | ----------------------------------- |
| `--paper`       | `#141210` | Latar halaman                       |
| `--surface`     | `#1D1A17` | Kartu, sheet, input                 |
| `--ink`         | `#F5F1EA` | Teks utama, jam                     |
| `--ink-muted`   | `#ABA39A` | Teks sekunder, label                |
| `--line`        | `#2E2924` | Garis pemisah dan border            |
| `--accent`      | `#E8836F` | Aksi utama, penanda sekarang, fokus |
| `--accent-soft` | `#3A241F` | Latar aksen ringan, state terpilih  |
| `--focus`       | `#E8836F` | Cincin fokus 2px dengan offset 2px  |

Kontras yang sudah dihitung:

- `--ink` pada `--paper` terang: sekitar 16:1.
- `--ink-muted` pada `--paper` terang: sekitar 6.9:1.
- `--paper` pada `--accent` terang: sekitar 5.4:1.
- `--ink` pada `--paper` gelap: sekitar 16.7:1.
- `--ink-muted` pada `--paper` gelap: sekitar 7.5:1.
- `--paper` pada `--accent` gelap: sekitar 7:1.

Semua pasangan teks memenuhi WCAG AA. Rasio diukur ulang saat implementasi dengan alat pemeriksa kontras.

### Warna data kualitas udara

Warna ini semantik, terpisah dari aksen merek. Selalu disertai angka dan label teks, tidak pernah warna saja.

| Kategori                           | Terang    | Gelap     |
| ---------------------------------- | --------- | --------- |
| Baik                               | `#2E7D32` | `#7CC47F` |
| Sedang                             | `#A16207` | `#E0B44C` |
| Tidak sehat bagi kelompok sensitif | `#C05621` | `#F09A5B` |
| Tidak sehat                        | `#B3261E` | `#F07A72` |
| Sangat tidak sehat                 | `#7B3F8C` | `#C79AD6` |
| Berbahaya                          | `#6E1B2A` | `#E08A9A` |

Alasan memakai skala adaptif, bukan warna resmi mentah: warna resmi AQI memakai hijau dan kuning neon yang gagal kontras di layar terang. Nuansa di atas mempertahankan urutan makna, tetapi tetap terbaca.

### Aturan pemakaian

- Aksen hanya untuk aksi utama, penanda waktu sekarang, dan cincin fokus.
- Warna data hanya di grafik, titik kategori, dan label kategori.
- Tidak ada warna merek di dalam grafik cuaca. Cuaca memakai tinta dan aksen secara hemat.

## 6. Tipografi

Satu keluarga huruf: Plus Jakarta Sans, bobot 400, 500, 600, 700.

Alasan: huruf ini dibuat oleh Tokotype untuk identitas kota Jakarta, sehingga punya kaitan langsung dengan konteks produk. Bentuknya hangat, terbuka di ukuran kecil, dan tidak memakai Inter yang menjadi default generik.

Skala:

| Peran              | Ukuran                   | Bobot | Catatan                                                |
| ------------------ | ------------------------ | ----- | ------------------------------------------------------ |
| Jam utama          | clamp(64px, 14vw, 112px) | 700   | `font-variant-numeric: tabular-nums`, tracking -0.04em |
| Judul halaman      | 24px                     | 700   | Tracking -0.02em                                       |
| Judul kartu        | 16px                     | 600   | Tidak semua kartu perlu judul                          |
| Teks isi           | 15px                     | 400   | Line height 1.6                                        |
| Label dan metadata | 13px                     | 500   | `--ink-muted`                                          |
| Angka data         | 20-32px                  | 600   | Tabular nums                                           |

Aturan:

- Jam dan angka data selalu memakai `tabular-nums` agar tidak bergeser.
- Tidak ada huruf monospace dekoratif.
- Tidak ada label kapital dengan tracking lebar.
- Teks tetap bisa diperbesar sampai 200% tanpa kehilangan konten.

## 7. Spacing, radius, elevasi

Spacing berbasis 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

Radius:

- Input dan tombol: 10px.
- Kartu: 14px.
- Sheet dan dialog: 20px di sudut atas.
- Pill: hanya untuk status kecil dan chip hari. Tidak untuk tombol utama.

Elevasi:

- Default: border 1px `--line`, tanpa shadow.
- Sheet dan bottom nav saat konten di bawahnya: satu shadow lembut.
- Alasan: bayangan dipakai sebagai penanda lapisan, bukan hiasan di semua kartu.

## 8. Layout

Mobile (di bawah 768px):

- Satu kolom, margin 16px, jarak antar blok 24px.
- Urutan: jam, garis hari, cuaca, kualitas udara, agenda, catatan, alarm.
- Satu titik fokus: jam. Ukuran dan posisi jam tidak boleh disaingi elemen lain.

Tablet (768px ke atas):

- Grid 8 kolom, margin 24px.
- Jam dan cuaca berdampingan. Garis hari memenuhi lebar.

Desktop (1120px ke atas):

- Grid 12 kolom, lebar maksimal 1120px, margin otomatis.
- Baris pertama: jam 7 kolom, cuaca 5 kolom.
- Garis hari memenuhi 12 kolom.
- Baris ketiga: kualitas udara 4 kolom, agenda 8 kolom.
- Baris keempat: catatan 7 kolom, alarm 5 kolom.
- Komposisi asimetris ini disengaja agar tidak menjadi mosaik kartu berukuran sama.

Breakpoint: 480px, 768px, 1120px.

## 9. Navigasi

Mobile: bottom tab bar dengan lima item: Beranda, Catatan, Kalkulator, Alarm, Pengaturan. Tinggi 64px, target sentuh 44px, label teks selalu tampil.

Desktop: rail kiri 240px dengan logo teks "Nadi", lima item, dan tombol tema di bawah.

Aturan:

- Tidak ada item nav tanpa halaman.
- Item aktif ditandai oleh ikon terisi, teks dengan bobot 600, dan indikator garis di sisi kiri. Tidak hanya warna.
- Navigasi memakai `<a href>` dengan route nyata.

Alasan lima item: enam modul, tetapi dasbor menampung jam, cuaca, dan kualitas udara, sehingga tidak perlu tab terpisah. Kalender dan catatan digabung jadi satu halaman karena keduanya sama-sama bahan rujukan harian, dan tab kalender diganti kalkulator sebagai alat harian.

## 10. Komponen

| Komponen                | Varian                            | State                                            |
| ----------------------- | --------------------------------- | ------------------------------------------------ |
| Button                  | primary, secondary, ghost, danger | default, hover, active, focus, disabled, loading |
| IconButton              | 32px, 44px                        | default, hover, focus, pressed                   |
| Card                    | default, interactive              | default, hover jika bisa diklik                  |
| SectionHeader           | dengan aksi, tanpa aksi           | -                                                |
| Pill                    | status, chip hari                 | default, selected                                |
| Sheet                   | bawah, dengan handle              | open, closing, focus trapped                     |
| Dialog                  | konfirmasi                        | open, closing                                    |
| Input, TextArea, Select | default, error                    | default, focus, error, disabled                  |
| Toggle                  | default                           | on, off, focus                                   |
| Toast                   | info, success, error              | entering, visible, leaving                       |
| Banner                  | offline, update                   | visible, dismissed                               |
| EmptyState              | dengan aksi                       | -                                                |
| ErrorState              | dengan retry                      | -                                                |
| Skeleton                | text, card                        | animasi halus, nonaktif saat reduced motion      |
| WeatherGlyph            | siang, malam                      | -                                                |
| AqiBadge                | enam kategori                     | -                                                |
| DayLine                 | -                                 | -                                                |
| DayStrip                | horizontal scroll                 | -                                                |
| EventItem               | -                                 | default, pressed                                 |
| NoteItem                | -                                 | default, pinned                                  |
| AlarmRow                | -                                 | aktif, nonaktif                                  |

Aturan komponen:

- Setiap kontrol punya state hover, active, focus, dan disabled. Fokus tidak dihapus tanpa pengganti.
- Tombol ikon wajib punya `aria-label`.
- Input selalu punya label yang terlihat, bukan hanya placeholder.
- Dialog dan sheet menutup dengan Escape dan mengembalikan fokus.

## 11. Layar

### 11.1 Beranda

Urutan dan isi:

1. Header ringan: sapaan ("Selamat pagi"), nama lokasi, tombol pengaturan cepat.
2. Jam utama, tanggal lengkap, dan garis hari.
3. Kartu cuaca: suhu, kondisi, suhu terasa, kelembapan, angin. Tombol membuka detail 7 hari di sheet.
4. Kartu kualitas udara: angka US AQI, kategori, PM2.5, saran singkat, grafik 24 jam. Atribusi kecil di bawah.
5. Agenda: maksimal tiga item terdekat hari ini dan besok, tombol tambah.
6. Catatan: dua catatan terbaru atau yang dipin, tombol catatan cepat.
7. Alarm berikutnya: waktu dan label, status aktif.
8. Banner offline atau banner pembaruan bila relevan.

Interaksi:

- Menekan kartu cuaca membuka sheet detail, bukan halaman baru.
- Menekan item agenda membuka panel hari di halaman Catatan.
- Menekan catatan membuka editor.
- Menekan alarm membuka layar Alarm.

### 11.2 Agenda dan catatan

Satu halaman, agenda lebih dulu lalu catatan:

- Header bulan dengan tombol sebelumnya, hari ini, berikutnya.
- Grid 7 kolom, nama hari dalam bahasa Indonesia, awal minggu mengikuti Pengaturan.
- Hari ini ditandai dengan lingkaran aksen dan teks tebal.
- Hari dengan agenda menampilkan titik, maksimal tiga. Titik merah menandai agenda dengan nada dering.
- Menekan tanggal membuka sheet daftar agenda hari itu.
- Tombol tambah agenda di sheet.
- Form agenda: judul, tanggal, mulai, selesai, sepanjang hari, catatan, dan sakelar **Pasang nada dering** dengan pilihan kapan berbunyi serta nada.
- Di bawah agenda: header catatan dengan tombol tambah dan input pencarian.
- Daftar catatan: judul, cuplikan dua baris, waktu diubah, ikon pin. Urutan: pin, lalu terbaru.
- Editor catatan berupa sheet layar penuh di mobile, dialog lebar di desktop.
- Validasi: judul catatan maksimal 80 karakter, isi maksimal 5000 karakter.
- Hapus memakai dialog konfirmasi dengan judul.
- State kosong agenda: "Belum ada agenda di hari ini." dengan tombol tambah.
- State kosong catatan: "Belum ada catatan. Tulis satu hal yang ingin kamu ingat."

### 11.3 Kalkulator

- Dua mode lewat segmented control: **Ilmiah** dan **BMI**.
- Ilmiah: baris rumus yang bisa diketik, pratinjau hasil langsung, tombol mode sudut (Derajat atau Radian), tombol fungsi (kurung, pangkat, akar, sin, cos, tan, log, ln, pi, faktorial, persen), papan angka, tombol Hitung, dan riwayat singkat lima hasil terakhir.
- BMI: input tinggi dan berat, angka IMT besar, kategori memakai ambang Asia, dan rentang berat sehat.

### 11.4 Alarm

- Header dengan tombol tambah.
- Baris alarm: waktu besar, label, hari pengulangan, toggle aktif.
- Alarm berikutnya ditandai dengan label "Berikutnya".
- Form: label, waktu, ulangi (sekali, setiap hari, pilih hari), tunda, aktif.
- Banner batasan di atas daftar: "Alarm berbunyi selama Nadi terbuka."
- Di bawah daftar: stopwatch dan timer. Timer tetap berbunyi saat aplikasi tertutup di Android.
- Saat berbunyi: layar penuh dengan waktu, label, tombol Tunda dan Matikan. Layar yang sama dipakai pengingat agenda.
- State kosong: "Belum ada alarm." dengan tombol tambah.

### 11.5 Pengaturan

Bagian:

1. Lokasi: nama lokasi aktif, tombol gunakan lokasi saat ini, pencarian kota.
2. Tampilan: tema (Sistem, Terang, Gelap).
3. Satuan: Celsius atau Fahrenheit, format jam, awal minggu.
4. Alarm: nada alarm (enam nada bundel, berlaku untuk aplikasi Android) dan tempat membuka alat alarm.
5. Data: ekspor JSON, impor JSON, hapus semua data.
6. Aplikasi Android: unduh APK.
7. Tentang: versi, sumber data, atribusi Open-Meteo dan CAMS, lisensi, tautan ke dokumentasi.

## 12. State

Loading:

- Skeleton dengan tinggi yang dicadangkan agar tidak ada layout shift.
- Animasi denyut halus, nonaktif saat `prefers-reduced-motion`.
- Tidak ada spinner layar penuh untuk dasbor. Modul dimuat sendiri-sendiri.

Error:

- Error tingkat kartu, bukan halaman.
- Pesan singkat, penyebab yang bisa dipahami, tombol "Coba lagi".
- Data lama tetap tampil jika ada, dengan label basi.

Empty:

- Satu kalimat penjelas dan satu aksi utama.
- Tanpa ilustrasi generik. Ruang kosong dipakai apa adanya.

Offline:

- Banner di atas konten: "Kamu sedang offline."
- Data cuaca dan udara menampilkan "Data 10 menit lalu".
- Data lokal tetap bisa diubah dan disimpan.

Izin lokasi ditolak:

- Pesan inline di kartu lokasi: "Izin lokasi tidak aktif. Pilih kota secara manual."
- Pencarian kota langsung terlihat.

Data basi:

- Label waktu di bawah nilai, contoh: "Diperbarui 08.42".
- Tidak ada warna peringatan untuk data basi biasa. Cukup teks.

## 13. Motion

MOTION 1, hanya transisi state:

- Hover dan fokus: 120ms.
- Masuk dan keluar sheet: 240ms, ease-out.
- Toast: 200ms.
- Perubahan tema: tanpa animasi warna global, hanya pergantian token.
- Perubahan angka jam: tanpa animasi.
- Tidak ada scroll reveal, parallax, atau ikon cuaca beranimasi pada v1.

`prefers-reduced-motion: reduce` mematikan transformasi dan menyisakan perubahan opacity minimal.

## 14. Aksesibilitas

- Kontras AA untuk semua teks.
- Target sentuh minimal 44x44px.
- Cincin fokus 2px `--focus` dengan offset 2px, terlihat di kedua tema.
- Urutan tab mengikuti urutan visual.
- Sheet dan dialog: fokus terkunci, Escape menutup, fokus kembali ke pemicu.
- Jam tidak memakai `aria-live`. Toast memakai `aria-live="polite"`.
- Grafik AQI punya ringkasan teks dan tabel alternatif yang bisa dibuka.
- Kategori AQI tidak hanya dibedakan warna.
- Ikon dekoratif `aria-hidden="true"`.
- Tombol ikon punya nama aksesibel.
- `lang="id"` pada dokumen.
- Satu `h1` per halaman, level heading berurutan.
- Zoom tidak diblokir.

## 15. Suara teks

Tenang, langsung, tanpa seru. Sebut keadaan apa adanya dan beri langkah berikutnya.

Contoh:

- Offline: "Kamu sedang offline. Cuaca dari 10 menit lalu."
- Izin lokasi ditolak: "Izin lokasi tidak aktif. Pilih kota secara manual."
- Catatan kosong: "Belum ada catatan. Tulis satu hal yang ingin kamu ingat."
- Alarm: "Alarm berbunyi selama Nadi terbuka."
- Error cuaca: "Cuaca tidak bisa dimuat. Periksa koneksi, lalu coba lagi."

Hindari:

- "Oops", "Yay", "Siap!", tanda seru.
- Kata seperti "seamless", "powerful", "revolusioner".
- Menyalahkan pengguna.

## 16. Ikon

- UI: Phosphor Icons. Alasan: pasangan outline dan filled membuat state aktif nav terbaca tanpa bergantung pada warna, dan ukuran stokenya konsisten.
- Cuaca: Meteocons. Alasan: set khusus cuaca dengan varian siang dan malam, lebih tepat daripada ikon UI generik. Dipakai versi statis agar sesuai MOTION 1.
- Ukuran: 20px untuk nav, 20px inline, 24px aksi, 40-56px untuk glyph cuaca.
- Ikon tidak dipakai sebagai hiasan di samping setiap judul.

## 17. Log keputusan

| Keputusan                      | Alasan satu baris                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Palet kertas dan tinta hangat  | Produk dipakai pagi hari; putih murni terasa keras dan dingin.                              |
| Aksen terakota                 | Mengaitkan makna denyut dengan warna hangat, dan tidak memakai biru teknologi yang generik. |
| Satu keluarga huruf            | Mengurangi beban unduh dan menjaga konsistensi; identitas datang dari skala dan tracking.   |
| Plus Jakarta Sans              | Kaitan langsung dengan konteks Indonesia dan bentuknya terbaca di ukuran kecil.             |
| Jam sebagai fokus tunggal      | Pertanyaan pertama pengguna adalah waktu, jadi elemen lain harus mengalah.                  |
| Garis hari                     | Menjadikan motif denyut berfungsi sebagai penanda waktu, bukan hiasan.                      |
| Layout asimetris               | Menghindari mosaik kartu seragam yang terasa seperti template.                              |
| Border sebagai elevasi utama   | Menjaga halaman tetap tenang; bayangan hanya untuk lapisan yang benar-benar mengambang.     |
| Lima tab                       | Enam modul, tetapi tiga di antaranya hidup di dasbor.                                       |
| Warna AQI adaptif              | Warna resmi gagal kontras; nuansa adaptif menjaga makna dan keterbacaan.                    |
| Light default mengikuti sistem | Produk harian dipakai di siang hari; dark mode tetap tersedia.                              |
| Motion hanya untuk state       | Animasi dekoratif mengganggu pembacaan cepat.                                               |
| Phosphor dan Meteocons         | Alasan pemilihan tertulis di bagian ikon; keduanya relevan dengan peran masing-masing.      |

## 18. Pertanyaan desain terbuka

- Perlu onboarding atau cukup state kosong dengan ajakan mengatur lokasi?
- Apakah grafik AQI 24 jam masuk v1 atau Should?
- Apakah jam dunia memakai halaman sendiri atau sheet dari jam utama?
- Apakah perlu mode "fokus" yang menyembunyikan semua kartu selain jam dan cuaca?
