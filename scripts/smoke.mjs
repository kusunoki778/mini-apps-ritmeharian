import { chromium } from 'playwright-core';

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:4173';
const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const results = [];

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
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
  check(
    'heading beranda',
    (await page.locator('h1').first().innerText()).trim() === 'Beranda',
  );

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
    await page.getByText(/^Diperbarui \d{2}\.\d{2}$/).first().isVisible(),
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
  check('catatan cepat langsung tampil di dasbor', await page.getByText('Catatan asap').first().isVisible());

  const agendaEmpty = page.getByText('Belum ada agenda terdekat. Tambah satu agar harimu lebih tenang.');
  await agendaEmpty.waitFor({ timeout: 15000 });
  check('kartu agenda kosong tampil', await agendaEmpty.isVisible());

  await page.getByRole('button', { name: 'Tambah agenda' }).click();
  await page.getByLabel('Judul').fill('Rapat asap');
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
    ['Kalender', '/kalender', 'Kalender'],
    ['Catatan', '/catatan', 'Catatan'],
    ['Alarm', '/alarm', 'Alarm'],
    ['Pengaturan', '/pengaturan', 'Pengaturan'],
  ];

  for (const [label, path, heading] of routes) {
    await page.getByRole('navigation', { name: 'Navigasi bawah' }).getByRole('link', { name: label }).click();
    await page.waitForURL(`**${path}`);
    const headingLocator = page.getByRole('heading', { level: 1, name: heading, exact: true });
    await headingLocator.waitFor();
    check(`rute ${path}`, await headingLocator.isVisible());
    check(
      `tanpa overflow ${path}`,
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    );
  }

  await page.goto(`${BASE}/catatan`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Catatan', exact: true }).waitFor();
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

  await page.goto(`${BASE}/kalender`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Kalender', exact: true }).waitFor();
  const monthHeading = page.getByRole('heading', { level: 2 });
  const beforeMonth = (await monthHeading.textContent()) ?? '';
  await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await page.waitForFunction((previous) => document.querySelector('h2')?.textContent !== previous, beforeMonth);
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
  check('agenda terhapus dari panel hari', await page.getByText('Belum ada agenda di hari ini.').first().isVisible());

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
  check('rail desktop terlihat', await desktop.getByRole('navigation', { name: 'Navigasi utama' }).isVisible());
  await desktop.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'Catatan' }).click();
  await desktop.waitForURL('**/catatan');
  check('navigasi desktop', desktop.url().endsWith('/catatan'));

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
