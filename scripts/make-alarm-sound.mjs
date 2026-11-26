// Membuat nada dering alarm yang dibundel ke Android (res/raw/alarm*.wav).
// Jalankan: node scripts/make-alarm-sound.mjs
//
// Semua nada dibuat dengan sintesis, tanpa berkas pihak ketiga, jadi bebas lisensi.
// Setiap nada dirancang mulus di ujung loop agar tidak ada letupan saat berulang.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const OUT_DIR = 'android/app/src/main/res/raw';
// 22 kHz cukup untuk nada alarm (di bawah 3 kHz) dan menjaga ukuran berkas tetap
// wajar walau tiap nada panjang.
const SAMPLE_RATE = 22050;
const BITS = 16;
const CHANNELS = 1;

function toSamples(ms) {
  return Math.round((ms / 1000) * SAMPLE_RATE);
}

// Amplop naik-turun pendek untuk mencegah klik pada tiap nada.
function envelope(index, length, fadeSamples, sustain = 1) {
  const fadeIn = Math.min(1, index / fadeSamples);
  const fadeOut = Math.min(1, (length - index) / fadeSamples);
  return Math.min(fadeIn, fadeOut) * sustain;
}

// Tulis deret sampel mono menjadi WAV 16 bit.
async function writeWav(fileName, samples, seconds) {
  const byteLength = samples.length * (BITS / 8);
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

  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]));
    buffer.writeInt16LE(Math.round(clamped * 32767 * 0.85), 44 + index * 2);
  }

  const path = join(OUT_DIR, fileName);
  await writeFile(path, buffer);
  console.log(
    `  ${fileName.padEnd(20)} ${String(buffer.length).padStart(7)} byte  ${seconds.toFixed(1)} s`,
  );
}

// Nada dasar bermain beberapa ketuk dengan jeda. dipakai pola beep, lonceng, dan denyut.
function tonePattern({ hz, taps, tapMs, gapMs, groupGapMs, groups, fadeMs = 10, harmonic = 0 }) {
  const totalMs = groups * (taps * (tapMs + gapMs) - gapMs + groupGapMs) - groupGapMs + 120;
  const samples = new Float32Array(toSamples(totalMs));
  const fade = toSamples(fadeMs);

  let cursor = 0;
  for (let group = 0; group < groups; group += 1) {
    for (let tap = 0; tap < taps; tap += 1) {
      const length = toSamples(tapMs);
      for (let index = 0; index < length; index += 1) {
        const phase = (2 * Math.PI * hz * index) / SAMPLE_RATE;
        const base = Math.sin(phase);
        const overtone = harmonic * Math.sin(2 * phase);
        samples[cursor + index] = (base + overtone) * envelope(index, length, fade) * 0.75;
      }
      cursor += length + toSamples(gapMs);
    }
    cursor += toSamples(groupGapMs) - toSamples(gapMs);
  }

  return { samples, seconds: totalMs / 1000 };
}

// Nada berayun dengan amplitudo naik turun dan dua frekuensi berdampingan, terasa
// seperti alarm lembut yang tidak menusuk.
function swellPattern({ hz, swellMs, groups, gapMs, secondHz }) {
  const swell = toSamples(swellMs);
  const gap = toSamples(gapMs);
  const totalSamples = groups * (swell + gap) - gap;
  const samples = new Float32Array(totalSamples + toSamples(120));
  const fade = toSamples(30);

  for (let group = 0; group < groups; group += 1) {
    const start = group * (swell + gap);
    for (let index = 0; index < swell; index += 1) {
      const progress = index / swell;
      const rise = Math.sin(Math.PI * progress);
      const a = Math.sin((2 * Math.PI * hz * index) / SAMPLE_RATE);
      const b = Math.sin((2 * Math.PI * secondHz * index) / SAMPLE_RATE) * 0.5;
      samples[start + index] = (a + b) * rise * envelope(index, swell, fade) * 0.8;
    }
  }

  return { samples, seconds: samples.length / SAMPLE_RATE };
}

// Nada menanjak seperti matahari terbit, satu frasa per siklus, diulang beberapa
// kali lalu ditutup nada tahan panjang.
function risePattern({ fromHz, toHz, stepMs, steps, gapMs, cycles, holdMs }) {
  const step = toSamples(stepMs);
  const gap = toSamples(gapMs);
  const hold = toSamples(holdMs);
  const phrase = steps * (step + gap) - gap;
  const cycle = phrase + gap;
  const totalSamples = cycles * cycle + hold + toSamples(120);
  const samples = new Float32Array(totalSamples);
  const fade = toSamples(16);

  for (let round = 0; round < cycles; round += 1) {
    const base = round * cycle;
    for (let note = 0; note < steps; note += 1) {
      const start = base + note * (step + gap);
      const hz = fromHz + ((toHz - fromHz) * note) / Math.max(1, steps - 1);
      for (let index = 0; index < step; index += 1) {
        const phase = (2 * Math.PI * hz * index) / SAMPLE_RATE;
        const value = Math.sin(phase) + 0.3 * Math.sin(2 * phase);
        samples[start + index] = value * envelope(index, step, fade) * 0.72;
      }
    }
  }

  const holdStart = cycles * cycle;
  for (let index = 0; index < hold; index += 1) {
    const phase = (2 * Math.PI * toHz * index) / SAMPLE_RATE;
    const value = Math.sin(phase) + 0.25 * Math.sin(2 * phase);
    samples[holdStart + index] = value * envelope(index, hold, toSamples(60)) * 0.68;
  }

  return { samples, seconds: samples.length / SAMPLE_RATE };
}

await mkdir(dirname(join(OUT_DIR, 'alarm.wav')), { recursive: true });
console.log('Menulis nada alarm ke', OUT_DIR);

const presets = [
  [
    'alarm.wav',
    tonePattern({ hz: 1000, taps: 3, tapMs: 180, gapMs: 120, groupGapMs: 700, groups: 17 }),
  ],
  [
    'alarm_lembut.wav',
    swellPattern({ hz: 660, secondHz: 880, swellMs: 600, gapMs: 400, groups: 25 }),
  ],
  [
    'alarm_tegas.wav',
    tonePattern({
      hz: 880,
      taps: 2,
      tapMs: 110,
      gapMs: 70,
      groupGapMs: 420,
      groups: 35,
      harmonic: 0.35,
    }),
  ],
  [
    'alarm_lonceng.wav',
    tonePattern({
      hz: 1320,
      taps: 2,
      tapMs: 320,
      gapMs: 260,
      groupGapMs: 900,
      groups: 14,
      fadeMs: 50,
      harmonic: 0.2,
    }),
  ],
  [
    'alarm_denyut.wav',
    tonePattern({
      hz: 200,
      taps: 2,
      tapMs: 160,
      gapMs: 110,
      groupGapMs: 780,
      groups: 20,
      fadeMs: 24,
      harmonic: 0.5,
    }),
  ],
  [
    'alarm_fajar.wav',
    risePattern({
      fromHz: 523,
      toHz: 784,
      stepMs: 260,
      steps: 5,
      gapMs: 240,
      cycles: 10,
      holdMs: 900,
    }),
  ],
];

for (const [fileName, preset] of presets) {
  await writeWav(fileName, preset.samples, preset.seconds);
}

console.log('Selesai. Jalankan npx cap sync android lalu bangun ulang APK.');
