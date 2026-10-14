import * as THREE from 'three';
import { MeshBuilder, vertexMaterial } from '../world/MeshBuilder.js';

const col = (hex) => new THREE.Color(hex);

// Jalan beraspal yang melekuk mengikuti kontur tanah (tinggi tiap sampel dihitung WorldMap),
// dengan trotoar, garis tengah putus-putus, serta jembatan batu di atas sungai.
export class Roads3D {
  constructor(scene, world) {
    this.world = world;
    this.group = new THREE.Group();
    scene.add(this.group);
    const { x: sx, y: sy, z: sz, tx, tz } = world.samples;
    const M = world.M;

    const pos = [], colors = [], idx = [];
    const push = (x, y, z, c) => { pos.push(x, y, z); colors.push(c.r, c.g, c.b); return pos.length / 3 - 1; };
    // Pita sepanjang jalan antara offset lateral a..b (dalam satuan dunia), pada ketinggian y + dy.
    const band = (a, b, dy, c, from = 0, to = M) => {
      let prev = null;
      for (let j = from; j <= to; j++) {
        const jj = j % M, nx = -tz[jj], nz = tx[jj];
        const y = sy[jj] + dy;
        const i0 = push(sx[jj] + nx * a, y, sz[jj] + nz * a, c);
        const i1 = push(sx[jj] + nx * b, y, sz[jj] + nz * b, c);
        if (prev) idx.push(prev[0], prev[1], i0, prev[1], i1, i0);
        prev = [i0, i1];
      }
    };
    const asphalt = col(0x68717d), asphaltLight = col(0x76808c), curb = col(0xf1ebd8), shoulder = col(0xcfb585), line = col(0xf7f3e2);
    band(-3.5, -2.75, 0.03, shoulder);
    band(2.75, 3.5, 0.03, shoulder);
    band(-2.75, -2.4, 0.13, curb);
    band(2.4, 2.75, 0.13, curb);
    band(-2.4, 2.4, 0.07, asphalt);
    // Garis tepi dan tengah putus-putus
    band(-2.15, -2.05, 0.085, line);
    band(2.05, 2.15, 0.085, line);
    const stepsPerDash = 10;
    for (let j = 0; j < M; j += stepsPerDash * 2) {
      const to = Math.min(j + stepsPerDash - 3, M);
      band(-0.07, 0.07, 0.09, col(0xf4d34a), j, to);
    }
    // Pita nada sedikit berbeda untuk memberi kesan permukaan aspal.
    for (let j = 0; j < M; j += 36) band(-2.2, 2.2, 0.075, asphaltLight, j, Math.min(j + 14, M));

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.9, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }));
    mesh.receiveShadow = true;
    this.group.add(mesh);

    this.buildBridge();
  }

  buildBridge() {
    const w = this.world, M = w.M;
    const { x: sx, y: sy, z: sz, tx, tz } = w.samples;
    // Temukan rentang sampel yang berada di atas air sungai.
    const over = [];
    for (let j = 0; j < M; j++) {
      const ri = w.riverInfo(sx[j], sz[j]);
      if (ri.d < ri.hw + 2.2) over.push(j);
    }
    if (!over.length) return;
    const first = over[0], last = over[over.length - 1];
    const b = new MeshBuilder();
    const stone = 0xb9a98c, stoneDark = 0x8f8068, wood = 0x8a5a36;
    // Sisi dan dasar dek jembatan
    for (let j = first; j <= last; j++) {
      const nx = -tz[j], nz = tx[j];
      const y = sy[j];
      const yaw = Math.atan2(tx[j], tz[j]);
      // Dek tebal
      b.box(5.9, 0.55, 0.46, stone, sx[j], y - 0.5, sz[j], { ry: yaw });
      if ((j - first) % 5 === 0) {
        for (const s of [-1, 1]) {
          const px = sx[j] + nx * 2.7 * s, pz = sz[j] + nz * 2.7 * s;
          b.box(0.32, 1.0, 0.32, stoneDark, px, y + 0.1, pz, { ry: yaw });
          b.box(0.5, 0.18, 0.5, stone, px, y + 1.1, pz, { ry: yaw });
        }
      }
    }
    for (const s of [-1, 1]) {
      for (let j = first; j <= last; j += 2) {
        const nx = -tz[j], nz = tx[j], yaw = Math.atan2(tx[j], tz[j]);
        b.box(0.16, 0.12, 0.75, wood, sx[j] + nx * 2.7 * s, sy[j] + 0.78, sz[j] + nz * 2.7 * s, { ry: yaw });
      }
    }
    // Tiang penyangga ke dasar sungai
    for (const j of [first + 4, Math.round((first + last) / 2), last - 4]) {
      for (const s of [-1, 1]) {
        const nx = -tz[j], nz = tx[j];
        b.cyl(0.42, 0.55, 3.2, 8, stoneDark, sx[j] + nx * 1.6 * s, sy[j] - 3.6, sz[j] + nz * 1.6 * s);
      }
    }
    const mesh = new THREE.Mesh(b.build(), vertexMaterial());
    mesh.castShadow = true; mesh.receiveShadow = true;
    this.group.add(mesh);
    this.bridgeRange = [first, last];
  }
}
