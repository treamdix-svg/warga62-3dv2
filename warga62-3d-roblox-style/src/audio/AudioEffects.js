// Efek suara & suasana (angin + burung) dibuat prosedural dengan Web Audio API: tanpa file audio eksternal.
class SoundSystem {
  constructor() {
    this.ctx = null; this.muted = false; this.volume = 0.6; this.ambientOn = false; this.master = null;
    this.ambientGain = null; this.birdTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  setVolume(v) { this.volume = v; if (this.master) this.master.gain.value = this.muted ? 0 : v; }
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : this.volume;
    if (!m) this.startAmbient();
  }

  ok() { if (this.muted) return false; return this.init() && !!this.ctx; }

  tone(freq, dur, { type = 'sine', vol = 0.25, delay = 0, to = null, attack = 0.005 } = {}) {
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }

  noise(dur, { vol = 0.2, freq = 1200, q = 1, delay = 0, type = 'bandpass' } = {}) {
    const t = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
  }

  playDiceRoll() { if (!this.ok()) return; for (let i = 0; i < 7; i++) this.noise(0.06, { vol: 0.28, freq: 900 + Math.random() * 1400, q: 2, delay: i * 0.075 }); }
  playDiceHit(n = 1) { if (!this.ok()) return; this.tone(180 / n, 0.1, { type: 'triangle', vol: 0.3, to: 70 }); this.noise(0.05, { vol: 0.2, freq: 2400 }); }
  playPawnHop() { if (!this.ok()) return; this.tone(300, 0.12, { vol: 0.2, to: 560 }); }
  playStep() { if (!this.ok()) return; this.tone(110 + Math.random() * 30, 0.07, { type: 'triangle', vol: 0.22, to: 70 }); this.noise(0.04, { vol: 0.07, freq: 600 }); }
  playCoin() { if (!this.ok()) return; this.tone(988, 0.25, { vol: 0.22 }); this.tone(1319, 0.32, { vol: 0.22, delay: 0.08 }); }
  playPay() { if (!this.ok()) return; this.tone(660, 0.18, { vol: 0.2, to: 440 }); this.tone(440, 0.24, { vol: 0.2, delay: 0.1, to: 330 }); }
  playBuy() { if (!this.ok()) return; this.noise(0.05, { vol: 0.2, freq: 3000 }); this.tone(880, 0.1, { vol: 0.2, delay: 0.05 }); this.tone(1175, 0.3, { vol: 0.22, delay: 0.14 }); this.tone(1568, 0.4, { vol: 0.16, delay: 0.2 }); }
  playBuild() { if (!this.ok()) return; for (let i = 0; i < 4; i++) { this.noise(0.07, { vol: 0.3, freq: 400, q: 3, delay: i * 0.17 }); this.tone(200, 0.07, { type: 'square', vol: 0.12, delay: i * 0.17, to: 110 }); } this.tone(784, 0.18, { vol: 0.2, delay: 0.75 }); this.tone(1047, 0.35, { vol: 0.22, delay: 0.85 }); }
  playCardDraw() { if (!this.ok()) return; this.noise(0.12, { vol: 0.18, freq: 3500, delay: 0 }); this.tone(220, 0.22, { type: 'triangle', vol: 0.2, to: 880 }); }
  playFate() { if (!this.ok()) return; [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.3, { vol: 0.18, delay: i * 0.09 })); }
  playHazard() { if (!this.ok()) return; this.tone(196, 0.5, { type: 'sawtooth', vol: 0.16, to: 98 }); this.noise(0.35, { vol: 0.15, freq: 300, delay: 0.1 }); }
  playJail() { if (!this.ok()) return; this.tone(150, 0.45, { type: 'sawtooth', vol: 0.25, to: 50 }); this.noise(0.2, { vol: 0.25, freq: 1800, q: 5, delay: 0.05 }); this.noise(0.2, { vol: 0.2, freq: 1500, q: 5, delay: 0.35 }); }
  playSalary() { if (!this.ok()) return; [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, { vol: 0.2, delay: i * 0.07 })); }
  playWin() { if (!this.ok()) return; [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.34, { type: 'triangle', vol: 0.25, delay: i * 0.16 })); }
  playClick() { if (!this.ok()) return; this.tone(660, 0.05, { vol: 0.12, type: 'triangle' }); }
  playError() { if (!this.ok()) return; this.tone(180, 0.18, { type: 'square', vol: 0.12, to: 120 }); }
  playTeleport() { if (!this.ok()) return; this.tone(400, 0.3, { vol: 0.16, to: 1600 }); this.tone(1600, 0.25, { vol: 0.12, delay: 0.3, to: 500 }); }

  // Suasana: angin lembut + kicau burung acak.
  startAmbient() {
    if (this.ambientOn || this.muted || !this.init()) return;
    this.ambientOn = true;
    const len = this.ctx.sampleRate * 3;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { last = (last + (Math.random() * 2 - 1) * 0.06) * 0.985; d[i] = last * 3; }
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
    this.ambientGain = this.ctx.createGain(); this.ambientGain.gain.value = 0.13;
    src.connect(f); f.connect(this.ambientGain); this.ambientGain.connect(this.master); src.start();
    const chirp = () => {
      if (!this.ctx) return;
      if (!this.muted && this.ctx.state === 'running') {
        const base = 2200 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) this.tone(base, 0.09, { vol: 0.035, delay: i * 0.12, to: base * (1.15 + Math.random() * 0.3) });
      }
      this.birdTimer = setTimeout(chirp, 3500 + Math.random() * 6500);
    };
    this.birdTimer = setTimeout(chirp, 2500);
  }
}

export const sounds = new SoundSystem();
