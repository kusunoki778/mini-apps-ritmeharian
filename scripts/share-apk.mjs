// Menyajikan berkas APK di jaringan lokal supaya bisa diunduh dari ponsel.
// Pakai: node scripts/share-apk.mjs [berkas-apk] [port]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { resolve } from 'node:path';

const apk = resolve(process.argv[2] ?? 'Nadi.apk');
const port = Number(process.argv[3] ?? 8099);

if (!existsSync(apk)) {
  console.error(`APK tidak ditemukan: ${apk}`);
  process.exit(1);
}

function lanAddress() {
  for (const entries of Object.values(networkInterfaces())) {
    for (const net of entries ?? []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

createServer((_req, res) => {
  const { size } = statSync(apk);
  res.writeHead(200, {
    'Content-Type': 'application/vnd.android.package-archive',
    'Content-Disposition': 'attachment; filename="Nadi.apk"',
    'Content-Length': size,
  });
  createReadStream(apk).pipe(res);
}).listen(port, '0.0.0.0', () => {
  console.log('APK siap diunduh. Buka di browser ponsel yang satu Wi-Fi dengan komputer ini:');
  console.log(`  http://${lanAddress()}:${port}/Nadi.apk`);
  console.log(`Dari komputer ini: http://localhost:${port}/Nadi.apk`);
});
