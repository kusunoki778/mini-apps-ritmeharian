import { createRequire } from 'node:module';

import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');
const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.AUDIT_BASE ?? 'http://localhost:5173';

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1440];
const PAGES = ['/', '/catatan', '/kalkulator', '/alarm', '/tumbuh-kembang', '/pengaturan'];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const problems = [];

try {
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 800 } });
    const page = await context.newPage();

    for (const path of PAGES) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
      await page.locator('h1').first().waitFor({ timeout: 10000 });

      const report = await page.evaluate(() => {
        const overflowX = document.documentElement.scrollWidth - window.innerWidth;
        const offenders = [];

        if (overflowX > 1) {
          for (const element of Array.from(document.querySelectorAll('body *'))) {
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            if (rect.right > window.innerWidth + 1 || rect.left < -1) {
              offenders.push({
                tag: element.tagName.toLowerCase(),
                text: (element.textContent ?? '').trim().slice(0, 40),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                cls: (element.getAttribute('class') ?? '').slice(0, 70),
              });
            }
          }
        }

        return { overflowX, offenders: offenders.slice(0, 6) };
      });

      if (report.overflowX > 1) {
        problems.push({ width, path, overflowX: report.overflowX, offenders: report.offenders });
      }

      await page.addScriptTag({ path: AXE_PATH });
      const axe = await page.evaluate(async () => {
        const outcome = await window.axe.run(document, { resultTypes: ['violations'] });
        return outcome.violations
          .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
          .map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.slice(0, 3).map((node) => node.target.join(' ')),
          }));
      });

      for (const violation of axe) {
        problems.push({ width, path, axe: violation });
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

if (problems.length === 0) {
  console.log('Tidak ada overflow horizontal maupun pelanggaran aksesibilitas berat.');
} else {
  for (const problem of problems) {
    if (problem.overflowX) {
      console.log(`\nOVERFLOW ${problem.path} @${problem.width}px (${problem.overflowX}px)`);
      for (const item of problem.offenders) {
        console.log(`  <${item.tag}> ${item.left}..${item.right} "${item.text}" [${item.cls}]`);
      }
    } else {
      console.log(
        `\nAXE ${problem.path} @${problem.width}px ${problem.axe.id}:${problem.axe.impact}`,
      );
      for (const node of problem.axe.nodes) console.log(`  ${node}`);
    }
  }
  console.log(`\n${problems.length} masalah.`);
}
