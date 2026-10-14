import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { world } from '../engine/GameBridge.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Mode: follow (mengikuti pemain), iso (sudut isometrik mengikuti pemain), overview, top, free (geser bebas).
// Pemain tetap dapat memutar (seret), memperbesar (scroll/cubit), dan menggeser (klik kanan / mode Geser).
export class CameraController {
  constructor(camera, dom) {
    this.camera = camera; this.dom = dom;
    this.controls = new OrbitControls(camera, dom);
    const c = this.controls;
    c.enableDamping = true; c.dampingFactor = 0.08;
    c.minDistance = 9; c.maxDistance = 260;
    c.minPolarAngle = 0.08; c.maxPolarAngle = 1.46;
    c.screenSpacePanning = false;
    c.rotateSpeed = 0.7; c.zoomSpeed = 0.9; c.panSpeed = 0.9;
    c.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
    c.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    this.mode = 'follow';
    this.followPos = new THREE.Vector3(0, 2, 0);
    this.followYaw = null;
    this.fly = null;
    this.lastUser = -10;
    this.time = 0;
    this.listeners = new Set();
    c.addEventListener('start', () => { this.lastUser = this.time; });
    dom.addEventListener('pointerdown', (e) => { if (e.button === 2 || e.button === 1) { this.setMode('free', false); } });
    this.fitInitial();
  }

  onMode(fn) { this.listeners.add(fn); }
  emit() { for (const fn of this.listeners) fn(this.mode); }

  aspectFactor() { const a = innerWidth / innerHeight; return a < 0.8 ? 1.55 : a < 1.2 ? 1.2 : 1; }

  fitInitial() {
    this.camera.position.set(60, 90, 120).multiplyScalar(1.1);
    this.controls.target.set(0, 0, 0);
    this.flyTo(this.presetOverview(), 0.01);
  }

  presetOverview() { const f = this.aspectFactor(); return { target: new THREE.Vector3(0, 0, 4), pos: new THREE.Vector3(0, 104 * f, 132 * f) }; }
  presetTop() { const f = this.aspectFactor(); return { target: new THREE.Vector3(0, 0, 0), pos: new THREE.Vector3(0.01, 190 * f, 0.5) }; }
  presetOffset(kind, around) {
    const t = around.clone();
    if (kind === 'iso') { const r = 46 * Math.min(1.35, this.aspectFactor()); return { target: t, pos: t.clone().add(new THREE.Vector3(r * 0.62, r * 0.78, r * 0.62)) }; }
    const r = 34 * Math.min(1.3, this.aspectFactor());
    const yaw = this.followYaw ?? 0.7;
    return { target: t, pos: t.clone().add(new THREE.Vector3(-Math.sin(yaw) * r * 0.62, r * 0.62, -Math.cos(yaw) * r * 0.62)) };
  }

  flyTo(p, dur = 1.1) {
    this.fly = { t: 0, dur, fromPos: this.camera.position.clone(), fromTarget: this.controls.target.clone(), toPos: p.pos.clone(), toTarget: p.target.clone() };
  }

  setMode(mode, fly = true) {
    this.mode = mode;
    this.controls.touches.TWO = mode === 'free' ? THREE.TOUCH.DOLLY_PAN : THREE.TOUCH.DOLLY_ROTATE;
    if (fly) {
      if (mode === 'overview') this.flyTo(this.presetOverview(), 1.3);
      else if (mode === 'top') this.flyTo(this.presetTop(), 1.3);
      else if (mode === 'iso' || mode === 'follow') this.flyTo(this.presetOffset(mode, this.followPos), 1.0);
    }
    this.emit();
  }

  // Fokus cepat ke titik tertentu (klik lokasi / pilih pemain) lalu mengikuti jika mode ikuti.
  focusOn(pos, dist = 26) {
    const dir = this.camera.position.clone().sub(this.controls.target).setLength(dist);
    dir.y = Math.max(dir.y, dist * 0.55);
    this.flyTo({ target: pos.clone(), pos: pos.clone().add(dir) }, 0.9);
    if (this.mode === 'overview' || this.mode === 'top') this.mode = 'free';
    this.emit();
  }

  update(dt) {
    this.time += dt;
    const c = this.controls, cam = this.camera;
    if (this.fly) {
      const f = this.fly; f.t += dt / f.dur;
      const k = easeInOut(Math.min(1, f.t));
      cam.position.lerpVectors(f.fromPos, f.toPos, k);
      c.target.lerpVectors(f.fromTarget, f.toTarget, k);
      if (f.t >= 1) this.fly = null;
    } else if (this.mode === 'follow' || this.mode === 'iso') {
      const delta = this.followPos.clone().sub(c.target);
      const k = 1 - Math.exp(-dt * 3.2);
      c.target.addScaledVector(delta, k); cam.position.addScaledVector(delta, k);
      // Saat pemain berjalan, kamera pelan-pelan berputar ke belakang pemain (kecuali pemain sedang menggeser kamera).
      if (this.mode === 'follow' && this.followYaw !== null && this.time - this.lastUser > 3) {
        const off = cam.position.clone().sub(c.target);
        const cur = Math.atan2(off.x, off.z), want = this.followYaw + Math.PI;
        const d = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
        const step = d * Math.min(1, dt * 0.9);
        const cos = Math.cos(step), sin = Math.sin(step);
        const nx = off.x * cos + off.z * sin, nz = -off.x * sin + off.z * cos;
        cam.position.set(c.target.x + nx, cam.position.y, c.target.z + nz);
      }
    }
    c.update();
    // Jangan sampai kamera masuk ke dalam tanah.
    const ground = world.heightAt(cam.position.x, cam.position.z, { dry: true }) + 2.2;
    if (cam.position.y < ground) cam.position.y = ground;
  }
}
