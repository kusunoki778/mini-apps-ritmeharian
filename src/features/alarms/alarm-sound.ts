import { DEFAULT_ALARM_SOUND, isAlarmSoundId, type AlarmSoundId } from './alarm-sounds';

type StopSound = () => void;
type Scheduler = (context: AudioContext, start: number, master: GainNode) => void;

// Nada alarm dibuat dengan Web Audio supaya tidak butuh berkas audio eksternal.
// Pola nada disamakan dengan yang dibundel di Android (res/raw/alarm*.wav): Nadi,
// Lembut, Tegas, Lonceng, Denyut, dan Fajar. Jadi pilihan nada di Pengaturan juga
// terasa di web, bukan hanya di aplikasi Android.
function getAudioContext(): typeof AudioContext | null {
  if (typeof globalThis === 'undefined') return null;

  const audioGlobal = globalThis as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext ?? null;
}

interface ToneNote {
  hz: number;
  durationMs: number;
  fadeMs?: number;
  harmonic?: number;
  peak?: number;
}

// Satu ketuk nada dengan amplop naik-turun pendek. Overtone opsional memberi warna
// yang membedakan tiap nada.
function playNote(context: AudioContext, master: GainNode, at: number, note: ToneNote): void {
  const { hz, durationMs } = note;
  const duration = durationMs / 1000;
  const peak = note.peak ?? 0.16;
  const fade = Math.min((note.fadeMs ?? 12) / 1000, duration / 2);

  const schedule = (frequency: number, level: number) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(level, at + fade);
    gain.gain.setValueAtTime(level, at + duration - fade);
    gain.gain.linearRampToValueAtTime(0, at + duration);

    oscillator.connect(gain).connect(master);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.02);
  };

  schedule(hz, peak);
  if (note.harmonic) schedule(hz * 2, peak * note.harmonic);
}

interface TonePatternConfig {
  hz: number;
  taps: number;
  tapMs: number;
  gapMs: number;
  groupGapMs: number;
  harmonic?: number;
  fadeMs?: number;
  peak?: number;
}

// Beberapa ketuk dalam satu grup, lalu jeda grup. Dipakai Nadi, Tegas, Lonceng, Denyut.
function playTonePattern(
  context: AudioContext,
  master: GainNode,
  start: number,
  config: TonePatternConfig,
): void {
  let cursor = start;
  for (let tap = 0; tap < config.taps; tap += 1) {
    playNote(context, master, cursor, {
      hz: config.hz,
      durationMs: config.tapMs,
      fadeMs: config.fadeMs,
      harmonic: config.harmonic,
      peak: config.peak,
    });
    cursor += (config.tapMs + config.gapMs) / 1000;
  }
}

interface SwellConfig {
  hz: number;
  secondHz: number;
  swellMs: number;
  gapMs: number;
}

// Dua frekuensi berdampingan dengan amplitudo yang naik turun halus. Nada Lembut.
function playSwell(
  context: AudioContext,
  master: GainNode,
  start: number,
  config: SwellConfig,
): void {
  const duration = config.swellMs / 1000;

  const schedule = (frequency: number, level: number) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(level, start + duration / 2);
    gain.gain.linearRampToValueAtTime(0, start + duration);

    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };

  schedule(config.hz, 0.18);
  schedule(config.secondHz, 0.09);
}

interface RiseConfig {
  fromHz: number;
  toHz: number;
  stepMs: number;
  steps: number;
  gapMs: number;
  holdMs: number;
}

// Nada menanjak lalu ditahan panjang, seperti matahari terbit. Nada Fajar.
function playRise(
  context: AudioContext,
  master: GainNode,
  start: number,
  config: RiseConfig,
): void {
  let cursor = start;
  for (let step = 0; step < config.steps; step += 1) {
    const hz =
      config.fromHz + ((config.toHz - config.fromHz) * step) / Math.max(1, config.steps - 1);
    playNote(context, master, cursor, { hz, durationMs: config.stepMs, harmonic: 0.3, peak: 0.15 });
    cursor += (config.stepMs + config.gapMs) / 1000;
  }

  playNote(context, master, cursor, {
    hz: config.toHz,
    durationMs: config.holdMs,
    fadeMs: 60,
    harmonic: 0.25,
    peak: 0.14,
  });
}

interface Preset {
  cycleMs: number;
  schedule: Scheduler;
}

const PRESETS: Record<AlarmSoundId, Preset> = {
  nadi: {
    cycleMs: 1480,
    schedule: (context, start, master) =>
      playTonePattern(context, master, start, {
        hz: 1000,
        taps: 3,
        tapMs: 180,
        gapMs: 120,
        groupGapMs: 700,
      }),
  },
  lembut: {
    cycleMs: 1000,
    schedule: (context, start, master) =>
      playSwell(context, master, start, { hz: 660, secondHz: 880, swellMs: 600, gapMs: 400 }),
  },
  tegas: {
    cycleMs: 710,
    schedule: (context, start, master) =>
      playTonePattern(context, master, start, {
        hz: 880,
        taps: 2,
        tapMs: 110,
        gapMs: 70,
        groupGapMs: 420,
        harmonic: 0.35,
      }),
  },
  lonceng: {
    cycleMs: 1800,
    schedule: (context, start, master) =>
      playTonePattern(context, master, start, {
        hz: 1320,
        taps: 2,
        tapMs: 320,
        gapMs: 260,
        groupGapMs: 900,
        harmonic: 0.2,
        fadeMs: 50,
      }),
  },
  denyut: {
    cycleMs: 1210,
    schedule: (context, start, master) =>
      playTonePattern(context, master, start, {
        hz: 200,
        taps: 2,
        tapMs: 160,
        gapMs: 110,
        groupGapMs: 780,
        harmonic: 0.5,
        fadeMs: 24,
      }),
  },
  fajar: {
    cycleMs: 3440,
    schedule: (context, start, master) =>
      playRise(context, master, start, {
        fromHz: 523,
        toHz: 784,
        stepMs: 260,
        steps: 5,
        gapMs: 240,
        holdMs: 700,
      }),
  },
};

// Memutar nada alarm terpilih secara berulang. Mengembalikan fungsi untuk
// menghentikannya. Bila id tidak dikenal, dipakai nada bawaan. Bila Web Audio tidak
// tersedia, mengembalikan fungsi kosong.
export function startAlarmSound(soundId?: string): StopSound {
  const AudioCtor = getAudioContext();
  if (!AudioCtor) return () => {};

  const id = isAlarmSoundId(soundId) ? soundId : DEFAULT_ALARM_SOUND;
  const preset = PRESETS[id];
  const context = new AudioCtor();
  const master = context.createGain();
  master.gain.value = 0.9;
  master.connect(context.destination);

  let stopped = false;

  const playCycle = () => {
    if (stopped) return;
    preset.schedule(context, context.currentTime + 0.03, master);
  };

  void context.resume?.();
  playCycle();

  const interval = window.setInterval(playCycle, preset.cycleMs);

  return () => {
    stopped = true;
    window.clearInterval(interval);

    // Redam cepat supaya tidak ada letupan saat dimatikan, lalu tutup konteks.
    try {
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.06);
    } catch {
      // Abaikan bila konteks sudah tertutup.
    }

    window.setTimeout(() => {
      void context.close();
    }, 120);
  };
}
