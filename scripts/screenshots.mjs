// Tangkapan layar untuk dokumentasi (T8.9).
// Jalankan setelah `npm run build` dan preview di port 4173:
//   npm run screenshots
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:4173';
const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'docs/screenshots';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

try {
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await mobile.newPage();

  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.locator('h1').first().waitFor();
  await page.getByRole('button', { name: 'Detail 7 hari' }).waitFor({ timeout: 20000 });
  await page.screenshot({ path: `${OUT}/01-beranda-terang.png` });

  await page.goto(`${BASE}/pengaturan`, { waitUntil: 'load' });
  await page.getByRole('heading', { level: 1, name: 'Pengaturan', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Gelap' }).click();
  await page.screenshot({ path: `${OUT}/06-pengaturan-gelap.png` });

  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.locator('h1').first().waitFor();
  await page.getByRole('button', { name: 'Detail 7 hari' }).waitFor({ timeout: 20000 });
  await page.screenshot({ path: `${OUT}/02-beranda-gelap.png` });

  for (const [path, name] of [
    ['kalender', '03-kalender'],
    ['catatan', '04-catatan'],
    ['alarm', '05-alarm'],
  ]) {
    await page.goto(`${BASE}/${path}`, { waitUntil: 'load' });
    await page.locator('h1').first().waitFor();
    await page.screenshot({ path: `${OUT}/${name}.png` });
  }

  await page.goto(`${BASE}/tumbuh-kembang`, { waitUntil: 'load' });
  await page
    .getByRole('heading', { level: 1, name: 'Tinggi dan berat ideal', exact: true })
    .waitFor();
  await page.getByLabel('Umur (tahun)').fill('8');
  await page.getByLabel('Tinggi badan (cm)').fill('128');
  await page.getByLabel('Berat badan (kg)').fill('26');
  await page.getByText('Tinggi ideal').waitFor();
  await page.screenshot({ path: `${OUT}/08-tumbuh-kembang.png` });

  await mobile.close();

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(`${BASE}/`, { waitUntil: 'load' });
  await desktopPage.locator('h1').first().waitFor();
  await desktopPage.getByRole('button', { name: 'Detail 7 hari' }).waitFor({ timeout: 20000 });
  await desktopPage.screenshot({ path: `${OUT}/07-beranda-desktop.png` });
  await desktop.close();

  console.log(`Tangkapan layar disimpan di ${OUT}.`);
} finally {
  await browser.close();
}
