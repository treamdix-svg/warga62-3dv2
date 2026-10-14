import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Dadu 3D sungguhan yang dilempar, memantul, berputar, lalu berhenti dengan sisi hasil engine menghadap ke atas.
// Nilai dadu selalu berasal dari engine (state.dice) - animasi hanya menampilkan hasilnya.
const FACE_NORMALS = [[1, 0, 0, 1], [-1, 0, 0, 6], [0, 1, 0, 2], [0, -1, 0, 5], [0, 0, 1, 3], [0, 0, -1, 4]];
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export class Dice3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group(); scene.add(this.group);
    this.group.visible = false;
    const geo = new RoundedBoxGeometry(1.5, 1.5, 1.5, 3, 0.16);
    const mats = FACE_NORMALS.map(([, , , n]) => new THREE.MeshStandardMaterial({ map: this.faceTexture(n), roughness: 0.28, metalness: 0.02 }));
    this.dice = [0, 1].map(() => {
      const m = new THREE.Mesh(geo, mats); m.castShadow = true; m.receiveShadow = true; this.group.add(m); return m;
    });
    this.state = null;
    this.hideT = -1;
  }

  faceTexture(n) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ece7da');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const dot = (px, py, r = 24) => { x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); };
    x.fillStyle = n === 1 ? '#dc2626' : '#111827';
    const C = 128, L = 68, R = 188;
    ({ 1: () => dot(C, C, 38), 2: () => { dot(L, L); dot(R, R); }, 3: () => { dot(L, L); dot(C, C); dot(R, R); }, 4: () => { dot(L, L); dot(R, L); dot(L, R); dot(R, R); },
      5: () => { dot(L, L); dot(R, L); dot(C, C); dot(L, R); dot(R, R); }, 6: () => { dot(L, L); dot(R, L); dot(L, C); dot(R, C); dot(L, R); dot(R, R); } })[n]();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }

  // Orientasi agar sisi bertitik `value` menghadap ke atas (+Y), dengan putaran yaw acak.
  targetQuat(value, yaw) {
    const f = FACE_NORMALS.find((n) => n[3] === value) || FACE_NORMALS[2];
    const from = new THREE.Vector3(f[0], f[1], f[2]);
    const q = new THREE.Quaternion().setFromUnitVectors(from, new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiply(q);
  }

  get busy() { return !!this.state; }

  // values: [d1, d2] atau [d]; origin: posisi pemain; frame: arah jalan {fx,fz}; ground: tinggi jalan.
  roll(values, origin, frame, ground, onSettled, onBounce) {
    this.hideT = -1;
    this.group.visible = true;
    const n = values.length;
    const { fx, fz } = frame;
    const rx = -fz, rz = fx;
    const throws = values.map((v, i) => {
      const side = n === 1 ? 0 : (i === 0 ? -1 : 1);
      const ahead = 4.6 + (Math.random() - 0.5) * 0.6, lat = side * 1.15 + (Math.random() - 0.5) * 0.3;
      const land = new THREE.Vector3(origin.x + fx * ahead + rx * lat, ground, origin.z + fz * ahead + rz * lat);
      const start = new THREE.Vector3(origin.x + rx * side * 0.5, ground + 8.4, origin.z + fz * 0.3);
      return {
        v, start, land, axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        spins: 5 + Math.random() * 3, q: this.targetQuat(v, Math.random() * Math.PI * 2), bounces: 0,
      };
    });
    this.state = { t: 0, dur: 1.75, throws, onSettled, onBounce, done: false };
    this.dice.forEach((d, i) => { d.visible = i < n; d.scale.setScalar(1); });
  }

  hide() { if (this.group.visible && this.hideT < 0) this.hideT = 0; }

  update(dt) {
    if (this.hideT >= 0) {
      this.hideT += dt / 0.35;
      const s = Math.max(0.001, 1 - this.hideT);
      this.dice.forEach((d) => d.scale.setScalar(s));
      if (this.hideT >= 1) { this.group.visible = false; this.hideT = -1; }
    }
    const st = this.state; if (!st) return;
    st.t += dt;
    const k = Math.min(1, st.t / st.dur);
    st.throws.forEach((th, i) => {
      const d = this.dice[i];
      // Lintasan: terbang melengkung lalu memantul 2x (tinggi mengecil).
      const flight = Math.min(1, k / 0.55);
      d.position.x = th.start.x + (th.land.x - th.start.x) * easeOut(Math.min(1, k / 0.8));
      d.position.z = th.start.z + (th.land.z - th.start.z) * easeOut(Math.min(1, k / 0.8));
      let y;
      if (k < 0.55) y = th.land.y + 0.75 + (th.start.y - th.land.y - 0.75) * (1 - flight * flight);
      else if (k < 0.8) { const u = (k - 0.55) / 0.25; y = th.land.y + 0.75 + Math.sin(u * Math.PI) * 1.9; }
      else { const u = (k - 0.8) / 0.2; y = th.land.y + 0.75 + Math.sin(u * Math.PI) * 0.55; }
      d.position.y = y;
      const bounceNow = (k >= 0.55 && th.bounces === 0) || (k >= 0.8 && th.bounces === 1) || (k >= 0.97 && th.bounces === 2);
      if (bounceNow) { th.bounces++; st.onBounce?.(th.bounces); }
      const spin = th.spins * Math.PI * 2 * Math.pow(1 - k, 1.6);
      const qs = new THREE.Quaternion().setFromAxisAngle(th.axis, spin);
      d.quaternion.copy(th.q).premultiply(qs);
    });
    if (k >= 1 && !st.done) {
      st.done = true;
      this.state = null;
      st.throws.forEach((th, i) => { this.dice[i].quaternion.copy(th.q); this.dice[i].position.y = th.land.y + 0.75; });
      st.onSettled?.(st.throws.map((t) => t.land));
    }
  }
}
