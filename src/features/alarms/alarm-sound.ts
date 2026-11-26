type StopSound = () => void;

function getAudioContext(): typeof AudioContext | null {
  if (typeof globalThis === 'undefined') return null;

  const audioGlobal = globalThis as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext ?? null;
}

// Nada alarm dibuat dengan Web Audio supaya tidak butuh berkas audio eksternal.
// Mengembalikan fungsi untuk menghentikan nada.
export function startAlarmSound(): StopSound {
  const AudioCtor = getAudioContext();
  if (!AudioCtor) return () => {};

  const context = new AudioCtor();
  let stopped = false;

  const beep = (at: number) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.18, at + 0.02);
    gain.gain.linearRampToValueAtTime(0, at + 0.28);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.3);
  };

  const play = () => {
    if (stopped) return;
    beep(context.currentTime + 0.02);
    beep(context.currentTime + 0.4);
  };

  void context.resume?.();
  play();

  const interval = window.setInterval(play, 1200);

  return () => {
    stopped = true;
    window.clearInterval(interval);
    void context.close();
  };
}
