// Prefab bangunan bergaya low-poly. Semua fungsi menggambar ke MeshBuilder `b` dengan asal di tengah
// dasar bangunan dan muka depan menghadap +Z (gunakan b.begin(x,y,z,ry) untuk menempatkan & memutar).
const PI = Math.PI;
export const WALLS = [0xfce8c8, 0xf7c6b5, 0xbfe3f5, 0xd3efc2, 0xf3cfe3, 0xffe6a8, 0xf3a361, 0x7fd6c6, 0xf08a7a, 0xf5d36b];
export const ROOFS = [0xd9694f, 0xc0564a, 0x2f8f78, 0x4a6fa5, 0xe08a3c];
const GLASS = 0x3d6f8f, GLASS_LIGHT = 0x8fd2ee, WOOD = 0x8a5a36, WOOD_DARK = 0x5e3a22, STONE = 0xd9d2c0, GOLD = 0xf2b632, WHITE = 0xfbf7ee, RED = 0xe0463d;

const roofGable = (b, w, d, h, color, y, ov = 0.5) => b.gable(d + ov * 2, h, w + ov * 2, color, 0, y, 0, { ry: PI / 2 });

function windowGrid(b, w, d, floors, fh, y0, color = GLASS, trim = WHITE) {
  const nx = Math.max(1, Math.floor(w / 1.5)), nz = Math.max(1, Math.floor(d / 1.5));
  for (let f = 0; f < floors; f++) {
    const y = y0 + f * fh + fh * 0.28;
    for (let i = 0; i < nx; i++) {
      const x = (i - (nx - 1) / 2) * (w / nx);
      for (const s of [1, -1]) {
        b.box(0.62, fh * 0.46, 0.05, trim, x, y - 0.06, s * (d / 2 + 0.01));
        b.box(0.5, fh * 0.38, 0.07, color, x, y - 0.02, s * (d / 2 + 0.02));
      }
    }
    for (let i = 0; i < nz; i++) {
      const z = (i - (nz - 1) / 2) * (d / nz);
      for (const s of [1, -1]) b.box(0.05, fh * 0.4, 0.5, color, s * (w / 2 + 0.02), y - 0.02, z);
    }
  }
}

function glassBands(b, w, d, floors, fh, y0, color = GLASS, light = GLASS_LIGHT) {
  for (let f = 0; f < floors; f++) {
    const y = y0 + f * fh + fh * 0.2, hh = fh * 0.58;
    const c = f % 3 === 1 ? light : color;
    b.box(w * 0.86, hh, d + 0.1, c, 0, y, 0);
    b.box(w + 0.1, hh, d * 0.86, c, 0, y, 0);
  }
}

// ---------- Kota ----------
export function ruko(b, o = {}) {
  const { w = 4.6, d = 4, floors = 3, wall = WALLS[0], roof = ROOFS[0], awning = RED } = o;
  const fh = 1.45;
  b.box(w, floors * fh, d, wall, 0, 0, 0);
  b.box(w + 0.3, 0.18, d + 0.3, STONE, 0, floors * fh, 0);
  windowGrid(b, w, d, floors - 1, fh, fh);
  // Toko lantai dasar: etalase + kanopi bergaris
  b.box(w * 0.82, 1.0, 0.08, GLASS_LIGHT, 0, 0.2, d / 2 + 0.03);
  for (let i = 0; i < 6; i++) b.box(w / 6, 0.12, 0.9, i % 2 ? WHITE : awning, (i - 2.5) * (w / 6), 1.45, d / 2 + 0.45, { rx: -0.35 });
  b.box(w * 0.6, 0.48, 0.1, GOLD, 0, floors * fh - 0.28, d / 2 + 0.1);
  if (floors > 2) { b.cyl(0.4, 0.4, 0.7, 8, 0x8d9aa6, w / 3, floors * fh + 0.18, -d / 4); }
  if (o.roofed !== false) b.gable(d + 0.4, 0.8, w + 0.3, roof, 0, floors * fh + 0.18, 0, { ry: PI / 2 });
}

export function tower(b, o = {}) {
  const { w = 4.6, d = 4.6, floors = 12, color = 0xdfe9f1, glass = GLASS } = o;
  const fh = 1.15;
  b.box(w + 0.8, 1.2, d + 0.8, STONE, 0, 0, 0);
  b.box(w, floors * fh, d, color, 0, 1.2, 0);
  glassBands(b, w, d, floors, fh, 1.2, glass, GLASS_LIGHT);
  const top = 1.2 + floors * fh;
  b.box(w + 0.2, 0.3, d + 0.2, 0x8a97a6, 0, top, 0);
  b.box(w * 0.5, 0.9, d * 0.5, 0xaab6c2, 0, top + 0.3, 0);
  b.cyl(0.07, 0.1, 3, 6, 0xc83d3d, 0, top + 1.2, 0);
}

export function apartment(b, o = {}) {
  const { w = 6, d = 3.6, floors = 6, wall = 0xf2ead8, accent = 0xe0793c } = o;
  const fh = 1.3;
  b.box(w, floors * fh, d, wall, 0, 0, 0);
  for (let f = 0; f < floors; f++) {
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * (w / 4);
      b.box(1.0, 0.14, 0.7, accent, x, f * fh + 0.7, d / 2 + 0.35);
      b.box(0.8, 0.5, 0.06, GLASS, x, f * fh + 0.75, d / 2 + 0.01);
      b.box(1.0, 0.4, 0.05, 0xffffff, x, f * fh + 0.84, d / 2 + 0.7);
    }
  }
  b.box(w + 0.2, 0.2, d + 0.2, STONE, 0, floors * fh, 0);
  b.box(1.4, 1.0, 1.4, 0xb7c0c9, w / 4, floors * fh + 0.2, 0);
}

export function house(b, o = {}) {
  const { w = 3.4, d = 3, wall = WALLS[0], roof = ROOFS[0] } = o;
  b.box(w, 1.7, d, wall, 0, 0, 0);
  b.box(w + 0.1, 0.12, d + 0.1, STONE, 0, 0, 0);
  roofGable(b, w, d, 1.25, roof, 1.7, 0.45);
  b.box(0.55, 1.05, 0.08, WOOD, 0, 0, d / 2 + 0.02);
  windowGrid(b, w * 0.9, d, 1, 1.7, 0.55);
  b.box(0.45, 0.9, 0.45, 0xd8d2c4, w / 3, 1.9, -0.2);
}

export function masjid(b) {
  b.box(7, 3, 7, 0xf6f1e4, 0, 0, 0);
  b.box(7.6, 0.3, 7.6, STONE, 0, 0, 0);
  b.cyl(2.5, 2.6, 0.8, 16, 0xf6f1e4, 0, 3, 0);
  b.sphere(2.5, 0x2e9e8a, 0, 3.4, 0, { sy: 0.9 });
  b.cyl(0.08, 0.08, 1.2, 6, GOLD, 0, 7.2, 0);
  b.sphere(0.28, GOLD, 0, 8.2, 0);
  for (const sx of [-1, 1]) {
    b.cyl(0.55, 0.7, 7, 8, 0xf6f1e4, sx * 4.2, 0, 3.2);
    b.cyl(0.8, 0.8, 0.35, 8, 0x2e9e8a, sx * 4.2, 7, 3.2);
    b.cone(0.62, 1.4, 8, 0x2e9e8a, sx * 4.2, 7.35, 3.2);
  }
  for (let i = -2; i <= 2; i++) b.box(0.7, 1.5, 0.08, 0x2f7a94, i * 1.2, 0.6, 3.52);
}

export function monas(b) {
  b.box(15, 0.6, 15, 0xc9c2b0, 0, 0, 0);
  b.box(11, 1.4, 11, 0xe6dfd0, 0, 0.6, 0);
  b.box(7, 3.2, 7, 0xf1ecdf, 0, 2, 0);
  b.box(8, 0.35, 8, 0xd4cdb9, 0, 5.2, 0);
  b.cyl(0.45, 1.1, 22, 4, 0xf4f1e8, 0, 5.5, 0, { ry: PI / 4 });
  b.box(3, 0.4, 3, 0xdcd5c2, 0, 22.5, 0);
  b.box(1.9, 0.9, 1.9, 0xf4f1e8, 0, 22.9, 0);
  b.cone(0.55, 1.6, 8, GOLD, 0, 23.8, 0);
  b.sphere(0.6, 0xffd84a, 0, 23.9, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.box(1.1, 0.5, 1.1, 0xe6dfd0, sx * 5.3, 0.6, sz * 5.3);
}

export function bundaran(b) {          // bundaran air mancur + Tugu Selamat Datang
  b.cyl(9.5, 9.7, 0.12, 40, 0x59606a, 0, 0, 0);
  b.cyl(6.4, 6.6, 0.3, 40, 0xdcd6c6, 0, 0.1, 0);
  b.cyl(5.9, 5.9, 0.12, 40, 0x6cc04a, 0, 0.4, 0);
  b.cyl(4.0, 4.1, 0.35, 32, 0xd9d2c0, 0, 0.45, 0);
  b.cyl(3.6, 3.6, 0.1, 32, 0x58c7e6, 0, 0.78, 0);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; b.cyl(0.08, 0.1, 1.6 + (i % 3) * 0.4, 5, 0xbfeaf7, Math.cos(a) * 2.4, 0.8, Math.sin(a) * 2.4); b.sphere(0.2, 0xe3f7fc, Math.cos(a) * 2.4, 2.4 + (i % 3) * 0.4, Math.sin(a) * 2.4); }
  b.cyl(0.55, 0.8, 3.4, 8, 0xf4efe2, 0, 0.8, 0);
  b.box(1.5, 0.4, 1.5, 0xd9d2c0, 0, 4.2, 0);
  b.box(0.5, 1.5, 0.35, 0xf2b632, 0, 4.6, 0); b.sphere(0.28, 0xf2b632, 0, 6.1, 0);
  b.box(1.5, 0.12, 0.12, 0xf2b632, 0, 5.4, 0);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; if (i % 3 === 0) tree(b, Math.cos(a) * 7.9, 0, Math.sin(a) * 7.9); }
  function tree(bb, x, y, z) { bb.cyl(0.12, 0.18, 1.0, 5, 0x7a5638, x, y, z); bb.sphere(0.8, 0x45b755, x, y + 0.9, z); }
}

export function stadium(b) {            // stadion bergaya GBK: mangkuk tribun oranye, atap cincin putih
  const n = 30;
  b.cyl(5.6, 5.8, 0.25, 32, 0xd9d4c8, 0, 0, 0);
  b.cyl(3.1, 3.1, 0.1, 28, 0x58b84a, 0, 0.25, 0);
  b.box(2.4, 0.02, 0.1, 0xffffff, 0, 0.36, 0); b.cyl(0.7, 0.7, 0.02, 14, 0xffffff, 0, 0.36, 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), yaw = -a + Math.PI / 2;
    b.box(1.25, 2.4, 0.5, 0xf4f1ea, c * 5.55, 0.2, s * 5.55, { ry: yaw });
    for (let t = 0; t < 3; t++) b.box(1.2, 0.18, 0.7, (i + t) % 2 ? 0xe9542c : 0xf0742c, c * (4.3 + t * 0.45), 0.55 + t * 0.55, s * (4.3 + t * 0.45), { ry: yaw });
    b.box(1.35, 0.16, 1.5, 0xfafafa, c * 5.5, 2.55, s * 5.5, { ry: yaw, rx: 0 });
    if (i % 3 === 0) b.box(0.12, 1.2, 0.12, 0x9aa3ab, c * 5.9, 2.4, s * 5.9);
  }
}

export function fountain(b, r = 2) {
  b.cyl(r, r + 0.15, 0.5, 12, 0xd9d2c0, 0, 0, 0);
  b.cyl(r - 0.25, r - 0.25, 0.1, 12, 0x58c7e6, 0, 0.45, 0);
  b.cyl(0.2, 0.3, 1.2, 8, 0xd9d2c0, 0, 0.45, 0);
  b.sphere(0.4, 0xa6e4f5, 0, 1.4, 0);
}

export function lamp(b, x, z, h = 2.6) {
  b.cyl(0.07, 0.1, h, 6, 0x39434f, x, 0, z);
  b.box(0.5, 0.12, 0.2, 0x39434f, x, h, z);
  b.sphere(0.17, 0xfff2b0, x, h - 0.28, z);
}

export function bench(b, x, z, ry = 0) {
  b.begin(x, 0, z, ry);
  b.box(1.4, 0.12, 0.5, WOOD, 0, 0.45, 0);
  b.box(1.4, 0.4, 0.1, WOOD, 0, 0.6, -0.22);
  b.box(0.1, 0.45, 0.4, 0x39434f, -0.55, 0, 0);
  b.box(0.1, 0.45, 0.4, 0x39434f, 0.55, 0, 0);
  b.end();
}

// ---------- Rumah adat lima wilayah ----------
export function rumahGadang(b) {      // Sumatra Barat
  for (const x of [-3, -1, 1, 3]) for (const z of [-1.2, 1.2]) b.cyl(0.17, 0.2, 1.3, 6, WOOD_DARK, x, 0, z);
  b.box(7.4, 2.4, 3.2, 0x7a2f23, 0, 1.3, 0);
  b.box(7.5, 0.35, 3.3, GOLD, 0, 2.5, 0);
  for (let i = -3; i <= 3; i += 1) b.box(0.55, 1.3, 0.06, 0xf0c04a, i * 0.95, 1.5, 1.62);
  roofGable(b, 7.4, 3.2, 1.2, 0x2f2a28, 3.65, 0.4);
  for (const sx of [-1, 1]) {
    b.cone(0.55, 3.4, 4, 0x2f2a28, sx * 4.1, 3.0, 0, { rz: -sx * 0.55, ry: PI / 4 });
    b.cone(0.4, 2.4, 4, 0x2f2a28, sx * 2.1, 3.7, 0, { rz: -sx * 0.4, ry: PI / 4 });
  }
  for (let i = 0; i < 4; i++) b.box(2.2, 0.18, 0.5, WOOD, 0, 0.1 + i * 0.3, 2.0 + (3 - i) * 0.4);
}

export function rumahBetang(b) {      // Kalimantan
  for (let x = -6; x <= 6; x += 2) for (const z of [-1.2, 1.2]) b.cyl(0.2, 0.24, 2.0, 6, WOOD_DARK, x, 0, z);
  b.box(13.5, 2.2, 3.0, 0xa66a3c, 0, 2.0, 0);
  b.box(13.7, 0.3, 3.2, 0xd13a2f, 0, 4.0, 0);
  for (let x = -6; x <= 6; x += 1.5) b.box(0.6, 0.9, 0.08, 0x2b2118, x, 2.7, 1.52);
  roofGable(b, 13.5, 3.0, 1.6, 0x8a6a3a, 4.3, 0.6);
  b.box(14, 0.14, 1.6, WOOD, 0, 1.95, 2.3);
  for (const x of [-2.5, 0, 2.5]) {      // patung totem Dayak
    b.cyl(0.25, 0.3, 4.2, 6, WOOD_DARK, x, 0, 4.2);
    b.box(0.7, 0.55, 0.6, 0xd13a2f, x, 3.2, 4.2);
    b.box(0.7, 0.45, 0.6, 0xf2b632, x, 2.5, 4.2);
    b.cone(0.45, 0.8, 4, 0x1f7a50, x, 4.2, 4.2, { ry: PI / 4 });
  }
}

export function tongkonan(b) {        // Sulawesi Selatan (Toraja)
  for (const x of [-2.4, -0.8, 0.8, 2.4]) for (const z of [-1.1, 1.1]) b.cyl(0.18, 0.22, 1.5, 6, WOOD_DARK, x, 0, z);
  b.box(6.2, 1.7, 2.9, 0x6b2a20, 0, 1.5, 0);
  b.box(6.3, 0.3, 3.0, 0xf3ede0, 0, 2.2, 0);
  b.box(6.4, 0.2, 3.1, 0x1f1b1a, 0, 1.55, 0);
  for (let i = 0; i < 7; i++) {         // atap berbentuk perahu
    const t = (i - 3) / 3, y = 3.25 + t * t * 1.9;
    b.gable(3.8, 1.5, 1.05, 0x8d5e33, (i - 3) * 1.0, y, 0);
  }
  for (const sx of [-1, 1]) b.box(0.35, 1.8, 3.2, 0x8d5e33, sx * 3.5, 4.3, 0, { rz: -sx * 0.3 });
  b.box(0.8, 0.3, 0.9, 0xf2b632, 0, 5.15, 0);
}

export function honai(b) {            // Papua
  b.cyl(1.35, 1.45, 1.6, 10, 0x9a6c3c, 0, 0, 0);
  b.cone(1.9, 2.1, 10, 0xd4ab62, 0, 1.6, 0);
  b.sphere(0.25, 0xe0c27a, 0, 3.5, 0);
  b.box(0.55, 0.95, 0.08, WOOD_DARK, 0, 0, 1.43);
  for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; b.cyl(0.05, 0.05, 0.7, 4, 0x7a4f2a, Math.cos(a) * 2.3, 0, Math.sin(a) * 2.3); }
}

export function joglo(b) {            // Jawa
  for (const x of [-1.7, 1.7]) for (const z of [-1.7, 1.7]) b.cyl(0.2, 0.22, 2.4, 8, WOOD_DARK, x, 0.4, z);
  b.box(4.8, 0.4, 4.8, 0xc9c2b0, 0, 0, 0);
  b.box(3.0, 1.9, 3.0, 0xf1e6cf, 0, 0.4, 0);
  b.cone(3.6, 1.4, 4, 0xb85a3e, 0, 2.8, 0, { ry: PI / 4 });
  b.cone(2.2, 1.5, 4, 0xc4684a, 0, 3.7, 0, { ry: PI / 4 });
  b.cone(0.35, 0.8, 4, GOLD, 0, 5.1, 0, { ry: PI / 4 });
}

export function candi(b) {            // Candi bertingkat bergaya Borobudur
  const tiers = [[11, 0.9], [9.2, 0.9], [7.4, 0.9], [5.6, 0.9]];
  let y = 0;
  tiers.forEach(([s, h], i) => { b.box(s, h, s, i % 2 ? 0x8f8c84 : 0xa09c92, 0, y, 0); y += h; });
  for (const [x, z] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3], [0, 0]]) {
    b.cyl(0.7, 0.8, 0.6, 8, 0x8f8c84, x, y, z);
    b.sphere(0.75, 0x9c9890, x, y + 0.5, z, { sy: 0.9 });
  }
  b.cone(0.6, 2.2, 8, 0xa9a59a, 0, y + 0.8, 0);
  for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 4; i++) b.box(1.4, 0.2, 0.5, 0xa09c92, 0, i * 0.22, 5.7 + (3 - i) * 0.5);
}

// ---------- Struktur petak khusus (muncul di sisi dalam jalan, ±5 x 5) ----------
export function gateMulai(b, color = 0x16a34a) {
  b.cyl(5.4, 5.7, 0.2, 12, 0xdff3dc, 0, 0, 0);
  for (const sx of [-1, 1]) { b.box(1.1, 6, 1.1, WHITE, sx * 3.2, 0.2, 0); b.box(1.3, 0.5, 1.3, color, sx * 3.2, 6.2, 0); }
  b.box(8.5, 1.5, 1.2, color, 0, 5.6, 0);
  b.box(7.6, 0.7, 1.25, 0xfef3c7, 0, 5.95, 0.02);
  b.cyl(0.08, 0.08, 4, 6, 0x6b4a2c, 0, 6.8, 0);
  b.box(1.8, 1.1, 0.08, RED, 0.95, 9.0, 0);
  b.box(1.8, 0.55, 0.08, WHITE, 0.95, 8.9, 0);
  b.box(2.6, 0.06, 7, 0xd9322b, 0, 0.2, 2.5);
}

export function penjara(b) {
  b.box(7.5, 3.2, 5.5, 0x8d939b, 0, 0, 0);
  b.box(7.8, 0.4, 5.8, 0x6c727b, 0, 3.2, 0);
  for (let i = -3; i <= 3; i++) if (i % 1 === 0) b.box(0.18, 0.9, 0.12, 0x2c3138, i * 0.9, 1.6, 2.78);
  b.box(6.4, 0.12, 0.14, 0x2c3138, 0, 1.55, 2.8);
  b.box(6.4, 0.12, 0.14, 0x2c3138, 0, 2.5, 2.8);
  b.box(1.6, 2.2, 0.15, 0x3a4048, 0, 0, 2.78);
  for (const sx of [-1, 1]) { b.box(1.6, 5.2, 1.6, 0x7a8089, sx * 4.4, 0, 2); b.box(2, 0.35, 2, 0x4c525b, sx * 4.4, 5.2, 2); b.cone(1.3, 0.9, 4, 0xc4584a, sx * 4.4, 5.5, 2, { ry: PI / 4 }); }
  for (let i = -5; i <= 5; i++) b.box(0.1, 1.3, 0.1, 0x59606a, i * 1.0, 0, 5.6);
  b.box(10, 0.1, 0.1, 0x59606a, 0, 1.2, 5.6);
}

export function kantorPajak(b) {
  b.box(7.6, 0.5, 6, 0xcfc8b4, 0, 0, 0);
  b.box(6.6, 3.4, 4.6, 0xf1ebd8, 0, 0.5, -0.4);
  for (let i = -2; i <= 2; i++) b.cyl(0.32, 0.36, 3.4, 8, WHITE, i * 1.35, 0.5, 2.3);
  b.gable(6.4, 1.4, 8.2, 0x0d9488, 0, 3.9, 0.2, { ry: PI / 2 });
  b.cyl(0.9, 0.9, 0.14, 14, GOLD, 0, 4.3, 3.0, { rx: PI / 2 });
  b.box(0.2, 0.7, 0.1, 0xb27a10, 0, 4.0, 3.1);
  b.box(2.2, 0.8, 0.1, 0x0d9488, 0, 0.9, 2.5);
}

export function pengadilan(b) {
  b.box(8.2, 0.7, 6.4, 0xd8d1be, 0, 0, 0);
  b.box(7, 3.6, 4.8, 0xf7f2e4, 0, 0.7, -0.5);
  for (let i = -3; i <= 3; i++) b.cyl(0.3, 0.34, 3.6, 8, WHITE, i * 1.05, 0.7, 2.3);
  b.gable(2.3, 1.7, 7.6, 0xe9e1cd, 0, 4.3, 2.3, { ry: PI / 2 });
  b.box(0.12, 1.4, 0.12, 0x7c3aed, 0, 4.5, 3.4);
  b.box(1.4, 0.1, 0.12, 0x7c3aed, 0, 5.8, 3.4);
  b.cyl(0.3, 0.3, 0.06, 8, 0xf2b632, -0.7, 5.35, 3.4, { rx: PI / 2 });
  b.cyl(0.3, 0.3, 0.06, 8, 0xf2b632, 0.7, 5.35, 3.4, { rx: PI / 2 });
  for (let i = 0; i < 5; i++) b.box(5.2 - i * 0.4, 0.14, 1.0, 0xcfc8b4, 0, 0.1 + i * 0.12, 3.9 - i * 0.12);
}

export function parkiranPungli(b) {
  b.box(9, 0.14, 7, 0x4e5661, 0, 0, 0);
  for (let i = -3; i <= 3; i++) b.box(0.1, 0.02, 2.2, WHITE, i * 1.2, 0.14, -0.7);
  b.box(1.9, 2.1, 1.7, 0xd97706, 3.6, 0, 2.6);
  b.box(2.3, 0.2, 2.1, 0x3b3f46, 3.6, 2.1, 2.6);
  b.box(1.1, 0.6, 0.05, GLASS_LIGHT, 3.6, 1.2, 1.76);
  b.box(0.2, 1.2, 0.2, 0xe5e7eb, 1.9, 0, 2.6);
  b.box(3.4, 0.16, 0.16, RED, 0.2, 1.05, 2.6);
  for (let i = 0; i < 4; i++) b.box(0.3, 0.16, 0.18, WHITE, -1.2 + i * 0.85, 1.05, 2.6);
  b.cyl(0.07, 0.07, 3.2, 6, 0x39434f, -3.8, 0, 2.2);
  b.box(1.1, 1.1, 0.1, 0x2563eb, -3.8, 3.0, 2.2);
  b.box(0.6, 0.7, 0.06, WHITE, -3.8, 3.2, 2.25);
  b.box(2.0, 0.9, 1.1, 0x9ca3af, -2.0, 0.14, -1.0);
  b.box(1.3, 0.6, 1.0, 0x9ca3af, -2.1, 1.0, -1.0);
}

export function takdirGate(b) {       // bintang emas bertahta di panggung
  b.cyl(2.6, 2.9, 0.5, 10, 0xf6e7b0, 0, 0, 0);
  b.cyl(1.8, 2.0, 0.35, 10, 0xe0b840, 0, 0.5, 0);
  b.cyl(0.18, 0.25, 2.1, 8, 0xe0b840, 0, 0.8, 0);
  const star = [];
  b.begin(0, 4, 0, 0);
  for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; b.cone(0.55, 1.6, 4, 0xffd23f, Math.sin(a) * 0.7, Math.cos(a) * 0.7 - 0.2, 0, { rz: -a, ry: PI / 4 }); }
  b.sphere(0.6, 0xffe27a, 0, -0.4, 0);
  b.end();
  for (const sx of [-1, 1]) b.sphere(0.35, 0xfff1a8, sx * 2.1, 0.9, 0.2);
  return star;
}

export function musibahCloud(b) {      // awan petir di atas tiang peringatan
  b.cyl(2.6, 2.9, 0.5, 10, 0x6b7280, 0, 0, 0);
  b.cyl(0.16, 0.22, 3.6, 8, 0x4b5563, 0, 0.5, 0);
  b.begin(0, 5.6, 0, 0);
  for (const [x, y, s] of [[-0.95, 0, 0.7], [0, 0.35, 0.95], [0.95, 0, 0.7], [0.15, -0.2, 0.8]]) b.sphere(s, 0x8b97a6, x, y, 0, { sy: 0.7 });
  b.box(0.28, 1.0, 0.16, 0xfde047, 0.2, -1.6, 0.5, { rz: 0.3 });
  b.box(0.28, 0.6, 0.16, 0xfde047, 0.0, -2.1, 0.5, { rz: -0.4 });
  b.end();
  b.box(1.5, 1.0, 0.12, 0xdc2626, 0, 1.4, 1.0);
  b.box(0.2, 0.5, 0.14, WHITE, 0, 1.65, 1.07);
  b.box(0.2, 0.14, 0.14, WHITE, 0, 1.43, 1.07);
}

export function tollGate(b) {
  b.box(7.4, 0.2, 5.2, 0x59606a, 0, 0, 0);
  b.box(2.0, 2.4, 1.8, 0x2563eb, -2.6, 0.2, 0);
  b.box(2.4, 0.25, 2.2, 0x1e3a8a, -2.6, 2.6, 0);
  b.box(1.2, 0.8, 0.06, GLASS_LIGHT, -2.6, 1.3, 0.92);
  b.box(6.2, 0.9, 0.3, 0x1e40af, 0, 4.1, 0);
  b.box(5.6, 0.45, 0.32, WHITE, 0, 4.32, 0);
  for (const sx of [-1, 1]) b.box(0.4, 4.1, 0.4, 0xdbeafe, sx * 3, 0.2, 0);
  b.box(3.6, 0.18, 0.18, RED, 0.9, 1.2, 1.7);
  for (let i = 0; i < 4; i++) b.box(0.42, 0.2, 0.2, WHITE, -0.7 + i * 0.9, 1.2, 1.7);
}

export function tilangPost(b) {
  b.box(7, 0.2, 5, 0x59606a, 0, 0, 0);
  b.box(2.3, 2.3, 2.0, 0xf3f4f6, -2.3, 0.2, 0);
  b.box(2.5, 0.25, 2.2, 0x1d4ed8, -2.3, 2.5, 0);
  b.box(1.2, 0.8, 0.06, GLASS, -2.3, 1.2, 1.02);
  b.box(0.6, 0.2, 0.2, RED, -2.7, 2.75, 0); b.box(0.6, 0.2, 0.2, 0x2563eb, -1.9, 2.75, 0);
  b.cyl(0.1, 0.12, 3.6, 6, 0x39434f, 2.4, 0.2, -1.2);
  b.box(0.8, 0.6, 0.6, 0x1f2937, 2.4, 3.6, -1.2);
  b.cyl(0.2, 0.2, 0.1, 10, 0xe5e7eb, 2.4, 3.8, -0.88, { rx: PI / 2 });
  // mobil polisi
  b.box(2.6, 0.7, 1.2, WHITE, 1.6, 0.35, 1.4);
  b.box(1.4, 0.55, 1.1, 0x1d4ed8, 1.5, 1.0, 1.4);
  b.box(0.5, 0.15, 0.3, RED, 1.5, 1.55, 1.4);
  for (const [x, z] of [[0.8, 0.75], [2.4, 0.75], [0.8, 2.05], [2.4, 2.05]]) b.cyl(0.28, 0.28, 0.22, 8, 0x1f2937, x, 0.28, z, { rx: PI / 2 });
}

// ---------- Properti pemain (level engine: 1 Subsidi 1, 2 Subsidi 2, 3 OKB) ----------
export function rumahSubsidi1(b, wall = 0xfdf2d8) {
  b.box(3.0, 1.55, 2.6, wall, 0, 0.12, 0);
  roofGable(b, 3.0, 2.6, 1.15, 0xd9534a, 1.67, 0.4);
  b.box(0.5, 1.0, 0.07, WOOD, -0.5, 0.12, 1.32);
  b.box(0.7, 0.55, 0.06, GLASS, 0.75, 0.75, 1.31);
  b.box(0.85, 0.08, 0.1, WHITE, 0.75, 0.68, 1.33);
  b.box(0.38, 0.8, 0.38, 0xe4ddd0, -0.9, 1.9, -0.4);
  b.box(1.6, 0.1, 0.9, 0xeee6d6, -0.5, 0.12, 1.75);
}

export function rumahSubsidi2(b, wall = 0xfff0b8) {
  b.box(3.4, 1.7, 2.9, 0xf6f0e2, 0, 0.12, 0);
  b.box(3.0, 1.55, 2.6, wall, 0, 1.82, 0);
  b.box(3.7, 0.14, 3.2, 0xe36b3c, 0, 1.78, 0);
  roofGable(b, 3.0, 2.6, 1.0, 0x2f7fb5, 3.37, 0.45);
  b.box(0.55, 1.05, 0.07, WOOD, -0.7, 0.12, 1.48);
  for (const x of [0.5, 1.2]) b.box(0.45, 0.6, 0.06, GLASS, x, 0.7, 1.48);
  for (const x of [-0.8, 0, 0.8]) b.box(0.5, 0.65, 0.06, GLASS, x, 2.15, 1.31);
  b.box(2.6, 0.12, 0.7, 0xe36b3c, 0, 1.86, 1.62);
  b.box(2.6, 0.5, 0.08, 0xffffff, 0, 2.0, 1.95);
  b.box(0.5, 0.8, 0.5, 0xe4ddd0, 1.0, 3.5, -0.5);
}

export function villaOKB(b, wall = 0xffffff) {
  b.box(5.2, 0.35, 4.4, 0xd7d2c4, 0, 0, 0);
  b.box(3.4, 2.5, 3.0, wall, -0.6, 0.35, -0.2);
  b.box(2.2, 1.9, 2.4, 0xf3eee2, 1.4, 0.35, 0.1);
  b.box(3.7, 0.22, 3.4, 0xc69214, -0.6, 2.85, -0.2);
  b.box(2.5, 0.2, 2.8, 0xc69214, 1.4, 2.25, 0.1);
  b.box(2.6, 1.7, 0.08, 0x57c4ee, -0.6, 0.75, 1.32);
  b.box(1.5, 1.2, 0.08, 0x57c4ee, 1.4, 0.7, 1.33);
  for (const x of [-1.9, 0.7]) b.box(0.1, 1.7, 0.1, 0xffffff, x, 0.75, 1.34);
  b.box(2.4, 0.5, 0.06, 0x57c4ee, -0.6, 2.2, 1.3);
  b.box(1.9, 0.08, 1.2, 0x39c3e6, -1.3, 0.35, 2.1);     // kolam renang
  b.box(2.1, 0.12, 1.4, 0xf4efe2, -1.3, 0.32, 2.1);
  b.cyl(0.08, 0.1, 1.0, 5, WOOD_DARK, 2.0, 0.35, 1.9);
  for (let i = 0; i < 5; i++) b.cone(0.55, 0.12, 4, 0x2f9e55, 2.0, 1.2, 1.9, { rz: (i - 2) * 0.5, ry: i * 1.2 });
  b.begin(-0.6, 3.1, -0.2, 0);                          // mahkota emas OKB
  b.cyl(0.55, 0.45, 0.35, 8, 0xffcc33, 0, 0, 0);
  for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; b.cone(0.13, 0.4, 4, 0xffe066, Math.cos(a) * 0.45, 0.35, Math.sin(a) * 0.45); }
  b.end();
  for (const sx of [-1, 1]) { b.cyl(0.14, 0.14, 1.1, 6, 0x39434f, sx * 2.5, 0.35, 2.1); b.sphere(0.2, 0xfff0a0, sx * 2.5, 1.35, 2.1); }
}

export function stake(b, x, z, color) {
  b.cyl(0.05, 0.07, 1.1, 5, 0xc89a62, x, 0, z);
  b.box(0.28, 0.2, 0.04, color, x + 0.14, 0.82, z);
}
