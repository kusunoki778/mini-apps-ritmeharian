// Membuat bunyi alarm yang dibundel ke Android (res/raw/alarm.wav).
// Jalankan: node scripts/make-alarm-sound.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const OUT = 'android/app/src/main/res/raw/alarm.wav';
const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BITS = 16;

// Pola: tiga beep pendek lalu jeda, diulang beberapa kali agar terdengar seperti alarm.
const BEEP_HZ = 1000;
const BEEP_MS = 180;
const GAP_MS = 120;
const GROUP_GAP_MS = 700;
const GROUPS = 3;
const beepsPerGroup = 3;
const FADE_MS = 12;

function samples(ms) {
  return Math.round((ms / 1000) * SAMPLE_RATE);
}

const totalMs =
  GROUPS * (beepsPerGroup * (BEEP_MS + GAP_MS) - GAP_MS + GROUP_GAP_MS) - GROUP_GAP_MS + 200;
const totalSamples = samples(totalMs);
const data = new Int16Array(totalSamples);

let cursor = 0;
for (let group = 0; group < GROUPS; group += 1) {
  for (let beep = 0; beep < beepsPerGroup; beep += 1) {
    const on = samples(BEEP_MS);
    const fade = samples(FADE_MS);
    for (let index = 0; index < on; index += 1) {
      const fadeIn = Math.min(1, index / fade);
      const fadeOut = Math.min(1, (on - index) / fade);
      const envelope = Math.min(fadeIn, fadeOut);
      const value = Math.sin((2 * Math.PI * BEEP_HZ * index) / SAMPLE_RATE);
      data[cursor + index] = Math.round(value * envelope * 0.6 * 32767);
    }
    cursor += on + samples(GAP_MS);
  }
  cursor += samples(GROUP_GAP_MS) - samples(GAP_MS);
}

const byteLength = data.length * (BITS / 8);
const buffer = Buffer.alloc(44 + byteLength);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + byteLength, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(CHANNELS, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE((SAMPLE_RATE * CHANNELS * BITS) / 8, 28);
buffer.writeUInt16LE((CHANNELS * BITS) / 8, 32);
buffer.writeUInt16LE(BITS, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(byteLength, 40);

for (let index = 0; index < data.length; index += 1) {
  buffer.writeInt16LE(data[index], 44 + index * 2);
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, buffer);
console.log(
  `Bunyi alarm ditulis ke ${OUT} (${buffer.length} byte, ${(totalMs / 1000).toFixed(1)} s).`,
);
