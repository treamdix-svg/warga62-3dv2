import * as THREE from 'three';

// Tekstur prosedural (canvas) untuk detail landmark: jam, rumbai, paving, ukiran, jerami, papan kayu, batu.
const cache = new Map();
const make = (key, w, h, draw, { repeat = null, srgb = true } = {}) => {
  const id = key;
  if (cache.has(id)) return cache.get(id);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  cache.set(id, t);
  return t;
};
const rnd = (() => { let s = 99; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

export const tex = {
  clockFace: () => make('clock', 256, 256, (x) => {
    x.fillStyle = '#f7f2e2'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill();
    x.strokeStyle = '#3b3a38'; x.lineWidth = 12; x.stroke();
    x.fillStyle = '#1f2937'; x.font = 'bold 30px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const R = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    R.forEach((r, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; x.fillText(r, 128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96); });
    x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + 52, 128 - 34); x.stroke();
    x.lineWidth = 6; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 - 8, 128 - 78); x.stroke();
    x.fillStyle = '#b91c1c'; x.beginPath(); x.arc(128, 128, 8, 0, 7); x.fill();
  }),
  bunting: () => make('bunting', 256, 64, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      x.fillStyle = i % 2 ? '#ffffff' : '#d9322b';
      x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 32, 0); x.quadraticCurveTo(i * 32 + 16, 70, i * 32, 0); x.fill();
    }
    x.fillStyle = '#d9322b'; x.fillRect(0, 0, w, 12);
  }, { repeat: [3, 1] }),
  paveTeal: () => make('paveteal', 256, 256, (x, w, h) => {
    x.fillStyle = '#7fae9f'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
      const v = 120 + Math.floor(rnd() * 40); x.fillStyle = `rgb(${v - 26},${v + 34},${v + 12})`; x.fillRect(i * 16 + 1, j * 16 + 1, 14, 14);
    }
  }, { repeat: [5, 5] }),
  sun: () => make('sun', 256, 256, (x) => {
    x.clearRect(0, 0, 256, 256);
    x.fillStyle = '#e8803a'; x.beginPath(); x.arc(128, 128, 84, 0, 7); x.fill();
    x.fillStyle = '#f6c75c';
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; x.beginPath(); x.moveTo(128 + Math.cos(a - 0.14) * 84, 128 + Math.sin(a - 0.14) * 84); x.lineTo(128 + Math.cos(a) * 124, 128 + Math.sin(a) * 124); x.lineTo(128 + Math.cos(a + 0.14) * 84, 128 + Math.sin(a + 0.14) * 84); x.fill(); }
    x.fillStyle = '#fff6d6'; x.beginPath(); x.arc(128, 128, 30, 0, 7); x.fill();
    x.strokeStyle = '#2e8f5b'; x.lineWidth = 8; x.beginPath(); x.arc(128, 128, 90, 0, 7); x.stroke();
  }),
  awning: () => make('awning', 128, 128, (x, w, h) => {
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#25b8a2'; x.fillRect(i * 16, 0, 16, h); }
  }, { repeat: [3, 1] }),
  toraja: () => make('toraja', 512, 256, (x, w, h) => {
    x.fillStyle = '#1b1412'; x.fillRect(0, 0, w, h);
    const cols = ['#d9322b', '#f6f0e0', '#f5c542'];
    for (let r = 0; r < 4; r++) for (let i = 0; i < 16; i++) {
      const cx = i * 32 + 16, cy = r * 64 + 32;
      x.fillStyle = cols[(i + r) % 3]; x.beginPath(); x.moveTo(cx, cy - 24); x.lineTo(cx + 24, cy); x.lineTo(cx, cy + 24); x.lineTo(cx - 24, cy); x.closePath(); x.fill();
      x.fillStyle = '#1b1412'; x.beginPath(); x.arc(cx, cy, 8, 0, 7); x.fill();
      x.strokeStyle = cols[(i + r + 1) % 3]; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 14, 0, 7); x.stroke();
    }
    x.fillStyle = '#f6f0e0'; x.fillRect(0, 124, w, 8);
  }, { repeat: [1, 1] }),
  carvedSun: () => make('carvedsun', 256, 256, (x) => {
    x.fillStyle = '#1b1412'; x.fillRect(0, 0, 256, 256);
    x.translate(128, 150);
    for (let i = 0; i < 16; i++) { x.rotate((Math.PI * 2) / 16); x.fillStyle = i % 2 ? '#d9322b' : '#f5c542'; x.beginPath(); x.moveTo(0, -30); x.lineTo(14, -110); x.lineTo(-14, -110); x.fill(); }
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = '#f6f0e0'; x.beginPath(); x.arc(128, 150, 36, 0, 7); x.fill(); x.fillStyle = '#d9322b'; x.beginPath(); x.arc(128, 150, 20, 0, 7); x.fill();
  }),
  shingle: () => make('shingle', 256, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f0803a'); g.addColorStop(1, '#c4381f'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(80,20,10,0.45)'; x.lineWidth = 3;
    for (let j = 0; j < 12; j++) { x.beginPath(); x.moveTo(0, j * 22); x.lineTo(w, j * 22); x.stroke(); for (let i = 0; i < 10; i++) { x.beginPath(); x.moveTo(i * 26 + (j % 2) * 13, j * 22); x.lineTo(i * 26 + (j % 2) * 13, j * 22 + 22); x.stroke(); } }
  }, { repeat: [3, 2] }),
  thatch: () => make('thatch', 256, 256, (x, w, h) => {
    x.fillStyle = '#d9b46a'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 520; i++) { const v = 150 + Math.floor(rnd() * 80); x.strokeStyle = `rgb(${v + 30},${v},${v - 70})`; x.lineWidth = 1 + rnd() * 2; const px = rnd() * w; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + (rnd() - 0.5) * 20, h); x.stroke(); }
    x.strokeStyle = 'rgba(100,70,30,0.35)'; x.lineWidth = 4; for (let j = 1; j < 6; j++) { x.beginPath(); x.moveTo(0, j * 42); x.lineTo(w, j * 42 + 6); x.stroke(); }
  }, { repeat: [4, 2] }),
  planks: () => make('planks', 256, 256, (x, w, h) => {
    for (let i = 0; i < 8; i++) { const v = 130 + Math.floor(rnd() * 40); x.fillStyle = `rgb(${v + 40},${v},${v - 55})`; x.fillRect(i * 32, 0, 32, h); x.strokeStyle = 'rgba(60,35,15,0.6)'; x.lineWidth = 3; x.strokeRect(i * 32, -2, 32, h + 4);
      for (let k = 0; k < 14; k++) { x.strokeStyle = 'rgba(70,40,15,0.22)'; x.beginPath(); const px = i * 32 + 4 + rnd() * 24; x.moveTo(px, 0); x.lineTo(px + (rnd() - 0.5) * 6, h); x.stroke(); } }
  }, { repeat: [3, 1] }),
  stone: () => make('stone', 256, 256, (x, w, h) => {
    x.fillStyle = '#c9c4b6'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) { const v = 175 + Math.floor(rnd() * 40); x.fillStyle = `rgb(${v},${v - 4},${v - 14})`; x.fillRect(i * 64 + (j % 2) * 32 + 2, j * 32 + 2, 60, 28); }
  }, { repeat: [3, 2] }),
  brickRed: () => make('brickred', 256, 256, (x, w, h) => {
    x.fillStyle = '#a94d3a'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 6; i++) { const v = 150 + Math.floor(rnd() * 40); x.fillStyle = `rgb(${v + 20},${v - 70},${v - 80})`; x.fillRect(i * 44 + (j % 2) * 22 + 2, j * 16 + 2, 40, 12); }
  }, { repeat: [4, 2] }),
  cobble: () => make('cobble', 256, 256, (x, w, h) => {
    x.fillStyle = '#9a9588'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { const v = 140 + Math.floor(rnd() * 60); x.fillStyle = `rgb(${v},${v - 6},${v - 16})`; x.beginPath(); x.ellipse(rnd() * w, rnd() * h, 14 + rnd() * 8, 10 + rnd() * 6, rnd() * 3, 0, 7); x.fill(); }
  }, { repeat: [6, 6] }),
  lawn: () => make('lawn', 256, 256, (x, w, h) => {
    x.fillStyle = '#6cc04a'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) { const v = 120 + Math.floor(rnd() * 90); x.fillStyle = `rgb(${v - 60},${v + 40},${v - 90})`; x.fillRect(rnd() * w, rnd() * h, 2, 5); }
  }, { repeat: [4, 4] }),
};

export const stdMat = (map, o = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0, ...o });
