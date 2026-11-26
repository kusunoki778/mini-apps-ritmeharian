import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:4173';
const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const results = [];

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
}

async function axeViolations(targetPage, url) {
  await targetPage.goto(url, { waitUntil: 'load' });
  await targetPage.locator('h1').first().waitFor();
  await targetPage.addScriptTag({ path: AXE_PATH });

  return targetPage.evaluate(async () => {
    const outcome = await window.axe.run(document, { resultTypes: ['violations'] });
    return outcome.violations
      .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
      .map((violation) => `${violation.id}:${violation.impact}`);
  });
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.locator('h1').first().waitFor();

  check('judul dokumen', (await page.title()) === 'Nadi');
  check('heading beranda', (await page.locator('h1').first().innerText()).trim() === 'Beranda');

  const timeText = (await page.locator('p.tabular').first().innerText()).trim();
  check('jam tampil', /^\d{2}[.:]\d{2}$/.test(timeText), timeText);
  check(
    'tanpa overflow 320px',
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  );

  check(
    'modul agenda dan catatan tampil',
    (await page.getByRole('heading', { name: 'Agenda terdekat' }).isVisible()) &&
      (await page.getByRole('heading', { name: 'Catatan terakhir' }).isVisible()),
  );
  check(
    'tautan atur lokasi tampil',
    await page.getByRole('link', { name: 'Atur lokasi' }).isVisible(),
  );
  check(
    'garis hari tampil dengan ringkasan',
    await page.getByRole('img', { name: /hari berjalan/ }).isVisible(),
  );

  const detailButton = page.getByRole('button', { name: 'Detail 7 hari' });
  await detailButton.waitFor({ timeout: 15000 });
  check('kartu cuaca memuat data nyata', await detailButton.isVisible());
  check(
    'label waktu pembaruan tampil',
    await page
      .getByText(/^Diperbarui \d{2}\.\d{2}$/)
      .first()
      .isVisible(),
  );
  check(
    'strip per jam tampil',
    await page.getByRole('region', { name: 'Prakiraan per jam' }).isVisible(),
  );

  await detailButton.click();
  const sheetTitle = page.getByRole('heading', { name: 'Prakiraan 7 hari' });
  await sheetTitle.waitFor();
  check('sheet 7 hari terbuka', await sheetTitle.isVisible());
  await page.keyboard.press('Escape');
  await sheetTitle.waitFor({ state: 'hidden' });
  check('sheet tertutup dengan Escape', !(await sheetTitle.isVisible()));

  const aqiLabel = page.getByText('Kualitas udara · US AQI');
  await aqiLabel.waitFor({ timeout: 20000 });
  check('kartu AQI tampil', await aqiLabel.isVisible());

  const chartDetails = page.getByText('Lihat tabel 24 jam');
  await chartDetails.waitFor({ timeout: 20000 });
  check('grafik AQI dimuat malas', await chartDetails.isVisible());

  check('atribusi CAMS tampil', await page.getByText(/Open-Meteo, berisi data CAMS/).isVisible());

  const notesEmpty = page.getByText('Belum ada catatan. Tulis satu hal yang ingin kamu ingat.');
  await notesEmpty.waitFor({ timeout: 15000 });
  check('kartu catatan kosong tampil', await notesEmpty.isVisible());

  await page.getByRole('button', { name: 'Catatan baru' }).click();
  await page.getByLabel('Judul').fill('Catatan asap');
  await page.getByLabel('Isi').fill('Dibuat oleh uji asap.');
  await page.getByRole('button', { name: 'Simpan' }).click();
  await page.getByText('Catatan asap').first().waitFor({ timeout: 10000 });
  check(
    'catatan cepat langsung tampil di dasbor',
    await page.getByText('Catatan asap').first().isVisible(),
  );

  const agendaEmpty = page.getByText(
    'Belum ada agenda terdekat. Tambah satu agar harimu lebih tenang.',
  );
  await agendaEmpty.waitFor({ timeout: 15000 });
  check('kartu agenda kosong tampil', await agendaEmpty.isVisible());

  await page.getByRole('button', { name: 'Tambah agenda' }).click();
  await page.getByLabel('Judul').fill('Rapat asap');
  // Sepanjang hari supaya agenda tidak bergantung waktu berjalan saat uji.
  await page.getByRole('switch', { name: 'Sepanjang hari' }).click();
  await page.getByRole('button', { name: 'Simpan' }).click();
  await page.getByText('Rapat asap').first().waitFor({ timeout: 10000 });
  check('agenda cepat tampil di dasbor', await page.getByText('Rapat asap').first().isVisible());

  const manifestResponse = await context.request.get(`${BASE}/manifest.webmanifest`);
  check('manifest tersedia', manifestResponse.ok());

  const serviceWorkerActive = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    return Promise.race([
      navigator.serviceWorker.ready.then((registration) => Boolean(registration.active)),
      new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
    ]);
  });
  check('service worker aktif', serviceWorkerActive);

  const routes = [
    ['Catatan', '/catatan', 'Agenda dan catatan'],
    ['Kalkulator', '/kalkulator', 'Kalkulator'],
    ['Alarm', '/alarm', 'Alarm'],
    ['Pengaturan', '/pengaturan', 'Pengaturan'],
  ];

  for (const [label, path, heading] of routes) {
    await page
      .getByRole('navigation', { name: 'Navigasi bawah' })
      .getByRole('link', { name: label })
      .click();
    await page.waitForURL(`**${path}`);
    const headingLocator = page.getByRole('heading', { level: 1, name: heading, exact: true });
    await headingLocator.waitFor();
    check(`rute ${path}`, await headingLocator.isVisible());
    check(
      `tanpa overflow ${path}`,
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    );
  }

  // Kalkulator ilmiah dan BMI.
  await page.goto(`${BASE}/kalkulator`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Kalkulator', exact: true }).waitFor();
  await page.getByLabel('Rumus').fill('2 + 3 * 4');
  await page.getByText('= 14').waitFor();
  check('kalkulator ilmiah menghitung', await page.getByText('= 14').isVisible());

  await page.getByRole('button', { name: 'BMI' }).click();
  await page.getByLabel('Tinggi (cm)').fill('170');
  await page.getByLabel('Berat (kg)').fill('70');
  await page.getByText('24.2').waitFor();
  check('kalkulator BMI menghitung', await page.getByText('24.2').isVisible());

  // Modul tumbuh kembang, dicapai lewat kartu di dasbor.
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.locator('h1').first().waitFor();
  await page.getByRole('link', { name: /Tinggi dan berat ideal/ }).click();
  await page.waitForURL('**/tumbuh-kembang');
  await page
    .getByRole('heading', { level: 1, name: 'Tinggi dan berat ideal', exact: true })
    .waitFor();
  check('rute /tumbuh-kembang', page.url().endsWith('/tumbuh-kembang'));

  await page.getByLabel('Umur (tahun)').fill('8');
  await page.getByText('Tinggi ideal').waitFor();
  check('tumbuh kembang menghitung tinggi ideal', await page.getByText('Tinggi ideal').isVisible());

  await page.goto(`${BASE}/catatan`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Agenda dan catatan', exact: true }).waitFor();
  await page.getByText('Catatan asap').waitFor();
  check('daftar catatan tampil', await page.getByText('Catatan asap').isVisible());

  const search = page.getByRole('searchbox', { name: 'Cari catatan' });
  await search.fill('tidakcocok');
  await page.getByText('Tidak ada hasil').waitFor();
  check('pesan tanpa hasil tampil', await page.getByText('Tidak ada hasil').isVisible());

  await search.fill('asap');
  await page.getByText('Catatan asap').waitFor();
  check('pencarian menyaring daftar', await page.getByText('Catatan asap').isVisible());

  await page.getByRole('button', { name: 'Pin Catatan asap' }).click();
  await page.getByRole('button', { name: 'Lepas pin Catatan asap' }).waitFor();
  check(
    'pin catatan bekerja',
    await page.getByRole('button', { name: 'Lepas pin Catatan asap' }).isVisible(),
  );

  await search.fill('');
  await page.getByText('Catatan asap').waitFor();

  await page.getByRole('button', { name: 'Hapus Catatan asap' }).click();
  await page.getByRole('heading', { name: 'Hapus catatan?' }).waitFor();
  check('dialog hapus menyebut judul', await page.getByText(/Catatan "Catatan asap"/).isVisible());
  await page.getByRole('button', { name: 'Hapus', exact: true }).click();
  await page.getByText('Belum ada catatan').waitFor();
  check('catatan terhapus', await page.getByText('Belum ada catatan').isVisible());

  await page.goto(`${BASE}/catatan`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Agenda dan catatan', exact: true }).waitFor();
  const monthHeading = page.getByRole('heading', { level: 2 }).first();
  const beforeMonth = (await monthHeading.textContent()) ?? '';
  await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await page.waitForFunction(
    (previous) => document.querySelector('h2')?.textContent !== previous,
    beforeMonth,
  );
  check('navigasi bulan berikutnya', (await monthHeading.textContent()) !== beforeMonth);
  await page.getByRole('button', { name: 'Hari ini' }).click();

  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  await page.getByRole('button', { name: todayLabel }).click();
  await page.getByText('Rapat asap').waitFor();
  check('panel hari menampilkan agenda', await page.getByText('Rapat asap').isVisible());

  await page.getByRole('button', { name: 'Hapus Rapat asap' }).click();
  await page.getByRole('heading', { name: 'Hapus agenda?' }).waitFor();
  await page.getByRole('button', { name: 'Hapus', exact: true }).click();
  await page.getByText('Belum ada agenda di hari ini.').first().waitFor();
  check(
    'agenda terhapus dari panel hari',
    await page.getByText('Belum ada agenda di hari ini.').first().isVisible(),
  );

  await page.goto(`${BASE}/alarm`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Alarm', exact: true }).waitFor();
  await page.getByText('Belum ada alarm').waitFor();
  check('state kosong alarm tampil', await page.getByText('Belum ada alarm').isVisible());
  check(
    'batas alarm tampil',
    await page.getByText(/Alarm berbunyi selama Nadi terbuka/).isVisible(),
  );

  await page.getByRole('button', { name: 'Alarm baru' }).first().click();
  await page.getByLabel('Label').fill('Cek asap');
  await page.getByRole('button', { name: 'Simpan' }).click();
  await page.getByText('Cek asap').waitFor();
  check('alarm tersimpan tampil', await page.getByText('Cek asap').isVisible());

  await page.getByRole('switch', { name: 'Nonaktifkan Cek asap' }).click();
  await page.getByRole('switch', { name: 'Aktifkan Cek asap' }).waitFor();
  check(
    'sakelar alarm bekerja',
    await page.getByRole('switch', { name: 'Aktifkan Cek asap' }).isVisible(),
  );

  await page.getByRole('button', { name: 'Hapus Cek asap' }).click();
  await page.getByRole('heading', { name: 'Hapus alarm?' }).waitFor();
  await page.getByRole('button', { name: 'Hapus', exact: true }).click();
  await page.getByText('Belum ada alarm').waitFor();
  check('alarm terhapus', await page.getByText('Belum ada alarm').isVisible());

  await page.goto(`${BASE}/pengaturan`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Pengaturan', exact: true }).waitFor();

  check(
    'pengaturan punya pencarian kota',
    await page.getByRole('textbox', { name: 'Cari kota' }).isVisible(),
  );
  check(
    'lokasi bawaan tampil',
    await page.getByText('Jakarta', { exact: true }).first().isVisible(),
  );

  await page.getByRole('button', { name: 'Gelap' }).click();
  check(
    'tema gelap aktif',
    (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark',
  );

  await page.reload({ waitUntil: 'load' });
  check(
    'tema gelap bertahan',
    (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark',
  );

  await page.getByRole('button', { name: 'Terang' }).click();
  check(
    'tema terang aktif',
    (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light',
  );

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await page.getByRole('button', { name: '12 jam' }).click();
  await page.getByRole('button', { name: 'Minggu' }).click();
  check(
    'satuan suhu tersimpan',
    (await page.getByRole('button', { name: 'Fahrenheit' }).getAttribute('aria-pressed')) ===
      'true',
  );

  await page.reload({ waitUntil: 'load' });
  check(
    'satuan suhu bertahan setelah reload',
    (await page.getByRole('button', { name: 'Fahrenheit' }).getAttribute('aria-pressed')) ===
      'true',
  );

  check(
    'pengaturan menawarkan aplikasi Android',
    await page.getByRole('heading', { name: 'Aplikasi Android' }).isVisible(),
  );
  const apkLink = page.getByRole('link', { name: 'Unduh APK' });
  await apkLink
    .first()
    .waitFor({ timeout: 5000 })
    .catch(() => {});
  check('tautan unduh APK tersedia', (await apkLink.count()) > 0);

  const apkResponse = await context.request.get(`${BASE}/Nadi.apk`);
  check(
    'berkas APK disajikan',
    apkResponse.status() === 200 &&
      (apkResponse.headers()['content-type'] ?? '').includes('android.package-archive'),
    `${apkResponse.status()} ${apkResponse.headers()['content-type'] ?? ''}`,
  );

  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.locator('h1').first().waitFor();
  const clockText = await page
    .locator('section[aria-label="Jam dan garis hari"] p.tabular')
    .first()
    .innerText();
  check('format jam 12 jam dipakai', /(AM|PM)/.test(clockText), clockText);

  await page.goto(`${BASE}/catatan`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Agenda dan catatan', exact: true }).waitFor();
  const firstWeekday = await page
    .locator('div.grid-cols-7')
    .first()
    .locator('span')
    .first()
    .innerText();
  check('awal minggu Minggu dipakai', firstWeekday === 'Min', firstWeekday);

  await page.goto(`${BASE}/pengaturan`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Pengaturan', exact: true }).waitFor();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Ekspor JSON' }).click();
  const download = await downloadPromise;
  check('ekspor JSON terunduh', download.suggestedFilename().endsWith('.json'));

  await page.getByRole('button', { name: '24 jam' }).click();
  await page.getByRole('button', { name: 'Senin' }).click();

  await page.goto(`${BASE}/tidak-ada`, { waitUntil: 'load' });
  const notFoundHeading = page.getByRole('heading', {
    level: 1,
    name: 'Halaman tidak ditemukan',
    exact: true,
  });
  await notFoundHeading.waitFor();
  check('halaman 404', await notFoundHeading.isVisible());

  check('tanpa error konsol', consoleErrors.length === 0, consoleErrors.join(' | '));

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(`${BASE}/`, { waitUntil: 'load' });
  await desktop.locator('h1').first().waitFor();
  check(
    'rail desktop terlihat',
    await desktop.getByRole('navigation', { name: 'Navigasi utama' }).isVisible(),
  );
  await desktop
    .getByRole('navigation', { name: 'Navigasi utama' })
    .getByRole('link', { name: 'Catatan' })
    .click();
  await desktop.waitForURL('**/catatan');
  check('navigasi desktop', desktop.url().endsWith('/catatan'));
  await desktop.close();

  // Aksesibilitas: hanya pelanggaran critical dan serious yang menggagalkan.
  const a11yBeranda = await axeViolations(page, `${BASE}/`);
  check('a11y beranda bersih', a11yBeranda.length === 0, a11yBeranda.join(', '));
  const a11yPengaturan = await axeViolations(page, `${BASE}/pengaturan`);
  check('a11y pengaturan bersih', a11yPengaturan.length === 0, a11yPengaturan.join(', '));

  // Performa: Largest Contentful Paint pada muat pertama.
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.locator('h1').first().waitFor();
  const lcp = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let value = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) value = entry.startTime;
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        window.setTimeout(() => {
          observer.disconnect();
          resolve(Math.round(value));
        }, 1200);
      }),
  );
  check('LCP di bawah 2500 ms', lcp > 0 && lcp < 2500, `${lcp} ms`);

  // Keyboard: skip link lebih dulu dan mengarah ke konten utama.
  await page.keyboard.press('Tab');
  check(
    'keyboard: skip link fokus lebih dulu',
    (await page.evaluate(() => document.activeElement?.textContent?.trim())) === 'Lewati ke konten',
  );
  check('keyboard: target skip link ada', (await page.locator('#konten').count()) === 1);

  // Reduced motion: animasi dan transisi dipangkas agar aman bagi yang sensitif gerak.
  const reducedContext = await browser.newContext({
    viewport: { width: 320, height: 800 },
    reducedMotion: 'reduce',
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${BASE}/`, { waitUntil: 'load' });
  await reducedPage.locator('h1').first().waitFor();
  const reducedTransition = await reducedPage.evaluate(() => {
    const probe = document.createElement('div');
    document.body.append(probe);
    const value = getComputedStyle(probe).transitionDuration;
    probe.remove();
    return value;
  });
  check(
    'reduced motion: transisi dipangkas',
    Number.parseFloat(reducedTransition) > 0 && Number.parseFloat(reducedTransition) < 0.001,
    reducedTransition,
  );
  await reducedContext.close();

  // Offline: setelah data segar, shell dan cache tetap tampil.
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.locator('h1').first().waitFor();
  await context.setOffline(true);

  await page.reload({ waitUntil: 'load' });
  await page.locator('h1').first().waitFor();
  await page
    .getByText(/Data tersimpan|Diperbarui/)
    .first()
    .waitFor({ timeout: 10000 });
  check(
    'offline: shell tetap tampil',
    (await page.locator('h1').first().innerText()).includes('Beranda'),
  );
  check('offline: banner tampil', await page.getByText(/Kamu sedang offline/).isVisible());
  check(
    'offline: label waktu pengambilan tampil',
    await page
      .getByText(/Data tersimpan|Diperbarui/)
      .first()
      .isVisible(),
  );

  const coldPage = await context.newPage();
  await coldPage.goto(`${BASE}/`, { waitUntil: 'load' });
  await coldPage.locator('h1').first().waitFor();
  check(
    'offline: cold start memuat shell',
    (await coldPage.locator('h1').first().innerText()).includes('Beranda'),
  );
  await coldPage.close();

  await context.setOffline(false);
  await page.reload({ waitUntil: 'load' });
  check(
    'online: banner offline hilang',
    (await page.getByText(/Kamu sedang offline/).count()) === 0,
  );

  // Offline tanpa cache: konteks baru tanpa service worker tidak bisa memuat aplikasi.
  const freshContext = await browser.newContext({ viewport: { width: 320, height: 800 } });
  await freshContext.setOffline(true);
  const freshPage = await freshContext.newPage();
  let blocked = false;
  try {
    await freshPage.goto(`${BASE}/`, { waitUntil: 'load', timeout: 5000 });
  } catch {
    blocked = true;
  }
  check(
    'offline tanpa cache: tidak memuat aplikasi',
    blocked || (await freshPage.locator('h1').count()) === 0,
  );
  await freshContext.close();

  await context.close();
} finally {
  await browser.close();
}

for (const result of results) {
  const mark = result.ok ? 'PASS' : 'FAIL';
  console.log(`${mark} ${result.name}${result.detail ? `: ${result.detail}` : ''}`);
}

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} pemeriksaan lulus.`);
process.exit(failed.length === 0 ? 0 : 1);
