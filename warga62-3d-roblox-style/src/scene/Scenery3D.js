import * as THREE from 'three';
import { MeshBuilder, vertexMaterial } from '../world/MeshBuilder.js';
import { mulberry32 } from '../world/noise.js';
import { engine } from '../engine/GameBridge.js';
import * as P from '../world/Prefabs.js';
import { buildCity, buildKampung } from '../world/Cities.js';

const TAU = Math.PI * 2;
export const CITY_R = 28;
export const CITY_STEP = 7.6;
const CITY_C = { x: 4.5, z: 5.5 };
const STADIUM = { x: 17.5, z: -8.5 };

// Kota, desa adat lima wilayah, dan alam (instancing). Semuanya statis -> sangat sedikit draw call.
export class Scenery3D {
  constructor(scene, world, quality) {
    this.scene = scene; this.world = world; this.quality = quality;
    this.rand = mulberry32(2026);
    this.occupied = [];             // lingkaran terpakai: {x,z,r}
    this.group = new THREE.Group();
    scene.add(this.group);
    // Reservasi lot & petak.
    for (const lot of world.lots) this.occupied.push({ x: lot.x, z: lot.z, r: world.tiles[lot.index].corner ? 11 : 6.2 });
    for (const h of world.heroes) this.occupied.push({ x: h.x, z: h.z, r: 13.5 });
    // Cadangkan plat klaster kota (6.8 x 9) di sisi luar jalan: tiga lingkaran sepanjang kedalaman plat.
    for (const pl of world.plates) for (const off of [-3.0, 0, 3.0]) this.occupied.push({ x: pl.x + pl.nx * off, z: pl.z + pl.nz * off, r: 4.4 });
    this.buildCity();
    this.buildCityClusters();
    this.buildNature();
  }

  free(x, z, r = 2) {
    for (const o of this.occupied) { const dx = x - o.x, dz = z - o.z, rr = o.r + r; if (dx * dx + dz * dz < rr * rr) return false; }
    return true;
  }
  mesh(builder, { shadow = true } = {}) {
    const m = new THREE.Mesh(builder.build(), vertexMaterial());
    m.castShadow = shadow; m.receiveShadow = true;
    this.group.add(m);
    return m;
  }
  groundY(x, z) { return this.world.heightAt(x, z); }

  // ------------------------------------------------------------------ KOTA
  buildCity() {
    const w = this.world, b = new MeshBuilder(), r = this.rand;
    const gy = (x, z) => this.groundY(x, z);
    // Alas kota (paving) + jalan kota
    const baseY = 2.5;
    b.cyl(CITY_R + 1, CITY_R + 1.6, 0.35, 32, 0xcdd4c8, 0, baseY - 0.34, 0);
    // Jalan kota (grid)
    const step = CITY_STEP;
    const roadCol = 0x6b7480;
    for (let g = -4; g <= 3; g++) {
      const off = g * step + step / 2;
      for (const horizontal of [true, false]) {
        const half = Math.sqrt(Math.max(0, (CITY_R - 0.6) ** 2 - off * off));
        if (half < 3) continue;
        if (horizontal) { b.box(half * 2, 0.1, 2.5, roadCol, 0, baseY - 0.02, off); b.box(half * 2, 0.02, 0.1, 0xf4d34a, 0, baseY + 0.07, off); }
        else { b.box(2.5, 0.1, half * 2, roadCol, off, baseY - 0.02, 0); b.box(0.1, 0.02, half * 2, 0xf4d34a, off, baseY + 0.07, 0); }
      }
    }
    // Monas dan plaza
    b.begin(CITY_C.x, baseY, CITY_C.z, 0); P.bundaran(b); b.end();
    this.occupied.push({ x: CITY_C.x, z: CITY_C.z, r: 9 });
    b.begin(STADIUM.x, baseY, STADIUM.z, 0.3); P.stadium(b); b.end();
    this.occupied.push({ x: STADIUM.x, z: STADIUM.z, r: 8 });
    // Bangunan per sel grid
    let count = 0, mosque = false;
    const cells = [];
    for (let gx = -4; gx <= 4; gx++) for (let gz = -4; gz <= 4; gz++) cells.push([gx * step, gz * step]);
    cells.sort(() => r() - 0.5);
    for (const [cx, cz] of cells) {
      const d0 = Math.hypot(cx, cz);
      if (d0 > CITY_R - 3.4) continue;
      if (Math.hypot(cx - CITY_C.x, cz - CITY_C.z) < 11.5) continue;
      if (Math.hypot(cx - STADIUM.x, cz - STADIUM.z) < 10.5) continue;
      if (w.lakeDist(cx, cz) < w.lake.r + 4.5) continue;
      const ri = w.riverInfo(cx, cz); if (ri.d < ri.hw + 4.5) continue;
      const rot = Math.floor(r() * 4) * (Math.PI / 2);
      const dc = Math.hypot(cx - CITY_C.x, cz - CITY_C.z);
      b.box(7.0, 0.16, 7.0, 0xdcd6c6, cx, baseY - 0.02, cz);
      if (r() < 0.7) { b.cyl(0.1, 0.14, 1.0, 5, 0x7a5638, cx + 3.1, baseY, cz + 3.1); b.sphere(0.7, 0x4cb85a, cx + 3.1, baseY + 0.9, cz + 3.1); }
      b.begin(cx, baseY + 0.12, cz, rot);
      const pick = r();
      if (!mosque && d0 > 12 && count > 4) { P.masjid(b); mosque = true; this.occupied.push({ x: cx, z: cz, r: 5.5 }); }
      else if (dc < 20 && pick < 0.45) { P.tower(b, { floors: 8 + Math.floor(r() * 9), color: [0xdfe9f1, 0xe8e2d4, 0xd5e4ea][Math.floor(r() * 3)] }); this.occupied.push({ x: cx, z: cz, r: 3.8 }); }
      else if (pick < 0.62) { P.apartment(b, { wall: P.WALLS[Math.floor(r() * P.WALLS.length)], floors: 4 + Math.floor(r() * 4) }); this.occupied.push({ x: cx, z: cz, r: 4.2 }); }
      else if (pick < 0.88) { P.ruko(b, { floors: 2 + Math.floor(r() * 2), wall: P.WALLS[Math.floor(r() * P.WALLS.length)], roof: P.ROOFS[Math.floor(r() * P.ROOFS.length)], awning: [0xe0463d, 0x2a8fd6, 0x2fae66, 0xf2a21c][Math.floor(r() * 4)] }); this.occupied.push({ x: cx, z: cz, r: 3.6 }); }
      else { P.house(b, { wall: P.WALLS[Math.floor(r() * P.WALLS.length)], roof: P.ROOFS[Math.floor(r() * P.ROOFS.length)] }); this.occupied.push({ x: cx, z: cz, r: 3 }); }
      b.end(); count++;
    }
    // Lampu kota & bangku
    for (let g = -4; g <= 3; g++) {
      const off = g * step + step / 2;
      for (let t = -CITY_R + 3; t < CITY_R - 3; t += 7.6) {
        for (const [x, z] of [[t, off + 1.6], [off + 1.6, t]]) if (Math.hypot(x, z) < CITY_R - 1.5 && this.free(x, z, 0.1) && w.lakeDist(x, z) > w.lake.r + 2) { b.begin(0, baseY, 0, 0); P.lamp(b, x, z); b.end(); }
      }
    }
    // Taman dengan air mancur
    const park = { x: -9, z: 13 };
    if (Math.hypot(park.x, park.z) < CITY_R - 5 && w.lakeDist(park.x, park.z) > w.lake.r + 5) {
      b.begin(park.x, baseY, park.z, 0); P.fountain(b, 2.2); b.end();
      this.occupied.push({ x: park.x, z: park.z, r: 3 });
    }
    this.mesh(b);
    this.cityMeshReady = true;
  }

  // ------------------------------------------------------------------ KLASTER KOTA & KAMPUNG
  // Tiap petak non-sudut punya plat miniatur di sisi luar yang menempel pada petaknya:
  // petak kota = landmark khas kota; petak Takdir/Musibah/Tol/Tilang = kampung rumah adat pulau tsb.
  buildCityClusters() {
    const perIsland = [0, 1, 2, 3, 4].map(() => new MeshBuilder());
    for (const pl of this.world.plates) {
      const island = this.world.tiles[pl.i].island, b = perIsland[island];
      b.begin(pl.x, pl.y, pl.z, pl.ry);
      if (engine.tiles[pl.i][1] === 'asset') buildCity(b, engine.tiles[pl.i][0], island); else buildKampung(b, island);
      b.end();
    }
    perIsland.forEach((b) => this.mesh(b));
  }

  // ------------------------------------------------------------------ ALAM
  buildNature() {
    const w = this.world, q = this.quality, r = this.rand, hi = q.lod === 1;
    // Geometri pohon (vertex-color). Profil hemat (HP) memakai bentuk lebih sederhana.
    const mk = (fn) => { const b = new MeshBuilder(); fn(b); return b.build(); };
    const sp = (b, rad, c, x, y, z, o) => (hi ? b.sphere(rad, c, x, y, z, o) : b.add(new THREE.IcosahedronGeometry(rad, 0), c, x, y + rad, z, o));
    const broadleaf = mk((b) => {
      b.cyl(0.18, 0.28, 1.9, hi ? 6 : 4, 0x7a5638, 0, 0, 0);
      sp(b, 1.25, 0x3fae4f, 0, 1.4, 0, { sy: 0.95 });
      sp(b, 0.95, 0x56c35e, 0.55, 2.3, 0.15);
      if (hi) sp(b, 0.85, 0x2f9a48, -0.55, 2.2, -0.2);
    });
    const pine = mk((b) => {
      b.cyl(0.14, 0.22, 1.2, hi ? 6 : 4, 0x6e4a2e, 0, 0, 0);
      b.cone(1.35, 1.9, hi ? 7 : 5, 0x2f7d4f, 0, 0.9, 0);
      b.cone(1.05, 1.7, hi ? 7 : 5, 0x3c9a5f, 0, 1.9, 0);
      if (hi) b.cone(0.7, 1.5, 7, 0x4bb36f, 0, 2.9, 0);
    });
    const palm = mk((b) => {
      const segs = hi ? 5 : 3;
      for (let i = 0; i < segs; i++) b.cyl(0.13 - i * 0.012, 0.17 - i * 0.012, hi ? 0.9 : 1.5, hi ? 6 : 4, i % 2 ? 0x9a6f43 : 0x8a6038, i * 0.12, i * (hi ? 0.88 : 1.45), 0, { rz: -0.1 });
      const top = segs * (hi ? 0.88 : 1.45);
      for (let i = 0; i < (hi ? 7 : 5); i++) { const n = hi ? 7 : 5, a = (i / n) * TAU; b.cone(0.3, 2.2, 4, i % 2 ? 0x3aa855 : 0x2d9348, 0.5 + Math.cos(a) * 0.95, top - 0.4, Math.sin(a) * 0.95, { rz: Math.cos(a) * 1.25, rx: -Math.sin(a) * 1.25, ry: a }); }
    });
    const bush = mk((b) => { sp(b, 0.8, 0x3e9e4e, 0, 0, 0, { sy: 0.7 }); if (hi) { sp(b, 0.6, 0x52b85d, 0.6, 0, 0.2, { sy: 0.7 }); b.sphere(0.35, 0xe85d8a, 0.5, 0.55, 0.5); b.sphere(0.3, 0xffd24a, -0.3, 0.6, 0.4); } });
    const rock = mk((b) => { b.add(new THREE.DodecahedronGeometry(1, 0), 0x9a9690, 0, 0.6, 0, { sy: 0.7, sx: 1.2 }); if (hi) b.add(new THREE.DodecahedronGeometry(0.6, 0), 0x84807a, 1.0, 0.3, 0.3); });
    const geos = { broadleaf, pine, palm, bush, rock };
    const spots = { broadleaf: [], pine: [], palm: [], bush: [], rock: [] };
    const obj = new THREE.Object3D();
    const put = (type, x, y, z, s, tint = 0) => {
      if (spots[type].length >= { broadleaf: q.trees, pine: q.trees * 0.5, palm: q.trees * 0.3, bush: q.trees * 0.4, rock: q.rocks }[type]) return;
      obj.position.set(x, y - 0.12 - Math.min(1.6, (this.slope || 0) * 1.3 * s), z); obj.rotation.set(0, r() * TAU, 0); obj.scale.setScalar(s); obj.updateMatrix();
      spots[type].push({ m: obj.matrix.clone(), x, z, tint });
    };
    const tries = (q.trees + q.rocks) * 14;
    for (let i = 0; i < tries; i++) {
      const rad = 16 + Math.sqrt(r()) * 100, ang = r() * TAU;
      const x = Math.cos(ang) * rad, z = Math.sin(ang) * rad;
      if (Math.hypot(x - CITY_C.x, z - CITY_C.z) < CITY_R + 1 && rad < 34) continue;      // area kota
      const h = this.groundY(x, z);
      if (h < 0.55) continue;
      const nr = w.nearestRoad(x, z);
      if (nr.d < 6.5) continue;
      if (!this.free(x, z, 1.6) || w.isWater(x, z)) continue;
      const hx = this.groundY(x + 1.6, z) - h, hz = this.groundY(x, z + 1.6) - h;
      const slope = Math.hypot(hx, hz) / 1.6; this.slope = slope;
      const region = w.regionOf(x, z);
      const tint = r() - 0.5, s = 0.8 + r() * 0.8, coastal = h < 1.9 && Math.hypot(x, z) > 90, roll = r();
      if (h > 19 || slope > 1.1) { if (r() < 0.25) put('rock', x, h, z, 0.8 + r() * 1.4); continue; }
      if (coastal) { if (r() < 0.8) put('palm', x, h, z, s); continue; }
      if (h > 9) { put(roll < 0.75 ? 'pine' : 'rock', x, h, z, s * (roll < 0.75 ? 1 : 1.2), tint); continue; }
      const dense = [0.9, 1.25, 0.7, 0.85, 0.75][region];
      if (r() > dense) { if (roll < 0.1) put('rock', x, h, z, 0.5 + r() * 0.8); continue; }
      if (region === 2 || region === 4) { if (roll < 0.35) put('palm', x, h, z, s, tint); else if (roll < 0.8) put('broadleaf', x, h, z, s, tint); else put('bush', x, h, z, s); }
      else if (region === 3) { if (roll < 0.55) put('pine', x, h, z, s, tint); else if (roll < 0.8) put('broadleaf', x, h, z, s, tint); else put('bush', x, h, z, s); }
      else { if (roll < 0.72) put('broadleaf', x, h, z, s * (region === 1 ? 1.15 : 1), tint); else if (roll < 0.88) put('pine', x, h, z, s, tint); else put('bush', x, h, z, s); }
      this.occupied.push({ x, z, r: 0.5 });
    }
    // Potong per area (grid 44) supaya frustum culling & bayangan hanya memproses yang dekat kamera.
    const CELL = 44, color = new THREE.Color(), mat = vertexMaterial();
    for (const type of Object.keys(spots)) {
      const chunks = new Map();
      for (const sp2 of spots[type]) { const key = Math.floor(sp2.x / CELL) + ',' + Math.floor(sp2.z / CELL); (chunks.get(key) || chunks.set(key, []).get(key)).push(sp2); }
      for (const list of chunks.values()) {
        const mesh = new THREE.InstancedMesh(geos[type], mat, list.length);
        list.forEach((sp2, i) => { mesh.setMatrixAt(i, sp2.m); mesh.setColorAt(i, color.setRGB(1 - sp2.tint * 0.15, 1 + sp2.tint * 0.08, 1 - sp2.tint * 0.15)); });
        mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.castShadow = q.treeShadow || type === 'rock' && false; mesh.receiveShadow = true;
        mesh.computeBoundingSphere();
        this.group.add(mesh);
      }
    }
    this.sets = spots;
  }
}
