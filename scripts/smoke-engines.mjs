// Uji lintas mesin (T8.8): jalankan alur inti di Firefox dan WebKit selain Chrome.
// Chromium sudah diuji penuh di scripts/smoke.mjs, jadi di sini cukup alur kunci.
import { firefox, webkit } from 'playwright-core';

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:4173';

const engines = [
  ['firefox', firefox],
  ['webkit', webkit],
];

const results = [];

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
}

for (const [name, launcher] of engines) {
  let browser;
  try {
    browser = await launcher.launch({ headless: true });
  } catch (error) {
    check(`${name}: browser tersedia`, false, String(error.message).split('\n')[0]);
    continue;
  }

  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 800 } });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    await page.locator('h1').first().waitFor({ timeout: 20000 });
    check(
      `${name}: beranda tampil`,
      (await page.locator('h1').first().innerText()).includes('Beranda'),
    );
    check(
      `${name}: tanpa overflow 320px`,
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    );

    const routes = [
      ['Kalender', '/kalender', 'Kalender'],
      ['Catatan', '/catatan', 'Catatan'],
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
      await headingLocator.waitFor({ timeout: 15000 });
      check(`${name}: rute ${path}`, await headingLocator.isVisible());
    }

    await page.getByRole('button', { name: 'Gelap' }).click();
    check(
      `${name}: tema gelap aktif`,
      (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark',
    );

    await page.goto(`${BASE}/catatan`, { waitUntil: 'load' });
    await page.getByRole('heading', { level: 1, name: 'Catatan', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Catatan baru' }).first().click();
    await page.getByLabel('Judul').fill('Lintas mesin');
    await page.getByLabel('Isi').fill('Uji Firefox dan WebKit.');
    await page.getByRole('button', { name: 'Simpan' }).click();
    await page.getByText('Lintas mesin').first().waitFor({ timeout: 15000 });
    check(`${name}: catatan tersimpan`, await page.getByText('Lintas mesin').first().isVisible());

    check(`${name}: tanpa error konsol`, consoleErrors.length === 0, consoleErrors.join(' | '));

    await context.close();
  } finally {
    await browser.close();
  }
}

for (const result of results) {
  const mark = result.ok ? 'PASS' : 'FAIL';
  console.log(`${mark} ${result.name}${result.detail ? `: ${result.detail}` : ''}`);
}

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} pemeriksaan lulus.`);
process.exit(failed.length === 0 ? 0 : 1);
