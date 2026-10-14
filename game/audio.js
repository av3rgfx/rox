// audio.js: every sound is synthesised with the Web Audio API (no files): the engine, the horn, the hits, the
// jingles and a little chiptune tarantella. The context starts on the first tap or key (browsers require it).
let ctx = null, master = null, musicBus = null, sfxBus = null, engine = null, musicTimer = null;
const state = { sound: true, music: true };
try { const s = JSON.parse(localStorage.getItem('rox-audio') || '{}'); Object.assign(state, s); } catch {}
const save = () => { try { localStorage.setItem('rox-audio', JSON.stringify(state)); } catch {} };

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.gain.value = state.sound ? 1 : 0; sfxBus.connect(master);
  musicBus = ctx.createGain(); musicBus.gain.value = state.music ? 0.32 : 0; musicBus.connect(master);
}
export const audioState = () => ({ ...state });
export function setSound(on) { state.sound = on; save(); if (sfxBus) sfxBus.gain.value = on ? 1 : 0; }
export function setMusic(on) { state.music = on; save(); if (musicBus) musicBus.gain.value = on ? 0.32 : 0; }

function tone(type, f0, f1, t0, dur, vol = 0.2, bus = sfxBus) {
  if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.02);
}
let noiseBuf = null;
function noise(t0, dur, vol = 0.3, freq = 1200, q = 0.7) {
  if (!ctx) return; if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime + t0; s.buffer = noiseBuf; s.loop = true;
  f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dur + 0.02);
}

export const sfx = {
  hit() { noise(0, 0.18, 0.5, 700); tone('square', 520, 90, 0, 0.35, 0.18); tone('triangle', 900, 300, 0.05, 0.25, 0.12); },
  gold() { [784, 988, 1175, 1568].forEach((f, i) => tone('square', f, f, i * 0.07, 0.16, 0.12)); noise(0, 0.15, 0.4, 900); },
  horn() { tone('square', 392, 392, 0, 0.16, 0.14); tone('square', 494, 494, 0, 0.16, 0.1); tone('square', 440, 440, 0.2, 0.32, 0.14); tone('square', 554, 554, 0.2, 0.32, 0.1); },
  crash() { noise(0, 0.6, 0.6, 400, 0.5); tone('sawtooth', 160, 40, 0, 0.5, 0.2); },
  skid() { noise(0, 0.45, 0.25, 2600, 4); },
  slip() { tone('sine', 300, 1200, 0, 0.25, 0.15); tone('sine', 1200, 200, 0.25, 0.3, 0.15); },
  pickup() { [523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, i * 0.05, 0.1, 0.1)); },
  miss() { tone('square', 300, 200, 0, 0.15, 0.08); tone('square', 200, 140, 0.15, 0.25, 0.08); },
  beep(hi) { tone('square', hi ? 1046 : 523, hi ? 1046 : 523, 0, hi ? 0.4 : 0.18, 0.15); },
  win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone('square', f, f, i * 0.12, 0.2, 0.13)); },
  lose() { [392, 370, 349, 330].forEach((f, i) => tone('triangle', f, f * 0.98, i * 0.28, 0.32, 0.18)); tone('sawtooth', 110, 70, 1.15, 0.7, 0.12); },
  taunt() { tone('square', 660, 880, 0, 0.08, 0.06); tone('square', 880, 660, 0.09, 0.08, 0.06); },
};

// the engine: two detuned oscillators through a low-pass filter, pitch from speed
export function engineOn() {
  if (!ctx || engine) return; const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  o1.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = 0.0;
  o1.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus); o1.start(); o2.start(); engine = { o1, o2, f, g };
}
export function engineSet(speed, throttle) {
  if (!engine) return; const t = ctx.currentTime, f = 38 + speed * 2.6 + throttle * 8;
  engine.o1.frequency.setTargetAtTime(f, t, 0.06); engine.o2.frequency.setTargetAtTime(f * 0.501, t, 0.06);
  engine.f.frequency.setTargetAtTime(380 + speed * 22, t, 0.1); engine.g.gain.setTargetAtTime(0.05 + throttle * 0.04, t, 0.1);
}
export function engineOff() { if (!engine) return; const e = engine; engine = null; e.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); setTimeout(() => { e.o1.stop(); e.o2.stop(); }, 300); }

// a short tarantella loop in A minor, 6/8: melody, bass, a hi-hat tick
const N = { A3: 220, B3: 247, C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, Gs4: 415, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, A2: 110, E2: 82, D3: 147, G2: 98, C3: 131 };
const MEL = ['E5', 'E5', 'F5', 'E5', 'D5', 'C5', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4', 'Gs4', 'A4', 'B4', 'C5', 'B4', 'A4', 'B4', 'Gs4', 'E4', 'E4', '-', '-',
  'A4', 'C5', 'E5', 'A4', 'C5', 'E5', 'D5', 'C5', 'B4', 'A4', 'B4', 'C5', 'D5', 'F5', 'E5', 'D5', 'C5', 'B4', 'C5', 'B4', 'Gs4', 'A4', '-', '-'];
const BAS = ['A2', 'E2', 'A2', 'E2', 'D3', 'A2', 'E2', 'E2', 'A2', 'E2', 'A2', 'E2', 'D3', 'G2', 'E2', 'A2'];
export function musicStart(fast = false) {
  if (!ctx || musicTimer) return; let step = 0, next = ctx.currentTime + 0.1; const dt = fast ? 0.105 : 0.13;
  musicTimer = setInterval(() => {
    while (next < ctx.currentTime + 0.25) {
      const m = MEL[step % MEL.length]; if (m !== '-') tone('square', N[m], N[m], next - ctx.currentTime, dt * 0.9, 0.08, musicBus);
      if (step % 3 === 0) { const b = BAS[(step / 3 | 0) % BAS.length]; tone('triangle', N[b], N[b], next - ctx.currentTime, dt * 2.6, 0.2, musicBus); }
      if (step % 3 === 2 && ctx) { const s = ctx.createOscillator(), g = ctx.createGain(), t = next; s.type = 'square'; s.frequency.value = 8000; g.gain.setValueAtTime(0.012, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03); s.connect(g); g.connect(musicBus); s.start(t); s.stop(t + 0.04); }
      step++; next += dt;
    }
  }, 60);
}
export function musicStop() { clearInterval(musicTimer); musicTimer = null; }
