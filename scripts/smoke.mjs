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
    'prototipe dasbor tampil',
    (await page.getByText('Kualitas udara (US AQI)').isVisible()) &&
      (await page.getByRole('heading', { name: 'Agenda hari ini' }).isVisible()) &&
      (await page.getByRole('heading', { name: 'Catatan terakhir' }).isVisible()),
  );
  check(
    'label data contoh tampil',
    await page.getByRole('link', { name: 'Aktifkan data nyata' }).isVisible(),
  );

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
