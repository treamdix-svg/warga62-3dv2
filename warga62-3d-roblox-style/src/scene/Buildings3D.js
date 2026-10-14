import * as THREE from 'three';
import { engine, world, playerColorOf } from '../engine/GameBridge.js';
import { MeshBuilder, vertexMaterial } from '../world/MeshBuilder.js';
import * as P from '../world/Prefabs.js';
import { tileColorHex } from './tileStyle.js';

const mat = vertexMaterial();
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

// Properti: tanah kosong (lahan + patok) -> Subsidi 1 (rumah kecil) -> Subsidi 2 (rumah bertingkat) -> OKB (villa).
// Level & pemilik dibaca langsung dari state engine; setiap perubahan tampil dengan animasi "muncul".
export class Buildings3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group(); scene.add(this.group);
    this.lots = {};
    this.islandHex = {};
    this.pop = [];
    this.onBuilt = null;
    for (let i = 0; i < 45; i++) {
      if (engine.tiles[i][1] !== 'asset') continue;
      const lot = world.lots[i];
      const g = new THREE.Group();
      g.position.set(lot.x, lot.y, lot.z); g.rotation.y = lot.rotationY;
      this.group.add(g);
      this.lots[i] = { g, key: null, mesh: null };
      this.islandHex[i] = new THREE.Color(tileColorHex(i)).getHex();
    }
  }

  build(owner, level, road, islandHex = 0xffffff) {
    const b = new MeshBuilder();
    const color = owner === undefined ? null : (owner === 'state' ? { color: 0x64748b } : playerColorOf(owner));
    const hex = color ? color.color : 0xffffff;
    const W = 6.3, D = 5.2;
    if (road) {
      b.box(W, 0.3, D, 0x59606a, 0, -0.1, 0);
      b.box(W, 0.02, 0.18, 0xf4d34a, 0, 0.2, 0);
      b.box(0.4, 1.4, 0.4, 0xe5e7eb, -2.4, 0.2, 1.7); b.box(3.0, 0.16, 0.16, 0xe0463d, -0.9, 1.3, 1.7);
      b.box(2.6, 1.2, 0.2, 0x2563eb, 2.2, 0.2, -1.8); b.box(2.2, 0.55, 0.12, 0xffffff, 2.2, 0.55, -1.68);
      return b;
    }
    if (owner === undefined) {
      // Tanah kosong: lahan tanah merah + patok + tali pembatas
      b.box(W, 0.45, D, 0xc9a56f, 0, -0.3, 0);
      b.box(W - 0.5, 0.05, D - 0.5, 0xd8b883, 0, 0.14, 0);
      // bingkai persil berwarna pulau agar jelas bahwa ini tanah milik petak tersebut
      b.box(W, 0.22, 0.18, islandHex, 0, 0.1, D / 2 - 0.09); b.box(W, 0.22, 0.18, islandHex, 0, 0.1, -D / 2 + 0.09); b.box(0.18, 0.22, D, islandHex, W / 2 - 0.09, 0.1, 0); b.box(0.18, 0.22, D, islandHex, -W / 2 + 0.09, 0.1, 0);
      for (const [x, z] of [[-3.0, -2.2], [3.0, -2.2], [-3.0, 2.2], [3.0, 2.2]]) P.stake(b, x, z, islandHex);
      for (const z of [-2.2, 2.2]) b.box(6.0, 0.04, 0.04, 0xf5f0e2, 0, 0.75, z);
      for (const x of [-3.0, 3.0]) b.box(0.04, 0.04, 4.4, 0xf5f0e2, x, 0.75, 0);
      b.box(1.6, 0.9, 0.1, 0xf2a21c, 0, 0.9, 2.5);
      b.box(0.1, 0.9, 0.1, 0x8a5a36, -0.7, 0, 2.5); b.box(0.1, 0.9, 0.1, 0x8a5a36, 0.7, 0, 2.5);
      b.box(1.1, 0.08, 0.12, 0xffffff, 0, 1.45, 2.56);
      return b;
    }
    // Lahan berpemilik: rumput + pagar + bendera warna pemilik
    b.box(W, 0.45, D, 0x6fc25a, 0, -0.3, 0);
    b.box(W + 0.2, 0.2, D + 0.2, 0xe9e2cf, 0, -0.12, 0);
    b.box(W - 0.3, 0.06, D - 0.3, 0x82d36a, 0, 0.12, 0);
    for (let x = -3.4; x <= 3.41; x += 1.15) { b.box(0.14, 0.7, 0.14, 0xffffff, x, 0.1, 2.55); }
    b.box(6.9, 0.1, 0.08, 0xffffff, 0, 0.55, 2.55);
    for (let z = -2.4; z <= 2.5; z += 1.2) { b.box(0.14, 0.7, 0.14, 0xffffff, -3.55, 0.1, z); b.box(0.14, 0.7, 0.14, 0xffffff, 3.55, 0.1, z); }
    b.cyl(0.07, 0.09, 3.0, 6, 0xcfd3d8, -3.0, 0.1, 2.1);
    b.box(1.25, 0.75, 0.06, hex, -2.4, 2.25, 2.1);
    b.box(1.25, 0.12, 0.07, 0xffffff, -2.4, 2.25, 2.1);
    b.sphere(0.12, 0xf2c94c, -3.0, 3.1, 2.1);
    if (level === 0) {
      for (const [x, z] of [[-1.5, -0.6], [1.5, -0.6], [-1.5, 1.2], [1.5, 1.2]]) P.stake(b, x, z, hex);
      b.cyl(0.08, 0.1, 0.8, 5, 0x7a5638, 2.5, 0.1, -1.4); b.sphere(0.55, 0x3fae4f, 2.5, 0.8, -1.4);
      b.box(2.4, 0.04, 2.0, 0xa6d98d, 0, 0.14, 0);
    } else {
      b.begin(0.3, 0.14, -0.5, 0);
      if (level === 1) P.rumahSubsidi1(b);
      else if (level === 2) P.rumahSubsidi2(b);
      else P.villaOKB(b);
      b.end();
      b.cyl(0.08, 0.1, 0.8, 5, 0x7a5638, 3.0, 0.1, -2.0); b.sphere(0.5, 0x3fae4f, 3.0, 0.8, -2.0);
    }
    return b;
  }

  update(state, animate = true) {
    for (const key of Object.keys(this.lots)) {
      const i = Number(key), lot = this.lots[i];
      const owner = state.owners?.[i];
      const level = state.buildings?.[i] || 0;
      const road = !!state.roads?.[i];
      const k = `${owner ?? '-'}|${level}|${road ? 1 : 0}`;
      if (k === lot.key) continue;
      const first = lot.key === null;
      lot.key = k;
      if (lot.mesh) { this.disposeMesh(lot.mesh); lot.g.remove(lot.mesh); }
      const b = this.build(owner, level, road, this.islandHex[i]);
      const mesh = new THREE.Mesh(b.build(), mat);
      mesh.castShadow = true; mesh.receiveShadow = true;
      lot.g.add(mesh); lot.mesh = mesh;
      if (!first && animate) {
        mesh.scale.setScalar(0.05);
        this.pop.push({ mesh, t: 0, i, level });
        this.onBuilt?.(i, level, world.lots[i]);
      }
    }
  }

  disposeMesh(mesh) { mesh.geometry.dispose(); }

  tick(dt) {
    for (let n = this.pop.length - 1; n >= 0; n--) {
      const p = this.pop[n];
      p.t += dt / 0.6;
      const t = Math.min(1, p.t);
      p.mesh.scale.setScalar(Math.max(0.05, easeOutBack(t)));
      if (t >= 1) { p.mesh.scale.setScalar(1); this.pop.splice(n, 1); }
    }
  }
}
