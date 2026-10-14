// Monumen mini khas setiap kota (25 kota aset), berdiri di tepi jalan dekat petaknya agar mudah dikenali.
const PI = Math.PI;
const W = 0xfbf7ee, GOLD = 0xf2b632, STONE = 0xcfc8b4, GREEN = 0x2e9e5a, RED = 0xe0463d;

const plinth = (b, r = 2.2, color = STONE) => { b.cyl(r, r + 0.25, 0.35, 12, color, 0, 0, 0); };
const dome = (b, r, color, x, y, z) => b.sphere(r, color, x, y, z, { sy: 0.9 });

const M = {
  Aceh(b) { plinth(b, 2.3); b.box(3.4, 1.4, 2.2, W, 0, 0.35, 0);
    for (const x of [-1.1, 0, 1.1]) { b.cyl(0.5, 0.5, 0.3, 10, W, x, 1.75, 0); dome(b, 0.55, 0x2b2b2b, x, 2.0, 0); b.cone(0.08, 0.5, 5, GOLD, x, 2.95, 0); }
    for (const x of [-1.9, 1.9]) { b.cyl(0.18, 0.2, 3.4, 8, W, x, 0.35, 0); b.cone(0.28, 0.6, 8, 0x2b2b2b, x, 3.7, 0); } },
  Medan(b) { plinth(b); b.box(3.2, 1.6, 2.2, 0xf5cf3d, 0, 0.35, 0); b.box(3.4, 0.2, 2.4, 0x2e9e5a, 0, 1.95, 0);
    dome(b, 0.9, 0xf5cf3d, 0, 2.1, 0); b.cone(0.15, 0.8, 6, GOLD, 0, 3.4, 0); for (const x of [-1.4, 1.4]) { b.cyl(0.35, 0.35, 2.4, 8, 0xf5cf3d, x, 0.35, 0.8); b.cone(0.45, 0.6, 8, 0x2e9e5a, x, 2.75, 0.8); } },
  Lampung(b) { plinth(b, 1.8); b.cyl(0.5, 0.9, 3.4, 8, W, 0, 0.35, 0); b.box(1.4, 0.18, 1.4, GOLD, 0, 3.75, 0);
    for (const s of [-1, 1]) b.cone(0.25, 1.6, 4, GOLD, s * 0.45, 3.9, 0, { rz: -s * 0.35, ry: PI / 4 }); },
  Padang(b) { plinth(b, 2.3); for (const x of [-1.3, 0, 1.3]) b.cyl(0.12, 0.14, 0.9, 5, 0x5e3a22, x, 0.35, 0.5); b.box(3.6, 1.5, 1.8, 0x7a2f23, 0, 1.25, 0); b.box(3.7, 0.2, 1.9, GOLD, 0, 2.65, 0);
    b.gable(2.0, 0.9, 3.8, 0x2f2a28, 0, 2.75, 0, { ry: PI / 2 }); for (const s of [-1, 1]) { b.cone(0.38, 2.2, 4, 0x2f2a28, s * 1.95, 2.8, 0, { rz: -s * 0.55, ry: PI / 4 }); b.cone(0.28, 1.5, 4, 0x2f2a28, s * 0.9, 3.4, 0, { rz: -s * 0.35, ry: PI / 4 }); } },
  Batam(b) { b.box(5.2, 0.3, 1.2, STONE, 0, 0.2, 0); for (const x of [-1.8, 1.8]) b.box(0.3, 3.6, 0.3, 0xf08a24, x, 0.3, 0);
    for (let i = 1; i <= 4; i++) for (const x of [-1.8, 1.8]) { const dir = x < 0 ? 1 : -1; b.box(0.04, 3.4 / 2.3 * 0.9 + i * 0.05, 0.04, 0x8d8f94, x + dir * i * 0.4, 1.6 - i * 0.1, 0, { rz: dir * -0.82 }); } },
  Pontianak(b) { plinth(b, 2.3); for (const x of [-1.2, 0, 1.2]) for (const z of [-0.7, 0.7]) b.cyl(0.1, 0.12, 0.8, 5, 0x5e3a22, x, 0.35, z); b.box(3.4, 1.3, 2.0, 0xf2c62e, 0, 1.15, 0);
    b.box(3.6, 0.15, 2.2, 0xe0b020, 0, 2.45, 0); b.cone(2.2, 1.2, 4, 0x2e7d4f, 0, 2.6, 0, { ry: PI / 4 }); b.cone(0.15, 0.8, 4, GOLD, 0, 3.8, 0); for (const x of [-1.1, 0, 1.1]) b.box(0.5, 0.7, 0.06, 0x7a4a2a, x, 1.1, 1.03); },
  Palangkaraya(b) { plinth(b, 1.6); b.cyl(0.35, 0.4, 4.0, 6, 0x6b4a2c, 0, 0.35, 0);
    b.box(0.9, 0.6, 0.7, RED, 0, 1.2, 0); b.box(0.9, 0.6, 0.7, GOLD, 0, 2.0, 0); b.box(0.9, 0.6, 0.7, 0x1f7a50, 0, 2.8, 0); b.cone(0.55, 0.9, 4, 0x2b2118, 0, 3.5, 0, { ry: PI / 4 }); },
  Banjarmasin(b) { b.cyl(2.3, 2.3, 0.1, 14, 0x58c7e6, 0, 0, 0); b.box(2.8, 0.45, 1.0, 0x8a5a36, 0, 0.1, 0); b.box(2.5, 0.25, 0.9, 0xe0463d, 0, 0.55, 0);
    b.cone(0.9, 0.55, 12, 0xe6c27a, 0.1, 0.8, 0); for (const [x, c] of [[-0.9, 0xf2b632], [0.9, 0x2fae66]]) b.sphere(0.35, c, x, 0.7, 0.1); },
  Samarinda(b) { plinth(b, 2.2); b.box(2.8, 1.3, 2.2, 0xf6f1e4, 0, 0.35, 0); dome(b, 1.2, 0x2e9e8a, 0, 1.4, 0); b.cone(0.1, 0.8, 5, GOLD, 0, 3.1, 0);
    for (const x of [-1.9, 1.9]) { b.cyl(0.22, 0.25, 3.8, 8, W, x, 0.35, 0); b.cone(0.3, 0.6, 8, 0x2e9e8a, x, 4.15, 0); } },
  IKN(b) { plinth(b, 2.2, 0x9ca3af); b.box(2.4, 0.9, 1.6, 0xb18c45, 0, 0.35, 0);
    b.box(0.9, 1.9, 0.6, GOLD, 0, 1.25, 0); b.sphere(0.45, GOLD, 0, 3.1, 0); b.cone(0.18, 0.5, 4, 0xc2410c, 0, 3.75, 0.1, { rx: PI / 2 });
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) b.box(1.5 - i * 0.2, 0.28, 0.12, i % 2 ? RED : GOLD, s * (0.95 + i * 0.1), 1.3 + i * 0.4, 0, { rz: s * (0.5 - i * 0.12) }); },
  Makassar(b) { b.cyl(2.3, 2.3, 0.1, 14, 0x58c7e6, 0, 0, 0); b.box(2.4, 0.6, 0.9, 0x8a5a36, 0, 0.1, 0); b.cone(0.5, 0.9, 4, 0x8a5a36, 1.4, 0.1, 0, { rz: -PI / 2, ry: PI / 4 });
    b.cyl(0.06, 0.08, 3.2, 6, 0x5e3a22, -0.2, 0.6, 0); b.box(0.05, 2.4, 1.5, W, -0.2, 0.9, 0.9, { rx: 0.1 }); b.box(0.05, 1.8, 1.1, 0xf3e7d0, -0.2, 0.9, -0.8); },
  Manado(b) { b.cyl(2.3, 2.3, 0.1, 14, 0x3fc3d6, 0, 0, 0); for (const [x, z, c] of [[-1, 0, 0xff6f91], [0.6, -0.5, 0xffb347], [0.9, 0.7, 0xc86bfa]]) { b.cyl(0.15, 0.2, 1.1, 6, c, x, 0.1, z); b.sphere(0.45, c, x, 1.0, z); }
    b.box(1.1, 0.5, 0.2, 0x2b8cf7, -0.2, 1.8, 0.3); b.cone(0.3, 0.6, 4, 0x2b8cf7, -0.95, 1.8, 0.3, { rz: PI / 2, ry: PI / 4 }); },
  Palu(b) { b.box(5.0, 0.3, 1.0, STONE, 0, 0.2, 0); for (let i = 0; i < 9; i++) { const a = (i / 8) * PI, x = -2.3 + (i / 8) * 4.6, y = 0.3 + Math.sin(a) * 2.4;
    b.box(0.2, 0.25, 0.3, 0xf5cf3d, x, y, 0, { rz: Math.cos(a) * 0.5 }); if (i % 2 === 0) b.box(0.04, Math.max(0.1, y - 0.3), 0.04, 0xd8d8d8, x, 0.3, 0); } },
  Gorontalo(b) { plinth(b, 2.3, 0x9ca3af); b.cyl(1.0, 1.15, 2.4, 10, 0xb7a58a, 0, 0.35, 0); for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; b.box(0.35, 0.35, 0.35, 0xb7a58a, Math.cos(a) * 0.95, 2.75, Math.sin(a) * 0.95); }
    b.box(3.6, 1.0, 0.4, 0xb7a58a, 0, 0.35, 1.3); },
  Kendari(b) { plinth(b, 2.0); for (const [y, r] of [[0.35, 1.1], [1.1, 0.9], [1.85, 0.7]]) { b.cyl(r, r + 0.1, 0.55, 10, W, 0, y, 0); b.cyl(r + 0.1, r + 0.1, 0.1, 10, GOLD, 0, y + 0.55, 0); } b.cone(0.1, 1.0, 5, GOLD, 0, 2.6, 0); },
  Sorong(b) { b.cyl(2.4, 2.4, 0.1, 14, 0x3fc3d6, 0, 0, 0); for (const [x, z, h] of [[-1.0, 0, 2.2], [0.5, -0.5, 1.7], [1.1, 0.6, 1.3]]) { b.cyl(0.55, 0.8, h, 7, 0x8a8f86, x, 0.1, z); b.sphere(0.65, 0x3fae4f, x, h - 0.1, z, { sy: 0.7 }); } },
  Jayapura(b) { plinth(b, 1.8); b.cyl(0.18, 0.22, 2.0, 6, 0x6b4a2c, 0, 0.35, 0); b.sphere(0.5, 0x1e88e5, 0, 2.5, 0, { sx: 1.2 });
    for (const [x, y, c] of [[-0.5, -0.2, RED], [0.1, -0.5, GOLD], [-0.1, -0.7, 0x22c55e], [0.5, -0.1, 0xff7f50]]) b.cone(0.18, 1.4, 4, c, x - 0.3, 2.3 + y, -0.2, { rx: PI + 0.2, ry: PI / 4 }); b.cone(0.18, 0.5, 4, GOLD, 0.6, 2.7, 0, { rz: -PI / 2 }); },
  Manokwari(b) { plinth(b, 2.0); b.cyl(1.2, 1.5, 0.7, 8, 0x8d8f86, 0, 0.35, 0); b.box(0.35, 2.6, 0.35, W, 0, 1.0, 0); b.box(1.5, 0.35, 0.35, W, 0, 2.5, 0); },
  Timika(b) { b.cyl(2.3, 2.5, 0.2, 10, 0x8d8f86, 0, 0, 0); b.cone(1.9, 3.6, 6, 0x7b7f86, 0, 0.2, 0, { ry: 0.3 }); b.cone(0.85, 1.1, 6, 0xf6fbff, 0, 2.7, 0, { ry: 0.3 }); b.cone(0.9, 1.9, 5, 0x6d7178, 1.4, 0.2, 0.5); },
  Merauke(b) { plinth(b, 1.9); b.box(0.9, 3.0, 0.9, W, 0, 0.35, 0); b.box(0.92, 0.7, 0.92, RED, 0, 2.0, 0); b.cone(0.65, 0.9, 4, W, 0, 3.35, 0, { ry: PI / 4 }); b.sphere(0.25, GOLD, 0, 4.3, 0); },
  Surabaya(b) { b.cyl(2.3, 2.5, 0.35, 12, 0x6fb8d9, 0, 0, 0); b.box(1.9, 0.6, 0.6, 0x8c98a6, -0.7, 0.4, 0.2, { rz: 0.45 }); b.cone(0.3, 0.7, 4, 0x6b7785, 0.2, 1.2, 0.2, { rz: -0.6 });
    b.box(2.0, 0.5, 0.55, 0x5f7f3a, 0.7, 0.4, -0.3, { rz: -0.35 }); b.sphere(0.35, 0x5f7f3a, 1.7, 0.9, -0.3); b.box(0.3, 0.3, 0.3, W, 1.9, 1.15, -0.4); },
  Yogyakarta(b) { plinth(b, 2.1); b.box(1.6, 0.5, 1.6, W, 0, 0.35, 0); b.box(0.9, 0.5, 0.9, W, 0, 0.85, 0); b.cyl(0.28, 0.45, 2.2, 8, W, 0, 1.35, 0); b.cone(0.38, 1.1, 8, GOLD, 0, 3.55, 0); b.sphere(0.35, GOLD, 0, 3.4, 0); },
  Bandung(b) { plinth(b, 2.5); b.box(4.0, 1.5, 1.4, 0xf3e3c3, 0, 0.35, 0); b.box(4.1, 0.2, 1.5, 0xc05a3a, 0, 1.85, 0); b.box(1.3, 1.3, 1.0, 0xf3e3c3, 0, 2.05, 0);
    b.cyl(0.08, 0.08, 1.4, 6, 0x6b4a2c, 0, 3.3, 0); for (let i = 0; i < 4; i++) b.sphere(0.2, i % 2 ? 0xc2410c : 0xe0a34a, 0, 3.5 + i * 0.3, 0); },
  Solo(b) { plinth(b, 2.2); b.box(2.6, 1.0, 2.6, 0xf1e6cf, 0, 0.35, 0); b.cone(2.0, 0.9, 4, 0x8a4b2a, 0, 1.35, 0, { ry: PI / 4 }); b.cone(1.2, 0.9, 4, 0x9a5532, 0, 2.1, 0, { ry: PI / 4 }); b.cone(0.18, 0.7, 4, GOLD, 0, 2.95, 0, { ry: PI / 4 });
    for (const [x, z] of [[-1.15, -1.15], [1.15, -1.15], [-1.15, 1.15], [1.15, 1.15]]) b.cyl(0.1, 0.12, 1.1, 6, 0x5e3a22, x, 0.35, z); },
  Jakarta(b) { b.cyl(2.4, 2.5, 0.3, 16, 0xd9d2c0, 0, 0, 0); b.cyl(2.0, 2.0, 0.08, 16, 0x58c7e6, 0, 0.3, 0); b.cyl(0.4, 0.55, 2.8, 8, W, 0, 0.3, 0); b.box(1.1, 0.3, 1.1, STONE, 0, 3.0, 0);
    b.box(0.4, 1.2, 0.3, GOLD, 0, 3.3, 0); b.sphere(0.24, GOLD, 0, 4.5, 0); for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; b.cyl(0.05, 0.06, 1.0, 5, 0xbfeaf7, Math.cos(a) * 1.4, 0.3, Math.sin(a) * 1.4); } },
};

export function hasMonument(name) { return !!M[name]; }
export function monument(b, name) { M[name]?.(b); }
