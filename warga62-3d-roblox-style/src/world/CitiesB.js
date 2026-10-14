import { C, plate, tree, palm, pine, lamp, flagPole, bush, flowerBed, water, jukung, sampan, ship, containers, gantryCrane, archBridge, cableBridge, dome, minaret, glassTower, houseMini, stiltHouse, statue, pixelText } from './CityKit.js';
import * as P from './Prefabs.js';

const PI = Math.PI, TAU = Math.PI * 2;
const frontLamps = (b) => { lamp(b, -3.0, 4.0, 1.9); lamp(b, 3.0, 4.0, 1.9); };

function phinisi(b, x, z, ry = 0, s = 1) {
  b.begin(x, 0.1, z, ry, s);
  b.box(1.1, 0.5, 3.0, 0x8a5a36, 0, 0, 0); b.cone(0.55, 0.9, 4, 0x8a5a36, 0, 0, 1.9, { rx: PI / 2, ry: PI / 4 });
  b.box(1.1, 0.1, 3.0, 0xd9a96a, 0, 0.5, 0); b.box(0.8, 0.5, 0.8, 0xf1e6cf, 0, 0.55, -1.0);
  for (const [zz, h] of [[-0.2, 2.8], [0.9, 2.4]]) { b.cyl(0.05, 0.07, h, 5, 0x5e3a22, 0, 0.5, zz); b.box(0.04, h * 0.75, 1.0, 0xfffaf0, 0, 0.8, zz + 0.55, { rx: 0.1 }); }
  b.box(0.04, 0.8, 0.8, 0xe0463d, 0, 1.9, 1.7, { rx: -0.4 });
  b.end();
}
function hill(b, x, z, r, h, color = 0x4fae52, seg = 9) { b.cone(r, h, seg, color, x, 0, z, { ry: 0.3 }); b.cone(r * 0.55, h * 0.55, seg, 0x3f9d46, x + r * 0.35, h * 0.35, z, { ry: 0.6 }); }
function colorfulHouse(b, x, y, z, ry, i) { const w = [0xf2c62e, 0x6fcfc0, 0xf08a7a, 0xbfe3f5, 0xf3cfe3][i % 5], r = [0xc0562a, 0x2f6f8f, 0x7a2f23, 0x2e7d4f][i % 4]; b.begin(0, y, 0, 0); houseMini(b, x, z, ry, w, r, 0.8, 0.7, 0.55); b.end(); }

export const CITIES_B = {
  // ========================================================= SULAWESI
  Makassar(b) { // Pantai Losari: promenade, papan LOSARI, phinisi, masjid terapung
    water(b, 6.4, 2.6, 0, 2.9, 0x1f9fd6);
    b.box(6.4, 0.1, 0.9, 0xd9d2c0, 0, 0, 1.0); for (let i = 0; i < 6; i++) b.box(0.4, 0.04, 0.9, i % 2 ? 0xf0e8d4 : 0xe3dcc8, -2.5 + i, 0.1, 1.0);
    pixelText(b, 'LOSARI', 0, 0.1, 0.55, 0.15, 0xffffff, 0.14); b.box(4.0, 0.12, 0.3, 0x1f9fae, 0, 0.1, 0.4);
    phinisi(b, -1.2, 3.0, 0.3, 0.95); phinisi(b, 2.0, 3.5, -0.5, 0.7); sampan(b, 0.5, 2.1, 1.2, 0xf2b632);
    b.box(2.6, 1.1, 2.0, 0xf8f4ea, -0.4, 0, -2.0); dome(b, 0.9, 0x2e9e8a, -0.4, 1.1, -2.0); for (const [x, z] of [[-1.4, -1.2], [0.6, -1.2], [-1.4, -2.9], [0.6, -2.9]]) { b.cyl(0.2, 0.22, 0.4, 8, 0xf8f4ea, x, 1.1, z); dome(b, 0.28, 0x2e9e8a, x, 1.4, z); }
    minaret(b, 1.4, -2.2, 3.2, 0xf6f1e4, 0x2e9e8a);
    glassTower(b, 2.6, -3.4, 1.2, 1.1, 3.8, 0xe8e2d4); glassTower(b, -2.7, -3.4, 1.0, 1.0, 3.0);
    palm(b, -3.0, 0.7, 0.9); palm(b, 3.0, 0.7, 0.9); lamp(b, -1.5, 1.9, 1.7); lamp(b, 1.5, 1.9, 1.7);
  },
  Manado(b) { // waterfront + patung Yesus Memberkati + Bunaken
    water(b, 6.4, 2.8, 0, 2.8, 0x1f9fd6);
    for (let i = 0; i < 4; i++) b.box(0.3, 0.1, 0.7, C.wood, -2.2 + 0.0, 0.16, 1.3 + i * 0.7);
    const reef = [[0.6, 2.4, 0xff6f91], [1.4, 3.2, 0xffb347], [2.2, 2.7, 0xc86bfa], [-0.4, 3.4, 0x34d399]];
    for (const [x, z, c] of reef) { b.cyl(0.08, 0.12, 0.5, 5, c, x, 0.1, z); b.sphere(0.24, c, x, 0.5, z); b.sphere(0.16, c, x + 0.22, 0.4, z + 0.1); }
    for (const [x, z, c] of [[1.0, 2.9, 0xffd23f], [-1.1, 2.6, 0x2b8cf7]]) { b.box(0.4, 0.14, 0.12, c, x, 0.35, z); b.cone(0.1, 0.22, 4, c, x - 0.28, 0.35, z, { rz: PI / 2 }); }
    jukung(b, 2.3, 3.3, 0.3, true, [0xf6a21c]); sampan(b, -1.9, 2.7, -0.4, 0xe0463d);
    b.cone(2.4, 2.0, 8, 0x4fb35a, 0, 0, -2.2, { ry: 0.3 });
    b.box(1.0, 0.5, 1.0, C.stone, 0, 1.9, -2.2); b.box(0.7, 0.5, 0.7, 0xdcd5c2, 0, 2.4, -2.2);
    b.cone(0.45, 1.7, 8, C.white, 0, 2.9, -2.2); b.sphere(0.26, C.white, 0, 4.5, -2.2); b.box(2.0, 0.17, 0.2, C.white, 0, 3.9, -2.2); b.box(2.0, 0.11, 0.18, C.white, 0, 3.55, -2.2, { rz: 0.0 });
    colorfulHouse(b, -2.4, 0.0, -1.0, 0.3, 0); colorfulHouse(b, 2.5, 0.0, -1.0, -0.3, 1); palm(b, -3.0, 0.4, 0.9); palm(b, 3.0, 0.4, 0.9); lamp(b, 0, 1.0, 1.7);
  },
  Palu(b) {   // Jembatan Ponulele (lengkung kuning) di Teluk Palu
    water(b, 6.4, 4.4, 0, 1.4, 0x2aa3bd);
    archBridge(b, 6.2, 2.8, 0xf5cf3d, 1.0, 1.4, 1.2);
    b.box(6.4, 0.05, 4.4, 0xffb36b, 0, 0.17, 1.4, { sy: 0.1 }); b.box(6.2, 0.03, 0.3, 0xffe29a, 0, 0.19, 3.2);
    jukung(b, -1.8, 3.1, 0.4, false, [0xf6a21c]); sampan(b, 1.9, 3.3, 1.9, 0x2a8fd6);
    hill(b, -2.2, -3.4, 1.8, 2.0); hill(b, 2.3, -3.6, 1.6, 1.7);
    b.box(1.4, 1.0, 1.1, 0xf8f4ea, 0, 0, -3.0); dome(b, 0.55, 0x2e9e8a, 0, 1.0, -3.0); minaret(b, 1.0, -3.0, 2.2, 0xf6f1e4, 0x2e9e8a);
    colorfulHouse(b, -0.9, 0, -2.3, 0, 2); colorfulHouse(b, 1.0, 0, -2.0, 0.2, 3); palm(b, -3.0, 0.3, 0.9); lamp(b, 3.0, 4.0);
  },
  Gorontalo(b) { // pantai + perbukitan: Benteng Otanaha
    water(b, 6.4, 2.4, 0, 3.0, 0x1f9fd6);
    b.cone(3.0, 2.8, 9, 0x5fb85a, 0, 0, -2.2, { ry: 0.2 }); b.cone(1.6, 1.4, 8, 0x4aa850, -1.8, 0, -1.2, { ry: 0.5 });
    for (const [x, y, z, r] of [[0, 2.1, -2.2, 0.55], [0.9, 1.2, -1.6, 0.45], [-0.9, 1.2, -1.7, 0.45]]) { b.cyl(r, r * 1.05, 0.9, 10, 0xb7a58a, x, y, z); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; b.box(0.16, 0.2, 0.14, 0xb7a58a, x + Math.cos(a) * r, y + 0.9, z + Math.sin(a) * r); } b.cone(r * 0.9, 0.4, 8, 0x8c4a2a, x, y + 1.0, z); }
    for (let i = 0; i < 6; i++) b.box(0.5, 0.08, 0.28, 0xc9bfa6, 0.5 - (i % 2) * 0.9, 0.2 + i * 0.35, -0.5 - i * 0.2);
    sampan(b, -1.7, 3.2, 0.2, 0xd9534a); sampan(b, 1.0, 3.5, -0.3, 0x2a8fd6); jukung(b, 2.5, 2.8, 0.7, false, [0xf6a21c]);
    colorfulHouse(b, -2.6, 0, 0.7, 0.3, 4); colorfulHouse(b, 2.6, 0, 0.5, -0.2, 0); palm(b, 0, 0.9, 0.9); palm(b, -1.2, 1.0, 0.8); palm(b, 3.0, 1.3, 0.8);
  },
  Kendari(b) { // Teluk Kendari: jembatan teluk + pesisir hijau
    water(b, 6.4, 4.2, 0, 1.6, 0x2aa3bd);
    cableBridge(b, 6.2, 0xf4f7fa, [0.2], 3.8, 1.0, 1.6, 1.2);
    sampan(b, -2.0, 3.3, 0.3, 0xf2b632); jukung(b, 1.8, 3.4, -0.3, true, [0x3fae4f]);
    hill(b, -2.0, -3.3, 1.9, 2.2, 0x58b95e); hill(b, 2.2, -3.6, 1.8, 1.9, 0x4aa850);
    for (let i = 0; i < 6; i++) colorfulHouse(b, -2.6 + (i % 3) * 0.9, 0.3 + (i % 3) * 0.35, -3.5 + Math.floor(i / 3) * 0.9, 0.3, i);
    b.cyl(0.25, 0.3, 1.8, 8, C.white, 0.6, 0, -2.0); b.cone(0.3, 0.5, 8, C.red, 0.6, 1.8, -2.0);
    palm(b, -3.0, 0.2, 0.9); palm(b, 3.0, 0.2, 0.9); frontLamps(b);
  },
  // ========================================================= PAPUA
  Sorong(b) { // pelabuhan + Raja Ampat
    water(b, 6.4, 4.0, 0, 1.8, 0x1f9fd6);
    for (const [x, z, h] of [[-2.0, 2.4, 1.3], [-0.6, 3.3, 1.0], [2.0, 2.2, 1.5]]) { b.cyl(0.4, 0.75, h, 7, 0x8a8f86, x, 0.05, z); b.sphere(0.55, 0x3fae4f, x, h - 0.05, z, { sy: 0.65 }); b.sphere(0.3, 0x56c35e, x + 0.3, h + 0.2, z + 0.1, { sy: 0.7 }); }
    ship(b, 0.8, 2.2, 0.4, 0x2b3a4a, true);
    b.box(6.4, 0.12, 1.2, 0xc9ccd0, 0, 0, -0.4);
    gantryCrane(b, -1.6, -1.2, 0); containers(b, -2.8, -2.6, 2, 3, 2); containers(b, 0.2, -2.8, 2, 3, 1);
    glassTower(b, 2.6, -2.8, 1.3, 1.1, 3.0, 0xe9f1ee); b.box(2.2, 0.9, 1.0, 0xf3f4f6, 2.1, 0, -1.0);  b.box(2.4, 0.12, 1.1, 0x2563eb, 2.1, 0.9, -1.0);
    for (let i = 0; i < 3; i++) b.cyl(0.04, 0.04, 1.6, 4, 0x39434f, -2.9 + i * 0.1, 0, 0.5 + i * 0.4);
    lamp(b, -3.0, 4.0); lamp(b, 3.0, 4.0);
  },
  Jayapura(b) { // bukit + teluk + papan JAYAPURA
    water(b, 6.4, 2.4, 0, 3.0, 0x1f9fd6);
    b.cone(3.6, 3.8, 10, 0x4fae52, 0, 0, -2.4, { ry: 0.2 }); b.cone(1.8, 2.0, 8, 0x3f9d46, 2.2, 0, -1.4); b.cone(1.5, 1.6, 8, 0x58b95e, -2.3, 0, -1.2);
    pixelText(b, 'JAYAPURA', 0, 1.35, -0.8, 0.1, 0xffffff, 0.1);
    for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.65, r = Math.abs(a) / 3.6; colorfulHouse(b, a, Math.max(0.1, (1 - r) * 1.8 - 0.4 + (i % 2) * 0.25), -0.2 - (i % 3) * 0.55, 0.0, i); }
    b.box(1.6, 0.14, 0.9, 0xd9322b, 0, 0.1, 1.3); b.box(0.12, 0.7, 0.12, 0xd9322b, -0.7, 0.1, 1.3); b.box(0.12, 0.7, 0.12, 0xd9322b, 0.7, 0.1, 1.3);
    sampan(b, -1.8, 3.3, 0.2, 0xf2b632); jukung(b, 1.9, 3.5, 0.0, false, [0xf6a21c]); palm(b, -3.0, 0.9, 0.9); palm(b, 3.0, 0.9, 0.9);
  },
  Manokwari(b) { // pesisir + perbukitan + Pulau Mansinam (salib)
    water(b, 6.4, 3.2, 0, 2.6, 0x1f9fd6);
    b.cone(1.3, 0.8, 9, 0xf0d9a0, 1.2, 0.05, 2.4); b.cone(0.9, 0.9, 8, 0x4fae52, 1.2, 0.5, 2.4);
    b.box(0.18, 2.0, 0.18, C.white, 1.2, 1.2, 2.4); b.box(0.9, 0.17, 0.17, C.white, 1.2, 2.4, 2.4);
    jukung(b, -1.4, 2.8, 0.3, false, [0xf6a21c]); sampan(b, -2.4, 3.6, 0.0, 0xd9534a);
    hill(b, -2.0, -3.0, 2.0, 2.4, 0x3f9d46); hill(b, 2.0, -3.4, 2.2, 2.8, 0x4aa850);
    for (let i = 0; i < 3; i++) { b.begin(-2.2 + i * 1.4, 0, -0.4, 0); b.cone(0.65, 0.8, 8, 0xd4ab62, 0, 0.5, 0); b.cyl(0.5, 0.52, 0.5, 8, 0x9a6c3c, 0, 0, 0); b.end(); }
    b.box(0.18, 0.7, 0.18, 0x5e3a22, 3.0, 0, 0.4); b.cyl(0.08, 0.1, 0.9, 6, 0x4b5563, 2.7, 0.2, 0.3, { rz: 1.2 });   // meriam peninggalan
    palm(b, -3.0, 0.7, 0.9); palm(b, 0.6, 0.6, 0.9); palm(b, 3.1, 1.2, 0.8);
  },
  Timika(b) { // Puncak Jaya + tambang terbuka modern
    b.cone(2.8, 5.0, 6, 0x7b7f86, -0.8, 0, -2.4, { ry: 0.3 }); b.cone(1.1, 1.5, 6, 0xf6fbff, -0.8, 3.6, -2.4, { ry: 0.3 }); b.cone(1.6, 3.2, 6, 0x6d7178, 1.8, 0, -3.0); b.cone(0.55, 0.9, 6, 0xf6fbff, 1.8, 2.4, -3.0);
    for (let i = 0; i < 5; i++) b.cyl(1.9 - i * 0.34, 2.0 - i * 0.34, 0.22, 12, i % 2 ? 0x8a5a36 : 0xc47a3c, 1.5, i * 0.22, 1.4);
    b.begin(-1.5, 0, 1.6, 0.5);               // truk tambang kuning raksasa
    b.box(1.5, 0.5, 2.0, 0xf2b632, 0, 0.45, 0); b.box(1.3, 0.1, 1.6, 0x39434f, 0, 0.95, -0.1, { rx: 0.0 }); b.box(0.8, 0.6, 0.7, 0xf2b632, 0, 0.55, 1.1); b.box(0.7, 0.3, 0.05, 0x9fd8ef, 0, 0.85, 1.46);
    for (const [x, z] of [[-0.7, 0.7], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7]]) b.cyl(0.38, 0.38, 0.3, 10, 0x1f2937, x, 0.0, z, { rz: PI / 2 });
    b.end();
    b.box(0.35, 0.3, 3.4, 0x39434f, -2.6, 0.7, -0.2, { rx: 0.45 }); for (const z of [-1.2, 0.8]) b.box(0.1, 1.0, 0.1, 0x39434f, -2.6, 0, z);
    b.cyl(0.06, 0.07, 2.6, 5, 0xcfd3d8, 3.0, 0, 3.6); b.box(0.7, 0.4, 0.04, 0xf2b632, 3.36, 2.2, 3.6);
    lamp(b, -3.0, 4.0); pine(b, -3.0, -0.4, 0.8);
  },
  Merauke(b) { // dataran luas + Tugu Km 0 + rumah rayap Musamus
    for (let i = 0; i < 6; i++) b.box(6.0, 0.2, 0.42, i % 2 ? 0xe9c85a : 0x7fc24a, 0, 0, -3.8 + i * 0.5);
    for (let i = 0; i < 6; i++) for (let k = 0; k < 9; k++) b.cone(0.07, 0.35, 4, i % 2 ? 0xd9b13a : 0x5aa83a, -2.7 + k * 0.66, 0.2, -3.8 + i * 0.5);
    for (const [x, z, s] of [[-2.0, -1.0, 1.0], [-0.6, -1.8, 1.3], [1.8, -1.2, 0.9]]) { b.cone(0.55 * s, 1.8 * s, 8, 0xb98c5a, x, 0.05, z); b.cone(0.38 * s, 1.0 * s, 8, 0xa87a4a, x + 0.3 * s, 0.05, z + 0.1); for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; b.box(0.08, 1.1 * s, 0.18, 0xa57545, x + Math.cos(a) * 0.4 * s, 0.1, z + Math.sin(a) * 0.4 * s, { ry: a }); } }
    b.box(1.4, 0.3, 1.4, C.stone, 0, 0.0, 1.2); b.box(0.9, 2.6, 0.9, C.white, 0, 0.3, 1.2); b.box(0.92, 0.5, 0.92, C.red, 0, 1.6, 1.2); b.cone(0.65, 0.8, 4, C.white, 0, 2.9, 1.2, { ry: PI / 4 }); b.sphere(0.2, C.gold, 0, 3.7, 1.2);
    pixelText(b, 'KM 0', 0, 0.38, 1.7, 0.09, 0x1f1f1f, 0.05);
    for (const s of [-1, 1]) b.box(0.2, 1.6, 0.2, C.woodD, s * 2.4, 0, 2.6); b.box(5.2, 0.5, 0.14, C.red, 0, 1.2, 2.6); b.box(5.2, 0.24, 0.16, C.white, 0, 1.2, 2.62);
    b.cyl(0.08, 0.1, 1.4, 5, 0x7a5638, 2.6, 0, -0.2); b.sphere(0.9, 0x9bc15a, 2.6, 1.3, -0.2, { sy: 0.35, sx: 1.4 });
    lamp(b, -3.0, 3.9);
  },
  // ========================================================= JAWA
  Surabaya(b) { // Tugu Pahlawan + patung Suro & Boyo + kota besar
    b.box(3.2, 0.3, 3.2, C.stone, 0, 0, -1.2); b.box(2.4, 0.3, 2.4, 0xe4dccb, 0, 0.3, -1.2);
    b.cyl(0.38, 0.62, 5.4, 10, 0xf1ead6, 0, 0.6, -1.2);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; b.box(0.08, 5.0, 0.14, 0xe0d6bd, Math.cos(a) * 0.52, 0.7, -1.2 + Math.sin(a) * 0.52, { ry: -a + PI / 2 }); }
    b.box(1.1, 0.25, 1.1, 0xe4dccb, 0, 6.0, -1.2); b.cone(0.28, 0.9, 8, 0xf2c62e, 0, 6.25, -1.2);
    b.cyl(1.4, 1.5, 0.35, 14, 0xd9d2c0, 0, 0, 2.2); b.cyl(1.15, 1.15, 0.1, 14, 0x58c7e6, 0, 0.35, 2.2);
    b.begin(-0.3, 0.5, 2.2, 0.5); b.box(1.0, 0.22, 0.35, 0x8c98a6, 0, 0.1, 0); b.cone(0.18, 0.5, 4, 0x6b7785, 0.2, 0.3, 0, { rz: -0.6 }); b.cone(0.16, 0.5, 4, 0x6b7785, 0.55, 0.0, 0, { rz: -PI / 2 }); b.end();
    b.begin(0.35, 0.5, 2.3, -0.4); b.box(1.0, 0.2, 0.3, 0x5f7f3a, 0, 0.1, 0); b.sphere(0.2, 0x5f7f3a, 0.55, 0.15, 0); b.end();
    glassTower(b, -2.6, -3.5, 1.2, 1.2, 4.6, 0xdfe9f1, C.glass, 'crown'); glassTower(b, 2.6, -3.6, 1.1, 1.1, 5.6, 0xe8e2d4, C.glass, 'spire'); glassTower(b, 2.7, -1.2, 0.9, 0.9, 3.2);
    b.begin(-2.6, 0, 2.6, PI / 2); b.box(0.9, 0.7, 2.8, 0xe0463d, 0, 0.1, 0); b.box(0.92, 0.3, 2.6, 0x9fd8ef, 0, 0.45, 0); b.end();
    frontLamps(b);
  },
  Yogyakarta(b) { // Tugu Jogja + candi Prambanan + pasar rakyat
    b.box(1.8, 0.2, 1.8, 0xe6dfd0, -1.8, 0, 0.8); b.box(1.3, 0.2, 1.3, C.white, -1.8, 0.2, 0.8); b.box(0.8, 0.3, 0.8, C.white, -1.8, 0.4, 0.8);
    b.cyl(0.26, 0.4, 3.2, 8, C.white, -1.8, 0.7, 0.8); b.cyl(0.42, 0.42, 0.12, 8, C.gold, -1.8, 1.7, 0.8); b.sphere(0.34, C.gold, -1.8, 3.8, 0.8); b.cone(0.1, 0.8, 6, C.gold, -1.8, 4.2, 0.8);
    b.box(3.2, 0.4, 3.2, 0x5c6066, 1.0, 0, -2.4); b.box(2.5, 0.4, 2.5, 0x666b72, 1.0, 0.4, -2.4);
    for (const [x, h] of [[1.0, 4.4], [-0.1, 2.9], [2.1, 2.9]]) { for (let i = 0; i < 5; i++) b.cone(0.85 - i * 0.14 - (h < 4 ? 0.2 : 0), h / 5 + 0.2, 4, i % 2 ? 0x44484d : 0x4d5157, x, 0.8 + i * (h / 6), -2.4, { ry: PI / 4 }); b.cone(0.1, 0.7, 5, 0x3a3d41, x, 0.8 + h, -2.4); }
    b.box(2.0, 1.2, 1.4, 0xe9d8c0, -2.5, 0, -3.3); b.gable(1.6, 0.8, 2.2, 0xc0562a, -2.5, 1.2, -3.3, { ry: PI / 2 });
    for (let i = 0; i < 4; i++) { const x = -0.3 + (i % 2) * 1.8 + 0.2, z = 1.2 + Math.floor(i / 2) * 1.5, c = [0xe0463d, 0x2a8fd6, 0xf2b632, 0x2fae66][i]; b.box(0.9, 0.5, 0.7, C.wood, x, 0, z); b.cone(0.75, 0.4, 4, c, x, 0.9, z, { ry: PI / 4 }); for (const dx of [-0.38, 0.38]) b.cyl(0.03, 0.03, 0.4, 4, C.woodD, x + dx, 0.5, z + 0.3); for (let k = 0; k < 4; k++) b.sphere(0.07, [0xf2b632, 0xe0463d, 0x3fae4f][k % 3], x - 0.3 + k * 0.2, 0.5, z); b.sphere(0.07, 0xf2c9a0, x + 0.5, 0.22, z + 0.5); b.box(0.1, 0.2, 0.1, [0xe0463d, 0x2a8fd6][i % 2], x + 0.5, 0, z + 0.5); }
    tree(b, 3.0, 1.0, 0.9); tree(b, -3.0, -1.2, 0.8); frontLamps(b);
  },
  Bandung(b) { // Gedung Sate + taman kota + angklung
    b.box(5.6, 1.4, 1.8, 0xf3e3c3, 0, 0, -2.2); b.box(5.8, 0.16, 2.0, 0xc05a3a, 0, 1.4, -2.2);
    for (let i = -4; i <= 4; i++) b.box(0.4, 0.55, 0.05, 0x7a4a2a, i * 0.6, 0.4, -1.28);
    b.gable(2.2, 0.8, 5.8, 0xc05a3a, 0, 1.55, -2.2, { ry: PI / 2 });
    b.box(1.5, 1.2, 1.3, 0xf3e3c3, 0, 1.5, -2.2); for (let i = 0; i < 3; i++) b.cone(1.05 - i * 0.3, 0.5, 4, 0xc05a3a, 0, 2.7 + i * 0.42, -2.2, { ry: PI / 4 });
    b.cyl(0.04, 0.05, 1.1, 5, 0x6b4a2c, 0, 3.9, -2.2); for (let i = 0; i < 6; i++) b.sphere(0.12, i % 2 ? 0xc2410c : 0xe0a34a, 0, 4.4 + i * 0.16, -2.2);
    b.cyl(1.3, 1.4, 0.3, 12, 0xd9d2c0, 0.0, 0, 1.4); b.cyl(1.0, 1.0, 0.1, 12, 0x58c7e6, 0, 0.3, 1.4); b.cyl(0.1, 0.14, 0.9, 6, 0xd9d2c0, 0, 0.3, 1.4); b.sphere(0.2, 0xa6e4f5, 0, 1.2, 1.4);
    for (let i = 0; i < 6; i++) b.cyl(0.07, 0.08, 1.0 + (i % 3) * 0.35, 6, 0xd9c35a, -2.8 + i * 0.22, 0.0, 0.4, { rz: 0.0 }); b.box(1.5, 0.1, 0.12, C.wood, -2.35, 0.15, 0.4);
    pine(b, -2.6, 3.0, 0.9); pine(b, 2.8, 3.0, 0.9); pine(b, 3.0, -0.4, 0.8); flowerBed(b, -1.6, 3.3, 1.8, 0.7, [0xff6f91, 0xc86bfa, 0xffffff]); flowerBed(b, 1.6, 3.3, 1.8, 0.7, [0xffd23f, 0xff6f91]);
    b.begin(2.3, 0, 0.8, 0.4); b.box(0.9, 0.7, 0.9, 0xf08a7a, 0, 0, 0); b.box(1.0, 0.1, 1.0, 0x2f6f8f, 0, 0.7, 0); b.end();
    frontLamps(b);
  },
  Solo(b) { // Keraton Surakarta: gerbang, pendopo joglo, menara
    b.box(6.2, 0.9, 0.2, 0xf4f6fa, 0, 0, -4.0); b.box(0.2, 0.9, 5.0, 0xf4f6fa, -3.0, 0, -1.7); b.box(0.2, 0.9, 5.0, 0xf4f6fa, 3.0, 0, -1.7);
    for (const s of [-1, 1]) { b.box(2.4, 0.9, 0.2, 0xf4f6fa, s * 1.8, 0, 0.8); b.box(2.4, 0.14, 0.26, 0x2a8fd6, s * 1.8, 0.9, 0.8); }
    b.box(1.5, 0.14, 0.26, 0x2a8fd6, 0, 0, 0.8, { sy: 0.2 });
    b.box(1.6, 1.3, 0.7, 0xf4f6fa, 0, 0, 0.8); b.cone(1.5, 0.5, 4, 0xb85a3e, 0, 1.3, 0.8, { ry: PI / 4 }); b.cone(1.0, 0.5, 4, 0xc4684a, 0, 1.75, 0.8, { ry: PI / 4 }); b.cone(0.2, 0.6, 4, C.gold, 0, 2.2, 0.8, { ry: PI / 4 });
    for (const [x, z] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, -2.9], [1.1, -2.9]]) b.cyl(0.1, 0.12, 1.3, 8, C.woodD, x, 0, z);
    b.box(3.0, 0.2, 2.6, 0xe9e2d2, 0, 0, -2.0); b.cone(2.4, 0.8, 4, 0xb85a3e, 0, 1.3, -2.0, { ry: PI / 4 }); b.cone(1.5, 0.8, 4, 0xc4684a, 0, 1.9, -2.0, { ry: PI / 4 }); b.cone(0.2, 0.7, 4, C.gold, 0, 2.6, -2.0, { ry: PI / 4 });
    b.cyl(0.55, 0.65, 3.4, 8, 0xf4f6fa, 2.2, 0, -3.1); b.cyl(0.8, 0.8, 0.12, 8, 0x2a8fd6, 2.2, 3.0, -3.1); b.cone(0.75, 1.0, 8, 0xc4684a, 2.2, 3.4, -3.1); b.sphere(0.1, C.gold, 2.2, 4.5, -3.1);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) b.box(0.42, 0.04, 0.42, (i + j) % 2 ? 0x2a8fd6 : 0xf4f6fa, -1.0 + i * 0.42, 0.0, 2.0 + j * 0.42);
    tree(b, -2.6, 2.4, 0.8); tree(b, 2.8, 2.6, 0.8); flagPole(b, -2.6, 3.4, 3.0);
  },
  Jakarta(b) { // Monas mini + skyline pencakar langit
    const towers = [[-2.7, -3.7, 1.0, 1.0, 7.0, 'spire', 0xdfe9f1], [-1.4, -3.9, 1.1, 1.1, 5.4, 'crown', 0xe8e2d4], [0.0, -3.6, 1.2, 1.2, 8.4, 'spire', 0xd5e4ea], [1.4, -3.9, 1.0, 1.0, 6.0, 'flat', 0xdfe9f1], [2.7, -3.6, 1.1, 1.1, 7.6, 'crown', 0xe8e2d4], [-2.5, -2.2, 0.9, 0.9, 3.4, 'flat', 0xe9f1ee], [2.6, -2.1, 0.9, 0.9, 4.2, 'flat', 0xdfe9f1]];
    for (const [x, z, w, d, h, top, col] of towers) glassTower(b, x, z, w, d, h, col, C.glass, top);
    b.begin(0, 0, 0.6, 0, 0.27); P.monas(b); b.end();
    b.cyl(1.0, 1.1, 0.2, 14, 0xd9d2c0, 0, 0, 3.4); b.cyl(0.8, 0.8, 0.08, 14, 0x58c7e6, 0, 0.2, 3.4);
    b.begin(-2.6, 0, 1.6, PI / 2); b.box(0.8, 0.6, 2.4, 0xe0463d, 0, 0.1, 0); b.box(0.82, 0.25, 2.2, 0x9fd8ef, 0, 0.4, 0); b.end();
    tree(b, 3.0, 1.0, 0.8); tree(b, -3.0, 3.2, 0.8); frontLamps(b);
  },
};


// Plat kampung untuk petak non-kota (Takdir, Musibah, Tol, Tilang): rumah adat khas tiap pulau, agar cincin petak rapat & seragam.
export const KAMPUNG = [
  (b) => {   // Sumatra: rumah gadang kecil + lumbung + marawa
    for (const x of [-1.2, 0, 1.2]) for (const z of [-1.6, -0.2]) b.cyl(0.1, 0.12, 0.8, 6, C.woodD, x, 0, z);
    b.box(3.4, 1.2, 1.7, 0x7a2f23, 0, 0.8, -0.9); b.box(3.5, 0.15, 1.8, C.gold, 0, 2.0, -0.9);
    b.gable(1.9, 0.9, 3.5, 0x2f2a28, 0, 2.1, -0.9, { ry: PI / 2 });
    for (const s of [-1, 1]) b.cone(0.35, 1.9, 4, 0x2f2a28, s * 1.8, 2.1, -0.9, { rz: -s * 0.55, ry: PI / 4 });
    for (let i = -2; i <= 2; i++) b.box(0.35, 0.7, 0.05, 0xf0c04a, i * 0.6, 0.95, -0.03);
    b.cyl(0.04, 0.05, 2.4, 5, 0xcfd3d8, 2.6, 0, 2.6); b.box(0.7, 0.2, 0.04, 0xf5c542, 2.96, 2.1, 2.6); b.box(0.7, 0.2, 0.04, 0xd9322b, 2.96, 1.9, 2.6); b.box(0.7, 0.2, 0.04, 0x1f1f1f, 2.96, 1.7, 2.6);
    palm(b, -2.6, 2.4, 0.9); palm(b, -2.6, -3.2, 0.9); flowerBed(b, -0.8, 3.0, 1.8, 0.8, [0xd9322b, 0xf5c542]); lamp(b, 3.0, 4.0);
  },
  (b) => {   // Kalimantan: rumah panjang di tepi sungai + totem + perahu
    water(b, 6.0, 2.0, 0, 2.6, 0x2e9fb5); sampan(b, -1.0, 2.7, 0.2, 0x8a5a36); jukung(b, 1.6, 2.4, -0.3, false, [0x3fae4f]);
    for (let x = -2.4; x <= 2.41; x += 1.2) for (const z of [-2.2, -0.8]) b.cyl(0.09, 0.11, 0.9, 6, C.woodD, x, 0, z);
    b.box(5.4, 1.0, 1.6, 0xa66a3c, 0, 0.9, -1.5); b.box(5.5, 0.14, 1.7, 0xd13a2f, 0, 1.9, -1.5);
    b.gable(1.8, 0.9, 5.6, 0x8a6a3a, 0, 2.0, -1.5, { ry: PI / 2 });
    for (let x = -2.2; x <= 2.21; x += 0.7) b.box(0.3, 0.45, 0.05, 0x2b2118, x, 1.1, -0.68);
    b.cyl(0.12, 0.15, 2.8, 6, C.woodD, 2.8, 0, 0.2); b.box(0.35, 0.3, 0.25, 0xd9322b, 2.8, 1.2, 0.2); b.box(0.35, 0.3, 0.25, 0xf5c542, 2.8, 1.55, 0.2); b.cone(0.18, 0.4, 4, 0x1f7a50, 2.8, 2.8, 0.2, { ry: PI / 4 });
    tree(b, -2.9, -3.4, 1.2); tree(b, 2.9, -3.5, 1.1); lamp(b, -3.0, 4.0);
  },
  (b) => {   // Sulawesi: tongkonan kecil + lumbung
    for (const x of [-1.5, -0.5, 0.5, 1.5]) for (const z of [-1.5, -0.2]) b.cyl(0.09, 0.11, 0.8, 6, C.woodD, x, 0, z);
    b.box(3.6, 1.1, 1.6, 0x6b2a20, 0, 0.8, -0.85); b.box(3.7, 0.12, 1.7, 0xf3ede0, 0, 1.4, -0.85);
    for (let i = 0; i < 7; i++) { const t = (i - 3) / 3, y = 1.6 + t * t * 1.1; b.gable(2.2, 1.0, 0.65, 0x8d5e33, (i - 3) * 0.55, y, -0.85); }
    for (const s of [-1, 1]) b.box(0.22, 1.2, 1.8, 0x8d5e33, s * 1.95, 2.3, -0.85, { rz: -s * 0.3 });
    b.box(1.5, 0.6, 0.12, 0xf5c542, 0, 0.9, 0.0);
    b.begin(2.4, 0, 2.4, -0.3, 0.6); for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) b.cyl(0.1, 0.12, 0.9, 6, C.woodD, x, 0, z); b.box(2.0, 0.9, 1.8, 0x6b2a20, 0, 0.9, 0); b.gable(2.2, 1.0, 2.4, 0x8d5e33, 0, 1.8, 0); b.end();
    b.cyl(0.1, 0.13, 2.4, 6, C.woodD, -2.6, 0, 2.6); for (let i = 0; i < 4; i++) { b.cone(0.1, 0.4, 5, 0xf5efe0, -2.74, 0.6 + i * 0.45, 2.6, { rz: 0.9 }); b.cone(0.1, 0.4, 5, 0xf5efe0, -2.46, 0.6 + i * 0.45, 2.6, { rz: -0.9 }); }
    tree(b, -2.8, -3.2, 1.1); palm(b, 2.8, -3.2, 0.9); lamp(b, 3.0, 4.0);
  },
  (b) => {   // Papua: honai + kebun ubi
    for (const [x, z, r, h, rh] of [[-1.2, -1.2, 1.1, 1.0, 1.4], [1.5, -0.6, 0.85, 0.85, 1.1]]) { b.cyl(r, r * 1.05, h, 12, 0x9a6c3c, x, 0, z); b.cone(r * 1.35, rh, 12, 0xd4ab62, x, h, z); b.sphere(0.13, 0xe0c27a, x, h + rh, z); b.box(r * 0.5, h * 0.6, 0.12, 0x1f1812, x, 0, z + r); }
    for (let i = 0; i < 10; i++) { const a = Math.PI * (0.15 + i * 0.07); b.cyl(0.05, 0.06, 0.8, 5, C.woodD, Math.cos(a) * 2.7, 0, Math.sin(a) * 2.7 + 0.8); }
    for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 6; i++) { b.cone(0.28, 0.25, 6, 0x6b4a2c, -2.5 + i * 0.7, 0, 2.6 + r2 * 0.7); b.sphere(0.14, 0x3fae4f, -2.5 + i * 0.7, 0.25, 2.6 + r2 * 0.7); }
    palm(b, 2.8, 2.6, 0.9); pine(b, -2.9, -3.3, 0.9); lamp(b, 3.0, 4.0);
  },
  (b) => {   // Jawa: joglo + sawah
    for (const x of [-1.2, 1.2]) for (const z of [-1.9, -0.3]) b.cyl(0.1, 0.12, 1.2, 8, C.woodD, x, 0.3, z);
    b.box(3.2, 0.3, 2.4, 0xc9c2b0, 0, 0, -1.1); b.box(2.0, 1.1, 1.5, 0xf1e6cf, 0, 0.3, -1.1);
    b.cone(2.3, 0.9, 4, 0xb85a3e, 0, 1.5, -1.1, { ry: PI / 4 }); b.cone(1.4, 0.9, 4, 0xc4684a, 0, 2.2, -1.1, { ry: PI / 4 }); b.cone(0.18, 0.6, 4, C.gold, 0, 3.0, -1.1, { ry: PI / 4 });
    for (let i = 0; i < 5; i++) b.box(2.4 - i * 0.12, 0.14, 0.9, i % 2 ? 0x9ad25a : 0x7fc24a, 0.0, 0, 2.0 + i * 0.5 - 0.5 + 0.0, { sy: 1 });
    for (let i = 0; i < 5; i++) for (let k = 0; k < 6; k++) b.cone(0.06, 0.3, 4, 0x4a9a3a, -1.0 + k * 0.4, 0.14, 1.5 + i * 0.5);
    palm(b, 2.8, 2.0, 0.9); tree(b, -2.8, -3.2, 1.0); lamp(b, 3.0, 4.0);
  },
];
