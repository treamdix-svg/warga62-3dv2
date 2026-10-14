// Perangkat bantu untuk membangun klaster kota miniatur (semua ke MeshBuilder `b`, y = dasar objek).
// Bingkai lokal klaster: x = lebar (±3.4), z = kedalaman (+z menghadap jalan), alas bidang setinggi y=0.
const PI = Math.PI, TAU = Math.PI * 2;
export const C = {
  white: 0xfbf8f0, cream: 0xf3ead4, gold: 0xf2b632, red: 0xe0463d, dark: 0x2b2f35, wood: 0x8a5a36, woodD: 0x5e3a22,
  stone: 0xcfc8b4, glass: 0x4a7ea0, glassL: 0x9fd8ef, green: 0x3fae4f, greenD: 0x2c8f4a, water: 0x39c3d8, waterD: 0x2aa3bd, sand: 0xf0d9a0,
};

// Teks blok 3D (font piksel 3x5) untuk papan huruf (LOSARI, JAYAPURA, KM 0).
const FONT = {
  A: '010101111101101', I: '111010010010111', J: '001001001101010', L: '100100100100111', O: '010101101101010', P: '110101110100100',
  R: '110101110101101', S: '011100010001110', U: '101101101101111', Y: '101101010010010', K: '101101110101101', M: '101111111101101',
  '0': '111101101101111', ' ': '000000000000000',
};
export function pixelText(b, text, x, y, z, cell, color, depth = 0.18) {
  const w = text.length * 4 * cell - cell;
  let cx = x - w / 2;
  for (const ch of text) {
    const g = FONT[ch] || FONT[' '];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r * 3 + c] === '1') b.box(cell, cell, depth, color, cx + c * cell + cell / 2, y + (4 - r) * cell, z);
    cx += 4 * cell;
  }
}

export function plate(b, ground, edge, w = 6.8, d = 9) {
  b.box(w, 1.6, d, edge, 0, -1.3, 0);                 // alas/tembok miniatur sampai menutupi lereng
  b.box(w - 0.4, 0.1, d - 0.4, ground, 0, 0.3, 0);
}

export function tree(b, x, z, s = 1, y = 0) {
  b.cyl(0.1 * s, 0.15 * s, 0.9 * s, 5, 0x7a5638, x, y, z);
  b.sphere(0.72 * s, 0x45b755, x, y + 0.75 * s, z);
  b.sphere(0.5 * s, 0x5ccb66, x + 0.3 * s, y + 1.35 * s, z + 0.1 * s);
}
export function palm(b, x, z, s = 1, y = 0) {
  for (let i = 0; i < 3; i++) b.cyl(0.08 * s, 0.12 * s, 0.9 * s, 5, i % 2 ? 0x9a6f43 : 0x8a6038, x + i * 0.07 * s, y + i * 0.85 * s, z);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; b.cone(0.18 * s, 1.3 * s, 4, i % 2 ? 0x3aa855 : 0x2d9348, x + 0.2 * s + Math.cos(a) * 0.55 * s, y + 2.6 * s, z + Math.sin(a) * 0.55 * s, { rz: Math.cos(a) * 1.2, rx: -Math.sin(a) * 1.2, ry: a }); }
}
export function pine(b, x, z, s = 1, y = 0) {
  b.cyl(0.08 * s, 0.12 * s, 0.7 * s, 5, 0x6e4a2e, x, y, z);
  b.cone(0.8 * s, 1.3 * s, 6, 0x2f7d4f, x, y + 0.5 * s, z); b.cone(0.58 * s, 1.2 * s, 6, 0x3c9a5f, x, y + 1.3 * s, z); b.cone(0.36 * s, 1.0 * s, 6, 0x4bb36f, x, y + 2.0 * s, z);
}
export function lamp(b, x, z, h = 2.0) {
  b.cyl(0.05, 0.07, h, 5, 0x39434f, x, 0, z); b.box(0.34, 0.08, 0.14, 0x39434f, x, h, z); b.sphere(0.12, 0xfff2b0, x, h - 0.22, z);
}
export function flagPole(b, x, z, h = 3.4) {
  b.cyl(0.04, 0.06, h, 5, 0xcfd3d8, x, 0, z);
  b.box(0.9, 0.26, 0.04, 0xd9322b, x + 0.46, h - 0.3, z); b.box(0.9, 0.26, 0.04, 0xffffff, x + 0.46, h - 0.56, z);
}
export function bush(b, x, z, s = 1, c = 0x3e9e4e) { b.sphere(0.4 * s, c, x, 0, z, { sy: 0.7 }); }
export function flowerBed(b, x, z, w, d, colors = [0xff6f91, 0xffd23f, 0xffffff]) {
  b.box(w, 0.14, d, 0x5a3d26, x, 0, z);
  const n = Math.max(3, Math.floor(w * d * 2.2));
  for (let i = 0; i < n; i++) b.sphere(0.1, colors[i % colors.length], x + ((i * 0.618) % 1 - 0.5) * (w - 0.2), 0.14, z + ((i * 0.377) % 1 - 0.5) * (d - 0.2));
}

// ---- air & kapal ----
export function water(b, w, d, x = 0, z = 0, color = C.water) {
  b.box(w, 0.16, d, color, x, 0, z);
  b.box(w + 0.2, 0.2, 0.14, C.stone, x, 0, z + d / 2 + 0.05); b.box(w + 0.2, 0.2, 0.14, C.stone, x, 0, z - d / 2 - 0.05);
  b.box(0.14, 0.2, d, C.stone, x + w / 2 + 0.05, 0, z); b.box(0.14, 0.2, d, C.stone, x - w / 2 - 0.05, 0, z);
  for (let i = 0; i < 5; i++) b.box(0.5, 0.03, 0.06, 0xbdf1f8, x + (((i * 37) % 10) / 10 - 0.5) * (w - 1), 0.17, z + (((i * 53) % 10) / 10 - 0.5) * (d - 0.6));
}
export function jukung(b, x, z, ry = 0, hat = true, goods = [0xf6a21c, 0x3fae4f]) {
  b.begin(x, 0.1, z, ry);
  b.box(0.5, 0.2, 1.8, 0x8a5a36, 0, 0, 0); b.box(0.4, 0.14, 0.4, 0x8a5a36, 0, 0.05, 1.0, { rx: -0.5 }); b.box(0.4, 0.14, 0.4, 0x8a5a36, 0, 0.05, -1.0, { rx: 0.5 });
  b.box(0.34, 0.26, 0.2, 0xe0463d, 0, 0.2, -0.3); b.sphere(0.12, 0xf2c9a0, 0, 0.42, -0.3);
  if (hat) b.cone(0.34, 0.2, 10, 0xe6c27a, 0, 0.55, -0.3);
  goods.forEach((c, i) => { b.sphere(0.16, c, (i - 0.5) * 0.22, 0.2, 0.35 + i * 0.12); b.sphere(0.16, c, (i - 0.5) * 0.18, 0.2, 0.62); });
  b.end();
}
export function sampan(b, x, z, ry = 0, color = 0xd9534a) {
  b.begin(x, 0.1, z, ry);
  b.box(0.6, 0.24, 2.2, color, 0, 0, 0); b.cone(0.3, 0.7, 4, color, 0, 0.0, 1.4, { rx: PI / 2, ry: PI / 4 });
  b.box(0.5, 0.4, 0.6, 0xfff4dc, 0, 0.24, -0.3); b.box(0.6, 0.06, 0.7, 0x2563eb, 0, 0.64, -0.3);
  b.end();
}
export function ship(b, x, z, ry = 0, hull = 0x2b3a4a, containers = true) {
  b.begin(x, 0.1, z, ry);
  b.box(1.5, 0.55, 4.6, hull, 0, 0, 0); b.cone(0.75, 1.0, 4, hull, 0, 0, 2.7, { rx: PI / 2, ry: PI / 4 });
  b.box(1.5, 0.12, 4.6, 0xd9322b, 0, 0.55, 0);
  b.box(1.1, 1.0, 0.9, 0xf3f4f6, 0, 0.6, -1.7); b.box(1.2, 0.1, 1.0, 0x2563eb, 0, 1.6, -1.7);
  if (containers) { const cs = [0xe0463d, 0x2a8fd6, 0xf2a21c, 0x2fae66, 0xf3f4f6]; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) b.box(0.55, 0.5, 0.95, cs[(i + j * 2) % 5], (j - 0.5) * 0.6, 0.67, 1.1 - i * 1.05); for (let i = 0; i < 2; i++) b.box(0.55, 0.5, 0.95, cs[(i + 3) % 5], 0, 1.17, 0.6 - i * 1.05); }
  b.end();
}
export function containers(b, x, z, rows = 2, cols = 3, levels = 2) {
  const cs = [0xe0463d, 0x2a8fd6, 0xf2a21c, 0x2fae66, 0xf3f4f6, 0x8d6bd6];
  for (let l = 0; l < levels; l++) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) b.box(0.9, 0.5, 0.45, cs[(r * 3 + c + l) % 6], x + c * 0.95, l * 0.5, z + r * 0.5);
}
export function gantryCrane(b, x, z, ry = 0, color = 0x2a8fd6) {
  b.begin(x, 0, z, ry);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.12, 2.8, 0.12, color, sx * 0.9, 0, sz * 0.7);
  b.box(2.1, 0.12, 1.7, color, 0, 2.8, 0); b.box(0.16, 0.16, 4.2, color, 0, 3.0, 1.0); b.box(0.12, 1.0, 0.12, 0x39434f, 0, 2.0, 2.4); b.box(0.5, 0.1, 0.4, 0xe0463d, 0, 2.0, 2.4);
  b.box(2.4, 0.2, 2.0, 0xd9d4c8, 0, 0, 0, { sy: 0.2 });
  b.end();
}

// ---- jembatan ----
export function archBridge(b, len, h, color, deckY = 0.9, z = 0, width = 1.3) {
  b.box(len, 0.2, width, 0x59606a, 0, deckY, z); b.box(len, 0.06, width * 0.1, 0xf4d34a, 0, deckY + 0.2, z);
  for (const s of [-1, 1]) b.box(len, 0.14, 0.08, color, 0, deckY + 0.2, z + s * width / 2);
  const N = 14;
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N, x0 = -len / 2 + t0 * len, x1 = -len / 2 + t1 * len;
    const y0 = deckY + 0.2 + h * 4 * t0 * (1 - t0), y1 = deckY + 0.2 + h * 4 * t1 * (1 - t1);
    const l = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
    for (const s of [-1, 1]) b.box(l * 1.04, 0.2, 0.14, color, (x0 + x1) / 2, (y0 + y1) / 2 - 0.1, z + s * width / 2, { rz: a });
    if (i > 0 && i % 2 === 0) for (const s of [-1, 1]) b.box(0.04, Math.max(0.1, y0 - deckY - 0.2), 0.04, 0xd8dde2, x0, deckY + 0.2, z + s * width / 2);
  }
  b.box(0.5, deckY, width + 0.4, 0xa9a49a, -len / 2 + 0.1, 0, z); b.box(0.5, deckY, width + 0.4, 0xa9a49a, len / 2 - 0.1, 0, z);
}
export function cableBridge(b, len, color, pylons = [0], pylonH = 3.4, deckY = 0.9, z = 0, width = 1.3) {
  b.box(len, 0.2, width, 0x59606a, 0, deckY, z); b.box(len, 0.06, width * 0.1, 0xf4d34a, 0, deckY + 0.2, z);
  for (const s of [-1, 1]) b.box(len, 0.12, 0.07, color, 0, deckY + 0.2, z + s * width / 2);
  for (const px of pylons) {
    for (const s of [-1, 1]) b.box(0.22, pylonH, 0.22, color, px, deckY, z + s * (width / 2 + 0.1), { sx: 1 });
    b.box(0.3, 0.22, width + 0.5, color, px, deckY + pylonH - 0.2, z);
    for (const side of [-1, 1]) for (let k = 1; k <= 4; k++) {
      const dx = side * (0.5 + k * 0.52), tx = px + dx, ty = deckY + 0.2, topY = deckY + pylonH - 0.2 - (k - 1) * 0.22;
      const l = Math.hypot(dx, topY - ty), a = Math.atan2(topY - ty, -dx);
      for (const s of [-1, 1]) b.box(l, 0.03, 0.03, 0xe8eaec, px + dx / 2, (ty + topY) / 2 - 0.015, z + s * (width / 2 + 0.1), { rz: -side * a + (side > 0 ? 0 : 0) });
    }
  }
  b.box(0.5, deckY, width + 0.4, 0xa9a49a, -len / 2 + 0.1, 0, z); b.box(0.5, deckY, width + 0.4, 0xa9a49a, len / 2 - 0.1, 0, z);
}

// ---- bangunan umum ----
export function dome(b, r, color, x, y, z, sy = 0.9) { b.sphere(r, color, x, y, z, { sy }); }
export function minaret(b, x, z, h, color = 0xf6f1e4, cap = 0x2b2b2b) {
  b.cyl(0.16, 0.2, h, 8, color, x, 0, z); b.cyl(0.26, 0.26, 0.1, 8, 0xd9d2c0, x, h * 0.75, z); b.cone(0.22, 0.7, 8, cap, x, h, z); b.sphere(0.07, C.gold, x, h + 0.65, z);
}
export function glassTower(b, x, z, w, d, h, color = 0xdfe9f1, glass = C.glass, top = 'flat') {
  b.box(w + 0.3, 0.3, d + 0.3, C.stone, x, 0, z);
  b.box(w, h, d, color, x, 0.3, z);
  const floors = Math.max(2, Math.floor(h / 0.5));
  for (let f = 0; f < floors; f += 1) { const c = f % 3 === 1 ? C.glassL : glass; b.box(w * 0.88, 0.26, d + 0.05, c, x, 0.5 + f * 0.5, z); b.box(w + 0.05, 0.26, d * 0.88, c, x, 0.5 + f * 0.5, z); }
  if (top === 'spire') { b.box(w * 0.6, 0.4, d * 0.6, 0xaab6c2, x, h + 0.3, z); b.cone(Math.min(w, d) * 0.4, 1.3, 4, 0xaab6c2, x, h + 0.7, z, { ry: PI / 4 }); }
  else if (top === 'crown') { b.box(w * 1.05, 0.2, d * 1.05, 0x8a97a6, x, h + 0.3, z); b.box(w * 0.5, 0.5, d * 0.5, 0xaab6c2, x, h + 0.5, z); b.cyl(0.04, 0.05, 1.0, 5, 0xc83d3d, x, h + 1.0, z); }
  else { b.box(w * 0.5, 0.35, d * 0.5, 0xaab6c2, x, h + 0.3, z); b.cyl(0.03, 0.04, 0.8, 5, 0xc83d3d, x, h + 0.65, z); }
}
export function houseMini(b, x, z, ry, wall, roof, w = 1.4, d = 1.2, h = 0.9) {
  b.begin(x, 0, z, ry);
  b.box(w, h, d, wall, 0, 0, 0); b.gable(d + 0.3, 0.6, w + 0.3, roof, 0, h, 0, { ry: PI / 2 });
  b.box(0.26, 0.5, 0.05, 0x7a5638, 0, 0, d / 2 + 0.01); b.box(0.28, 0.26, 0.05, 0x3d6f8f, -w * 0.3, 0.4, d / 2 + 0.01); b.box(0.28, 0.26, 0.05, 0x3d6f8f, w * 0.3, 0.4, d / 2 + 0.01);
  b.end();
}
export function stiltHouse(b, x, z, ry, wall, roof, s = 1) {
  b.begin(x, 0, z, ry, s);
  for (const px of [-0.6, 0.6]) for (const pz of [-0.45, 0.45]) b.cyl(0.06, 0.07, 0.7, 5, C.woodD, px, 0, pz);
  b.box(1.5, 0.1, 1.2, C.wood, 0, 0.7, 0); b.box(1.3, 0.8, 1.0, wall, 0, 0.8, 0); b.gable(1.3, 0.55, 1.7, roof, 0, 1.6, 0);
  b.box(0.26, 0.5, 0.05, 0x3a2416, 0, 0.8, 0.51); b.box(0.3, 0.26, 0.05, 0x3d6f8f, 0.42, 1.2, 0.51);
  b.end();
}
export function statue(b, x, z, s = 1, color = 0xf4f1e8) {      // patung manusia sederhana di atas pedestal
  b.begin(x, 0, z, 0, s);
  b.box(1.0, 0.4, 1.0, C.stone, 0, 0, 0); b.box(0.7, 0.6, 0.7, 0xdcd5c2, 0, 0.4, 0);
  b.cone(0.38, 1.4, 8, color, 0, 1.0, 0); b.sphere(0.22, color, 0, 2.2, 0);
  b.box(1.5, 0.14, 0.16, color, 0, 1.9, 0);
  b.end();
}
