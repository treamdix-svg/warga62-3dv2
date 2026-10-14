import * as THREE from 'three';
import { world } from '../engine/GameBridge.js';
import { MeshBuilder, vertexMaterial } from '../world/MeshBuilder.js';
import { mulberry32 } from '../world/noise.js';
import { CITY_R, CITY_STEP } from './Scenery3D.js';

const mat = vertexMaterial();
const wheel = (b, x, y, z, r = 0.3) => b.cyl(r, r, 0.22, 10, 0x1f2937, x, y - r, z, { rz: Math.PI / 2 });

function car(b, color) {
  b.box(1.3, 0.55, 2.5, color, 0, 0.3, 0);
  b.box(1.1, 0.5, 1.3, 0xbfe6f5, 0, 0.85, -0.1);
  b.box(1.15, 0.12, 1.4, color, 0, 1.33, -0.1);
  b.box(0.25, 0.14, 0.05, 0xfff2b0, -0.4, 0.5, 1.26); b.box(0.25, 0.14, 0.05, 0xfff2b0, 0.4, 0.5, 1.26);
  for (const [x, z] of [[-0.62, 0.8], [0.62, 0.8], [-0.62, -0.8], [0.62, -0.8]]) wheel(b, x, 0.4, z);
}
function angkot(b, color) {
  b.box(1.5, 0.9, 3.2, color, 0, 0.35, 0);
  b.box(1.4, 0.6, 2.4, 0xbfe6f5, 0, 1.0, -0.2);
  b.box(1.45, 0.22, 3.2, 0xf6c445, 0, 0.62, 0);
  b.box(1.5, 0.14, 2.6, 0xfbfbfb, 0, 1.6, -0.2);
  for (const [x, z] of [[-0.72, 1.0], [0.72, 1.0], [-0.72, -1.0], [0.72, -1.0]]) wheel(b, x, 0.45, z, 0.34);
}
function bus(b, color) {
  b.box(1.7, 1.5, 5.2, color, 0, 0.4, 0);
  b.box(1.72, 0.5, 4.8, 0xbfe6f5, 0, 1.2, 0);
  b.box(1.72, 0.18, 5.2, 0xffffff, 0, 0.75, 0);
  b.box(1.72, 0.3, 0.1, 0xfff2b0, 0, 0.7, 2.62);
  for (const z of [-1.6, 1.6]) for (const x of [-0.82, 0.82]) wheel(b, x, 0.5, z, 0.42);
}
function bajaj(b) {
  b.box(1.1, 0.8, 1.7, 0xf2762e, 0, 0.35, 0);
  b.box(1.1, 0.12, 1.5, 0x2c3a4a, 0, 1.2, -0.1);
  b.box(0.9, 0.5, 0.08, 0xbfe6f5, 0, 0.85, 0.55);
  for (const [x, z] of [[-0.5, -0.6], [0.5, -0.6], [0, 0.8]]) wheel(b, x, 0.3, z, 0.25);
}
function phinisi(b) {
  b.box(2.2, 1.1, 9, 0x8a5a36, 0, -0.1, 0);
  b.cone(1.15, 1.8, 4, 0x8a5a36, 0, -0.1, 4.8, { rx: Math.PI / 2, ry: Math.PI / 4 });
  b.box(2.2, 0.15, 9.2, 0xd9a96a, 0, 1.0, 0);
  b.box(1.6, 1.0, 2.2, 0xf1e6cf, 0, 1.1, -2.8);
  for (const [z, h] of [[-0.5, 7.5], [2.0, 6.5]]) {
    b.cyl(0.1, 0.14, h, 6, 0x5e3a22, 0, 1.0, z);
    b.box(0.06, h * 0.78, 2.4, 0xfffaf0, 0, 1.4, z + 1.4, { rx: 0.12 });
    b.box(0.06, h * 0.55, 1.8, 0xf3e7d0, 0, 1.4, z - 1.2);
  }
  b.box(0.06, 1.6, 2.0, 0xe0463d, 0, 5.2, 5.0, { rx: -0.4 });
}
function fishing(b, color) {
  b.box(1.8, 0.7, 4.2, color, 0, -0.1, 0);
  b.cone(0.9, 1.3, 4, color, 0, -0.1, 2.5, { rx: Math.PI / 2, ry: Math.PI / 4 });
  b.box(1.2, 1.0, 1.4, 0xfff4dc, 0, 0.55, -0.8);
  b.box(1.4, 0.12, 1.6, 0x2563eb, 0, 1.5, -0.8);
  b.cyl(0.05, 0.05, 2.2, 5, 0x5e3a22, 0, 0.6, 1.2);
}

// Dunia hidup: lalu lintas kota, perahu di laut, burung, dan balon udara.
export class Life3D {
  constructor(scene, quality) {
    this.scene = scene; this.quality = quality;
    this.rand = mulberry32(777);
    this.vehicles = []; this.boats = []; this.birds = [];
    this.buildTraffic(scene);
    this.buildBoats(scene);
    if (quality.birds) this.buildBirds(scene);
    this.buildBalloon(scene);
  }

  mk(fn, ...args) { const b = new MeshBuilder(); fn(b, ...args); const m = new THREE.Mesh(b.build(), mat); m.castShadow = true; m.receiveShadow = true; return m; }

  buildTraffic(scene) {
    const r = this.rand, step = CITY_STEP, y = 2.52;
    const colors = [0xe0463d, 0x2a8fd6, 0xf6c445, 0xffffff, 0x2fae66, 0x39434f, 0xf2762e, 0x9b59d0];
    const offsets = [];
    for (let g = -4; g <= 3; g++) offsets.push(g * step + step / 2);
    for (let n = 0; n < this.quality.vehicles; n++) {
      const kind = n % 6 === 5 ? 'bus' : n % 6 === 3 ? 'angkot' : n % 6 === 4 ? 'bajaj' : 'car';
      const mesh = kind === 'bus' ? this.mk(bus, 0xe0463d) : kind === 'angkot' ? this.mk(angkot, 0x2a8fd6) : kind === 'bajaj' ? this.mk(bajaj) : this.mk(car, colors[Math.floor(r() * colors.length)]);
      const off = offsets[Math.floor(r() * offsets.length)];
      const horizontal = r() < 0.5, dir = r() < 0.5 ? 1 : -1;
      const half = Math.sqrt(Math.max(0, (CITY_R - 1.5) ** 2 - off * off));
      if (half < 5) { n--; continue; }
      this.vehicles.push({ mesh, off, horizontal, dir, half, s: (r() * 2 - 1) * half, speed: 2.8 + r() * 2.4, lane: dir * 0.65 });
      scene.add(mesh);
    }
    this.vy = y;
  }

  buildBoats(scene) {
    const defs = [
      { fn: phinisi, ang: 234, sw: 0.5, speed: 0.12, rr: 16 },
      { fn: fishing, color: 0xd9534a, ang: 90, sw: 0.45, speed: 0.17, rr: 14 },
      { fn: fishing, color: 0x2a8fd6, ang: 162, sw: 0.5, speed: 0.15, rr: 17 },
      { fn: fishing, color: 0xf6c445, ang: 306, sw: 0.4, speed: 0.2, rr: 15 },
      { fn: phinisi, ang: 18, sw: 0.4, speed: 0.1, rr: 22 },
    ];
    for (const d of defs) {
      const mesh = this.mk(d.fn, d.color);
      mesh.scale.setScalar(d.fn === phinisi ? 0.95 : 1);
      scene.add(mesh);
      this.boats.push({ mesh, base: d.ang * Math.PI / 180, sw: d.sw, speed: d.speed, rr: d.rr, phase: Math.random() * 6 });
    }
  }

  buildBirds(scene) {
    const wingGeo = new THREE.BoxGeometry(1.4, 0.06, 0.5);
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    for (let i = 0; i < this.quality.birds; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 1.1), m); g.add(body);
      const wl = new THREE.Mesh(wingGeo, m), wr = new THREE.Mesh(wingGeo, m);
      wl.position.x = -0.9; wr.position.x = 0.9;
      const pl = new THREE.Group(), pr = new THREE.Group(); pl.add(wl); pr.add(wr); g.add(pl, pr);
      scene.add(g);
      this.birds.push({ g, pl, pr, a: Math.random() * 6.28, r: 30 + Math.random() * 60, h: 26 + Math.random() * 16, speed: 0.12 + Math.random() * 0.1, phase: Math.random() * 6 });
    }
  }

  buildBalloon(scene) {
    const b = new MeshBuilder();
    const cols = [0xe0463d, 0xffffff, 0xf6c445, 0x2a8fd6];
    for (let i = 0; i < 4; i++) b.sphere(2.4 - Math.abs(i - 1.5) * 0.22, cols[i], 0, 4.4 + i * 0.01, 0, { sy: 1.15, sx: 1, sz: 1 });
    b.sphere(2.7, 0xe0463d, 0, 3.6, 0, { sy: 1.1 });
    b.cone(1.2, 1.6, 8, 0xe0463d, 0, 2.2, 0, { rx: Math.PI });
    b.box(1.1, 0.8, 1.1, 0x8a5a36, 0, 0, 0);
    for (const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) b.cyl(0.03, 0.03, 1.9, 4, 0x39434f, x, 0.8, z);
    this.balloon = new THREE.Mesh(b.build(), mat); this.balloon.castShadow = true;
    this.balloon.scale.setScalar(1.3);
    scene.add(this.balloon);
  }

  update(dt, time) {
    for (const v of this.vehicles) {
      v.s += v.dir * v.speed * dt;
      if (v.s > v.half) { v.s = -v.half; } else if (v.s < -v.half) { v.s = v.half; }
      if (v.horizontal) { v.mesh.position.set(v.s, this.vy, v.off + v.lane); v.mesh.rotation.y = v.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
      else { v.mesh.position.set(v.off + v.lane, this.vy, v.s); v.mesh.rotation.y = v.dir > 0 ? 0 : Math.PI; }
    }
    for (const bt of this.boats) {
      const a = bt.base + Math.sin(time * bt.speed + bt.phase) * bt.sw;
      const coast = world.coastR(a) + bt.rr;
      const nx = Math.cos(a) * coast, nz = Math.sin(a) * coast;
      const da = Math.cos(time * bt.speed + bt.phase);
      bt.mesh.position.set(nx, -0.15 + Math.sin(time * 1.3 + bt.phase) * 0.08, nz);
      const tx = -Math.sin(a) * Math.sign(da || 1), tz = Math.cos(a) * Math.sign(da || 1);
      bt.mesh.rotation.y = Math.atan2(tx, tz);
      bt.mesh.rotation.z = Math.sin(time * 1.1 + bt.phase) * 0.04;
    }
    for (const b of this.birds) {
      b.a += b.speed * dt;
      b.g.position.set(Math.cos(b.a) * b.r, b.h + Math.sin(time + b.phase) * 1.5, Math.sin(b.a) * b.r);
      b.g.rotation.y = -b.a;
      const f = Math.sin(time * 9 + b.phase) * 0.6;
      b.pl.rotation.z = f; b.pr.rotation.z = -f;
    }
    if (this.balloon) {
      const a = time * 0.03;
      this.balloon.position.set(Math.cos(a) * 20 + 4, 28 + Math.sin(time * 0.6) * 1.2, Math.sin(a) * 20 + 6);
      this.balloon.rotation.y = time * 0.05;
    }
  }
}
