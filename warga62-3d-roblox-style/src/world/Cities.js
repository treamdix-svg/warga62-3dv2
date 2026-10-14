import { C, plate, tree, palm, pine, lamp, flagPole, bush, flowerBed, water, jukung, sampan, ship, containers, gantryCrane, archBridge, cableBridge, dome, minaret, glassTower, houseMini, stiltHouse, statue, pixelText } from './CityKit.js';
import * as P from './Prefabs.js';

const PI = Math.PI, TAU = Math.PI * 2;

// Klaster khas 25 kota (miniatur ~6.8 x 9, +z menghadap jalan). Tiap kota: landmark + bangunan pendukung + suasana.
// Warna alas per pulau + sentuhan lokal membuat tiap kota langsung dikenali dari kamera ikuti maupun isometrik.
const ISLAND_PLATE = [
  [0xe9d9bd, 0x8c2f2a],   // Sumatra: krem hangat, tepi marun
  [0x8cc77a, 0x6b4426],   // Kalimantan: hijau rimba, tepi kayu
  [0xe9e4d2, 0x1f9fae],   // Sulawesi: pasir/putih, tepi biru-hijau
  [0xbcd99c, 0x7a5a36],   // Papua: lembah hijau, tepi tanah
  [0xdcdedb, 0xc0562a],   // Jawa: marmer abu, tepi terakota
];

function frontLamps(b) { lamp(b, -3.0, 4.0, 1.9); lamp(b, 3.0, 4.0, 1.9); }

export const CITIES = {
  // ========================================================= SUMATRA
  Aceh(b) {   // Masjid Raya Baiturrahman
    b.box(5.0, 1.5, 2.6, 0xf8f4ea, 0, 0, -1.3);
    b.box(5.2, 0.14, 2.8, 0xd9d2c0, 0, 1.5, -1.3);
    for (let i = -2; i <= 2; i++) b.box(0.55, 0.9, 0.06, 0x2f6f8f, i * 0.9, 0.3, 0.02);
    b.box(5.0, 0.12, 0.3, 0xd9d2c0, 0, 1.2, 0.05);
    for (const [x, z, r] of [[0, -1.3, 0.95], [-1.5, -0.6, 0.6], [1.5, -0.6, 0.6], [-1.5, -2.0, 0.6], [1.5, -2.0, 0.6], [0, -2.5, 0.55]]) { b.cyl(r * 0.8, r * 0.85, 0.5, 12, 0xf8f4ea, x, 1.6, z); dome(b, r, 0x24262b, x, 2.1, z, 1.0); b.cone(0.05, 0.5, 5, C.gold, x, 2.1 + r * 1.8, z); }
    minaret(b, -2.7, -0.2, 4.4); minaret(b, 2.7, -0.2, 4.4); minaret(b, -2.7, -2.5, 3.2); minaret(b, 2.7, -2.5, 3.2);
    water(b, 3.4, 1.1, 0, 2.6, 0x58c7e6);
    palm(b, -2.8, 3.3, 0.9); palm(b, 2.8, 3.3, 0.9); frontLamps(b);
  },
  Medan(b) {  // Istana Maimun + kota besar
    b.box(5.0, 1.7, 2.4, 0xf2c62e, 0, 0, -1.6);
    b.box(5.2, 0.18, 2.6, 0x2e9e5a, 0, 1.7, -1.6);
    for (const x of [-1.9, -1.1, 1.1, 1.9]) b.cyl(0.14, 0.16, 1.4, 8, 0xfff6d8, x, 0, -0.3);
    b.box(4.8, 0.14, 0.9, 0xfff6d8, 0, 1.4, -0.5);
    b.box(1.9, 1.6, 1.7, 0xf6d24a, 0, 1.8, -1.6); b.cyl(0.85, 0.95, 0.35, 12, 0xf6d24a, 0, 3.4, -1.6); dome(b, 0.9, 0x2e9e5a, 0, 3.7, -1.6, 1.0); b.cone(0.45, 0.9, 10, 0x2e9e5a, 0, 4.4, -1.6); b.sphere(0.12, C.gold, 0, 5.2, -1.6); b.cone(0.05, 0.6, 5, C.gold, 0, 5.3, -1.6);
    for (const s of [-1, 1]) { b.box(1.4, 1.2, 1.8, 0xf2c62e, s * 2.5, 0, -1.6); b.gable(1.8, 0.6, 1.6, 0x2e9e5a, s * 2.5, 1.2, -1.6, { ry: PI / 2 }); }
    for (let i = -2; i <= 2; i++) b.box(0.5, 0.8, 0.06, 0x7a4a2a, i * 0.8, 0.3, -0.4);
    glassTower(b, -2.7, -3.6, 1.1, 1.0, 5.2, 0xe8e2d4); glassTower(b, 2.7, -3.6, 1.0, 1.0, 4.2, 0xdfe9f1);
    b.begin(1.6, 0, 3.2, 0.5); b.box(0.5, 0.3, 0.9, 0x2a8fd6, 0, 0.12, 0); b.box(0.5, 0.35, 0.4, 0xffffff, 0, 0.35, -0.2); b.cyl(0.14, 0.14, 0.06, 8, 0x222, 0.3, 0.02, 0.4, { rz: PI / 2 }); b.end();
    flowerBed(b, -1.4, 3.2, 2.0, 0.8); tree(b, 3.0, 2.6, 0.9); frontLamps(b);
  },
  Lampung(b) { // Menara Siger + gajah Way Kambas + rumah panggung Lamban
    b.cyl(1.2, 1.35, 0.4, 14, 0xd9d2c0, 0, 0, -1.2);
    b.cyl(0.7, 1.05, 3.2, 10, C.white, 0, 0.4, -1.2);
    b.cyl(1.1, 0.8, 0.25, 10, 0xc9a24a, 0, 3.6, -1.2);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU, up = i % 2 ? 0.8 : 1.3; b.cone(0.18, up, 4, C.gold, Math.cos(a) * 0.82, 3.8, -1.2 + Math.sin(a) * 0.82, { rz: -Math.cos(a) * 0.35, rx: Math.sin(a) * 0.35, ry: PI / 4 }); }
    b.begin(1.9, 0, 2.0, -0.6);                               // gajah
    b.box(1.1, 0.8, 1.7, 0x8f969b, 0, 0.55, 0); b.sphere(0.5, 0x8f969b, 0, 0.7, 1.0);
    for (const x of [-0.35, 0.35]) for (const z of [-0.6, 0.6]) b.cyl(0.18, 0.2, 0.6, 6, 0x838a90, x, 0, z);
    b.cyl(0.12, 0.2, 0.9, 6, 0x8f969b, 0, 0.1, 1.55, { rx: -0.4 });
    for (const s of [-1, 1]) { b.box(0.08, 0.5, 0.45, 0x838a90, s * 0.55, 0.9, 0.95); b.cone(0.05, 0.5, 5, 0xf6f0dc, s * 0.2, 0.55, 1.55, { rx: PI / 2 + 0.3 }); }
    b.end();
    b.begin(-2.1, 0, -2.0, 0.4); P.rumahSubsidi1(b); b.end();
    stiltHouse(b, -2.2, 1.6, 0.3, 0xe9d2a8, 0x7a2f23, 1.0);
    for (let i = 0; i < 6; i++) { bush(b, 2.8, -3.6 + i * 0.5, 0.8, 0x2f7d3f); b.sphere(0.07, 0xd9322b, 2.8, 0.35, -3.6 + i * 0.5); }
    frontLamps(b);
  },
  Padang(b) { // Rumah Gadang + rangkiang + marawa
    for (const x of [-1.8, -0.6, 0.6, 1.8]) for (const z of [-2.6, -0.9]) b.cyl(0.1, 0.12, 0.8, 6, C.woodD, x, 0, z);
    b.box(4.6, 1.5, 2.0, 0x7a2f23, 0, 0.8, -1.75);
    b.box(4.7, 0.18, 2.1, C.gold, 0, 2.3, -1.75);
    for (let i = -3; i <= 3; i++) b.box(0.4, 1.0, 0.05, 0xf0c04a, i * 0.62, 1.0, -0.72);
    b.gable(2.3, 1.0, 4.6, 0x2f2a28, 0, 2.45, -1.75, { ry: PI / 2 }); b.gable(2.3, 0.8, 4.6, 0xb23a2e, 0, 2.3, -1.75, { ry: PI / 2 });
    for (const s of [-1, 1]) { b.cone(0.4, 2.2, 4, 0x2f2a28, s * 2.4, 2.5, -1.75, { rz: -s * 0.55, ry: PI / 4 }); b.cone(0.3, 1.5, 4, 0x2f2a28, s * 1.2, 3.1, -1.75, { rz: -s * 0.35, ry: PI / 4 }); }
    for (const s of [-1, 1]) { for (const px of [-0.3, 0.3]) b.cyl(0.07, 0.08, 0.5, 5, C.woodD, s * 2.3 + px, 0, 1.6); b.box(0.9, 0.55, 0.7, 0x7a2f23, s * 2.3, 0.5, 1.6); b.gable(0.9, 0.5, 1.0, 0x2f2a28, s * 2.3, 1.05, 1.6, { ry: PI / 2 }); b.cone(0.2, 0.9, 4, 0x2f2a28, s * 2.3 - 0.45 * s, 1.05, 1.6, { rz: s * 0.5, ry: PI / 4 }); b.cone(0.2, 0.9, 4, 0x2f2a28, s * 2.3 + 0.45 * s, 1.05, 1.6, { rz: -s * 0.5, ry: PI / 4 }); }
    for (const x of [-3.0, 3.0]) { b.cyl(0.04, 0.05, 2.6, 5, 0xcfd3d8, x, 0, 3.6); b.box(0.7, 0.2, 0.04, 0xf5c542, x + 0.36, 2.3, 3.6); b.box(0.7, 0.2, 0.04, 0xd9322b, x + 0.36, 2.1, 3.6); b.box(0.7, 0.2, 0.04, 0x1f1f1f, x + 0.36, 1.9, 3.6); }
    palm(b, 0, 3.4, 0.9); flowerBed(b, -1.6, 3.3, 1.4, 0.7, [0xd9322b, 0xf5c542]); flowerBed(b, 1.6, 3.3, 1.4, 0.7, [0xd9322b, 0xf5c542]);
  },
  Batam(b) {  // pelabuhan + Jembatan Barelang + kota modern
    water(b, 6.4, 4.2, 0, 1.7, 0x2aa3bd);
    cableBridge(b, 6.2, 0xe2552c, [-1.6, 1.6], 3.5, 0.9, 1.7);
    ship(b, 0.2, 1.7, PI / 2 + 0.0, 0x2b3a4a, true);
    gantryCrane(b, -1.8, -2.2, 0); gantryCrane(b, 0.4, -2.2, 0, 0xe0463d);
    containers(b, -2.8, -3.6, 2, 3, 2); containers(b, 0.6, -3.5, 2, 3, 1);
    glassTower(b, 2.6, -2.3, 1.1, 1.1, 5.4, 0xdfe9f1, C.glass, 'spire'); glassTower(b, 1.5, -3.6, 1.0, 1.0, 4.4, 0xe8e2d4);
    lamp(b, -3.0, 3.9); lamp(b, 3.0, 3.9);
  },
  // ========================================================= KALIMANTAN
  Pontianak(b) { // Kapuas + Tugu Khatulistiwa mini
    water(b, 6.4, 3.0, 0, 2.5, 0x2e9fb5);
    for (let i = 0; i < 7; i++) b.box(0.18, 0.1, 0.7, C.wood, -2.7 + i * 0.9, 0.18, 0.9);
    sampan(b, -1.6, 2.6, 0.2, 0xd9534a); sampan(b, 1.6, 3.1, -0.3, 0x2a8fd6);
    b.cyl(1.7, 1.9, 0.3, 8, 0xd8dedd, 0, 0, -1.4, {ry: PI / 8});
    b.cyl(1.0, 1.4, 0.8, 8, 0xe9ecef, 0, 0.3, -1.4, { ry: PI / 8 }); b.cyl(0.75, 1.05, 0.3, 8, 0xa94d3a, 0, 0.3, -1.4, { ry: PI / 8 });
    for (const [x, z, h] of [[-0.25, -1.55, 3.2], [0.25, -1.55, 3.6], [-0.2, -1.2, 3.4], [0.25, -1.2, 3.0]]) b.box(0.22, h, 0.22, 0x1f2428, x, 1.0, z);
    b.torus(1.0, 0.09, 0xd5d9dd, 0, 4.1, -1.4); b.torus(0.7, 0.04, 0xd5d9dd, 0, 4.1, -1.4, { ry: PI / 2 }); b.box(0.05, 0.05, 2.4, 0xffd24a, 0, 4.1, -1.4); b.sphere(0.13, 0x3b82f6, 0, 3.95, -1.4);
    stiltHouse(b, -2.5, -2.9, 0.1, 0xf2c62e, 0x2e7d4f); stiltHouse(b, 2.5, -2.9, -0.1, 0x6fcfc0, 0xc0562a); palm(b, 2.9, 0.2, 0.9); palm(b, -2.9, 0.2, 0.9); flagPole(b, 3.0, -0.8, 3.0);
  },
  Palangkaraya(b) { // kota hijau: kantor pemerintahan bergaya Dayak
    b.box(5.0, 1.2, 2.4, 0xf4efe2, 0, 0, -1.5);
    for (let i = -2; i <= 2; i++) b.cyl(0.12, 0.14, 1.2, 8, 0x8a5a36, i * 0.9, 0, -0.2);
    b.gable(2.8, 1.6, 5.4, 0x2f8f48, 0, 1.2, -1.5, { ry: PI / 2 }); b.gable(3.0, 0.2, 5.5, 0xd9322b, 0, 1.18, -1.5, { ry: PI / 2 });
    for (let i = 0; i < 7; i++) b.box(0.5, 0.2, 0.06, i % 2 ? 0xf5c542 : 0xd9322b, -1.5 + i * 0.5, 1.0, -0.28);
    for (const x of [-2.9, 2.9]) { b.cyl(0.14, 0.18, 2.8, 6, C.woodD, x, 0, 1.2); b.box(0.4, 0.35, 0.3, 0xd9322b, x, 1.8, 1.2); b.box(0.4, 0.35, 0.3, 0xf5c542, x, 2.2, 1.2); b.cone(0.22, 0.4, 4, 0x1f7a50, x, 2.6, 1.2, { ry: PI / 4 }); }
    for (const [x, z, s] of [[-2.8, -3.6, 2.2], [-1.2, -4.0, 2.6], [1.0, -3.8, 2.4], [2.8, -3.5, 2.0]]) { b.cyl(0.2 * s * 0.4, 0.3 * s * 0.4, 1.6 * s * 0.5, 6, 0x6b4a2c, x, 0, z); b.sphere(0.95 * s * 0.45, 0x2f9a48, x, 1.0 * s * 0.5, z); b.sphere(0.7 * s * 0.45, 0x3fae4f, x + 0.4, 1.5 * s * 0.55, z); }
    flagPole(b, 0, 3.4, 3.2); flowerBed(b, -1.7, 3.2, 1.6, 0.8, [0xff6f91, 0xffffff]); flowerBed(b, 1.7, 3.2, 1.6, 0.8, [0xffd23f, 0xff6f91]);
  },
  Banjarmasin(b) { // pasar terapung
    water(b, 6.2, 5.6, 0, 0.8, 0x2e9fb5);
    jukung(b, -1.8, 1.6, 0.5); jukung(b, 1.4, 2.2, -0.4, true, [0xe0463d, 0xf6a21c]); jukung(b, -0.4, 0.2, 0.1, true, [0x3fae4f, 0xf2c62e]); jukung(b, 2.0, -0.4, 0.9, false, [0xff7a3d, 0xffd23f]); jukung(b, -2.2, -0.9, -0.5, true, [0xe0463d, 0x3fae4f]);
    for (let i = 0; i < 3; i++) { b.box(1.5, 0.1, 1.0, C.wood, -2.2 + i * 2.2, 0.15, -3.5); b.box(1.2, 0.8, 0.8, [0xf2c62e, 0x6fcfc0, 0xf08a7a][i], -2.2 + i * 2.2, 0.25, -3.5); b.gable(0.9, 0.5, 1.5, [0x7a2f23, 0x2f6f8f, 0x2f7d3f][i], -2.2 + i * 2.2, 1.05, -3.5, { ry: PI / 2 }); }
    for (const x of [-3.0, 3.0]) { for (let k = 0; k < 4; k++) b.cyl(0.04, 0.04, 0.9, 4, C.woodD, x, 0, 3.8 - k * 1.0); b.box(0.5, 0.06, 4.0, C.wood, x, 0.9, 2.3); }
    lamp(b, -3.0, 4.1); lamp(b, 3.0, 4.1);
  },
  Samarinda(b) { // Jembatan Mahakam + tongkang batu bara
    water(b, 6.4, 4.6, 0, 1.1, 0x2e9fb5);
    archBridge(b, 6.2, 2.6, 0xf4f7fa, 1.0, 1.1, 1.3);
    b.begin(0, 0.1, 2.5, 0); b.box(1.6, 0.3, 3.0, 0x39434f, 0, 0, 0); for (let i = 0; i < 5; i++) b.sphere(0.5 - i * 0.04, 0x1f2428, -0.2 + (i % 2) * 0.3, 0.2, -1.0 + i * 0.6, { sy: 0.7 }); b.end();
    sampan(b, 2.2, 3.4, 0.2, 0xf2b632);
    b.box(1.4, 1.6, 1.2, 0xf4efe2, -2.0, 0, -3.4); dome(b, 0.6, 0x2e9e8a, -2.0, 1.6, -3.4); minaret(b, -1.1, -3.4, 2.4, 0xf6f1e4, 0x2e9e8a);
    glassTower(b, 1.2, -3.4, 1.2, 1.1, 3.8, 0xe8e2d4); glassTower(b, 2.6, -3.4, 1.0, 1.0, 3.0);
    lamp(b, -3.0, 4.0); lamp(b, 3.0, 4.0);
  },
  IKN(b) {    // Istana Garuda + kantor kementerian modern
    b.box(6.0, 0.25, 4.0, 0xf2f2f0, 0, 0, -1.0); b.box(5.0, 0.2, 3.2, 0xe6e6e2, 0, 0.25, -1.0);
    b.box(1.0, 2.8, 0.7, 0xb08a3e, 0, 0.45, -1.2); b.sphere(0.42, 0xc99a3e, 0, 3.1, -1.2); b.cone(0.18, 0.55, 4, 0xe0463d, 0, 3.4, -0.9, { rx: PI / 2 });
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) b.box(1.7 - i * 0.14, 0.3, 0.14, i % 2 ? 0xe0b04a : 0xc99a3e, s * (1.2 + i * 0.12), 1.0 + i * 0.32, -1.2, { rz: s * (0.45 - i * 0.05) });
    for (let i = 0; i < 5; i++) b.box(0.18, 1.3 - Math.abs(i - 2) * 0.15, 0.1, 0xe0463d, -0.5 + i * 0.25, 0.45, -1.7);
    glassTower(b, -2.6, -3.3, 1.2, 1.1, 4.2, 0xe9f1ee, 0x4a9e8a); glassTower(b, 2.6, -3.3, 1.2, 1.1, 3.6, 0xe9f1ee, 0x4a9e8a);
    for (let i = 0; i < 4; i++) { tree(b, -2.8 + i * 1.9, 3.1, 0.8); }
    b.box(5.4, 0.04, 0.3, 0x2f8f48, 0, 0.3, 2.2); flagPole(b, -2.9, 1.4, 3.2); flagPole(b, 2.9, 1.4, 3.2); frontLamps(b);
  },
};

import { CITIES_B, KAMPUNG } from './CitiesB.js';
Object.assign(CITIES, CITIES_B);
export function plateColors(island) { return ISLAND_PLATE[island]; }
export function buildCity(b, name, island) {
  const [ground, edge] = ISLAND_PLATE[island];
  const fn = CITIES[name];
  if (!fn) return false;
  plate(b, ground, edge);
  b.begin(0, 0.33, 0, 0);
  fn(b);
  b.end();
  return true;
}

export function buildKampung(b, island) {
  const [ground, edge] = ISLAND_PLATE[island];
  plate(b, 0xb9dc9c, edge);
  b.begin(0, 0.33, 0, 0);
  KAMPUNG[island](b);
  b.end();
}
