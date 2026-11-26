// Menghasilkan tabel LMS ringkas yang dibundel aplikasi dari paket sumber WHO.
// Sumber: child-growth-standards (MIT), data dari WHO Child Growth Standards (0-5 tahun)
// dan WHO Growth Reference (5-19 tahun).
// Jalankan: node scripts/build-growth-data.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const SRC = 'node_modules/child-growth-standards/dist/data/who';
const OUT = 'src/features/growth/growth-data.ts';

const FILES = {
  heightForAge: {
    male: ['lhfa-boys-0-5-months.json', 'hfa-boys-5-19-months.json'],
    female: ['lhfa-girls-0-5-months.json', 'hfa-girls-5-19-months.json'],
  },
  bmiForAge: {
    male: ['bfa-boys-0-5-months.json', 'bfa-boys-5-19-months.json'],
    female: ['bfa-girls-0-5-months.json', 'bfa-girls-5-19-months.json'],
  },
};

const SOURCE =
  'WHO Child Growth Standards (0 sampai 5 tahun) dan WHO Growth Reference (5 sampai 19 tahun), lewat paket child-growth-standards (MIT).';

function round(value) {
  return Number(value.toFixed(5));
}

async function loadRows(files) {
  const rows = new Map();

  for (const file of files) {
    const parsed = JSON.parse(await readFile(`${SRC}/${file}`, 'utf8'));
    for (const row of parsed.rows) {
      rows.set(row.age, `[${row.age}, ${round(row.L)}, ${round(row.M)}, ${round(row.S)}]`);
    }
  }

  return [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, serialized]) => serialized);
}

const sections = [];
for (const [indicator, bySex] of Object.entries(FILES)) {
  const sexBlocks = [];
  for (const [sex, files] of Object.entries(bySex)) {
    const rows = await loadRows(files);
    sexBlocks.push(`    ${sex}: [\n      ${rows.join(',\n      ')},\n    ],`);
  }
  sections.push(`  ${indicator}: {\n${sexBlocks.join('\n')}\n  },`);
}

const contents = `// Dibuat otomatis oleh scripts/build-growth-data.mjs. Jangan diubah manual.
// ${SOURCE}

export type GrowthSex = 'male' | 'female';

// [umur dalam bulan, L, M, S]
export type GrowthRow = readonly [number, number, number, number];

export const GROWTH_SOURCE = '${SOURCE.replace(/'/g, "\\'")}';

export const GROWTH_DATA: Record<'heightForAge' | 'bmiForAge', Record<GrowthSex, GrowthRow[]>> = {
${sections.join('\n')}
};
`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, contents);

console.log(`Tabel ditulis ke ${OUT}.`);
