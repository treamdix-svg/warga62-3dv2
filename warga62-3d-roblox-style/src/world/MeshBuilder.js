import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Menggabungkan banyak bentuk sederhana berwarna menjadi SATU geometri ber-vertex-color.
// Hasilnya sedikit draw call, cocok untuk browser Android, tetapi tetap detail dan berwarna.
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

const shared = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: {},
  cone: {},
  sphere: {},
};

export class MeshBuilder {
  constructor() { this.parts = []; this.stack = []; this.tf = null; }

  // Transformasi lokal: semua bentuk di antara begin() dan end() ikut dipindah/diputar/diskalakan.
  begin(x = 0, y = 0, z = 0, ry = 0, scale = 1) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(scale, scale, scale));
    this.stack.push(this.tf);
    this.tf = this.tf ? this.tf.clone().multiply(m) : m;
    return this;
  }
  end() { this.tf = this.stack.pop() ?? null; return this; }

  add(geometry, color, x = 0, y = 0, z = 0, o = {}) {
    const { rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1 } = o;
    _e.set(rx, ry, rz, 'YXZ');
    _q.setFromEuler(_e);
    _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz));
    if (this.tf) _m.premultiply(this.tf);
    let g = geometry.clone();
    if (g.index) g = g.toNonIndexed();
    g.applyMatrix4(_m);
    g.deleteAttribute('uv');
    const n = g.attributes.position.count;
    _c.set(color);
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { colors[i * 3] = _c.r; colors[i * 3 + 1] = _c.g; colors[i * 3 + 2] = _c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.parts.push(g);
    return this;
  }

  // Semua primitif memakai konvensi: y = dasar objek (bukan pusat).
  box(w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
    return this.add(shared.box, color, x, y + h / 2, z, { ...o, sx: w * (o.sx ?? 1), sy: h * (o.sy ?? 1), sz: d * (o.sz ?? 1) });
  }
  cyl(rt, rb, h, seg, color, x = 0, y = 0, z = 0, o = {}) {
    const key = `${rt}|${rb}|${seg}`;
    shared.cyl[key] ??= new THREE.CylinderGeometry(rt, rb, 1, seg);
    return this.add(shared.cyl[key], color, x, y + h / 2, z, { ...o, sy: h });
  }
  cone(r, h, seg, color, x = 0, y = 0, z = 0, o = {}) {
    const key = `${r}|${seg}`;
    shared.cone[key] ??= new THREE.ConeGeometry(r, 1, seg);
    return this.add(shared.cone[key], color, x, y + h / 2, z, { ...o, sy: h });
  }
  sphere(r, color, x = 0, y = 0, z = 0, o = {}) {
    const key = `${r}`;
    shared.sphere[key] ??= new THREE.IcosahedronGeometry(r, 1);
    return this.add(shared.sphere[key], color, x, y + r, z, o);
  }

  torus(R, r, color, x = 0, y = 0, z = 0, o = {}, seg = 24) {
    const key = `${R}|${r}|${seg}`;
    shared.torus ??= {};
    shared.torus[key] ??= new THREE.TorusGeometry(R, r, 6, seg);
    return this.add(shared.torus[key], color, x, y, z, o);
  }

  // Atap pelana (prisma segitiga). Lebar mengikuti sumbu X, punggung atap sepanjang Z.
  gable(w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
    const g = new THREE.BufferGeometry();
    const hw = w / 2, hd = d / 2;
    const v = [
      -hw, 0, hd, hw, 0, hd, 0, h, hd,
      hw, 0, -hd, -hw, 0, -hd, 0, h, -hd,
      -hw, 0, -hd, -hw, 0, hd, 0, h, hd, -hw, 0, -hd, 0, h, hd, 0, h, -hd,
      hw, 0, hd, hw, 0, -hd, 0, h, -hd, hw, 0, hd, 0, h, -hd, 0, h, hd,
      -hw, 0, -hd, hw, 0, -hd, hw, 0, hd, -hw, 0, -hd, hw, 0, hd, -hw, 0, hd,
    ];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return this.add(g, color, x, y, z, o);
  }

  build() {
    if (!this.parts.length) return new THREE.BufferGeometry();
    const geometry = mergeGeometries(this.parts, false);
    geometry.computeBoundingSphere();
    this.parts.forEach((g) => g.dispose());
    this.parts = [];
    return geometry;
  }
}

export const vertexMaterial = (opts = {}) => new THREE.MeshStandardMaterial({
  vertexColors: true, flatShading: true, roughness: 0.82, metalness: 0, ...opts,
});
