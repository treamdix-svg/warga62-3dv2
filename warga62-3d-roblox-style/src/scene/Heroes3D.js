import * as THREE from 'three';
import { world } from '../engine/GameBridge.js';
import { MeshBuilder, vertexMaterial } from '../world/MeshBuilder.js';
import { tex, stdMat } from '../world/Textures.js';
import * as P from '../world/Prefabs.js';

const PI = Math.PI, TAU = Math.PI * 2;
const CREAM = 0xf4efe2, WHITE = 0xfbf8f0, GOLD = 0xf2b632, DARK = 0x2b2f35, GREEN_D = 0x2f8f48, WOOD = 0x8a5a36, WOOD_D = 0x5e3a22, STONE = 0xcfc8b4;

// Lima landmark wilayah: model 3D utuh (geometri + tekstur prosedural + taman), bukan ikon/marker.
// Asal lokal = pusat plaza di permukaan tanah; muka depan menghadap +Z (ke arah jalan).
function shadowed(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
function addMesh(g, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = shadowed(new THREE.Mesh(geo, mat)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); g.add(m); return m;
}
const vmat = vertexMaterial();

function tree(b, x, y, z, s = 1, kind = 0) {
  if (kind === 1) {      // palem
    for (let i = 0; i < 4; i++) b.cyl(0.14 * s, 0.18 * s, 1.0 * s, 6, i % 2 ? 0x9a6f43 : 0x8a6038, x + i * 0.1 * s, y + i * 0.95 * s, z);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; b.cone(0.3 * s, 2.2 * s, 4, i % 2 ? 0x3aa855 : 0x2d9348, x + 0.4 * s + Math.cos(a) * 0.9 * s, y + 3.9 * s, z + Math.sin(a) * 0.9 * s, { rz: Math.cos(a) * 1.2, rx: -Math.sin(a) * 1.2, ry: a }); }
    return;
  }
  b.cyl(0.18 * s, 0.28 * s, 1.9 * s, 6, 0x7a5638, x, y, z);
  b.sphere(1.25 * s, 0x3fae4f, x, y + 1.4 * s, z, { sy: 0.95 });
  b.sphere(0.95 * s, 0x56c35e, x + 0.55 * s, y + 2.3 * s, z + 0.15 * s);
  b.sphere(0.85 * s, 0x2f9a48, x - 0.55 * s, y + 2.2 * s, z - 0.2 * s);
}
function flag(b, x, y, z, h = 6) {
  b.cyl(0.07, 0.09, h, 6, 0xcfd3d8, x, y, z);
  b.box(1.5, 0.45, 0.05, 0xd9322b, x + 0.75, y + h - 0.5, z);
  b.box(1.5, 0.45, 0.05, 0xffffff, x + 0.75, y + h - 0.95, z);
  b.sphere(0.12, GOLD, x, y + h, z);
}
function hedgeRing(b, r, y, from, to, h = 0.7, step = 0.16) {
  for (let a = from; a < to; a += step) b.box(1.15, h, 0.7, 0x2c8f4a, Math.cos(a) * r, y, Math.sin(a) * r, { ry: -a + PI / 2 });
}
function flowers(b, x, y, z, w, d, colors = [0xff6f91, 0xffd23f, 0xffffff, 0xc86bfa]) {
  b.box(w, 0.25, d, 0x5a3d26, x, y, z);
  for (let i = 0; i < Math.max(4, Math.floor(w * d * 1.4)); i++) b.sphere(0.2, colors[i % colors.length], x + (Math.random() - 0.5) * (w - 0.4), y + 0.3, z + (Math.random() - 0.5) * (d - 0.4));
}
function fenceRing(b, r, y, h, gapAngle = PI / 2, gapW = 0.3, posts = 36) {
  for (let i = 0; i < posts; i++) {
    const a = (i / posts) * TAU;
    if (Math.abs(Math.atan2(Math.sin(a - gapAngle), Math.cos(a - gapAngle))) < gapW) continue;
    b.box(0.16, h, 0.16, 0x2f3a44, Math.cos(a) * r, y, Math.sin(a) * r);
    const a2 = ((i + 1) / posts) * TAU;
    if (Math.abs(Math.atan2(Math.sin(a2 - gapAngle), Math.cos(a2 - gapAngle))) < gapW) continue;
    const mx = (Math.cos(a) + Math.cos(a2)) / 2 * r, mz = (Math.sin(a) + Math.sin(a2)) / 2 * r, len = r * 2 * Math.sin(PI / posts);
    b.box(len, 0.1, 0.1, 0x2f3a44, mx, y + h * 0.85, mz, { ry: -(a + a2) / 2 + PI / 2 });
    b.box(len, 0.08, 0.08, 0x2f3a44, mx, y + h * 0.4, mz, { ry: -(a + a2) / 2 + PI / 2 });
  }
}

// ============================================================ JAM GADANG (Sumatra Barat)
function jamGadang() {
  const g = new THREE.Group(), b = new MeshBuilder();
  // Plaza bundar berbatu + lingkaran dalam berpagar besi
  addMesh(g, new THREE.CylinderGeometry(10.4, 10.7, 0.35, 48), stdMat(tex.cobble()), 0, 0.17, 0);
  addMesh(g, new THREE.CylinderGeometry(6.8, 7.0, 0.6, 40), stdMat(tex.stone(), { color: 0xd9d2c0 }), 0, 0.5, 0);
  addMesh(g, new THREE.CylinderGeometry(6.4, 6.4, 0.08, 40), stdMat(tex.lawn(), { color: 0xcfc6a8 }), 0, 0.84, 0);
  fenceRing(b, 6.6, 0.8, 1.2, PI / 2, 0.32, 44);
  // Tangga lengkung ganda + pagar putih
  b.box(8.2, 2.0, 8.2, 0x8b8372, 0, 0.8, 0);
  b.box(8.7, 0.3, 8.7, 0xe9e3d3, 0, 2.8, 0);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 8; i++) b.box(1.5, 0.22, 0.6, 0xe5dfcf, s * (2.7 - i * 0.12), 0.9 + i * 0.22, 4.9 - i * 0.18);
    for (let i = 0; i < 8; i++) { b.box(0.14, 0.9, 0.14, WHITE, s * 3.55, 1.4 + i * 0.22, 4.9 - i * 0.18); }
    b.box(0.2, 0.12, 2.0, WHITE, s * 3.55, 2.55, 4.1, { rx: 0.5 });
  }
  b.box(2.6, 1.7, 0.4, 0x2f2a28, 0, 0.9, 4.15);   // pintu lengkung bawah
  b.cyl(1.3, 1.3, 0.4, 14, 0x2f2a28, 0, 1.7, 4.15, { rx: PI / 2 });
  // Badan menara: 4 tingkat dengan cornice, jendela tinggi, pilaster
  const levels = [[2.8, 9.4, 5.2], [9.4, 14.2, 4.9], [14.2, 18.2, 4.7], [18.2, 22.0, 4.6]];
  levels.forEach(([y0, y1, w], li) => {
    b.box(w, y1 - y0, w, li % 2 ? 0xf2ecdc : WHITE, 0, y0, 0);
    b.box(w + 0.45, 0.4, w + 0.45, 0xe7dfcb, 0, y1 - 0.2, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.35, y1 - y0 - 0.4, 0.35, 0xeee7d4, sx * (w / 2 - 0.05), y0, sz * (w / 2 - 0.05));
    if (li < 3) {
      const n = li === 0 ? 3 : 2;
      for (const face of [0, 1, 2, 3]) {
        b.begin(0, 0, 0, face * (PI / 2));
        for (let i = 0; i < n; i++) {
          const x = (i - (n - 1) / 2) * 1.2;
          for (let f = 0; f < (li === 0 ? 2 : 1); f++) {
            const yy = y0 + 1.2 + f * 3.0;
            b.box(0.62, 2.1, 0.12, 0x2a3a49, x, yy, w / 2 + 0.02);
            b.box(0.8, 0.14, 0.18, WHITE, x, yy + 2.1, w / 2 + 0.05);
            b.box(0.8, 0.12, 0.2, WHITE, x, yy - 0.08, w / 2 + 0.06);
          }
        }
        b.end();
      }
    }
  });
  // Dek atas + rumbai merah-putih
  b.box(6.4, 0.45, 6.4, 0xf0e8d6, 0, 22.0, 0);
  b.box(6.6, 0.8, 0.2, WHITE, 0, 22.45, 3.2); b.box(6.6, 0.8, 0.2, WHITE, 0, 22.45, -3.2); b.box(0.2, 0.8, 6.6, WHITE, 3.2, 22.45, 0); b.box(0.2, 0.8, 6.6, WHITE, -3.2, 22.45, 0);
  // Paviliun atap gonjong Minang
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.28, 1.9, 0.28, 0xb23a2e, sx * 2.0, 22.45, sz * 2.0);
  b.box(4.8, 0.3, 4.8, 0x3a3a40, 0, 24.3, 0);
  b.gable(4.8, 1.2, 5.2, 0x3a3a40, 0, 24.6, 0);
  b.gable(4.8, 1.0, 5.2, 0xb23a2e, 0, 24.45, 0, { ry: PI / 2 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const t = i / 5, hx = sx * (2.1 + t * 1.2), hy = 24.5 + t * 2.4 + t * t * 1.6, hz = sz * (2.1 + t * 1.2);
      b.cone(0.55 - t * 0.42, 1.1, 4, i < 5 ? 0x3a3a40 : 0xb23a2e, hx, hy, hz, { rz: -sx * (0.5 + t * 0.4), rx: sz * (0.5 + t * 0.4), ry: PI / 4 });
    }
  }
  b.cyl(0.08, 0.12, 2.6, 6, GOLD, 0, 25.2, 0); b.sphere(0.28, GOLD, 0, 27.6, 0);
  // Taman: lingkar semak, bunga, pohon, lampu, bendera
  hedgeRing(b, 8.9, 0.35, 0, TAU, 0.8, 0.17);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2; flowers(b, Math.cos(a) * 8.0, 0.35, Math.sin(a) * 8.0, 1.6, 1.0, [0xff6f91, 0xffd23f]); }
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.5; tree(b, Math.cos(a) * 11.8, 0, Math.sin(a) * 11.8, 1.15, i % 2); }
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.52; P.lamp(b, Math.cos(a) * 9.7, Math.sin(a) * 9.7, 3.0); }
  flag(b, -8.2, 0.3, 8.0, 7.5); flag(b, 8.2, 0.3, 8.0, 7.5);
  P.bench(b, -3.5, 9.6, 0); P.bench(b, 3.5, 9.6, 0);
  g.add(shadowed(new THREE.Mesh(b.build(), vmat)));
  // Jam di keempat sisi + rumbai bertekstur
  const clock = stdMat(tex.clockFace(), { roughness: 0.4 });
  [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0]].forEach(([dx, , dz], i) => {
    const m = addMesh(g, new THREE.CircleGeometry(1.55, 32), clock, dx * 2.34, 20.2, dz * 2.34);
    m.rotation.y = Math.atan2(dx, dz);
    addMesh(g, new THREE.TorusGeometry(1.6, 0.14, 8, 32), stdMat(null, { color: 0x30343a }), dx * 2.33, 20.2, dz * 2.33).rotation.y = Math.atan2(dx, dz);
  });
  const bunt = stdMat(tex.bunting(), { side: THREE.DoubleSide, roughness: 0.9 });
  [[0, 3.33, 0], [0, -3.33, PI], [3.33, 0, PI / 2], [-3.33, 0, -PI / 2]].forEach(([x, z, ry]) => {
    const px = x, pz = z, plane = addMesh(g, new THREE.PlaneGeometry(6.6, 0.95), bunt, 0, 22.35, 0);
    plane.position.set(px, 22.35, pz); plane.rotation.y = x === 0 ? (z > 0 ? 0 : PI) : (x > 0 ? PI / 2 : -PI / 2);
  });
  g.userData.labelY = 31;
  return g;
}

// ============================================================ TUGU KHATULISTIWA (Pontianak)
function tuguKhatulistiwa() {
  const g = new THREE.Group(), b = new MeshBuilder();
  const oct = (r, h, mat, y) => { const m = addMesh(g, new THREE.CylinderGeometry(r, r, h, 8), mat, 0, y, 0); m.rotation.y = PI / 8; return m; };
  oct(11.2, 0.3, stdMat(tex.paveTeal()), 0.15);
  const sunMat = stdMat(tex.sun(), { transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 });
  for (let i = 0; i < 4; i++) { const a = PI / 4 + (i * PI) / 2; const m = addMesh(g, new THREE.CircleGeometry(1.7, 24), sunMat, Math.cos(a) * 7.9, 0.33, Math.sin(a) * 7.9); m.rotation.x = -PI / 2; }
  // Garis khatulistiwa melintasi plaza
  b.box(22, 0.05, 0.5, 0xd9322b, 0, 0.3, 0); b.box(22, 0.06, 0.12, 0xffffff, 0, 0.31, 0);
  // Pelataran bertingkat segi delapan
  const steps = [[8.4, 0.45], [7.5, 0.45], [6.6, 0.45]];
  let y = 0.3; steps.forEach(([r, h]) => { const m = addMesh(g, new THREE.CylinderGeometry(r, r + 0.15, h, 8), stdMat(null, { color: 0xeef0f2, flatShading: true }), 0, y + h / 2, 0); m.rotation.y = PI / 8; y += h; });
  // Dinding bata merah + badan paviliun menyerupai limas segi delapan terpancung
  const brick = addMesh(g, new THREE.CylinderGeometry(5.6, 5.8, 1.1, 8), stdMat(tex.brickRed()), 0, y + 0.55, 0); brick.rotation.y = PI / 8; y += 1.1;
  const body = addMesh(g, new THREE.CylinderGeometry(2.6, 5.4, 3.6, 8), stdMat(null, { color: 0xe9ecef, flatShading: true, roughness: 0.55 }), 0, y + 1.8, 0); body.rotation.y = PI / 8;
  for (let i = 0; i < 8; i++) { if (i === 2) continue; const a = (i / 8) * TAU + PI / 8; const m = addMesh(g, new THREE.BoxGeometry(2.2, 1.6, 0.1), stdMat(null, { color: 0xb8c4cc, roughness: 0.2, metalness: 0.2 }), Math.cos(a) * 3.72, y + 1.9, Math.sin(a) * 3.72); m.rotation.y = -a + PI / 2; m.rotation.x = 0.0; }
  // Kanopi bergaris hijau-putih + pintu
  const awn = addMesh(g, new THREE.BoxGeometry(5.2, 0.14, 2.6), stdMat(tex.awning(), { side: THREE.DoubleSide }), 0, y + 1.5, 5.15, 0.42, 0, 0);
  b.box(1.6, 2.0, 0.2, 0x1d3a36, 0, 1.9, 4.75);
  // Tangga + pegangan hijau
  for (let i = 0; i < 5; i++) b.box(4.2, 0.2, 0.7, 0xf1f3f4, 0, 0.3 + i * 0.2, 9.4 - i * 0.55);
  for (const s of [-1, 1]) { b.box(0.1, 0.1, 3.4, 0x2fae66, s * 2.3, 1.4, 8.4, { rx: 0.0 }); for (let i = 0; i < 4; i++) b.box(0.08, 0.7, 0.08, 0x2fae66, s * 2.3, 0.6 + i * 0.2, 9.4 - i * 0.7); }
  // Tugu: empat tiang hitam bertingkat
  const ty = y + 3.6;
  const pill = [[-0.55, -0.35, 11], [0.55, -0.35, 12.5], [-0.35, 0.55, 12], [0.55, 0.55, 10.5]];
  pill.forEach(([x, z, h], i) => { b.box(0.75, h, 0.75, i % 2 ? 0x1c2025 : 0x272c32, x, ty, z); for (let k = 1; k < 4; k++) b.box(0.8, 0.12, 0.8, 0x4a5058, x, ty + (h / 4) * k, z); });
  // Bola dunia (armillary): cincin besar + cincin lintang/bujur + panah meridian
  const ringMat = stdMat(null, { color: 0xd5d9dd, roughness: 0.3, metalness: 0.5 });
  const top = ty + 12.8;
  addMesh(g, new THREE.TorusGeometry(3.4, 0.3, 10, 40), ringMat, 0, top, 0);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; addMesh(g, new THREE.CylinderGeometry(0.2, 0.2, 0.22, 8), stdMat(null, { color: 0x8b9298 }), Math.cos(a) * 3.4, top + Math.sin(a) * 3.4, 0.02).rotation.x = PI / 2; }
  addMesh(g, new THREE.TorusGeometry(2.4, 0.1, 8, 36), ringMat, 0, top, 0, 0, PI / 2, 0);
  addMesh(g, new THREE.TorusGeometry(2.4, 0.1, 8, 36), ringMat, 0, top, 0, PI / 2, 0, 0);
  addMesh(g, new THREE.TorusGeometry(2.4, 0.1, 8, 36), ringMat, 0, top, 0, 0, 0, 0);
  b.box(0.12, 0.12, 8.4, 0xffd24a, 0, top, 0);   // panah sumbu
  b.cone(0.3, 0.9, 6, 0xffd24a, 0, top, 4.6, { rx: PI / 2 });
  b.sphere(0.45, 0x3b82f6, 0, top - 0.45, 0);
  // Taman & dekorasi
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + PI / 8; tree(b, Math.cos(a) * 12.8, 0, Math.sin(a) * 12.8, 1.1, i % 2 === 0 ? 1 : 0); }
  for (let i = 0; i < 4; i++) { const a = PI / 4 + (i * PI) / 2 + PI / 4; flowers(b, Math.cos(a) * 9.6, 0.3, Math.sin(a) * 9.6, 2.4, 1.2); }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; P.lamp(b, Math.cos(a) * 10.2, Math.sin(a) * 10.2, 3.0); }
  flag(b, -9.2, 0.3, 9.2, 7); flag(b, 9.2, 0.3, 9.2, 7);
  P.bench(b, -4.5, 10.4, 0); P.bench(b, 4.5, 10.4, 0);
  g.add(shadowed(new THREE.Mesh(b.build(), vmat)));
  g.userData.labelY = 24;
  return g;
}

// ============================================================ TONGKONAN (Sulawesi Selatan - Toraja)
function saddleRoof(L, W, H0, C, drop, thick) {
  const N = 32, pos = [], uv = [], idx = [], col = [];
  const c1 = new THREE.Color(0xf6894a), c2 = new THREE.Color(0xb8321c), c3 = new THREE.Color(0x3a1a10);
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * 2 - 1, x = u * L, hr = H0 + C * Math.pow(Math.abs(u), 2.1), w = W * (0.9 + 0.12 * Math.abs(u));
    for (let s = 0; s < 3; s++) {     // 0 = eave kiri, 1 = ridge, 2 = eave kanan
      const z = (s - 1) * w, y = s === 1 ? hr : hr - drop;
      pos.push(x, y, z); uv.push(i / N * 3, s === 1 ? 1 : 0);
      const c = s === 1 ? c1 : c2; col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < N; i++) for (let s = 0; s < 2; s++) {
    const a = i * 3 + s, b2 = (i + 1) * 3 + s;
    idx.push(a, b2, a + 1, a + 1, b2, b2 + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  // Sisi bawah (gelap) agar atap tampak tebal
  const under = geo.clone();
  const up = under.attributes.position, uc = under.attributes.color;
  for (let i = 0; i < up.count; i++) { up.setY(i, up.getY(i) - thick); uc.setXYZ(i, c3.r, c3.g, c3.b); }
  return [geo, under];
}

function tongkonanHouse(scale = 1) {
  const g = new THREE.Group(), b = new MeshBuilder();
  const L = 4.2, W = 2.6;
  // Tiang panggung & lantai
  for (const x of [-3.4, -1.1, 1.1, 3.4]) for (const z of [-1.5, 1.5]) b.cyl(0.2, 0.26, 2.0, 8, WOOD_D, x, 0, z);
  b.box(8.4, 0.3, 3.8, 0x6b4426, 0, 2.0, 0);
  // Dinding berukir (panel Toraja di sisi panjang)
  const wallMat = stdMat(tex.toraja(), { roughness: 0.8 });
  addMesh(g, new THREE.BoxGeometry(7.2, 2.2, 0.15), wallMat, 0, 3.4, 1.5);
  addMesh(g, new THREE.BoxGeometry(7.2, 2.2, 0.15), wallMat, 0, 3.4, -1.5);
  addMesh(g, new THREE.BoxGeometry(0.15, 2.2, 3.0), stdMat(tex.carvedSun(), { roughness: 0.8 }), 3.6, 3.4, 0);
  addMesh(g, new THREE.BoxGeometry(0.15, 2.2, 3.0), stdMat(tex.carvedSun(), { roughness: 0.8 }), -3.6, 3.4, 0);
  b.box(7.6, 0.18, 3.4, 0x2a1810, 0, 4.5, 0);
  // Balkon & tangga depan
  b.box(1.6, 0.22, 3.4, 0x7a4e2c, 4.9, 2.0, 0);
  for (let i = 0; i < 6; i++) b.box(1.0, 0.18, 0.15, WOOD, 4.9, 2.05 + i * 0.0, -1.7 + i * 0.68);
  for (const z of [-1.7, 1.7]) for (let i = 0; i < 6; i++) b.box(0.1, 0.9, 0.1, 0x3a2416, 4.2 + i * 0.28, 2.1, z * (i % 2 ? 1 : 1));
  b.box(0.12, 0.12, 3.5, 0x3a2416, 5.6, 2.95, 0);
  for (let i = 0; i < 7; i++) b.box(0.08, 0.8, 0.08, 0x3a2416, 5.6, 2.15, -1.6 + i * 0.53);
  // Tangga batu bata ke tanah
  for (let i = 0; i < 4; i++) b.box(1.6, 0.35, 1.2, 0xcfc8b4, 6.6 + i * 0.0, 0.0 + i * 0.35, -0.0 + 0, { sz: 1 });
  g.add(shadowed(new THREE.Mesh(b.build(), vmat)));
  // Atap pelana raksasa berpunggung melengkung
  const [outer, under] = saddleRoof(L * 1.25, W * 1.2, 5.1, 3.0, 2.1, 0.32);
  const roof = addMesh(g, outer, stdMat(tex.shingle(), { vertexColors: true, side: THREE.DoubleSide, roughness: 0.75 }), 0, 0, 0);
  addMesh(g, under, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.9 }), 0, 0, 0);
  // Papan tepi gelap & hiasan matahari di ujung
  for (const sx of [-1, 1]) {
    const m = addMesh(g, new THREE.PlaneGeometry(3.4, 3.4), stdMat(tex.carvedSun(), { side: THREE.DoubleSide, transparent: false }), sx * L * 1.25 * 0.86, 6.2, 0);
    m.rotation.y = PI / 2;
    m.scale.set(1, 0.75, 1);
  }
  g.scale.setScalar(scale);
  return g;
}

function tongkonan() {
  const g = new THREE.Group(), b = new MeshBuilder();
  addMesh(g, new THREE.CylinderGeometry(10.8, 11.2, 0.5, 40), stdMat(tex.lawn()), 0, 0.25, 0);
  b.cyl(5.0, 5.4, 0.4, 24, 0xcdbfa0, 0, 0.5, 2.5);
  const house = tongkonanHouse(1); house.position.set(0, 0.5, -1.2); g.add(house);
  const barn = tongkonanHouse(0.55); barn.position.set(-8.0, 0.4, 3.2); barn.rotation.y = -PI / 2 + 0.3; g.add(barn);
  // Tiang tanduk kerbau
  b.cyl(0.2, 0.26, 6.2, 8, WOOD_D, 5.6, 0.4, 5.8);
  for (let i = 0; i < 6; i++) { b.cone(0.22, 0.9, 6, 0xf5efe0, 5.35, 1.4 + i * 0.75, 5.8, { rz: 0.9 }); b.cone(0.22, 0.9, 6, 0xf5efe0, 5.85, 1.4 + i * 0.75, 5.8, { rz: -0.9 }); }
  // Taman batu, pohon, gazebo kecil, semak
  for (const [x, z, s, c] of [[-7.4, -6.5, 1.0, 0x9a9690], [7.2, -5.5, 1.4, 0x8a867f], [-8.8, -2.0, 0.8, 0xa5a199]]) b.add(new THREE.DodecahedronGeometry(1, 0), c, x, 0.9, z, { sy: 0.7, sx: s * 1.2, sz: s });
  tree(b, -9.6, 0.4, -7.5, 1.3); tree(b, 9.0, 0.4, -7.4, 1.5); tree(b, 9.8, 0.4, 2.0, 1.1, 1); tree(b, -11.4, 0.4, 0.4, 1.2, 1); tree(b, 4.2, 0.4, -9.4, 1.2);
  b.begin(7.6, 0.4, 5.4, 0); for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) b.cyl(0.1, 0.12, 1.8, 6, WOOD_D, x, 0, z); b.cone(1.9, 1.2, 4, 0x3a3a40, 0, 1.8, 0, { ry: PI / 4 }); b.end();
  for (const [x, z] of [[-4.2, 8.4], [-2.2, 9.0], [4.4, 8.6]]) flowers(b, x, 0.4, z, 1.8, 1.0, [0xff7a3d, 0xffd23f, 0xffffff]);
  flag(b, -9.4, 0.4, 7.4, 6.5); P.lamp(b, 3.8, 9.4, 3.0); P.lamp(b, -3.8, 9.4, 3.0);
  g.add(shadowed(new THREE.Mesh(b.build(), vmat)));
  g.userData.labelY = 16;
  return g;
}

// ============================================================ HONAI (Papua)
function honaiHut(r, h, roofH, doorFront = true) {
  const g = new THREE.Group(), b = new MeshBuilder();
  const walls = addMesh(g, new THREE.CylinderGeometry(r * 0.97, r * 1.03, h, 20, 1, true), stdMat(tex.planks(), { side: THREE.DoubleSide }), 0, h / 2, 0);
  walls.material.map.repeat.set(5, 1);
  // Atap jerami tebal: profil cembung (lathe) dengan tepi menjuntai
  const pts = [new THREE.Vector2(r * 1.32, h - 0.2), new THREE.Vector2(r * 1.36, h + 0.05)];
  for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(r * 1.34 * Math.pow(1 - t, 1.18), h + 0.05 + t * roofH + Math.sin(t * PI) * 0.12)); }
  const roof = addMesh(g, new THREE.LatheGeometry(pts, 28), stdMat(tex.thatch(), { side: THREE.DoubleSide, roughness: 1 }), 0, 0, 0);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; b.cyl(0.05, 0.05, 0.9, 5, 0xb98c4a, Math.cos(a) * r * 1.34 * 0.9, h - 0.65, Math.sin(a) * r * 1.34 * 0.9); }
  b.sphere(0.28, 0xc99a55, 0, h + roofH, 0);
  // Pintu lengkung batu
  if (doorFront) {
    b.box(r * 0.55, h * 0.62, 0.22, 0x1f1812, 0, 0, r * 0.99);
    for (let i = 0; i < 7; i++) { const a = (i / 6) * PI; b.box(0.2, 0.3, 0.3, 0x8f969b, Math.cos(a) * r * 0.31, h * 0.62 + Math.sin(a) * 0.3 - 0.1, r * 1.0, { rz: a }); }
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) b.box(0.22, 0.32, 0.3, 0x8f969b, s * r * 0.31, i * 0.34, r * 1.0);
  }
  g.add(shadowed(new THREE.Mesh(b.build(), vmat)));
  return g;
}

function honai() {
  const g = new THREE.Group(), b = new MeshBuilder();
  addMesh(g, new THREE.CylinderGeometry(10.8, 11.2, 0.5, 40), stdMat(tex.lawn(), { color: 0xb8dca0 }), 0, 0.25, 0);
  addMesh(g, new THREE.CylinderGeometry(7.4, 7.6, 0.3, 32), stdMat(tex.cobble(), { color: 0xc9a67a }), 0, 0.5, 0);
  const main = honaiHut(3.0, 2.7, 4.3); main.position.set(0, 0.6, -1.5); main.scale.setScalar(1.2); g.add(main);
  const side = honaiHut(1.9, 1.9, 3.0); side.position.set(-6.2, 0.6, 0.8); side.rotation.y = 0.5; g.add(side);
  const side2 = honaiHut(1.7, 1.7, 2.7); side2.position.set(6.0, 0.6, -0.4); side2.rotation.y = -0.6; g.add(side2);
  const small = honaiHut(1.4, 1.5, 2.3); small.position.set(2.8, 0.6, -8.0); small.rotation.y = PI + 0.3; g.add(small);
  // Menara pandang kayu + tangga
  b.begin(5.0, 0.6, -6.4, 0.4);
  for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) b.cyl(0.14, 0.18, 4.6, 6, WOOD_D, x, 0, z);
  b.box(2.4, 0.2, 2.4, WOOD, 0, 4.6, 0);
  for (const [x, z, w, d] of [[0, -1.1, 2.4, 0.1], [0, 1.1, 2.4, 0.1], [-1.1, 0, 0.1, 2.2], [1.1, 0, 0.1, 2.2]]) b.box(w, 0.7, d, WOOD_D, x, 4.8, z);
  b.cone(1.9, 1.3, 8, 0xd4ab62, 0, 5.6, 0);
  for (let i = 0; i < 9; i++) b.box(0.9, 0.1, 0.1, WOOD, 1.3, 0.3 + i * 0.5, 0.4, { rx: 0, rz: 0 });
  b.box(0.08, 4.6, 0.08, WOOD_D, 0.9, 0, 0.4); b.box(0.08, 4.6, 0.08, WOOD_D, 1.7, 0, 0.4);
  b.end();
  // Pagar kayu melengkung di depan + kebun ubi
  for (let i = 0; i < 18; i++) { const a = PI * (0.1 + i * 0.045); b.cyl(0.08, 0.1, 1.1, 6, WOOD_D, Math.cos(a) * 8.4, 0.5, Math.sin(a) * 8.4 - 0.5); if (i < 17) { const a2 = PI * (0.1 + (i + 1) * 0.045); b.box(1.1, 0.08, 0.08, WOOD, (Math.cos(a) + Math.cos(a2)) / 2 * 8.4, 1.1, (Math.sin(a) + Math.sin(a2)) / 2 * 8.4 - 0.5, { ry: -(a + a2) / 2 + PI / 2 }); } }
  for (let r2 = 0; r2 < 3; r2++) for (let i = 0; i < 7; i++) { b.cone(0.45, 0.4, 6, 0x6b4a2c, -8.4 + i * 1.1, 0.5, -6.8 - r2 * 1.1); b.sphere(0.22, 0x3fae4f, -8.4 + i * 1.1, 0.8, -6.8 - r2 * 1.1); }
  // Tiang totem + burung cendrawasih
  b.cyl(0.24, 0.3, 4.2, 8, WOOD_D, 8.2, 0.5, 4.8);
  b.box(0.7, 0.5, 0.5, 0xd9322b, 8.2, 3.0, 4.8); b.box(0.7, 0.5, 0.5, 0xf5c542, 8.2, 3.6, 4.8);
  b.sphere(0.34, 0x1e88e5, 8.2, 4.9, 4.8, { sx: 1.2 });
  for (const [dx, dy, c] of [[-0.5, -0.1, 0xd9322b], [-0.9, -0.6, 0xf5c542], [-0.4, -1.1, 0x22c55e]]) b.cone(0.13, 1.4, 4, c, 8.2 + dx, 4.9 + dy, 4.8, { rz: 1.2 });
  // Batu api unggun
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; b.add(new THREE.DodecahedronGeometry(0.3, 0), 0x6f6c66, -2.6 + Math.cos(a) * 0.8, 0.75, 5.0 + Math.sin(a) * 0.8); }
  b.cone(0.35, 0.8, 5, 0xff8a1f, -2.6, 0.7, 5.0); b.cone(0.2, 0.6, 5, 0xffd23f, -2.6, 0.7, 5.0);
  for (const [x, z, s] of [[-10.2, -4.5, 1.2], [10.0, -3.5, 1.3], [-9.0, 7.0, 1.0], [9.6, 8.2, 1.1]]) tree(b, x, 0.4, z, s, 1);
  for (const [x, z, sc] of [[-6.8, -8.2, 1.3], [10.4, 3.2, 1.0]]) b.add(new THREE.DodecahedronGeometry(1, 0), 0x8f8c86, x, 0.9, z, { sx: sc * 1.2, sy: sc * 0.7, sz: sc });
  flowers(b, -3.8, 0.5, 9.3, 1.8, 1.0, [0xff7a3d, 0xff6f91]); flowers(b, 3.8, 0.5, 9.3, 1.8, 1.0, [0xffd23f, 0xffffff]);
  g.add(shadowed(new THREE.Mesh(b.build(), vmat)));
  g.userData.labelY = 14;
  return g;
}

// ============================================================ MONAS (Jakarta / Jawa)
function monas() {
  const g = new THREE.Group(), b = new MeshBuilder();
  // Alas taman persegi: jalan keliling, rumput berpetak, jalur batu menyilang
  b.box(25, 0.3, 25, 0x4b5560, 0, 0, 0);
  addMesh(g, new THREE.BoxGeometry(22.6, 0.12, 22.6), stdMat(tex.lawn(), { color: 0xe8f5d8 }), 0, 0.36, 0);
  addMesh(g, new THREE.BoxGeometry(22.6, 0.16, 3.4), stdMat(tex.stone(), { color: 0xe5dfd0 }), 0, 0.4, 0);
  addMesh(g, new THREE.BoxGeometry(3.4, 0.16, 22.6), stdMat(tex.stone(), { color: 0xe5dfd0 }), 0, 0.4, 0);
  addMesh(g, new THREE.BoxGeometry(12.6, 0.2, 12.6), stdMat(tex.stone(), { color: 0xf2ecdd }), 0, 0.42, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.box(9.2, 0.7, 0.8, 0x2c8f4a, sx * 6.2, 0.4, sz * 3.2); b.box(0.8, 0.7, 9.2, 0x2c8f4a, sz * 3.2, 0.4, sx * 6.2);
    b.cyl(1.5, 1.6, 0.4, 14, 0xd9d2c0, sx * 8.4, 0.45, sz * 8.4); b.cyl(1.2, 1.2, 0.1, 14, 0x58c7e6, sx * 8.4, 0.8, sz * 8.4);
    tree(b, sx * 9.6, 0.4, sz * 5.6, 1.35); P.lamp(b, sx * 5.1, sz * 5.1, 3.2);
  }
  // Podium bertingkat + pelataran + tangga
  b.box(12.2, 0.5, 12.2, 0xe9e2d1, 0, 0.5, 0);
  b.box(10.4, 0.5, 10.4, 0xf3eddf, 0, 1.0, 0);
  for (let i = 0; i < 7; i++) b.box(5.2, 0.22, 0.7, 0xf6f1e6, 0, 0.62 + i * 0.22, 6.7 - i * 0.5);
  b.box(8.2, 3.2, 8.2, 0xf6f2e8, 0, 1.5, 0);
  for (const face of [0, 1, 2, 3]) { b.begin(0, 0, 0, face * (PI / 2)); for (const x of [-2.6, 0, 2.6]) { b.box(1.3, 2.1, 0.2, 0x2f3a44, x, 1.8, 4.12); b.cyl(0.65, 0.65, 0.2, 12, 0x2f3a44, x, 3.9, 4.12, { rx: PI / 2 }); } b.end(); }
  b.box(9.0, 0.45, 9.0, 0xe4dccb, 0, 4.7, 0);
  // Tugu obelisk
  addMesh(g, new THREE.CylinderGeometry(0.5, 1.55, 21, 4), stdMat(null, { color: 0xf7f3ea, roughness: 0.45, flatShading: true }), 0, 5.15 + 10.5, 0).rotation.y = PI / 4;
  for (let i = 0; i < 6; i++) b.box(0.5 + (5 - i) * 0.16, 0.12, 0.5 + (5 - i) * 0.16, 0xdcd3bf, 0, 8 + i * 3.1, 0, { ry: PI / 4, sx: 1.0 });
  // Pelataran cawan
  addMesh(g, new THREE.ConeGeometry(3.4, 1.7, 4), stdMat(null, { color: 0xeee8d8, flatShading: true }), 0, 16.05, 0, PI, PI / 4, 0);
  b.box(6.6, 0.45, 6.6, 0xf6f1e6, 0, 16.9, 0);
  for (let i = -3; i <= 3; i++) for (const s of [-1, 1]) { b.box(0.12, 0.8, 0.12, 0xdcd3bf, i * 1.0, 17.35, s * 3.2); b.box(0.12, 0.8, 0.12, 0xdcd3bf, s * 3.2, 17.35, i * 1.0); }
  b.box(6.6, 0.1, 0.12, 0xdcd3bf, 0, 18.1, 3.2); b.box(6.6, 0.1, 0.12, 0xdcd3bf, 0, 18.1, -3.2); b.box(0.12, 0.1, 6.6, 0xdcd3bf, 3.2, 18.1, 0); b.box(0.12, 0.1, 6.6, 0xdcd3bf, -3.2, 18.1, 0);
  b.box(2.2, 0.45, 2.2, 0xe4dccb, 0, 26.1, 0);
  // Lidah api emas
  const flame = [new THREE.Vector2(0.01, 0), new THREE.Vector2(1.15, 0.2), new THREE.Vector2(1.2, 0.55), new THREE.Vector2(0.95, 1.4), new THREE.Vector2(0.7, 2.3), new THREE.Vector2(0.36, 3.2), new THREE.Vector2(0.12, 4.0), new THREE.Vector2(0.01, 4.5)];
  const fm = addMesh(g, new THREE.LatheGeometry(flame, 16), new THREE.MeshStandardMaterial({ color: 0xffc628, emissive: 0xffa800, emissiveIntensity: 0.55, metalness: 0.6, roughness: 0.28 }), 0, 26.5, 0);
  g.userData.flame = fm;
  g.add(shadowed(new THREE.Mesh(b.build(), vmat)));
  flag(b, 0, 0, 0, 0);
  g.userData.labelY = 36;
  return g;
}

const BUILDERS = [jamGadang, tuguKhatulistiwa, tongkonan, honai, monas];

export class Heroes3D {
  constructor(scene) {
    this.group = new THREE.Group(); scene.add(this.group);
    this.items = [];
    world.heroes.forEach((h) => {
      const m = BUILDERS[h.k]();
      m.position.set(h.x, h.y, h.z);
      m.rotation.y = h.rotationY;
      this.group.add(m);
      h.labelY = m.userData.labelY;
      this.items.push(m);
    });
  }
  update(time) {
    const f = this.items[4]?.userData.flame;
    if (f) { f.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.12; f.scale.y = 1 + Math.sin(time * 5) * 0.03; }
  }
}
